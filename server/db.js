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
        // console.log("hashed pass", hashedPass);
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

module.exports.validateUser = (email, inputPass) => {
    let userId;
    return db
        .query(`SELECT * FROM users WHERE email = $1`, [email])
        .then((results) => {
            console.log(
                "user email exists, here is the entire info",
                results.rows
            );
            //get db password
            let dbPass = results.rows[0].password;

            //get id from db
            userId = results.rows[0].id;

            //compare passwords
            return bcrypt.compare(inputPass, dbPass).then((result) => {
                if (result) {
                    console.log("authentication successful");
                    // const firstName = results.rows[0].first;
                    //return userId for the cookie
                    return userId;
                } else {
                    console.log("authentication failed. passwords don't match");
                    // throw error for the POST login catch
                    throw new Error("Passwords don't match");
                }
            });
        });
};

module.exports.getUserData = (id) => {
    return db.query(
        `SELECT id, first, last, avatarurl, bio FROM users WHERE id = $1`,
        [id]
    );
};

module.exports.getUsers = (val) => {
    return db.query(
        `SELECT * FROM users WHERE first ILIKE $1 OR last ILIKE $1 ORDER BY id DESC LIMIT 5`,
        [val + "%" || null]
    );
    // could add to find the search query inside the words "%" + val + "%"
};

module.exports.updateImage = (userId, imageUrl) => {
    return db.query(
        `
    UPDATE users SET avatarurl=$2 WHERE id=$1 RETURNING avatarurl`,
        [userId, imageUrl]
    );
};

module.exports.updateBio = (userId, bio) => {
    return db.query(
        `
    UPDATE users SET bio=$2 WHERE id=$1 RETURNING bio`,
        [userId, bio || ``]
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

module.exports.findFriendship = (sender, recipient) => {
    return db.query(
        `
        SELECT * FROM friendships
        WHERE (sender_id = $1 AND recipient_id = $2)
        OR (sender_id = $2 AND recipient_id = $1)`,
        [sender, recipient]
    );
};

module.exports.friendshipRequest = (sender, recipient) => {
    return db.query(
        `INSERT INTO friendships (sender_id, recipient_id)
                VALUES ($1, $2) RETURNING *`,
        [sender, recipient]
    );
};

module.exports.acceptFriendship = (sender, recipient) => {
    return db.query(
        `UPDATE friendships SET accepted=true WHERE sender_id=$1 AND recipient_id=$2 RETURNING *`,
        [sender, recipient]
    );
};

module.exports.cancelFriendship = (sender, recipient) => {
    return db.query(
        `DELETE FROM friendships WHERE (sender_id=$1 AND recipient_id=$2) OR (sender_id=$2 AND recipient_id=$1)
        `,
        [sender, recipient]
    );
};

//get friends query - needs to use both users & friendships table; the joins refer to the person we want info about
module.exports.getFriendsAndWannabes = (id) => {
    return db.query(
        `SELECT users.id, first, last, avatarurl, accepted FROM users JOIN friendships ON (accepted=true AND recipient_id=$1 AND users.id=friendships.sender_id) OR (accepted=true and sender_id=$1 AND users.id=friendships.recipient_id) OR (accepted = false AND recipient_id=$1 AND users.id = friendships.sender_id)`,
        [id]
    );
};

module.exports.getGroupMessages = () => {
    return db.query(
        `SELECT messages.id, sender_id, message, timestamp, first, last, avatarurl FROM messages JOIN users ON messages.sender_id=users.id ORDER BY messages.id DESC LIMIT 10`
    );
};

module.exports.insertMessage = (id, text) => {
    return db.query(
        `WITH "user" AS (SELECT * FROM users WHERE id = $1), inserted_message as (INSERT INTO messages (sender_id, message) VALUES ($1, $2) RETURNING *) SELECT inserted_message.id, sender_id, message, timestamp, first, last, avatarurl FROM "user", inserted_message`,
        [id, text]
    );
};
