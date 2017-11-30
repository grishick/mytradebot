/**
 * Created by gsolovyev on 7/8/17.
 */
var AWS = require("aws-sdk");
var config = require('../config');
var AWS_ORDER_BOOK_NAME = config.get("AWS_ORDER_BOOK_NAME"); //"autotest-paper-orders";
var AWS_FILLS_BOOK_NAME = config.get("AWS_FILLS_BOOK_NAME"); //"autotest-paper-fills";
var AWS_ACCOUNT_RECORD_NAME = config.get("AWS_ACCOUNT_RECORD_NAME"); //"autotest-paper-account";


if(process.env.AWS_EXECUTION_ENV == "sandbox") {
    var credentials = new AWS.SharedIniFileCredentials();
    AWS.config.credentials = credentials;
}

AWS.config.update({
    region: "us-east-1"
});
var glob = require("../constants.js");
var docClient = new AWS.DynamoDB.DocumentClient();
var utils = require("../lib/utils.js");
function updateBalance(balances, cb) {
    console.log("dynamodb :: updateBalance " + JSON.stringify(balances))
    var itemData = {
        record_type:"USD",
        balance:balances["USD"] ? balances["USD"] : "0"
    }
    var requestParams = {
        TableName:AWS_ACCOUNT_RECORD_NAME,
        Item:itemData
    }
    docClient.put(requestParams, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            cb(err);
        } else {
            console.log("dynamodb :: updated USD balance")
            itemData = {
                record_type:"BTC",
                balance:balances["BTC"] ? Number(balances["BTC"]) : "0"
            }
            requestParams = {
                TableName:AWS_ACCOUNT_RECORD_NAME,
                Item:itemData
            }
            docClient.put(requestParams, function(err, data) {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    cb(err);
                } else {
                    console.log("dynamodb :: updated BTC balance")
                    itemData = {
                        record_type:"LTC",
                        balance:balances["LTC"] ? Number(balances["LTC"]) : "0"
                    }
                    requestParams = {
                        TableName:AWS_ACCOUNT_RECORD_NAME,
                        Item:itemData
                    }
                    docClient.put(requestParams, function(err, data) {
                        if (err) {
                            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                            cb(err);
                        } else {
                            console.log("dynamodb :: updated LTC balance")
                            itemData = {
                                record_type:"ETH",
                                balance:balances["ETH"] ? Number(balances["ETH"]) : "0"
                            }
                            requestParams = {
                                TableName:AWS_ACCOUNT_RECORD_NAME,
                                Item:itemData
                            }
                            docClient.put(requestParams, function(err, data) {
                                if (err) {
                                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                                    cb(err);
                                } else {
                                    console.log("dynamodb :: updated ETH balance")
                                    cb();
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function deleteAwsOrders(cb) {
    //console.log("Clearing paper trades");
    var params = {
        TableName: AWS_ORDER_BOOK_NAME,
        ProjectionExpression: "id"
    };
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            cb();
        } else {
            console.log("Scan succeeded. Found " + data.Count + " orders");
            var toDelete = data.Count;
            if(toDelete == 0) {
                cb()
            } else {
                data.Items.forEach(function(order) {
                    var deleteParams = {
                        TableName:AWS_ORDER_BOOK_NAME,
                        Key:{
                            "id":order.id
                        }
                    };
                    console.log("Attempting to delete an order...");
                    docClient.delete(deleteParams, function(err, data) {
                        if (err) {
                            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                        }
                        toDelete--;
                        if(toDelete == 0) {
                            cb();
                        }
                    });
                });
            }
        }
    });
}

function deleteAwsFills(cb) {
    //console.log("Clearing paper trades");
    var params = {
        TableName: AWS_FILLS_BOOK_NAME,
        ProjectionExpression: "trade_id"
    };
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            cb();
        } else {
            console.log("Scan succeeded. Found " + data.Count + " fills");
            var toDelete = data.Count;
            if(toDelete == 0) {
                cb()
            } else {
                data.Items.forEach(function(trade) {
                    var deleteParams = {
                        TableName:AWS_FILLS_BOOK_NAME,
                        Key:{
                            "trade_id":trade.trade_id
                        }
                    };
                    console.log("Attempting to delete a fill...");
                    docClient.delete(deleteParams, function(err, data) {
                        if (err) {
                            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                        }
                        toDelete--;
                        if(toDelete == 0) {
                            cb();
                        }
                    });
                });
            }
        }
    });
}

function createAwsFill(data, cb) {
    //create a test order
    var fillParams = {
        TableName:AWS_FILLS_BOOK_NAME,
        Item:data
    };
    //console.log("Adding a test order to DynamoDB...");
    docClient.put(fillParams, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            cb(err);
        } else {
            cb();
        }
    });
}

function getCurrentOrder(cb) {
    var params = {
        TableName: AWS_ORDER_BOOK_NAME
    };
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("getCurrentOrder::Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            cb(err, null);
        } else {
            //console.log("getCurrentOrder::Scan succeeded. Found " + data.Count + " items");
            //console.log("getCurrentOrder::Scan succeeded. Found " + JSON.stringify(data.Items));
            var numFound = data.Count;
            if(numFound == 0) {
                cb(null, null)
            } else {
                var latestOrder = {created_at:""};
                for(var i = 0; i < numFound; i++) {
                    if(data.Items[i].created_at > latestOrder.created_at && data.Items[i].status == "open") {
                        latestOrder = data.Items[i];
                    }
                }
                //console.log("getCurrentOrder::returning " + JSON.stringify(latestOrder));
                cb(null, latestOrder);
            }
        }
    });
}

