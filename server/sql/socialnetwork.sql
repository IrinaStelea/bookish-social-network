createdb socialnetwork

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    email VARCHAR UNIQUE NOT NULL CHECK (email != ''),
    password VARCHAR NOT NULL CHECK (password != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatarurl TEXT,
    bio TEXT
);


CREATE TABLE reset_codes(
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friendships(
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accepted BOOLEAN DEFAULT false
);

CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER DEFAULT null REFERENCES users(id),
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friendrequests(
    id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    senderid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE wallposts(
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    post TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);