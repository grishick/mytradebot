/**
 * Created by gsolovyev on 7/6/17.
 */
var glob = require("../constants.js");
var assert = require('assert');
const uuidv4 = require('uuid/v4');
var format = require('string.format');
var utils = require("../lib/utils.js");
var mockAdvisor = {
    adviseCalled:false,
    reset:function () {
        this.adviseCalled = false;
    }
}
var mockNotifier = {
    notifyCalled:false,
    reset:function() {
        this.notifyCalled = false;
    },
    notify:function (msg, cb) {
        var params = {
            Message: msg,
            MessageStructure: 'string',
            PhoneNumber: '+18583334455'
        };
        console.log("Notification: " + msg);
        this.notifyCalled = true;
        cb();
    }
}

var mockTrader = {
    getCurrentOrderCalled:false,
    getAvailableBalanceCalled:false,
    getHighLowCalled:false,
    placeBuyOrderCalled:false,
    placeSellOrderCalled:false,
    getCurrentPriceCalled:false,
    getLastFillCalled:false,
    cancelOrderCalled:false,
    updateOrderCalled:false,
    getLatestTradesCalled:false,
    getBalancesCalled:false,
    lastSellOrderPrice:0,
    lastBuyOrderPrice:0,
    reset:function() {
        this.getBalancesCalled = false;
        this.getCurrentOrderCalled = false;
        this.getAvailableBalanceCalled = false;
        this.getHighLowCalled = false;
        this.placeBuyOrderCalled = false;
        this.placeSellOrderCalled = false;
        this.getCurrentPriceCalled = false;
        this.cancelOrderCalled = false;
        this.getLastFillCalled = false;
        this.updateOrderCalled = false;
        this.getLatestTradesCalled = false;
        this.lastSellOrderPrice = 0;
        this.lastBuyOrderPrice = 0;
    }
}

