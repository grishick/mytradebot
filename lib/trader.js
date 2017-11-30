/**
 * Created by gsolovyev on 7/4/17.
 */
var Gdax = require('gdax');
var config = require('../config');
var glob = require("../constants.js");
var dynamodb = require("../lib/dynamodb.js");
var simulator = require("../lib/simulator.js");
var format = require('string.format');
const uuidv4 = require('uuid/v4');
function getAuthedClient() {
    var authedClient = config.get("TRADE_MODE") == "sandbox" ? (new Gdax.AuthenticatedClient(
        config.get("GDAX_SANDBOX_API_KEY"),
        config.get("GDAX_SANDBOX_API_SECRET"),
        config.get("GDAX_SANDBOX_PASSPHRASE"),
        config.get("GDAX_SANDBOX_API_URL"))) : (new Gdax.AuthenticatedClient(
        config.get("GDAX_LIVE_API_KEY"),
        config.get("GDAX_LIVE_API_SECRET"),
        config.get("GDAX_LIVE_PASSPHRASE"),
        config.get("GDAX_LIVE_API_URL")));
    return authedClient;
}

function getPublicClient(productId) {
    var publicClient = config.get("DATA_MODE") == "sandbox" ? (new Gdax.PublicClient(
        productId,
        config.get("GDAX_SANDBOX_API_URL"))) : (new Gdax.PublicClient(
        productId,
        config.get("GDAX_LIVE_API_URL")));
    return publicClient;
}

function getCurrentOrder(mode, productId, cb) {
    var trader = this;
    if(mode == "paper") {
        dynamodb.getCurrentOrder(cb);
    } else {
        getAuthedClient().getOrders({product_id:productId}, function (err, resp, data) {
            if (err) {
                cb(err, null);
            } else if (data && data.length > 0) {
                cb(null, data[0]);
            } else {
                cb(null, null);
            }
        })
    }
}

function getLatestTrades(product, cb) {
    getPublicClient(product).getProductTrades(function(err, resp, data) {
        if(err) {
            cb(err, null);
        } else if(data && data.length > 0) {
            console.log("Found " + data.length + " trades ")
            cb(null, data);
        } else {
            cb({code:glob.NO_DATA, resp:resp}, null);
        }
    })
}

function getTradesSince(product, oldestTrade, cb) {
    getPublicClient(product).getProductTrades({'before':oldestTrade},function(err, resp, data) {
        if(err) {
            cb(err, null);
        } else if(data && data.length > 0) {
            console.log("Found " + data.length + " trades ")
            cb(null, data);
        } else {
            cb({code:glob.NO_DATA, resp:resp}, null);
        }
    })
}
function getHighLow(product, interval, cb) {
    getPublicClient(product).getProductHistoricRates({granularity:interval}, function(err, resp, data) {
        if(err) {
            cb(err, null);
        } else if(data && data.length > 0) {
            var lowest = -1;
            var highest = -1;
            for(var ix in data) {
                if(lowest < 0 || lowest > data[ix][1]) {
                    lowest = data[ix][1];
                }
                if(highest < data[ix][2]) {
                    highest = data[ix][2];
                }
            }
            cb(null, {low:lowest, high:highest});
        } else {
            cb({code:glob.NO_DATA, resp:resp}, null);
        }
    })
}

function getCurrentPrice(product, cb) {
    getPublicClient(product).getProductTicker(function(err, resp, data) {
        if(err) {
            cb(err, null);
        } else if(data && data.price) {
            cb(null, data.price);
        } else {
            cb({"code":glob.NO_DATA, "resp":resp}, null);
        }
    })
}

function placeBuyOrder(mode, buyParams, cb) {
    console.log("trader :: placeBuyOrder " + JSON.stringify(buyParams));
    var trader = this;
    if(mode == "paper") {
        var orderId = uuidv4();
        var order = buyParams;
        order.id = orderId;
        order.status = 'open';
        order.time_in_force = 'GTT';
        order.side = "buy";
        dynamodb.placePaperOrder(order, function(err) {
            dynamodb.getAvailableBalance(function(err, balance) {
                balance["USD"] -= order.size * order.price;
                dynamodb.updateBalance(balance, function (err) {
                    console.log("trade :: placeBuyOrder -> updated paper balance")
                    cb(err, orderId);
                })
            })

        });
    } else {
        console.log("Placing buy order " + JSON.stringify(buyParams));
        getAuthedClient().buy(buyParams, function(err, resp, data) {
            if(err) {
                cb(err, null);
            } else if(data && data.id) {
                cb(null, data.id);
            } else {
                cb({"code":glob.NO_DATA, "resp":resp}, null);
            }
        })
    }
}

