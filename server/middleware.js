
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

// Set up instructions for Multer to store uploaded files to the disk
//multer takes an object with configuration which tells it how to store the images (destination & file name)
const storage = multer.diskStorage({
    // where should we store the newly uploaded files?
    destination: path.join(__dirname, "uploads"),
    // instructions for setting the file name for each uploaded file
    filename: (req, file, callback) => {
        // generate a unique string to ensure no conflicts of file names
        //24 refers to the byte length (which has implications for the UID length)
        uidSafe(24).then((uid) => {
            // get the extension of the original file (eg. .jpg)
            const extension = path.extname(file.originalname);
            const newFileName = uid + extension;
            //first arg of callback is always error, here null bc there is no error
            callback(null, newFileName);
        });
    },
});

//using this uploader function as middleware in server.js
module.exports.uploader = multer({
    storage,
    // include some limits to prevent overwhelming our server (e.g. DOS attacks), here: 2mb
    limits: {
        fileSize: 2097152,
    },
});

// module.exports.uploadFiles = (req, res) => {
//     console.log("req.body", req.body);
//     console.log("req.files", req.files);
//     res.json({ message: "Successfully uploaded files" });
// };
