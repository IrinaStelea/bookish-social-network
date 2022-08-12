const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const db = require("./db.js");
const cryptoRandomString = require("crypto-random-string");
const { sendCodeEmail } = require("./ses");
const s3 = require("./s3");
const { uploader } = require("./middleware");
const helpers = require("./helpers.js");

app.use(compression());

//middleware that generates a random string
// let secretCode = cryptoRandomString({
//     length: 6,
// });

const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("../secrets.json").COOKIE_SECRET;

app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

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
            console.log("user id cookie assigned", req.session.userId);
            //send success message
            res.json({ success: true });
        })
        .catch((err) => {
            console.log("error in adding new user", err);
            res.json({
                success: false,
                message: "Something went wrong, please try again!",
            });
        });
});

app.post("/login.json", (req, res) => {
    //to do - clean email
    //check user details in database

    //to do - db.validateUser with email and password as parameters, handle the password on the db side
    db.findUser(req.body.email.toLowerCase())
        .then((results) => {
            console.log(
                "user email exists, here is the entire info",
                results.rows
            );
            //check password
            let inputPass = req.body.password;
            let dbPass = results.rows[0].password;
            //authenticate the user
            // (TO DO: consider moving this password check to db.js)
            return bcrypt
                .compare(inputPass, dbPass)
                .then((result) => {
                    if (result) {
                        console.log("authentication successful");

                        //set the cookie session on the user id to keep track of login
                        const userId = results.rows[0].id;
                        // const firstName = results.rows[0].first;
                        req.session = {
                            userId,
                            // firstName,
                        };
                        console.log(
                            "user id cookie assigned at login",
                            req.session.userId
                        );

                        return res.json({
                            success: true,
                        });
                    } else {
                        console.log(
                            "authentication failed. passwords don't match"
                        );
                        return res.json({
                            success: false,
                            message: "Invalid email or password",
                        });
                    }
                })
                .catch((err) => {
                    console.log("error bcrypt compare", err);
                });
        })
        .catch((err) => {
            console.log("error in finding user in the database", err);
            return res.json({
                success: false,
                message: "Invalid email or password",
            });
        });
});

app.post("/password/reset/start.json", (req, res) => {
    //to do: clean email
    db.findUser(req.body.email)
        .then((results) => {
            console.log(
                "user email exists, here is the entire info",
                results.rows
            );
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
    //to do: clean email

    //find code among the codes saved in the last 10 mins
    db.findCode(req.body.email)
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

app.post("/upload-image", uploader.single("file"), s3.upload, (req, res) => {
    //get the full URL of the image (amazon url + filename)
    const avatarUrl = path.join(
        "https://s3.amazonaws.com/ihamspiced",
        `${req.file.filename}`
    );
    console.log("avatarUrl", avatarUrl);

    db.updateImage(req.session.userId, avatarUrl)
        .then((results) => {
            console.log("updating image url worked", results.rows[0].avatarurl);
            return res.json({
                success: true,
                avatar: results.rows[0].avatarurl,
            });
        })
        .catch((err) => {
            console.log("error in uploading new profile pic", err);
            return res.json({
                success: false,
                message: "Something went wrong, please try again",
            });
        });
});

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
            //handle edge cases for the id - when it does not exist or when it is the same id of the loggedin user
            // console.log("result of getUserdata", result);
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
        console.log("cookie exists exists");
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

app.get("/logout", (req, res) => {
    req.session = null;
    return res.redirect("/login");
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
