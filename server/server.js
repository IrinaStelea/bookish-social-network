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

app.use(compression());

//middleware that generates a random string
const secretCode = cryptoRandomString({
    length: 6,
});

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
    //add user to database
    db.insertUser(
        req.body.firstName,
        req.body.lastName,
        req.body.email,
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
    db.findUser(req.body.email)
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
            //insert secret code in new table
            db.insertCode(results.rows[0].email, secretCode)
                .then((results) => {
                    console.log(
                        "secret code was added successfully",
                        results.rows
                    );
                    //send code to user
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

    //find code in the most recent ones
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
    //     filePath,
    //     req.body.username,
    //     req.body.title,
    //     req.body.description
    // )
    //     .then((results) => {
    //         console.log("inserting new image worked, info is", results.rows);
    //         // send response back to Vue once we know that the INSERT was successfull
    //         res.json({
    //             success: true,
    //             message: "File uploaded successfully",
    //             uploadedFile: results.rows[0],
    //         });

    //         //after the response above is sent, we are back in app.js (Vue) -> the .then() part of the fetch request will run
    //     })
    //     .catch((err) => {
    //         console.log("error in adding new image", err);
    //         res.json({
    //             success: false,
    //             message: "File upload failed",
    //         });
    //     });

    // req.file ? res.json({ success: true }) : res.json({ success: false });
});

// app.post("/sendCode", (req, res) => {
// database queries: confirm that email exists then  generate secret code calling the function then store the code in the table then send the secret code in via ses to the user
//check code in resetcodes table in the time gap of 10 mins
//send a success at the end
// }) - this corresponds to the fetch we do in startResetFunction

// app.post("/reset-password", (req, res) => {
// receive the new code, compare in the db with code and email, and if they match, update the password - rehash it and update it in the db
// });

app.get("/user", function (req, res) {
    db.getUserData(req.session.userId)
        .then((result) => {
            return res.json(result.rows[0]);
        })
        .catch((err) => {
            console.log("error in getting user data", err);
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

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
