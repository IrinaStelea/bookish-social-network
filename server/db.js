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
            return hashedPassword;
        });
}

module.exports.insertUser = (first, last, email, password) => {
    return hashPassword(password).then((hashedPass) => {
        return db.query(
            //return id & first name to store in the cookie session
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
            let dbPass = results.rows[0].password;
            userId = results.rows[0].id;
            //compare passwords
            return bcrypt.compare(inputPass, dbPass).then((result) => {
                if (result) {
                    // console.log("authentication successful");
                    //return userId for the cookie
                    return userId;
                } else {
                    // console.log("authentication failed. passwords don't match");
                    // throw error for the catch in POST login
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

//get the info of all online users
module.exports.getUsersById = (arrayIds) => {
    return db.query(
        `SELECT id, first, last, avatarurl FROM users WHERE id = ANY($1)`,
        [arrayIds]
    );
};

module.exports.getUsers = (val) => {
    return db.query(
        `SELECT * FROM users WHERE first ILIKE $1 OR last ILIKE $1 ORDER BY id DESC LIMIT 5`,
        [val + "%" || null]
    );
    // use "%" + val + "%" to find the search string inside of a name, not only at start
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

//"get friends" query uses both users & friendships table; the joins need to target the person we want info about
module.exports.getFriendsAndWannabes = (id) => {
    return db.query(
        `SELECT users.id, first, last, avatarurl, accepted FROM users JOIN friendships ON (accepted=true AND recipient_id=$1 AND users.id=friendships.sender_id) OR (accepted=true and sender_id=$1 AND users.id=friendships.recipient_id) OR (accepted = false AND recipient_id=$1 AND users.id = friendships.sender_id) ORDER BY first`,
        [id]
    );
};

module.exports.getOtherUserFriends = (id) => {
    return db.query(
        `SELECT users.id, first, last, avatarurl, sender_id, recipient_id FROM users JOIN friendships ON (accepted=true AND recipient_id=$1 AND users.id=friendships.sender_id) OR (accepted=true and sender_id=$1 AND users.id=friendships.recipient_id) ORDER BY first`,
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

module.exports.getWallPosts = (userId) => {
    return db.query(
        `SELECT wallposts.id, sender_id, post, timestamp, first, last, avatarurl FROM wallposts JOIN users ON wallposts.sender_id=users.id WHERE wallposts.recipient_id=$1 ORDER BY wallposts.id DESC`,
        [userId]
    );
};

module.exports.insertWallPost = (sender_id, recipient_id, post) => {
    return db.query(
        `WITH "user" AS (SELECT * FROM users WHERE id = $1), inserted_post as (INSERT INTO wallposts (sender_id, recipient_id, post) VALUES ($1, $2, $3) RETURNING *) SELECT inserted_post.id, sender_id, recipient_id, post, timestamp, first, last, avatarurl FROM "user", inserted_post`,
        [sender_id, recipient_id, post]
    );
};

module.exports.deleteAccount = (id) => {
    //this query will delete the info from users, friendships & messages tables thanks to ON CASCADE DELETE constraint on the other tables
    return db.query(`DELETE FROM users WHERE id=$1`, [id]);
};

module.exports.getFriendRequestNotifications = (id) => {
    return db.query(`SELECT senderid FROM friendrequests WHERE userid=$1`, [
        id,
    ]);
};

module.exports.addFriendRequestNotification = (userid, senderid) => {
    return db.query(
        `INSERT INTO friendrequests (userid, senderid) VALUES ($1, $2) RETURNING *`,
        [userid, senderid]
    );
};

module.exports.deleteFriendRequestNotification = (userid, senderid) => {
    return db.query(
        `DELETE from friendrequests WHERE userid=$1 AND senderid=$2`,
        [userid, senderid]
    );
};

module.exports.deleteAllFriendRequestNotifications = (userid) => {
    return db.query(`DELETE from friendrequests WHERE userid=$1`, [userid]);
};
