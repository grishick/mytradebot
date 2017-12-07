/**
 * Created by gsolovyev on 7/20/17.
 */
var notifier = require("./lib/emailNotifier.js")
var glob = require("constants.js");
exports.handler = function(event, context, callback) {
    var mode = process.env.MODE;
    var productId = process.env.PRODUCT_ID;
    var dip = process.env.DIP;
    var rise = process.env.RISE;
    var minTrade = process.env.MIN_TRADE;
    var maxTrade = process.env.MAX_TRADE;
    var cancelBuyAfter = process.env.CANCEL_BUY_AFTER;
    var stopLossRatio = process.env.STOP_LOSS_RATIO;
    if(process.env.NOTIFIER) {
        if(process.env.NOTIFIER == "text") {
            notifier = require("./lib/SMSNotifier.js");
        } else if(process.env.NOTIFIER == "email") {
            notifier = require("./lib/emailNotifier.js")
        } else {
            console.log("Specified unknown notifier: " + process.env.NOTIFIER + ". Using default.")
        }
    } else {
        console.log("Notifier not specified. Using default.")
    }

    console.log("Starting handler: rise:" + rise + ", dip:"+ dip + ", mode: " + mode + ", minTrade: " + minTrade + ", maxTrade:" + maxTrade + ", productId:" +productId)
    var trader = require("./lib/trader.js");
    var advisor = require("./lib/advisor.js")
    var runner = require("./lib/runner.js")
    runner.heartbeat(mode, productId, dip, rise, minTrade, maxTrade, cancelBuyAfter, stopLossRatio, trader, advisor, notifier, function(err) {
        if ((err && err.code && err.code != glob.NOT_ENOUGH_BALANCE) || (err && !err.code)) {
            var errorTime = new Date().toLocaleString("en-us", {timeZone: "America/Los_Angeles"});
            var errMsg = "Encountered error at " + errorTime + ".\n Error: " + JSON.stringify(err);
            console.log(errMsg)
            var needToNotify = true;
            if(err.resp && err.resp.statusCode && (err.resp.statusCode == 500 || err.resp.statusCode == 504)) {
                needToNotify = false;
            }
            if(err.resp && err.message && err.message == "request timestamp expired" && err.resp.statusCode && err.resp.statusCode == 400) {
                needToNotify = false;
            }
            if(needToNotify) {
                notifier.notify(errMsg, function(err) {
                    if(err) {
                        console.log("Notifier returned an error trying to send error notification. " + JSON.stringify(err));
                    }
                    callback(new Error(errMsg));
                })
            } else {
                callback(new Error(errMsg));
            }
        } else {
            console.log("Success!")
        }
    })
};