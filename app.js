/**
 * Created by gsolovyev on 7/9/17.
 */
var glob = require("./constants.js");
var format = require('string.format');
var utils = require("./lib/utils.js");
var runner = require("./lib/runner.js");
var trader = require("./lib/trader.js");
var advisor = require("./lib/advisor.js")
var dynamodb = require("./lib/dynamodb.js")
var notifier = require("./lib/emailNotifier.js")
var argv = require( 'argv' );
var fs = require('fs')

var mode = "paper";
var productId = "BTC-USD";
var minTrade = 1000;
var maxTrade = 4000;
var rise = 0.001;
var clean = true;
var rise = 0.5;
var dip = 0.25;
var stopLossRatio = 2;
var btcBalance = 0;
var ltcBalance = 0;
var ethBalance = 0;
var usdBalance = 0;
var options =
[
    {
        name: 'clean',
        short: 'c',
        type: 'boolean'
    },
    {
        name: 'minTrade',
        short: 'i',
        type: 'float'
    },
    {
        name: 'maxTrade',
        short: 'x',
        type: 'float'
    },
    {
        name: 'mode',
        short: 'm',
        type: 'string'
    },
    {
        name: 'product',
        short: 'p',
        type: 'string'
    },
    {
        name: 'rise',
        short: 'r',
        type: 'float'
    },
    {
        name: 'dip',
        short: 'd',
        type: 'float'
    },
    {
        name:'stopLoss',
        short:'sl',
        type:'float'
    },
    {
        name: 'BTC',
        short: 'b',
        type: 'float'
    },
    {
        name: 'LTC',
        short: 't',
        type: 'float'
    },
    {
        name: 'ETH',
        short: 'e',
        type: 'float'
    },
    {
        name: 'USD',
        short: 'u',
        type: 'float'
    }];

var args = argv.option( options ).run();

clean = args.options["clean"];
if(args.options["product"]) {
    productId = args.options["product"];
}

if(args.options["minTrade"]) {
    minTrade = args.options["minTrade"];
}

if(args.options["maxTrade"]) {
    maxTrade = args.options["maxTrade"];
}

if(args.options["dip"]) {
    dip = args.options["dip"];
}

if(args.options["rise"]) {
    rise = args.options["rise"];
}

if(args.options["mode"]) {
    mode = args.options["mode"];
}
if(args.options["stopLoss"]) {
    stopLossRatio = args.options["stopLoss"];
}
cancelBuyAfter = "day";
btcBalance = args.options["BTC"];
ltcBalance = args.options["LTC"];
ethBalance = args.options["ETH"];
usdBalance = args.options["USD"];
function run() {
    fs.readFile('./signal', 'utf8', function (err,data) {
        if (!err && data.indexOf("stop") >-1) {
            console.log("got stop signal. Stopping");
            fs.writeFile('./signal', 'terminated on signal at ' + new Date().toUTCString(), 'utf8', function() {
                process.exit()
            });
        } else {
            runner.heartbeat(mode, productId, dip, rise, minTrade, maxTrade, cancelBuyAfter, stopLossRatio, trader, advisor, notifier, function(err) {
                if(err) {
                    var errorTime = new Date().toLocaleString("en-us", {timeZone:"America/Los_Angeles"});
                    console.log("Encountered error at " + errorTime + ".\n Error: " + JSON.stringify(err))
                    utils.sleep(60);
                    run();
                } else {
                    utils.sleep(5);
                    run();
                }
            });
        }

    });
}

function cleanAll(doClean, cb) {
    if(doClean && mode == "paper") {
        console.log("Doing cleanup")
        dynamodb.deleteAwsFills(function(err) {
            if (err) {
                console.log("Error deleting fills in AWS " + JSON.stringify(err));
            } else {
                dynamodb.deleteAwsOrders(function(err) {
                    if (err) {
                        console.log("Error deleting orders in AWS " + JSON.stringify(err));
                    } else {
                        dynamodb.updateBalance({"USD": usdBalance, "BTC": btcBalance, "ETH": ethBalance, "LTC": ltcBalance}, function (err) {
                            if (err) {
                                console.log("Error updating balance in AWS " + JSON.stringify(err));
                            } else {
                                console.log("cleanup done");
                                cb();
                            }
                        });
                    }
                })
            }
        })
    } else {
        console.log("Picking up where we left of without cleanup");
        cb();
    }
}

console.log(JSON.stringify(args));

cleanAll(clean, function() {
    utils.sleep(1);
    run();
})