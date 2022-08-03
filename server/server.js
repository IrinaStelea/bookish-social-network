const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const db = require("./db.js");

app.use(compression());

app.use(
    cookieSession({
        secret: "Sloths are the fastest animals",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client", "public")));

app.post("/register.json", (req, res) => {
    //to do: form validation

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
            // redirect to petition page
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

app.get("/user/id.json", function (req, res) {
    res.json({
        userId: req.session.userId,
    });
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
