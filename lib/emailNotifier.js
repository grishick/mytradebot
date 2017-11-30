/**
 * Created by gsolovyev on 7/23/17.
 */

var AWS = require("aws-sdk");

if(process.env.AWS_EXECUTION_ENV == "sandbox") {
    var credentials = new AWS.SharedIniFileCredentials();
    AWS.config.credentials = credentials;
}

AWS.config.update({
    region: "us-east-1"
});
var ses = new AWS.SES();

function notify(msg, cb) {
    var params = {
        Source:process.env.NOTIFICATION_SENDER_EMAIL,
        Destination: {
            ToAddresses: [
                process.env.NOTIFICATION_RECIPIENT_EMAIL
            ]
        },
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: msg
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: process.env.NOTIFICATION_EMAIL_SUBJ
            }
        }
    }

    ses.sendEmail(params, function(err, data) {
        if (err) {
            cb(err);
        } else {
            cb(null)
        }
    });
}

module.exports = {
    notify:notify
}