const aws = require("aws-sdk");
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("../secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

//creating new instance of s3 user
const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

exports.upload = (req, res, next) => {
    //if there is no file
    if (!req.file) {
        return res.sendStatus(500);
    }

    //boilerplate code - if we get at this point, req.file exists and we pull info from it
    // console.log("req.file: 	", req.file);

    const { filename, mimetype, size, path } = req.file;

    const promise = s3
        .putObject({
            Bucket: "ihamspiced",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise();

    promise
        .then(() => {
            // it worked!!!
            console.log("amazon upload successful");
            next(); //adding this because this function will be used as middleware

            //I will be able to see uploaded images in my bucket on AWS

            //optional
            fs.unlink(path, () => {}); //if all is well, please delete the image that we just uploaded from the uploads folder (no backup on local folder)
        })
        .catch((err) => {
            // uh oh
            console.log("error in upload put object -s3.js", err);
            res.sendStatus(404);
        });
};
