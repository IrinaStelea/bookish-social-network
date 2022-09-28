const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const cookieSession = require("cookie-session");
const db = require("./db.js");
const cryptoRandomString = require("crypto-random-string");
const { sendCodeEmail } = require("./ses");
const s3 = require("./s3");
const { uploader } = require("./middleware");
const helpers = require("./helpers.js");

app.use(compression());
//enable us to unpack JSON IN the request body
app.use(express.json());

//boilerplate code for web socket - socket io requires a native node server (not express) for handling the initial http request
//creating a native node server and passing to it our express app so that the app can also work with sockets

//TO DO: adapt the io code to work for a deployment environment
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    allowRequest: (req, callback) =>
        callback(null, req.headers.referer.startsWith("http://localhost:3000")),
});

const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("../secrets.json").COOKIE_SECRET;

const cookieSessionMiddleware = cookieSession({
    secret: COOKIE_SECRET,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    sameSite: true,
});

app.use(cookieSessionMiddleware);
//additional middleware so that socket has access to cookie
io.use((socket, next) => {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

//important to include body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "client", "public")));

//TO DO add middleware ensureSignedOut, validateRegistration (form validation) in the post register route

//registration route
app.post("/register.json", (req, res) => {
    //add user to database, cleaning the data
    db.insertUser(
        helpers.cleanString(req.body.firstName),
        helpers.cleanString(req.body.lastName),
        req.body.email.toLowerCase(),
        req.body.password
    )
        .then((results) => {
            console.log("inserting new user worked");
            //set the cookie session on the user id to keep track of login
            const userId = results.rows[0].id;
            // const firstName = results.rows[0].first;
            req.session = {
                userId,
                // firstName,
            };
            // console.log("user id cookie assigned", req.session.userId);
            //send success message
            return res.json({ success: true });
        })
        .catch((err) => {
            console.log("error in adding new user", err);
            return res.json({
                success: false,
                message: "Something went wrong, please try again!",
            });
        });
});

//login route
app.post("/login.json", (req, res) => {
    db.validateUser(req.body.email.toLowerCase(), req.body.password)
        .then((result) => {
            console.log("user id cookie assigned at login", result);
            //set the cookie
            req.session = {
                userId: result,
            };
            return res.json({
                success: true,
            });
        })
        .catch((err) => {
            console.log("error in validating user", err);
            return res.json({
                success: false,
                message: "Invalid email or password",
            });
        });
});

//password reset
app.post("/password/reset/start.json", (req, res) => {
    db.findUser(req.body.email.toLowerCase())
        .then((results) => {
            console.log("user exists", results.rows);
            //generate secret code
            let secretCode = cryptoRandomString({
                length: 6,
            });
            //insert secret code in new table
            db.insertCode(results.rows[0].email, secretCode)
                .then((results) => {
                    console.log(
                        "secret code was added successfully",
                        results.rows
                    );
                    //send code to user via SES
                    let code = results.rows[0].code;
                    return sendCodeEmail(code)
                        .then(() => {
                            console.log("email code sent successfully");
                            return res.json({
                                success: true,
                            });
                        })
                        .catch((err) => {
                            console.log("error in sending code via email", err);
                            return res.json({
                                success: false,
                                message:
                                    "Something went wrong, please try again",
                            });
                        });
                })
                .catch((error) => {
                    console.log("error in inserting code", error);
                    return res.json({
                        success: false,
                        message: "Something went wrong, please try again",
                    });
                });
        })
        .catch((err) => {
            console.log("error in finding user in the database", err);
            return res.json({
                success: false,
                message: "Please check if you entered your email correctly",
            });
        });
});

app.post("/password/reset/verify.json", (req, res) => {
    //find code among the codes saved in the last 10 mins
    db.findCode(req.body.email.toLowerCase())
        .then((results) => {
            console.log(
                "user email exists in reset codes table, here is the entire info",
                results.rows
            );
            //check if the codes correspond
            if (results.rows[0].code === req.body.code) {
                console.log("the two codes correspond");

                //hash the password and update the users row in the users table
                db.updatePassword(results.rows[0].email, req.body.password)
                    .then((results) => {
                        console.log("update password worked", results);
                        return res.json({
                            success: true,
                        });
                    })
                    .catch((error) => {
                        console.log("error in updating password", error);
                        return res.json({
                            success: false,
                            message: "Something went wrong, please try again!",
                        });
                    });
            } else {
                return res.json({
                    success: false,
                    message: "Please check if you entered your code correctly",
                });
            }
        })
        .catch((err) => {
            console.log(
                "error in finding the email in the reset codes table",
                err
            );
            return res.json({
                success: false,
                message: "Please check if you entered your email correctly",
            });
        });
});

//image upload route
app.post(
    "/upload-image",
    uploader.single("file"),
    s3.upload,
    async (req, res) => {
        //get the full URL of the image (amazon url + filename)
        const avatarUrl = path.join(
            "https://s3.amazonaws.com/ihamspiced",
            //add the userId for access to subfolder
            `${req.session.userId}`,
            `${req.file.filename}`
        );
        // console.log("avatarUrl", avatarUrl);

        try {
            const result = await db.updateImage(req.session.userId, avatarUrl);
            // console.log("updating image url worked", result.rows[0].avatarurl);
            return res.json({
                success: true,
                avatar: result.rows[0].avatarurl,
            });
        } catch (err) {
            // console.log("error in uploading new profile pic", err);
            return res.json({
                success: false,
                message: "Something went wrong, please try again",
            });
        }
    }
);

//edit bio route
app.post("/edit-bio", (req, res) => {
    db.updateBio(req.session.userId, req.body.bio)
        .then((results) => {
            console.log("updating bio worked, new bio is", results.rows[0].bio);
            return res.json({
                success: true,
                bio: results.rows[0].bio,
            });
        })
        .catch((err) => {
            console.log("error in updating the bio", err);
            return res.json({
                success: false,
                message: "Something went wrong, please try again",
            });
        });
});

//fetch user data on App mount
app.get("/api/current-user", function (req, res) {
    db.getUserData(req.session.userId)
        .then((result) => {
            console.log("getting user data");
            return res.json(result.rows[0]);
        })
        .catch((err) => {
            console.log("error in getting user data", err);
        });
});

//fetch other user's data on OtherProfile mount
app.get("/api/user/:id", function (req, res) {
    const { id } = req.params;

    //exclude cases where the id is not a number
    if (!isNaN(id)) {
        db.getUserData(id)
            .then((result) => {
                // console.log("result of getUserdata", result);

                //handle edge cases: invalid user id or id matches that of the loggedin user - send success: false response so that the App redirects to /

                if (result.rows.length == 0 || id == req.session.userId) {
                    return res.json({
                        success: false,
                    });
                } else {
                    return res.json({
                        success: true,
                        profile: result.rows[0],
                    });
                }
            })
            .catch((err) => {
                console.log("error in getting user data", err);
            });
    } else {
        console.log("inside the else");
        return res.json({
            success: false,
        });
    }
});

//fetch request on FindPeople mount
app.get("/api/findusers/:val", function (req, res) {
    //get just the value of the query, without json
    let val = req.params.val.split(".").shift();
    // console.log("val: 	", val);
    db.getUsers(val)
        .then((result) => {
            return res.json(result.rows);
        })
        .catch((err) => {
            console.log("error in getting the three most recent users", err);
        });
});

//fetch on start
app.get("/user/id.json", function (req, res) {
    if (req.session.userId) {
        console.log("cookie exists");
        res.json({
            userId: req.session.userId,
        });
    } else {
        console.log("cookie does not exist");
        res.json({});
    }
});

//fetch request for FriendButton mount
app.get("/api/friendship/:id", async (req, res) => {
    let sender = req.session.userId;
    let recipient = req.params.id;
    // console.log("sender id", sender, "recipient id", recipient);
    try {
        const result = await db.findFriendship(sender, recipient);
        return res.json(result.rows);
    } catch (err) {
        console.log("error in get friendship results");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

//post fetches for FriendshipButton - make sure they return data identical in structure to the GET friendship request
app.post("/friendshiprequest", async (req, res) => {
    try {
        const result = await db.friendshipRequest(
            req.session.userId,
            req.body.id
        );
        return res.json(result.rows);
    } catch (err) {
        console.log("error in get friendship results");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

app.post("/acceptfriendship", async (req, res) => {
    //note the order of the parameters, in this case the recipient is actually the user stored in the cookie session

    //TO DO: check that the friendship exists first
    try {
        const result = await db.acceptFriendship(
            req.body.id,
            req.session.userId
        );
        return res.json(result.rows);
    } catch (err) {
        console.log("error in get friendship results");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

app.post("/cancelfriendship", async (req, res) => {
    try {
        const result = await db.cancelFriendship(
            req.session.userId,
            req.body.id
        );
        return res.json(result.rows);
    } catch (err) {
        console.log("error in get friendship results");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

//post for delete account, including with full delete of all profile pics uploaded to Amazon
app.post("/api/delete-account", s3.delete, async (req, res) => {
    try {
        const result = await db.deleteAccount(req.session.userId);
        console.log("account delete successful", result);
        req.session = null;
        return res.redirect("/");
    } catch (err) {
        console.log("error in deleting account", err);
        res.sendStatus(500);
    }
});

//get friends and wannabes route
app.get("/api/friends", async (req, res) => {
    try {
        const result = await db.getFriendsAndWannabes(req.session.userId);
        return res.json({ friends: result.rows });
    } catch (err) {
        console.log("error in get friends and wannabes");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

//get friends of other user
app.get("/api/otheruserfriends/:id", async (req, res) => {
    let id = req.params.id;
    console.log("id in post friends is", id);
    let userId = req.session.userId;
    try {
        const result = await db.getOtherUserFriends(id);
        // console.log("result in get other friends", result);
        //send also the cookie id to be able to determine friendship relations
        //friendship check
        let friends = result.rows;
        console.log("friends in get other friends", friends);
        if (friends) {
            let areWeFriends = friends.find(
                (friend) =>
                    friend.recipient_id == userId || friend.sender_id == userId
            );
            // console.log("are we friends", areWeFriends);
            //friendship check
            if (areWeFriends) {
                friends = friends.filter(
                    (friend) =>
                        friend.recipient_id !== userId &&
                        friend.sender_id !== userId
                );
                return res.json({ friends, areWeFriends: true });
            } else {
                return res.json({});
            }
        } else {
            return res.json({});
        }
    } catch (err) {
        console.log("error in get other friends results");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    // res.json({ logout: true });
    return res.redirect("/login");
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

// app.listen(process.env.PORT || 3001, function () {
//     console.log("I'm listening.");
// });

//listen to the server instead to make the socket work
server.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});

//SOCKET CODE
//when the connection event fires it will run a callback; socket is an object representing the network connection between client and server; all the socket code has to be inside this connection event
let onlineUsers = {};

io.on("connection", (socket) => {
    //check if there is a userId set first
    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }
    //if we've reached this point, we have a userId
    const userId = socket.request.session.userId;
    console.log(
        `User with id ${userId} and socket-id ${socket.id} has connected`
    );

    //emit info about new user joining
    (async () => {
        //if user is not already online, emit his/her info to all other users
        if (!onlineUsers[userId]) {
            let result;
            try {
                result = await db.getUserData(userId);
                // console.log("result from getting user data", result.rows);

                socket.broadcast.emit("user-joined", result.rows[0]);
            } catch (err) {
                console.log("error in getting user info");
            }
        }
    })();

    onlineUsers[userId] = onlineUsers[userId]
        ? [...onlineUsers[userId], socket.id]
        : [socket.id];

    console.log("merged online users", onlineUsers);

    //here:emit custom events and send some data (the payload of the event) -> we need to listen to these events on the client side

    //get online users and emit
    (async () => {
        let result;
        try {
            //remove current user from online Users
            // const onlineMinusUser = Object.keys(onlineUsers).filter(
            //     (user) => user != userId
            // );
            // console.log("online minus user", onlineMinusUser);
            result = await db.getUsersById(Object.keys(onlineUsers));
            // console.log("result from get users by ids", result.rows);
            if (result.rows.length !== 0) {
                //emit list of online users to the user who just joined
                io.to(socket.id).emit("online-users", result.rows);
            }
        } catch (err) {
            console.log("error in getting online users by ids");
        }
    })();

    //get chat messages and emit
    (async () => {
        let result;
        try {
            result = await db.getGroupMessages();
            // console.log("result from get messagens", result.rows);
            if (result.rows.length !== 0) {
                //emit the latest 10 messages to the user who just connected
                io.to(socket.id).emit("last-10-messages", result.rows);
            }
        } catch (err) {
            console.log("error in getting latest 10 messages");
        }
    })();

    //get number of friend requests and emit to the user who just connected
    (async () => {
        try {
            const result = await db.getFriendRequestNotifications(userId);
            console.log("result from getting nb of friendships", result.rows);
            if (result.rows.length) {
                //merge the ids of request senders into an array
                let requests = result.rows.map((e) => e.senderid);
                io.to(socket.id).emit("number-of-friend-requests", requests);
            }
        } catch (err) {
            console.log("error in getting nb of friend requests", err);
        }
    })();

    //listen to friendship requests notifications
    socket.on("new-friend-request", async (data) => {
        //check if user is online - if yes, send that user a notification
        console.log("data from socket friendship request", data);

        //store the request in the table
        let result;
        try {
            result = await db.addFriendRequestNotification(
                data.recipient_id,
                data.sender_id
            );
            console.log("result from adding new friend request", result);
        } catch (err) {
            console.log("error from adding friend request", err);
        }

        //additionally if user is online, emit that friend request
        if (onlineUsers[data.recipient_id]) {
            for (let socket of onlineUsers[data.recipient_id]) {
                io.to(socket).emit("new-friend-notification", data);
                console.log("inside friend request emit event");
            }
        }
    });

    socket.on("new-friend-cancel", async (data) => {
        //delete the request from the friend notifications table
        let result;
        try {
            result = await db.deleteFriendRequestNotification(
                data.recipient_id,
                data.sender_id
            );
            console.log("result from deleting new friend request", result);
        } catch (err) {
            console.log("error deleting friend request", err);
        }

        //additionally if user is online, emit that friend request is cancelled
        if (onlineUsers[data.recipient_id]) {
            for (let socket of onlineUsers[data.recipient_id]) {
                io.to(socket).emit("new-friend-request-cancel", data);
                console.log(
                    "inside friend request emit event",
                    socket.requests
                );
            }
        }
    });

    socket.on("all-friend-requests-read", async (data) => {
        console.log("data inside socket server delete all notifications", data);
        //delete all requests from the friend notifications table
        let result;
        try {
            result = await db.deleteAllFriendRequestNotifications(
                data.recipient_id
            );
            console.log("result from deleting all friend requests", result);
        } catch (err) {
            console.log("error deleting friend request notifications", err);
        }
    });

    //listen to the new message event emitted in the ChatInput component
    socket.on("new-message", async (message) => {
        console.log("new message is", message, "user id is", userId);
        //add new message to database
        let result;
        try {
            result = await db.insertMessage(userId, message.text);
            console.log("result from inserting new message", result.rows[0]);
            //emit the new message to all users
            io.emit("added-new-message", result.rows[0]);
        } catch (err) {
            console.log("error in adding new message to the database");
        }
    });

    //listen to when the connection disconnects
    socket.on("disconnect", () => {
        console.log(
            `User with id ${userId} and socket-id ${socket.id} just disconnected`
        );

        console.log("socket requests on disconnnect", socket.requests);

        //remove users on disconnect
        onlineUsers[userId] = onlineUsers[userId].filter(
            (item) => item !== `${socket.id}`
        );

        //delete object key if no other sockets remain and emit that the user has left
        const userLeft = async () => {
            let result;
            try {
                result = await db.getUserData(userId);
                // console.log("result from getting user data", result.rows);
                io.emit("user-left", result.rows[0]);
            } catch (err) {
                console.log("error in getting user info");
            }
        };
        if (onlineUsers[userId].length == 0) {
            delete onlineUsers[userId];
            userLeft();
        }

        console.log("merged online users on disconnect", onlineUsers);
    });
});