describe("paper-runner", function() {
    describe("heartbeat", function() {
        beforeEach(function(done) {
            mockTrader.getCurrentOrder = function(mode, productId, cb) {
                console.log("mockTrader :: getCurrentOrder")
                this.getCurrentOrderCalled = true;
                cb(null, null);
            }

            mockTrader.getAvailableBalance = function(mode, cb) {
                console.log("mockTrader :: getAvailableBalance")
                this.getAvailableBalanceCalled = true;
                cb(null, {"USD":5000, "BTC":0.04});
            }

            mockTrader.getHighLow = function(product, interval, cb) {
                console.log("mockTrader :: getHighLow")
                this.getHighLowCalled = true;
                cb(null, {high:2543.79, low:2540.33})
            }

            mockTrader.placeBuyOrder = function(mode, buyParams, cb) {
                console.log("mockTrader :: placeBuyOrder")
                this.placeBuyOrderCalled = true;
                this.lastBuyOrderPrice = buyParams.price;
                cb(null, "0000-1111-2222-3333");
            }

            mockTrader.placeSellOrder = function(mode, sellParams, cb) {
                console.log("mockTrader :: placeSellOrder")
                this.placeSellOrderCalled = true;
                this.lastSellOrderPrice = sellParams.price;
                cb(null, "0000-1111-2222-3333");
            }

            mockTrader.getCurrentPrice = function(product, cb) {
                console.log("mockTrader :: getCurrentPrice")
                this.getCurrentPriceCalled = true;
                cb(null, 2542.59);
            }

            mockTrader.cancelOrder = function(mode, orderId, cb) {
                console.log("mockTrader :: cancelOrder")
                this.cancelOrderCalled = true;
                cb(null, 2542.59);
            }

            mockTrader.getLastFill = function(mode, productId, cb) {
                console.log("mockTrader :: getLastFill")
                this.getLastFillCalled = true;
                var lastFill = {
                    "trade_id": 74,
                    "product_id": productId,
                    "price": "2400.01",
                    "size": "0.01",
                    "order_id": "0000-1111-2222-3333",
                    "created_at": new Date().toISOString(),
                    "liquidity": "T",
                    "fee": "0.00025",
                    "settled": true,
                    "side": "buy"
                }
                cb(null, lastFill);
            }

            mockTrader.updateOrder = function (mode, order, cb) {
                console.log("mockTrader :: updateOrder")
                this.updateOrderCalled = true;
                cb(null, order);
            }

            mockTrader.getLatestTrades = function(mode, cb) {
                console.log("mockTrader :: getLatestTrades");
                this.getLatestTradesCalled = true;
                var trades = [
                    {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2617.93000000","size":"0.35680000","side":"buy"},
                    {"time":"2017-07-06T00:00:23.602Z","trade_id":17767786,"price":"2617.92100000","size":"0.82392126","side":"buy"},
                    {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                    {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2616.15000000","size":"0.07497941","side":"sell"},
                    {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.250000","size":"0.01000000","side":"sell"},
                    {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.15000000","size":"0.01000000","side":"buy"}
                    ]
                cb(null, trades)
            }
            mockTrader.getBalances = function(mode, cb) {
                console.log("mockTrader :: getBalances");
                this.getBalancesCalled = true;
                cb(null, {"USD":100, "BTC":0, "ETH":2.45, "LTC":0.0343})
            }
            mockTrader.reset();

            mockAdvisor.advise = function(current, rise, dip, stopLossRatio, lastFill, currentOrder, cb) {
                this.adviseCalled = true;
                cb(null, {action:glob.BUY, price:2300});
            }
            mockAdvisor.reset();
            mockNotifier.reset();
            done();
        })

        it("should 1. check for current order (find none), 2.check balance (find USD), 3. get advice, 4. place buy order", function(done) {
            this.timeout(20000);
            var mockTrader2 = mockTrader;
            mockTrader2.getAvailableBalance = function(mode, cb) {
                console.log("mockTrader :: getAvailableBalance")
                this.getAvailableBalanceCalled = true;
                cb(null, {"USD":5000, "BTC":0});
            }
            var runner = require("../lib/runner.js");
            runner.heartbeat("paper", "BTC-USD", 0.01, 0.005, 1000, 5000, "day", 2, mockTrader2, mockAdvisor, mockNotifier, function(err) {
                assert.ok(!err, "should not return an error")
                assert.ok(mockTrader2.getCurrentOrderCalled, "should have called getCurrentOrder");
                assert.ok(mockTrader2.getAvailableBalanceCalled, "should have called getAvailableBalance");
                assert.ok(mockAdvisor.adviseCalled, "should have called advise");
                assert.ok(mockTrader2.placeBuyOrderCalled, "should have called placeBuyOrder");
                assert.ok(!mockTrader2.placeSellOrderCalled, "should NOT have called placeSellOrder");
                assert.ok(mockNotifier.notifyCalled, "should have called notify");
                assert.ok(mockTrader2.getBalancesCalled, "should have called getBalances");
                assert.equal(2300, mockTrader2.lastBuyOrderPrice, "should have placed buy order with price {expected}. Instead found {found}".format({"expected":2300, "found":mockTrader2.lastBuyOrderPrice}))
                done();
            })
        })

        it("should 1. check for current order (find none), 2.check balance (find USD), 3. get advice, 4. place buy order", function(done) {
            this.timeout(20000);
            var runner = require("../lib/runner.js");
            var mockAdvisor2 = mockAdvisor;
            mockAdvisor2.reset();
            mockAdvisor2.pricePassed = 0;
            mockAdvisor2.advise = function(current, rise, dip, stopLossRatio, lastFill, currentOrder, cb) {
                this.adviseCalled = true;
                this.pricePassed = current;
                cb(null, {action:glob.BUY, price:2300});
            }
            var mockTrader2 = mockTrader;
            mockTrader2.getAvailableBalance = function(mode, cb) {
                console.log("mockTrader :: getAvailableBalance")
                this.getAvailableBalanceCalled = true;
                cb(null, {"USD":5000, "BTC":0});
            }
            runner.heartbeat("paper", "BTC-USD", 0.01, 0.005, 1000, 5000, "day", 2, mockTrader2, mockAdvisor2, mockNotifier, function(err) {
                assert.ok(!err, "should not return an error")
                assert.ok(mockTrader2.getCurrentOrderCalled, "should have called getCurrentOrder");
                assert.ok(mockTrader2.getAvailableBalanceCalled, "should have called getAvailableBalance");
                assert.ok(mockAdvisor2.adviseCalled, "should have called advise");
                assert.ok(mockTrader2.placeBuyOrderCalled, "should have called placeBuyOrder");
                assert.ok(!mockTrader2.placeSellOrderCalled, "should NOT have called placeSellOrder");
                assert.ok(mockNotifier.notifyCalled, "should have called notify");
                assert.ok(mockTrader2.getBalancesCalled, "should have called getBalances");
                assert.equal(2300, mockTrader2.lastBuyOrderPrice, "should have placed buy order with price {expected}. Instead found {found}".format({"expected":2300, "found":mockTrader2.lastBuyOrderPrice}))
                assert.equal(2542.59, mockAdvisor2.pricePassed, "should have passed 2540.33 to advisor")
                done();
            })
        })

        it("should 1.check current order (find buy order), 2. get advice", function(done) {
            this.timeout(20000);
            var runner = require("../lib/runner.js");
            var mockTrader2 = mockTrader;
            mockTrader2.reset();
            mockTrader2.getCurrentOrder = function(mode, productId, cb) {
                console.log("mockTrader2 :: getCurrentOrder")
                this.getCurrentOrderCalled = true;
                cb(null, {id:uuidv4(),
                    size:2.2354,
                    type:"limit",
                    status:"open",
                    side:"buy",
                    product_id:"BTC-USD",
                    price:2260.11,
                    time_in_force:"GTC"});
            };

            var mockAdvisor2 = mockAdvisor;
            mockAdvisor2.advise = function(current, rise, dip, stopLossRatio, lastFill, currentOrder, cb) {
                this.adviseCalled = true;
                cb(null, {action:glob.KEEP});
            }
            //mode, productId, lookBackSeconds, candleGranularity, margin, trader, advisor, cb
            runner.heartbeat("paper", "BTC-USD", 0.01, 0.005, 1000, 5000, "day", 2, mockTrader2, mockAdvisor2, mockNotifier, function(err) {
                assert.ok(!err, "should not return an error")
                assert.ok(mockTrader2.getCurrentOrderCalled, "should have called getCurrentOrder");
                assert.ok(mockTrader2.updateOrderCalled, "should have called updateOrder");
                assert.ok(!mockTrader2.getAvailableBalanceCalled, "should NOT have called getAvailableBalance");
                assert.ok(mockAdvisor2.adviseCalled, "should have called advise");
                assert.ok(!mockNotifier.notifyCalled, "should NOT have called notify");
                assert.ok(!mockTrader2.placeBuyOrderCalled, "should NOT have called placeBuyOrder");
                assert.ok(!mockTrader2.placeSellOrderCalled, "should NOT have called placeSellOrder");
                done();
            })
        })

        it("should 1.check current order (find sell order)", function(done) {
            this.timeout(20000);
            var runner = require("../lib/runner.js");
            var mockTrader2 = mockTrader;
            mockTrader2.getCurrentOrder = function(mode, productId, cb) {
                console.log("mockTrader2 :: getCurrentOrder")
                this.getCurrentOrderCalled = true;
                cb(null, {id:uuidv4(),
                    size:2.2354,
                    type:"limit",
                    status:"open",
                    side:"sell",
                    product_id:"BTC-USD",
                    price:2412.01,
                    time_in_force:"GTC"});
            };

            mockTrader2.getLastFill = function(mode, productId, cb) {
                console.log("mockTrader2 :: getLastFill")
                this.getLastFillCalled = true;
                var lastFill = {
                    "trade_id": 74,
                    "product_id": productId,
                    "price": "2400.01",
                    "size": "0.01",
                    "order_id": "0000-1111-2222-3333",
                    "created_at": new Date().toISOString(),
                    "liquidity": "T",
                    "fee": "0.00025",
                    "settled": true,
                    "side": "buy"
                }
                cb(null, lastFill);
            }
            var mockAdvisor2 = mockAdvisor;
            mockAdvisor2.advise = function(current, rise, dip, stopLossRatio, lastFill, currentOrder, cb) {
                this.adviseCalled = true;
                cb(null, {action:glob.KEEP});
            }
            //mode, productId, lookBackSeconds, candleGranularity, margin, trader, advisor, cb
            runner.heartbeat("paper", "BTC-USD", 0.01, 0.005, 1000, 5000, "day", 2, mockTrader2, mockAdvisor2, mockNotifier, function(err) {
                assert.ok(!err, "should not return an error")
                assert.ok(mockTrader2.getCurrentOrderCalled, "should have called getCurrentOrder");
                assert.ok(mockTrader2.updateOrderCalled, "should have called updateOrder");
                assert.ok(mockTrader2.getLastFillCalled, "should have called getLastFillCalled");
                assert.ok(!mockTrader2.getAvailableBalanceCalled, "should NOT have called getAvailableBalance");
                assert.ok(mockAdvisor2.adviseCalled, "should have called advise");
                assert.ok(!mockNotifier.notifyCalled, "should NOT have called notify");
                assert.ok(!mockTrader2.placeBuyOrderCalled, "should NOT have called placeBuyOrder");
                assert.ok(!mockTrader2.placeSellOrderCalled, "should NOT have called placeSellOrder");
                done();
            })
        })

        it("should 1.check current order (find sell order). 2. Replace it with a lower one", function(done) {
            this.timeout(30000);
            var runner = require("../lib/runner.js");
            var mockTrader2 = mockTrader;
            mockTrader2.getCurrentOrder = function(mode, productId, cb) {
                console.log("mockTrader2 :: getCurrentOrder")
                this.getCurrentOrderCalled = true;
                cb(null, {id:uuidv4(),
                    size:2.2354,
                    type:"limit",
                    status:"open",
                    side:"sell",
                    product_id:"BTC-USD",
                    price:2424.01,
                    time_in_force:"GTC"});
            };

            mockTrader2.getLastFill = function(mode, productId, cb) {
                console.log("mockTrader2 :: getLastFill")
                this.getLastFillCalled = true;
                var lastFill = {
                    "trade_id": 74,
                    "product_id": productId,
                    "price": "2400.01",
                    "size": "0.01",
                    "order_id": "0000-1111-2222-3333",
                    "created_at": new Date().toISOString(),
                    "liquidity": "T",
                    "fee": "0.00025",
                    "settled": true,
                    "side": "buy"
                }
                cb(null, lastFill);
            }

            mockTrader2.getAvailableBalance = function(mode, cb) {
                console.log("mockTrader :: getAvailableBalance")
                this.getAvailableBalanceCalled = true;
                cb(null, {"USD":2000, "BTC":2.2354});
            }
            mockTrader2.getCurrentPrice = function(product, cb) {
                console.log("mockTrader :: getCurrentPrice")
                this.getCurrentPriceCalled = true;
                cb(null, 2411.59);
            }
            var mockAdvisor2 = mockAdvisor;
            mockAdvisor2.advise = function(current, rise, dip, stopLossRatio, lastFill, currentOrder, cb) {
                this.adviseCalled = true;
                cb(null, {action:glob.REPLACE, price:2412.01});
            }
            //mode, productId, lookBackSeconds, candleGranularity, margin, trader, advisor, cb
            runner.heartbeat("paper", "BTC-USD", 0.01, 0.005, 2500, 5000, "day", 2, mockTrader2, mockAdvisor2, mockNotifier, function(err) {
                assert.ok(!err, "should not return an error")
                assert.ok(mockTrader2.getCurrentOrderCalled, "should have called getCurrentOrder");
                assert.ok(mockTrader2.updateOrderCalled, "should have called updateOrder");
                assert.ok(mockTrader2.getLastFillCalled, "should have called getLastFillCalled");
                assert.ok(mockTrader2.getAvailableBalanceCalled, "should have called getAvailableBalance");
                assert.ok(mockAdvisor2.adviseCalled, "should have called advise");
                assert.ok(!mockTrader2.placeBuyOrderCalled, "should NOT have called placeBuyOrder");
                assert.ok(mockTrader2.cancelOrderCalled, "should have called cancelOrder");
                assert.ok(mockTrader2.placeSellOrderCalled, "should have called placeSellOrder");
                assert.ok(mockNotifier.notifyCalled, "should have called notify");
                assert.equal(2412.01, mockTrader2.lastSellOrderPrice, "should have placed sell order for 2412.01. Found " + mockTrader2.lastSellOrderPrice)
                done();
            })
        })

        it("should 1.check current order (find none), 2. check balance (find BTC), 3. fetch last fill, 5. place sell order", function(done) {
            this.timeout(20000);
            var runner = require("../lib/runner.js");
            var expectedSellPrice = utils.round(2400.01 * 1.005, 2);
            var mockTrader3 = mockTrader;
            mockTrader3.getAvailableBalance = function(mode, cb) {
                console.log("mockTrader3 :: getAvailableBalance")
                this.getAvailableBalanceCalled = true;
                cb(null, {"USD":0, "BTC":2.04});
            };
            mockTrader3.getCurrentOrder = function(mode, productId, cb) {
                console.log("mockTrader3 :: getCurrentOrder")
                this.getCurrentOrderCalled = true;
                cb(null, null);
            }
            mockTrader3.getCurrentPrice = function(product, cb) {
                console.log("mockTrader :: getCurrentPrice")
                this.getCurrentPriceCalled = true;
                cb(null, 2411.59);
            }
            var mockAdvisor2 = mockAdvisor;
            mockAdvisor2.advise = function(current, rise, dip, stopLossRatio, lastFill, currentOrder, cb) {
                this.adviseCalled = true;
                cb(null, {action:glob.SELL, price:expectedSellPrice});
            }
            //mode, productId, lookBackSeconds, candleGranularity, margin, minTrade, maxTrade, trader, advisor, cb
            runner.heartbeat("paper", "BTC-USD", 0.01, 0.005, 1000, 5000, "day", 2, mockTrader3, mockAdvisor2, mockNotifier, function(err) {
                assert.ok(!err, "should not return an error " + JSON.stringify(err))
                assert.ok(mockTrader3.getCurrentOrderCalled, "should have called getCurrentOrder");
                assert.ok(mockTrader3.getAvailableBalanceCalled, "should have called getAvailableBalance");
                assert.ok(mockTrader3.getLastFillCalled, "should have called getLastFill");
                assert.ok(mockAdvisor.adviseCalled, "should have called advise");
                assert.ok(!mockTrader3.placeBuyOrderCalled, "should NOT have called placeBuyOrder");
                assert.ok(mockNotifier.notifyCalled, "should have called notify");
                assert.ok(mockTrader3.placeSellOrderCalled, "should have called placeSellOrder");
                var foundSellPrice = utils.round(mockTrader3.lastSellOrderPrice, 2);
                assert.equal(expectedSellPrice, foundSellPrice, "should have placed buy order with price {expected}. Instead found {found}".format({"expected":expectedSellPrice, "found":foundSellPrice}))
                done();
            })
        })

        it("should 1.check current order (find done 'buy' order), 2. check balance (find BTC), 3. fetch last fill, 5. place sell order", function(done) {
            this.timeout(20000);
            var runner = require("../lib/runner.js");
            var expectedSellPrice = utils.round(2400.01 * 1.005, 2);
            var mockTrader3 = mockTrader;
            mockTrader3.getAvailableBalance = function(mode, cb) {
                console.log("mockTrader3 :: getAvailableBalance")
                this.getAvailableBalanceCalled = true;
                cb(null, {"USD":0, "BTC":2.04});
            };
            mockTrader3.getCurrentOrder = function(mode, productId, cb) {
                console.log("mockTrader3 :: getCurrentOrder")
                this.getCurrentOrderCalled = true;
                cb(null, null);
            }
            mockTrader3.getCurrentOrder = function(mode, productId, cb) {
                console.log("mockTrader3 :: getCurrentOrder")
                this.getCurrentOrderCalled = true;
                cb(null, {id:uuidv4(),
                    size:2.2354,
                    type:"limit",
                    status:"done",
                    side:"buy",
                    product_id:"BTC-USD",
                    price:2390,
                    time_in_force:"GTC"});
            }
            mockTrader3.getCurrentPrice = function(product, cb) {
                console.log("mockTrader :: getCurrentPrice")
                this.getCurrentPriceCalled = true;
                cb(null, 2411.59);
            }
            var mockAdvisor2 = mockAdvisor;
            mockAdvisor2.advise = function(current, rise, dip, stopLossRatio, lastFill, currentOrder, cb) {
                this.adviseCalled = true;
                cb(null, {action:glob.SELL, price:expectedSellPrice});
            }
            //mode, productId, lookBackSeconds, candleGranularity, margin, minTrade, maxTrade, trader, advisor, cb
            runner.heartbeat("paper", "BTC-USD", 0.01, 0.005, 1000, 5000, "day", 2, mockTrader3, mockAdvisor2, mockNotifier, function(err) {
                assert.ok(!err, "should not return an error " + JSON.stringify(err))
                assert.ok(mockTrader3.getCurrentOrderCalled, "should have called getCurrentOrder");
                assert.ok(mockTrader3.getAvailableBalanceCalled, "should have called getAvailableBalance");
                assert.ok(mockTrader3.getLastFillCalled, "should have called getLastFill");
                assert.ok(mockAdvisor2.adviseCalled, "should have called advise");
                assert.ok(!mockTrader3.placeBuyOrderCalled, "should NOT have called placeBuyOrder");
                assert.ok(mockNotifier.notifyCalled, "should have called notify");
                assert.ok(mockTrader3.placeSellOrderCalled, "should have called placeSellOrder");
                var foundSellPrice = utils.round(mockTrader3.lastSellOrderPrice, 2);
                assert.equal(expectedSellPrice, foundSellPrice, "should have placed buy order with price {expected}. Instead found {found}".format({"expected":expectedSellPrice, "found":foundSellPrice}))
                done();
            })
        })


        it("should 1.check current order (find buy order), 2. get advice, 3. check balance, 4. update buy order with higher price", function(done) {
            this.timeout(20000);
            var runner = require("../lib/runner.js");
            var mockTrader4 = mockTrader;
            mockTrader4.getCurrentOrder = function(mode, productId, cb) {
                console.log("mockTrader4 :: getCurrentOrder")
                this.getCurrentOrderCalled = true;
                cb(null, {id:uuidv4(),
                    size:2.2354,
                    type:"limit",
                    status:"open",
                    side:"buy",
                    product_id:"BTC-USD",
                    price:2260.11,
                    time_in_force:"GTC"});
            };

            var mockAdvisor4 = mockAdvisor;
            mockAdvisor4.advise = function(current, rise, dip, stopLossRatio, lastFill, currentOrder, cb) {
                console.log("mockAdvisor4 :: advise")
                this.adviseCalled = true;
                cb(null, {action:glob.REPLACE, price:2260.23});
            }
            //mode, productId, lookBackSeconds, candleGranularity, margin, trader, advisor, cb
            runner.heartbeat("paper", "BTC-USD", 0.01, 0.005, 1000, 5000, "day", 2, mockTrader4, mockAdvisor4, mockNotifier, function(err) {
                assert.ok(!err, "should not return an error " + JSON.stringify(err))
                assert.ok(mockTrader4.getCurrentOrderCalled, "should have called getCurrentOrder");
                assert.ok(mockTrader4.updateOrderCalled, "should have called updateOrder");
                assert.ok(mockTrader4.getAvailableBalanceCalled, "should have called getAvailableBalance");
                //assert.ok(mockTrader4.getHighLowCalled, "should have called getHighLow");
                assert.ok(mockAdvisor4.adviseCalled, "should have called advise");
                assert.ok(mockTrader4.placeBuyOrderCalled, "should have called placeBuyOrder");
                assert.ok(mockTrader4.cancelOrderCalled, "should have called cancelOrder");
                assert.ok(!mockNotifier.notifyCalled, "should NOT have called notify");
                assert.ok(!mockTrader4.placeSellOrderCalled, "should NOT have called placeSellOrder");
                assert.equal(2260.23, mockTrader4.lastBuyOrderPrice, "should have placed buy order with price {expected}. Instead found {found}".format({"expected":2260.23, "found":mockTrader4.lastBuyOrderPrice}))
                done();
            })
        })

        it("should 1.check current order (find sell order). 2. update sell order and find that it matched. 3.check balance (find USD), 4.fetch high/low, 5. get advice, 6. place buy order", function(done) {
            this.timeout(20000);
            var runner = require("../lib/runner.js");
            var mockTrader5 = mockTrader;
            mockTrader5.getCurrentOrder = function(mode, productId, cb) {
                console.log("mockTrader5 :: getCurrentOrder")
                this.getCurrentOrderCalled = true;
                cb(null, {id:uuidv4(),
                    size:2.2354,
                    type:"limit",
                    status:"open",
                    side:"sell",
                    product_id:"BTC-USD",
                    price:2260.11,
                    time_in_force:"GTC"});
            };
            mockTrader5.updateOrder = function (mode, order, cb) {
                console.log("mockTrader5 :: updateOrder")
                this.updateOrderCalled = true;
                order.status="done";
                cb(null, order);
            }
            mockTrader5.getAvailableBalance = function(mode, cb) {
                console.log("mockTrader :: getAvailableBalance")
                this.getAvailableBalanceCalled = true;
                cb(null, {"USD":5000, "BTC":0});
            }
            //mode, productId, lookBackSeconds, candleGranularity, margin, trader, advisor, cb
            runner.heartbeat("paper", "BTC-USD", 0.01, 0.005, 1000, 5000, "day", 2, mockTrader5, mockAdvisor, mockNotifier, function(err) {
                assert.ok(!err, "should not return an error")
                assert.ok(mockTrader5.getCurrentOrderCalled, "should have called getCurrentOrder");
                assert.ok(mockTrader5.updateOrderCalled, "should have called updateOrder");
                assert.ok(mockTrader5.getAvailableBalanceCalled, "should have called getAvailableBalance");
                assert.ok(mockAdvisor.adviseCalled, "should have called advise");
                assert.ok(mockTrader5.placeBuyOrderCalled, "should have called placeBuyOrder");
                assert.ok(mockNotifier.notifyCalled, "should have called notify");
                assert.ok(!mockTrader5.placeSellOrderCalled, "should NOT have called placeSellOrder");
                assert.equal(2300, mockTrader5.lastBuyOrderPrice, "should have placed buy order with price {expected}. Instead found {found}".format({"expected":2300, "found":mockTrader5.lastBuyOrderPrice}))
                done();
            })
        })
    })
})