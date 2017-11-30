/**
 * Created by gsolovyev on 7/8/17.
 */
var glob = require("../constants.js");
var utils = require("../lib/utils.js");
var format = require('string.format');

function heartbeat(mode, productId,  dip, rise, minTrade, maxTrade, cancelBuyAfter, stopLossRatio, trader, advisor, notifier, cb) {
    var rise = Number(rise);
    var dip = Number(dip);
    var minTrade = Number(minTrade);
    var maxTrade = Number(maxTrade);
    console.log("heartbeat {time} ({mode}, {productId}, {dip}, {rise}, {minTrade}, {maxTrade}, {cancelBuyAfter}, {stopLossRatio})".format(
        {mode:mode, productId:productId,  dip:dip, rise:rise, minTrade:minTrade, maxTrade:maxTrade, cancelBuyAfter:cancelBuyAfter, stopLossRatio:stopLossRatio, time:new Date().toLocaleString("en-us", {timeZone:"America/Los_Angeles"})}
    ))
    trader.getCurrentOrder(mode, productId, function(err, orderData) {
        if(err) {
            cb(err);
        } else if(orderData && orderData.status && orderData.status != "done") {
            console.log("Current order is " + JSON.stringify(orderData));
            trader.updateOrder(mode, orderData, function(err, updatedOrder) {
                if(err) {
                    cb(err);
                } else if(!updatedOrder) {
                    cb({"code":glob.NO_DATA, "message":"updatedOrder is null, but no error was returned"});
                } else if(updatedOrder.status == "pending") {
                    console.log("Current order is pending. Exiting.")
                    cb(null);
                } else if(updatedOrder.status == "done") {
                    var orderTime = new Date() - new Date(updatedOrder.created_at);
                    console.log("{time}: Last order took {orderTime}".format({orderTime:orderTime,time:new Date().toLocaleString("en-us", {timeZone:"America/Los_Angeles"})}));
                    var msg = "Order {side} {productId} for {price} is {status} at {time}".format(
                        {
                            time: new Date().toLocaleString("en-us", {timeZone: "America/Los_Angeles"}),
                            productId:productId,
                            price:updatedOrder.price,
                            side:updatedOrder.side,
                            status:updatedOrder.status
                        }
                    );
                    notifier.notify(msg, function(err) {
                        if(err) {
                            console.log("Notifier returned an error " + JSON.stringify(err));
                        }
                        attemptTrade(mode, productId,  dip, stopLossRatio, rise, minTrade, maxTrade, cancelBuyAfter, trader, advisor, notifier, cb);
                    })
                } else {
                    //open order
                    var now = new Date().getTime();
                    var orderDate = new Date(orderData.created_at).getTime();
                    if(orderData.side == "sell") {
                        reviewSellOrder(orderData, mode, productId, dip, stopLossRatio, rise, trader, advisor, notifier, cb);
                    } else {
                       reviewBuyOrder(updatedOrder, mode, productId,  dip, stopLossRatio, rise, minTrade, maxTrade, cancelBuyAfter, trader, advisor, cb);
                    }
                }
            })
        } else {
            if(orderData && orderData.status) {
                var msg = "Order {side} {productId} for {price} is {status} at {time}".format(
                    {
                        time: new Date().toLocaleString("en-us", {timeZone: "America/Los_Angeles"}),
                        productId:productId,
                        price:orderData.price,
                        side:orderData.side,
                        status:orderData.status
                    }
                );
                notifier.notify(msg, function(err) {
                    if(err) {
                        console.log("Notifier returned an error " + JSON.stringify(err));
                    }
                    if(orderData.status == "done") {
                        attemptTrade(mode, productId,  dip, stopLossRatio, rise, minTrade, maxTrade, cancelBuyAfter, trader, advisor, notifier, cb)
                    } else {
                        cb();
                    }
                })
            } else {
                attemptTrade(mode, productId,  dip, stopLossRatio, rise, minTrade, maxTrade, cancelBuyAfter, trader, advisor, notifier, cb)
            }
        }
    })
}

