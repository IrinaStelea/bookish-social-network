const spicedPg = require("spiced-pg");
const username = "postgres";
const password = "postgres";
const database = "socialnetwork";
const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

const bcrypt = require("bcryptjs");

function hashPassword(pass) {
    return bcrypt
        .genSalt()
        .then((salt) => {
            return bcrypt.hash(pass, salt);
        })
        .then((hashedPassword) => {
            console.log("password in hash function", hashedPassword);
            return hashedPassword;
        });
}

module.exports.insertUser = (first, last, email, password) => {
    return hashPassword(password).then((hashedPass) => {
        console.log("hashed pass", hashedPass);
        return db.query(
            //add user to users table returning the id & first name to store in the cookie session
            `
            INSERT INTO users(first, last, email, password)
            VALUES ($1, $2, $3, $4) RETURNING id, first`,
            [first, last, email, hashedPass]
        );
    });
};
