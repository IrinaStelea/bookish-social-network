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

//enable us to unpack JSON IN the request body
app.use(express.json());
//important to include body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "client", "public")));

//TO DO: add middleware ensureSignedOut, validateRegistration (form validation) in the post register route

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

//fetch request on main App mount
app.get("/api/user", function (req, res) {
    db.getUserData(req.session.userId)
        .then((result) => {
            return res.json(result.rows[0]);
        })
        .catch((err) => {
            console.log("error in getting user data", err);
        });
});

//fetch request on OtherProfile mount
app.get("/api/user/:id", function (req, res) {
    const { id } = req.params;
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

app.get("/api/friends", async (req, res) => {
    try {
        const result = await db.getFriendsAndWannabes(req.session.userId);
        return res.json({ friends: result.rows });
    } catch (err) {
        console.log("error in get friends and wannabes");
        return res.json({ message: "Something went wrong, please try again" });
    }
});

app.get("/api/otherfriends/:id", async (req, res) => {
    let id = req.params.id;
    console.log("id in post friends is", id);
    let userId = req.session.userId;
    try {
        const result = await db.getOtherFriends(id);
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
let onlineUsers = [];
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

    onlineUsers.push({ [userId]: [`${socket.id}`] });
    console.log("online users", onlineUsers);
    const mergedOnlineUsers = onlineUsers.reduce((acc, obj) => {
        for (let key in obj) {
            acc[key] = acc[key] ? [...acc[key], obj[key]].flat() : obj[key];
        }
        return acc;
    }, {});

    console.log("merged online users", mergedOnlineUsers);

    // (() => {
    //     if (onlineUsers) {
    //         for (let user of onlineUsers) {
    //             if (user[userId] == undefined) {
    //                 onlineUsers.push({ [userId]: `${socket.id}` });
    //             }
    //             // user[id] !== undefined
    //             //     ? user[id].push(`${socket}`)
    //             //     : onlineUsers.push({ [id]: `${socket}` });
    //         }
    //     } else {
    //         console.log("in the else branch");
    //     }

    //     return onlineUsers;
    // })();

    // generateOnlineUsers(userId, socket.id);
    //list of online users
    // onlineUsers.push({ [userId]: `${socket.id}` });
    // onlineUsers.map((user) =>
    //     user[userId] !== undefined
    //         ? user[userId].push(`${socket.id}`)
    //         : onlineUsers.push({ [userId]: `${socket.id}` })
    // );

    // console.log("online users", onlineUsers);
    //here:emit custom events and send some data (the payload of the event) -> we need to listen to these events on the client side

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
    });
});