function attemptTrade(mode, productId,  dip, stopLossRatio, rise, minTrade, maxTrade, cancelBuyAfter, trader, advisor, notifier, cb) {
    var rise = Number(rise);
    var dip = Number(dip);
    var minTrade = Number(minTrade);
    var maxTrade = Number(maxTrade);
    trader.getAvailableBalance(mode, function(err, balances) {
        if(balances) {
            if(mode == "live") {
                utils.sleep(1);
            }
            trader.getCurrentPrice(productId, function(err, currentPrice) {
                if(balances[productId.substr(0,3)]) {
                    if(mode == "live") {
                        utils.sleep(1);
                    }
                    trader.getLastFill(mode, productId, function(err, lastFill) {
                        if(err) {
                            cb(err);
                        } else if(lastFill) {
                            console.log("Last fill is " + JSON.stringify(lastFill));
                            advisor.advise(currentPrice, rise, dip, stopLossRatio, lastFill, null, function(err, advice) {
                                var sellParams = {
                                    'price': advice.price,
                                    'size': balances[productId.substr(0,3)],
                                    'product_id': productId,
                                    'type': 'limit'
                                };
                                trader.placeSellOrder(mode, sellParams, function (err, order) {
                                    if(err) {
                                        cb(err)
                                    } else {
                                        if(mode == "live") {
                                            utils.sleep(1);
                                        }
                                        trader.getBalances(mode, function(err, allBalances) {
                                            if(err) {
                                                cb(err)
                                            } else {
                                                var msg = "Placed limit sell order at {time}. For {size} {productId} at {price}. Bought at {fill}. Balances: USD:{usd}, BTC: {btc}, ETH: {eth}, LTC: {ltc}".format(
                                                    {
                                                        time: new Date().toLocaleString("en-us", {timeZone: "America/Los_Angeles"}),
                                                        productId: productId,
                                                        price: sellParams.price,
                                                        size: sellParams.size,
                                                        fill: lastFill.price,
                                                        usd:allBalances["USD"],
                                                        btc:allBalances["BTC"],
                                                        ltc:allBalances["LTC"],
                                                        eth:allBalances["ETH"]
                                                    }
                                                );
                                                notifier.notify(msg, cb)
                                            }
                                        })
                                    }
                                })
                            });
                        } else {
                            cb({code:glob.NOT_FOUND, message:"cannot find last fill"});
                        }
                    })
                } else if(balances["USD"] && balances["USD"] >= minTrade) {
                    console.log("current balance in USD " + balances["USD"]);
                    if(err) {
                        cb(err)
                    } else {
                        advisor.advise(currentPrice, rise, dip, stopLossRatio, null, null, function(err, advice) {
                            if(advice.action == glob.BUY) {
                                var buyParams = {
                                    'price': advice.price,
                                    'size': utils.floor(Math.min(maxTrade, balances["USD"] - 100)/advice.price, 8),
                                    'product_id': productId,
                                    'type':'limit',
                                    'cancel_after':cancelBuyAfter
                                };
                                trader.placeBuyOrder(mode, buyParams, function(err, orderId) {
                                    if(err) {
                                        cb(err);
                                    } else {
                                        if(mode == "live") {
                                            utils.sleep(1);
                                        }
                                        trader.getBalances(mode, function(err, allBalances) {
                                            if(err) {
                                                cb(err)
                                            } else {
                                                var msg = "Placed buy order at {time} for {cancelBuyAfter}. For {size} {productId} at {price}. Balances: USD:{usd}, BTC: {btc}, ETH: {eth}, LTC: {ltc}".format(
                                                    {
                                                        time: new Date().toLocaleString("en-us", {timeZone: "America/Los_Angeles"}),
                                                        productId:productId,
                                                        size:buyParams.size,
                                                        price:buyParams.price,
                                                        cancelBuyAfter:cancelBuyAfter,
                                                        usd:allBalances["USD"],
                                                        btc:allBalances["BTC"],
                                                        ltc:allBalances["LTC"],
                                                        eth:allBalances["ETH"]
                                                    }
                                                );
                                                notifier.notify(msg, cb)
                                            }
                                        })
                                    }
                                })
                            } else {
                                cb(err);
                            }
                        })
                    }
                } else {
                    console.log("Error. Not enough balance: " + JSON.stringify(balances))
                    cb({code:glob.NOT_ENOUGH_BALANCE, message:"Not enough balance of {currency} to place an order. Balance: {balance} ".format({currency:productId.substr(0,3), balance:balances[productId.substr(0,3)]})})
                }
            })
        } else {
            var err = {code:glob.ACCOUNT_EMPTY, message:"No open orders and empty balance"};
            cb(err);
        }
    })
}