function placePaperOrder(order, cb) {
    console.log("Adding an order to DynamoDB :: " + AWS_ORDER_BOOK_NAME);
    var orderParams = {
        TableName:AWS_ORDER_BOOK_NAME,
        Item:{
            "price": order.price,
            "size": order.size,
            "product_id":order.product_id,
            "type":order.type,
            "id":order.id,
            'time_in_force':order.time_in_force,
            "side":order.side,
            "status":order.status,
            "created_at":new Date().toISOString()
        }
    };
    if(order.done_at) {
        orderParams.Item.done_at = order.done_at;
    }
    docClient.put(orderParams, function(err, data) {
        if (err) {
            console.log("Error adding paper order to AWS: " + JSON.stringify(err));
            cb(err);
        } else {
            console.log("Added paper order");
            cb(null);
        }
    });
}

function getOrderById(orderId, cb) {
    var params = {
        TableName:AWS_ORDER_BOOK_NAME,
        Key:{
            "id": orderId
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            cb(err, null);
        } else if(data && data.Item) {
            //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            cb(null, data.Item);
        } else {
            cb({"code":glob.NO_DATA, "message":"Could not find a paper order with ID " + orderId}, null);
        }
    });
}

function getLastFill(cb) {
    var params = {
        TableName: AWS_FILLS_BOOK_NAME
    };
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("getLastFill::Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            cb(err, null);
        } else {
            //console.log("getCurrentOrder::Scan succeeded. Found " + data.Count + " items");
            //console.log("getCurrentOrder::Scan succeeded. Found " + JSON.stringify(data.Items));
            var numFound = data.Count;
            if(numFound == 0) {
                cb(null, null)
            } else {
                var latestFill = {created_at:""};
                for(var i = 0; i < numFound; i++) {
                    if(data.Items[i].created_at > latestFill.created_at) {
                        latestFill = data.Items[i];
                    }
                }
                cb(null, latestFill);
            }
        }
    });
}

function getAvailableBalance(cb) {
    console.log("dynamodb :: getAvailableBalance")
    var params = {
        TableName: AWS_ACCOUNT_RECORD_NAME
    };
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("getAvailableBalance::Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            cb(err, null);
        } else {
            //console.log("getAvailableBalance::Scan succeeded. Found " + data.Count + " items");
            console.log("getAvailableBalance::Scan succeeded. Found " + JSON.stringify(data.Items));
            var numFound = data.Count;
            if(numFound == 0) {
                cb(null, null)
            } else {
                var balances = {};
                for(var i = 0; i < numFound; i++) {
                    balances[data.Items[i].record_type] = data.Items[i].balance;
                }
                cb(null, balances);
            }
        }
    });
}

function deleteAwsOrder(orderId, cb) {
    var deleteParams = {
        TableName:AWS_ORDER_BOOK_NAME,
        Key:{
            "id":orderId
        }
    };
    console.log("Deleting order from DynamoDB...");
    docClient.delete(deleteParams, function(err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            cb(err);
        } else {
            cb(null)
        }
    });
}
module.exports = {
    createAwsFill:createAwsFill,
    deleteAwsOrders:deleteAwsOrders,
    updateBalance:updateBalance,
    getCurrentOrder:getCurrentOrder,
    placePaperOrder:placePaperOrder,
    getOrderById:getOrderById,
    getLastFill:getLastFill,
    getAvailableBalance:getAvailableBalance,
    deleteAwsOrder:deleteAwsOrder,
    deleteAwsFills:deleteAwsFills,
    AWS_ORDER_BOOK_NAME:AWS_ORDER_BOOK_NAME,
    AWS_ACCOUNT_RECORD_NAME:AWS_ACCOUNT_RECORD_NAME,
    AWS_FILLS_BOOK_NAME:AWS_FILLS_BOOK_NAME
}