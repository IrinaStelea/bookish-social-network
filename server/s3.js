const aws = require("aws-sdk");
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env;
} else {
    secrets = require("../secrets");
}

//creating new instance of s3 user
const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

//S3 upload
exports.upload = (req, res, next) => {
    //check that file exists
    if (!req.file) {
        return res.sendStatus(500);
    }

    //if we get at this point, req.file exists and we pull info from it
    const { filename, mimetype, size, path } = req.file;

    const promise = s3
        .putObject({
            Bucket: "ihamspiced",
            ACL: "public-read",
            // this has access to the userid stored in req.session -> create subfolder on AWS for each user
            Key: req.session.userId + "/" + filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise();

    promise
        .then(() => {
            // console.log("amazon upload successful");
            next();
            //delete the image from the local storage
            fs.unlink(path, () => {});
        })
        .catch((err) => {
            console.log("error in s3 putObject", err);
            res.sendStatus(404);
        });
};

//S3 delete
exports.delete = (req, res, next) => {
    var params = {
        Bucket: "ihamspiced",
        Prefix: req.session.userId + "/",
    };

    return s3
        .listObjects(params)
        .promise()
        .then((data) => {
            if (data.Contents.length === 0) {
                throw new Error("List of objects empty.");
            }

            let currentData = data;
            params = { Bucket: "ihamspiced" };
            params.Delete = { Objects: [] };

            currentData.Contents.forEach((content) => {
                params.Delete.Objects.push({ Key: content.Key });
            });

            return s3
                .deleteObjects(params)
                .promise()
                .then(() => {
                    // console.log("amazon delete successful");
                    next();
                })
                .catch((err) => {
                    console.log("error in s3 deleteObjects", err);
                    res.sendStatus(404);
                });
        });
};