function placeSellOrder(mode, sellParams, cb) {
    console.log("trader :: placeSellOrder " + JSON.stringify(sellParams));
    var trader = this;
    if(mode == "paper") {
        var orderId = uuidv4();
        var order = sellParams;
        order.id = orderId;
        order.status = 'open';
        order.time_in_force = 'GTC';
        order.side = "sell";
        dynamodb.placePaperOrder(order, function(err) {
            dynamodb.getAvailableBalance(function(err, balance) {
                if(err) {
                    cb(err, orderId)
                } else {
                    balance[order.product_id.substr(0,3)] -= order.size;
                    dynamodb.updateBalance(balance, function (err) {
                        cb(err, orderId);
                    })
                }
            })
        });
    } else {
        if(sellParams.price > 20 && sellParams.price != null) {
            getAuthedClient().sell(sellParams, function(err, resp, data) {
                if(err) {
                    cb(err, null);
                } else if(data && data.id) {
                    cb(null, data.id);
                } else {
                    cb({"code":glob.NO_DATA, "resp":resp}, null);
                }
            })
        } else {
            cb({"code":glob.ERROR_CODE_BAD_ORDER, "msg":"invalid sell price " + sellParams.price}, null);
        }

    }
}

function getOrderById(mode, orderId, cb) {
    var trader = this;
    if(mode == "paper") {
        dynamodb.getOrderById(orderId, cb);
    } else {
        getAuthedClient().getOrder(orderId, function(err, resp, data) {
            if(err) {
                cb(err, null);
            } else if(data && data.message == "NotFound") {
                cb({"code":glob.NOT_FOUND, "resp":resp, "message":"Order with id {orderId} not found".format({orderId:orderId})}, null);
            } else if(!data) {
                cb({"code":glob.NO_DATA, "resp":resp}, null);
            } else if(data && data.message) {
                cb({"code":glob.UNKNOWN, "resp":resp, message:data.message}, null);
            } else {
                cb(err, data);
            }
        })
    }
}

function updateOrder(mode, order, cb) {
    var trader = this;
    if(mode == "paper") {
        trader.getLatestTrades(order.product_id, function(err, trades) {
            if (err) {
                cb(err, order)
            } else {
                if (trades && trades.length > 0) {
                    simulator.tryOrderMatch(trades, order, function (err, result) {
                        if (result) {
                            console.log("changing order status to 'done'")
                            order.status = "done";
                            order.done_at = new Date().toISOString();
                            var fill = {
                                "trade_id": trades[0].trade_id,
                                "product_id": order.product_id,
                                "price": order.price,
                                "size": order.size,
                                "order_id": order.id,
                                "created_at": trades[0].time,
                                "liquidity": "T",
                                "fee": "0.00025",
                                "settled": true,
                                "side": order.side
                            }
                            dynamodb.createAwsFill(fill, function (err) {
                                if (err) {
                                    cb(err, order)
                                } else {
                                    dynamodb.placePaperOrder(order, function (err) {
                                        if (err) {
                                            cb(err, order)
                                        } else {
                                            dynamodb.getAvailableBalance(function (err, balance) {
                                                if (err) {
                                                    cb(err, order)
                                                } else {
                                                    if (order.side == "buy") {
                                                        //buy order matched. Increase balance of BTC
                                                        if (!balance[order.product_id.substr(0, 3)]) {
                                                            balance[order.product_id.substr(0, 3)] = order.size;
                                                        } else {
                                                            balance[order.product_id.substr(0, 3)] += order.size;
                                                        }
                                                    } else {
                                                        //sell order matched. Increase balance of USD
                                                        if (!balance["USD"]) {
                                                            balance["USD"] = order.size * order.price;
                                                        } else {
                                                            balance["USD"] += order.size * order.price;
                                                        }
                                                    }
                                                    dynamodb.updateBalance(balance, function (err) {
                                                        cb(err, order);
                                                    })
                                                }
                                            })
                                        }
                                    });
                                }
                            })
                        } else {
                            cb(err, order);
                        }
                    })
                } else {
                    cb(null, order);
                }
            }
        })
    } else {
        if(cb == null && typeof(trades) == "function") {
            cb = trades;
        }
        trader.getOrderById(mode, order.id, function(err, order) {
            cb(err, order);
        })
    }
}

