let databaseUrl;
if (process.env.NODE_ENV === "production") {
    databaseUrl = process.env.DATABASE_URL;
} else {
    const {
        DB_USER,
        DB_PASSWORD,
        DB_HOST,
        DB_PORT,
        DB_NAME,
    } = require("../secrets.json");
    databaseUrl = `postgres:${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

const spicedPg = require("spiced-pg");
const db = spicedPg(databaseUrl);

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

module.exports.findUser = (email) => {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

module.exports.getUserData = (id) => {
    return db.query(`SELECT first, last, avatarurl FROM users WHERE id = $1`, [
        id,
    ]);
};

module.exports.updateImage = (userId, imageUrl) => {
    return db.query(
        `
    UPDATE users SET avatarurl=$2 WHERE id=$1 RETURNING avatarurl`,
        [userId, imageUrl]
    );
};

module.exports.updatePassword = (email, password) => {
    return hashPassword(password).then((hashedPass) => {
        console.log("hashed new pass", hashedPass);
        return db.query(`UPDATE users SET password=$2 WHERE email=$1`, [
            email,
            hashedPass,
        ]);
    });
};

module.exports.insertCode = (email, code) => {
    return db.query(
        `
            INSERT INTO reset_codes(email, code)
            VALUES ($1, $2) RETURNING code`,
        [email, code]
    );
};

module.exports.findCode = (email) => {
    return db.query(
        `SELECT * FROM reset_codes WHERE email = $1 AND CURRENT_TIMESTAMP - timestamp < INTERVAL '10 minutes' ORDER BY timestamp DESC LIMIT 1`,
        [email]
    );
};
