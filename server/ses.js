const aws = require("aws-sdk");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("../secrets.json");
}

const ses = new aws.SES({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: "us-east-1", // Make sure this corresponds to the region in which you have verified your email address
});

//function version with formatting
//normally we would also pass an email to the function
exports.sendCodeEmail = (code) => {
    let params = {
        Source: "Bookish <irina.a.stelea@gmail.com>",
        Destination: {
            ToAddresses: ["irina.a.stelea@gmail.com"],
        },
        ReplyToAddresses: [],
        Message: {
            Body: {
                Text: {
                    Data: `
                    Hello from Bookish,    
                    
                    Your password reset code is:
                    ${code}
                    
                    Your verification code expires in 10 minutes, make sure to use it before that.
                        `,
                },
                Html: {
                    Data: `<html>
                    <head>
                    <title>Your password reset code</title>
                    </head>
                    <body>
                    <h1 style="color:rgb(60, 110, 113);">Hello from Bookish,</h1>
                    <p>Your password reset code is</p>
                    <h2 id="code" style="color:red;">${code}</h2>
                    <p>Simply copy this code and paste it into the verification field in your browser.</p>
                    <em>Your team at Bookish</em>
                    </body>
                    </html>`,
                },
            },
            Subject: {
                Data: "Your password reset code / Bookish",
            },
        },
    };
    return ses
        .sendEmail(params)
        .promise()
        .then(() => console.log("Sending email with reset code worked"))
        .catch((err) => console.log("error in sending email: ", err));
};

//original version - does not include formatting
// exports.sendCodeEmail = function (code) {
//     //sendEmail below is a method from SES
//     return ses
//         .sendEmail({
//             Source: "Your social network <irina.a.stelea@gmail.com>",
//             Destination: {
//                 ToAddresses: ["irina.a.stelea@gmail.com"],
//             },
//             Message: {
//                 Body: {
//                     Text: {
//                         Data: `
//                         Hello,
//                         This is your code:
//                         ${code}`,
//                     },
//                 },
//                 Subject: {
//                     Data: "Your password reset code / Social network",
//                 },
//             },
//         })
//         .promise()
//         .then(() => console.log("sending emails worked!"))
//         .catch((err) => console.log(err));
// };
