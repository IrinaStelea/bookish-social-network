const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const cookieSession = require("cookie-session");
const cryptoRandomString = require("crypto-random-string");

const server = require("http").Server(app); //socket.io requires a native node server to handle the initial http request

//TO DO: adapt the socket.io code to work for a deployment environment
const io = require("socket.io")(server, {
    allowRequest: (req, callback) =>
        callback(null, req.headers.referer.startsWith("http://localhost:3000")),
});

const { sendCodeEmail } = require("./ses");
const db = require("./db.js");
const s3 = require("./s3");
const { uploader } = require("./middleware");
const helpers = require("./helpers.js");

const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("../secrets.json").COOKIE_SECRET;

const cookieSessionMiddleware = cookieSession({
    secret: COOKIE_SECRET,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    sameSite: true,
});

app.use(compression());
app.use(express.json());
app.use(cookieSessionMiddleware);

//additional middleware so that socket has access to cookie
io.use((socket, next) => {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "client", "public")));

//registration route
app.post("/register.json", (req, res) => {
    db.insertUser(
        helpers.cleanString(req.body.firstName),
        helpers.cleanString(req.body.lastName),
        req.body.email.toLowerCase(),
        req.body.password
    )
        .then((results) => {
            const userId = results.rows[0].id;
            req.session = {
                userId,
            };
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

//password reset - part 1
app.post("/password/reset/start.json", (req, res) => {
    db.findUser(req.body.email.toLowerCase())
        .then((results) => {
            //generate secret code
            let secretCode = cryptoRandomString({
                length: 6,
            });
            db.insertCode(results.rows[0].email, secretCode)
                .then((results) => {
                    //send code to user via SES
                    let code = results.rows[0].code;
                    return sendCodeEmail(code)
                        .then(() => {
                            // console.log("email code sent successfully");
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

//password reset - part 2
app.post("/password/reset/verify.json", (req, res) => {
    //find code among the codes saved in the last 10 mins
    db.findCode(req.body.email.toLowerCase())
        .then((results) => {
            if (results.rows[0].code === req.body.code) {
                db.updatePassword(results.rows[0].email, req.body.password)
                    .then(() => {
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
        const avatarUrl = path.join(
            "https://s3.amazonaws.com/ihamspiced",
            //add the userId for access to subfolder
            `${req.session.userId}`,
            `${req.file.filename}`
        );
        try {
            const result = await db.updateImage(req.session.userId, avatarUrl);
            return res.json({
                success: true,
                avatar: result.rows[0].avatarurl,
            });
        } catch (err) {
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

//fetch post route to add new wall post
app.post("/api/new-wall-post", async (req, res) => {
    try {
        const result = await db.insertWallPost(
            req.session.userId,
            req.body.id || req.session.userId,
            req.body.text
        );
        return res.json({
            success: true,
            wallPost: result.rows[0],
        });
    } catch (err) {
        console.log("error in adding new wall post to the database");
        return res.json({
            success: false,
            message: "Something went wrong, please try again",
        });
    }
});

//fetch user data on App mount
app.get("/api/current-user", function (req, res) {
    db.getUserData(req.session.userId)
        .then((result) => {
            return res.json({
                success: true,
                profile: result.rows[0],
            });
        })
        .catch((err) => {
            console.log("error in getting user data", err);
            return res.json({
                success: false,
            });
        });
});

//fetch profile of other users on OtherProfile mount
app.get("/api/user/:id", function (req, res) {
    const { id } = req.params;
    //exclude cases where the id is not a number
    if (!isNaN(id)) {
        db.getUserData(id)
            .then((result) => {
                //edge cases: invalid user id or id matches that of the loggedin user
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
        return res.json({
            success: false,
        });
    }
});

//fetch request from FindPeople component
app.get("/api/findusers/:val", function (req, res) {
    let val = req.params.val.split(".").shift(); //get just the value of the query, without json extension
    db.getUsers(val)
        .then((result) => {
            return res.json(result.rows);
        })
        .catch((err) => {
            console.log("error in getting users", err);
        });
});

//check for userid in cookie on start
app.get("/user/id.json", function (req, res) {
    if (req.session.userId) {
        res.json({
            userId: req.session.userId,
        });
    } else {
        // console.log("cookie does not exist");
        res.json({});
    }
});

//fetch for status of FriendButton
app.get("/api/friendship/:id", async (req, res) => {
    let sender = req.session.userId;
    let recipient = req.params.id;
    try {
        const result = await db.findFriendship(sender, recipient);
        return res.json(result.rows);
    } catch (err) {
        console.log("error in get friendship results");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

//post fetches for FriendshipButton - must return data consistent in structure to the GET friendship request
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
    try {
        const result = await db.acceptFriendship(
            req.body.id,
            req.session.userId //the recipient is the user stored in cookie session
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

//post request account delete, including full deletion of user's all profile pics uploaded to S3 bucket
app.post("/api/delete-account", s3.delete, async (req, res) => {
    try {
        await db.deleteAccount(req.session.userId);
        req.session = null;
        return res.redirect("/");
    } catch (err) {
        console.log("error in deleting account", err);
        res.sendStatus(500);
    }
});

//get list of friends and wannabes on App mount
app.get("/api/friends", async (req, res) => {
    try {
        const result = await db.getFriendsAndWannabes(req.session.userId);
        return res.json({ friends: result.rows });
    } catch (err) {
        console.log("error in get friends and wannabes");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

//get wall posts on App mount
app.get("/api/wallposts", async (req, res) => {
    try {
        const result = await db.getWallPosts(req.session.userId);
        if (result.rows.length) {
            return res.json({ wallPosts: result.rows });
        }
    } catch (err) {
        console.log("error in getting wall posts");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

//get list of friends of other user on OtherProfile mount
app.get("/api/otheruserfriends/:id", async (req, res) => {
    let id = req.params.id;
    let userId = req.session.userId;
    try {
        const result = await db.getOtherUserFriends(id);
        //check friendship between logged-in user and OtherUser and only send list of friends if true
        let friends = result.rows;
        if (friends) {
            let areWeFriends = friends.find(
                (friend) =>
                    friend.recipient_id == userId || friend.sender_id == userId
            );
            if (areWeFriends) {
                friends = friends.filter(
                    (friend) =>
                        friend.recipient_id !== userId &&
                        friend.sender_id !== userId
                );
                //get wall posts of other user
                const wallPosts = await db.getWallPosts(id);
                return res.json({
                    friends,
                    areWeFriends: true,
                    wallPosts: wallPosts.rows,
                });
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
    return res.redirect("/login");
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

server.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});

//SOCKET CODE
let onlineUsers = {};
io.on("connection", (socket) => {
    //check for existence of userid in the cookie session
    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }
    const userId = socket.request.session.userId;
    // console.log(
    //     `User with id ${userId} and socket-id ${socket.id} has connected`
    // );

    //emit info about new user joining
    (async () => {
        //TO DO: emit only to people who are friends
        //if user is not already online, emit his/her info to all other users
        if (!onlineUsers[userId]) {
            let result;
            try {
                result = await db.getUserData(userId);
                socket.broadcast.emit("user-joined", result.rows[0]);
            } catch (err) {
                console.log("error in getting user info");
            }
        }
    })();

    //keep track of online users
    onlineUsers[userId] = onlineUsers[userId]
        ? [...onlineUsers[userId], socket.id]
        : [socket.id];

    //get info of online users and emit
    (async () => {
        let result;
        try {
            result = await db.getUsersById(Object.keys(onlineUsers));
            if (result.rows.length !== 0) {
                //emit list of online users to the user who just joined
                io.to(socket.id).emit("online-users", result.rows);
            }
        } catch (err) {
            console.log("error in getting online users by ids");
        }
    })();

    //get chats and emit
    (async () => {
        let result;
        try {
            result = await db.getGroupMessages();
            if (result.rows.length !== 0) {
                //emit the latest 10 messages to the user who just connected
                io.to(socket.id).emit("last-10-messages", result.rows);
            }
        } catch (err) {
            console.log("error in getting latest 10 messages");
        }
    })();

    //get number of new friend notifications
    (async () => {
        try {
            const result = await db.getFriendRequestNotifications(userId);
            if (result.rows.length) {
                //merge the ids of request senders into an array
                let requests = result.rows.map((e) => e.senderid);
                // emit to the user who just connected
                io.to(socket.id).emit("number-of-friend-requests", requests);
            }
        } catch (err) {
            console.log("error in getting nb of friend requests", err);
        }
    })();

    //listen to friendship requests notifications
    socket.on("new-friend-request", async (data) => {
        //store the new friend notification in the db
        try {
            await db.addFriendRequestNotification(
                data.recipient_id,
                data.sender_id
            );
        } catch (err) {
            console.log("error from adding friend request", err);
        }
        //additionally if user is online, emit the new friend notification
        if (onlineUsers[data.recipient_id]) {
            for (let socket of onlineUsers[data.recipient_id]) {
                io.to(socket).emit("new-friend-notification", data);
            }
        }
    });

    socket.on("new-friend-cancel", async (data) => {
        //delete the new friend notification from the db
        try {
            await db.deleteFriendRequestNotification(
                data.recipient_id,
                data.sender_id
            );
        } catch (err) {
            console.log("error deleting friend request", err);
        }

        //additionally if user is online, emit that the new friend notification is cancelled
        if (onlineUsers[data.recipient_id]) {
            for (let socket of onlineUsers[data.recipient_id]) {
                io.to(socket).emit("new-friend-request-cancel", data);
            }
        }
    });

    socket.on("all-friend-requests-read", async (data) => {
        //delete all requests from the friend notifications table
        try {
            await db.deleteAllFriendRequestNotifications(data.recipient_id);
        } catch (err) {
            console.log("error deleting friend request notifications", err);
        }
    });

    //listen to the new message event emitted in the ChatInput component
    socket.on("new-message", async (message) => {
        //add new message to database
        let result;
        try {
            result = await db.insertMessage(userId, message.text);
            //emit the new message to all users
            io.emit("added-new-message", result.rows[0]);
        } catch (err) {
            console.log("error in adding new message to the database");
        }
    });

    //listen to user disconnect
    socket.on("disconnect", () => {
        // console.log(
        //     `User with id ${userId} and socket-id ${socket.id} just disconnected`
        // );

        //remove socket on disconnect
        onlineUsers[userId] = onlineUsers[userId].filter(
            (item) => item !== `${socket.id}`
        );

        //if no other sockets remain, emit that the user has left and delete object key
        const userLeft = async () => {
            let result;
            try {
                result = await db.getUserData(userId);
                io.emit("user-left", result.rows[0]);
            } catch (err) {
                console.log("error in getting user info");
            }
        };
        if (onlineUsers[userId].length == 0) {
            delete onlineUsers[userId];
            userLeft();
        }
    });
});