function reviewSellOrder(orderData, mode, productId, dip, stopLossRatio, rise, trader, advisor, notifier, cb) {
    if(mode == "live") {
        utils.sleep(1);
    }
    trader.getCurrentPrice(productId, function(err, currentPrice) {
        if (err) {
            cb(err);
        } else {
            if(mode == "live") {
                utils.sleep(1);
            }
            trader.getLastFill(mode, productId, function (err, lastFill) {
                if (err) {
                    cb(err);
                } else {
                    advisor.advise(currentPrice, rise, dip, stopLossRatio, lastFill, orderData, function(err, advice) {
                        if(advice.action == glob.KEEP) {
                            cb(null);
                        } else if(advice.action == glob.REPLACE) {
                            console.log("replacing order");
                            trader.cancelOrder(mode, orderData.id, function (err) {
                                if (err) {
                                    cb(err)
                                } else {
                                    if (mode == "live") {
                                        //let available balance free up
                                        utils.sleep(15);
                                    }
                                    trader.getAvailableBalance(mode, function (err, balances) {
                                        var sellParams = {
                                            'price': advice.price,
                                            'size': balances[productId.substr(0, 3)],
                                            'product_id': productId,
                                            'type': 'limit'
                                        };
                                        trader.placeSellOrder(mode, sellParams, function (err, order) {
                                            if (err) {
                                                cb(err)
                                            } else {
                                                var msg = "Replaced limit sell order with new one at {time}. For {size} {productId} at {price}. Bought at {fill}. Current price: {currentPrice}".format(
                                                    {
                                                        time: new Date().toLocaleString("en-us", {timeZone: "America/Los_Angeles"}),
                                                        productId: productId,
                                                        size: sellParams.size,
                                                        price: sellParams.price,
                                                        fill: lastFill.price,
                                                        currentPrice:currentPrice
                                                    }
                                                );
                                                notifier.notify(msg, cb);
                                            }
                                        })
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

function reviewBuyOrder(orderData, mode, productId,  dip, stopLossRatio, rise, minTrade, maxTrade, cancelBuyAfter, trader, advisor, cb) {
    if(mode == "live") {
        utils.sleep(1);
    }
    trader.getCurrentPrice(productId, function (err, currentPrice) {
        if (err) {
            cb(err);
        } else {
            console.log("current price " + currentPrice);
            advisor.advise(currentPrice, rise, dip, stopLossRatio, null, orderData, function (err, advice) {
                if (err) {
                    cb(err);
                } else if (advice.action == glob.REPLACE) {
                    console.log("replacing order");
                    trader.cancelOrder(mode, orderData.id, function (err) {
                        if (err) {
                            cb(err)
                        } else {
                            if(mode == "live") {
                                //let available balance free up
                                utils.sleep(15);
                            }
                            trader.getAvailableBalance(mode, function (err, balances) {
                                if (balances["USD"] && balances["USD"] >= minTrade) {
                                    console.log("current balance in USD " + balances["USD"]);
                                    var buyParams = {
                                        'price': advice.price,
                                        'size': utils.floor(Math.min(maxTrade, balances["USD"] - 100) / advice.price, 8),
                                        'product_id': productId,
                                        'type': 'limit',
                                        'cancel_after':cancelBuyAfter
                                    };
                                    trader.placeBuyOrder(mode, buyParams, function (err, orderId) {
                                        if(err) {
                                            cb(err)
                                        } else {
                                            cb(null)
                                        }
                                    })
                                } else {
                                    cb({
                                        code: glob.NOT_ENOUGH_BALANCE,
                                        message: "Not enough balance to place an order. USD balance: {usd}. Minimum trade: {minTrade}. Max trade: {maxTrade}. Buy price: {price}.".format({usd:balances["USD"], minTrade:minTrade, maxTrade:maxTrade, price:advice.price})
                                    })
                                }
                            })
                        }
                    })
                } else {
                    cb(null);
                }
            })
        }
    })
}

module.exports = {
    heartbeat:heartbeat,
    attemptTrade:attemptTrade,
    reviewBuyOrder:reviewBuyOrder,
    reviewSellOrder:reviewSellOrder
}
