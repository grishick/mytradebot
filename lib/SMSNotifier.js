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
var sns = new AWS.SNS();

function notify(msg, cb) {
    var params = {
        Message: msg,
        MessageStructure: 'string',
        PhoneNumber: process.env.NOTIFICATION_PHONE_NUMBER
    };
    sns.publish(params, function(err, data) {
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