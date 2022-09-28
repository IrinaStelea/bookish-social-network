const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

// setup for Multer to store uploaded files to the disk
const storage = multer.diskStorage({
    destination: path.join(__dirname, "uploads"),
    // instructions for setting the file name for each uploaded file
    filename: (req, file, callback) => {
        // generate a unique string to ensure no conflicts of filenames
        //24 refers to the byte length (which has implications for the UID length)
        uidSafe(24).then((uid) => {
            const extension = path.extname(file.originalname);
            const newFileName = uid + extension;
            callback(null, newFileName); //null as error (first arg of callback) because there is no error
        });
    },
});

//using uploader as middleware in server.js
module.exports.uploader = multer({
    storage,
    limits: {
        fileSize: 2097152, // include some limits to prevent overwhelming our server (e.g. DOS attacks), here: 2mb
    },
});