function getLastFill(mode, productId, cb) {
    var trader = this;
    if(mode == "paper") {
        dynamodb.getLastFill(cb);
    } else {
        getAuthedClient().getFills({product_id:productId}, function (err, resp, data) {
            if (err) {
                cb(err, null);
            } else if (data && data.length > 0) {
                var fill = data[0];
                for(var i = 0; i < data.length; i++) {
                    if(data[i].side == "buy") {
                        fill = data[i];
                        break;
                    }
                }
                cb(null, fill);
            } else {
                cb(null, null);
            }
        })
    }
}

function getAvailableBalance(mode, cb) {
    if(mode == "paper") {
        dynamodb.getAvailableBalance(cb);
    } else {
        getAuthedClient().getAccounts(function(err, resp, data) {
            if (err) {
                cb(err, null);
            } else if (data && data.length > 0) {
                var balances = {};
                for(var i = 0; i < data.length; i++) {
                    balances[data[i].currency] = Number(data[i].balance);
                    if(Number(data[i].hold) > 0) {
                        balances[data[i].currency] -= Number(data[i].hold);
                    }
                }
                cb(null, balances);
            } else {
                cb(null, null);
            }
        })
    }
}

function getBalances(mode, cb) {
    if(mode == "paper") {
        dynamodb.getAvailableBalance(cb);
    } else {
        getAuthedClient().getAccounts(function(err, resp, data) {
            if (err) {
                cb(err, null);
            } else if (data && data.length > 0) {
                var balances = {};
                for(var i = 0; i < data.length; i++) {
                    balances[data[i].currency] = Number(data[i].balance);
                }
                cb(null, balances);
            } else {
                cb(null, null);
            }
        })
    }
}

function cancelOrder(mode, orderId, cb) {
    if(mode == "paper") {
        dynamodb.getAvailableBalance(function(err, balance) {
            dynamodb.getOrderById(orderId, function(err, orderData) {
                if(err) {
                    cb(err)
                } else {
                    dynamodb.deleteAwsOrder(orderId, function (err) {
                        if (err) {
                            cb(err)
                        } else {
                            if (!orderData) {
                                cb({
                                    "code": glob.NOT_FOUND,
                                    "resp": resp,
                                    "message": "Order with id {orderId} not found".format({orderId: orderId})
                                })
                            } else {
                                if (orderData && orderData.side == "sell") {
                                    //add product back to balance
                                    balance[orderData.product_id.substr(0, 3)] += Number(orderData.size);
                                } else if (orderData && orderData.side == "buy") {
                                    //add USD back to balance
                                    balance["USD"] += Number(orderData.size) * Number(orderData.price);
                                }
                                dynamodb.updateBalance(balance, function (err) {
                                    cb(err, orderId);
                                })
                            }
                        }
                    });
                }
            })
        })

    } else {
        getAuthedClient().cancelOrder(orderId, function(err, resp, data) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        })
    }
}

function getOrderBook(productId, cb) {
    getPublicClient(productId).getProductOrderBook({"level":2}, function(err, resp, data) {
        if(err) {
            cb(err, data, resp);
        } else if(data) {
            //console.log("Found order book")
            cb(null, data, resp);
        } else {
            cb({code:glob.NO_DATA, resp:resp}, data, resp);
        }
    })
}
module.exports = {
    getCurrentOrder:getCurrentOrder,
    getHighLow:getHighLow,
    getCurrentPrice:getCurrentPrice,
    placeBuyOrder:placeBuyOrder,
    getOrderById:getOrderById,
    placeSellOrder:placeSellOrder,
    getLatestTrades:getLatestTrades,
    getTradesSince:getTradesSince,
    updateOrder:updateOrder,
    getLastFill:getLastFill,
    getAvailableBalance:getAvailableBalance,
    cancelOrder:cancelOrder,
    getOrderBook:getOrderBook,
    getBalances:getBalances
}
