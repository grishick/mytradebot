/**
 * Created by gsolovyev on 7/4/17.
 */
var glob = require("../constants.js");
var assert = require('assert');
var Gdax = require('gdax');
var config = require('../config');
var utils = require("../lib/utils.js");
var dynamodb = require("../lib/dynamodb.js")
var format = require('string.format');
const uuidv4 = require('uuid/v4');

var currentOrder = {
    id:"",
    size:0,
    type:"",
    status:"",
    side:"",
    settled:"",
    product_id:"BTC-USD",
    price:0,
    time_in_force:"",
    created_at:""
};

describe("trader", function() {
    // runs before all tests in this block
/*    before(function(done) {
        this.timeout(10000);
        console.log("Running 'before'");

        //clear all orders
        var authedClient = new Gdax.AuthenticatedClient(
            config.get("GDAX_SANDBOX_API_KEY"),
            config.get("GDAX_SANDBOX_API_SECRET"),
            config.get("GDAX_SANDBOX_PASSPHRASE"),
            config.get("GDAX_SANDBOX_API_URL"));

        //console.log("Created an authed client");
        authedClient.cancelAllOrders({product_id: 'BTC-USD'}, function(orders) {
            console.log("Cancelled existing orders");
            dynamodb.deleteAwsOrders(function() {
                done();
            })
        });

    });
*/
 /*   after(function(done) {
        this.timeout(10000);
        utils.sleep(2);
        var authedClient = new Gdax.AuthenticatedClient(
            config.get("GDAX_SANDBOX_API_KEY"),
            config.get("GDAX_SANDBOX_API_SECRET"),
            config.get("GDAX_SANDBOX_PASSPHRASE"),
            config.get("GDAX_SANDBOX_API_URL"));

        authedClient.cancelAllOrders({product_id: 'BTC-USD'}, function(orders) {
            console.log("Cancelled existing orders");
            dynamodb.deleteAwsOrders(function() {
                done();
            })
        });
    });
*/
   /* describe("getCurrentOrder(online, BTC-USD)", function() {
        before(function(done) {
            this.timeout(10000);
            utils.sleep(2);
            var buyParams = {
                'price': '100.00', // USD
                'size': '0.01',  // BTC
                'product_id': 'BTC-USD',
                'type':'limit'
            };
            var authedClient = new Gdax.AuthenticatedClient(
                config.get("GDAX_SANDBOX_API_KEY"),
                config.get("GDAX_SANDBOX_API_SECRET"),
                config.get("GDAX_SANDBOX_PASSPHRASE"),
                config.get("GDAX_SANDBOX_API_URL"));

            authedClient.buy(buyParams, function(err, resp, data) {
                currentOrder = data;
                console.log("Created a test order in sandbox");
                done();
            })
        })

        it("Should return current order", function(done) {
            this.skip();
            trader.getCurrentOrder("online", "BTC-USD", function(err, orderData) {
                assert.ok(!err, "should not return an error");
                assert.ok(orderData, "orderData should not be empty");
                assert.ok(orderData.price, "orderData.price should not be empty");
                assert.ok(orderData.side, "orderData.side should not be empty");
                assert.ok(orderData.product_id, "orderData.product_id should not be empty");
                assert.ok(orderData.size, "orderData.size should not be empty");
                assert.ok(orderData.type, "orderData.type should not be empty");
                assert.ok(orderData.id, "orderData.id should not be empty");
                assert.ok(orderData.status, "orderData.status should not be empty");
                assert.ok(orderData.time_in_force, "orderData.time_in_force should not be empty");
                assert.ok(orderData.created_at, "orderDate.created_at should not be empty")
                assert.equal(currentOrder.created_at, orderData.created_at,"expecting current order price to be " + currentOrder.created_at);
                assert.equal(currentOrder.price, orderData.price,"expecting current order price to be " + currentOrder.price);
                assert.equal(currentOrder.side, orderData.side,"expecting current order price to be " + currentOrder.side);
                assert.equal(currentOrder.product_id, orderData.product_id,"expecting current order price to be " + currentOrder.product_id);
                assert.equal(currentOrder.time_in_force, orderData.time_in_force,"expecting current order time_in_force to be " + currentOrder.time_in_force);
                assert.equal(currentOrder.id, orderData.id,"expecting current order id to be " + currentOrder.id);
                assert.equal(currentOrder.type, orderData.type,"expecting current order type to be " + currentOrder.type);
                assert.equal(currentOrder.size, orderData.size,"expecting current order size to be " + currentOrder.size);
                assert.ok(orderData.status == "pending" || orderData.status == "open", "expecting current order status to be 'pending' or 'open'");
                done();
            })
        })
    })*/

    describe("getHighLow(product, since, until, interval)", function() {
        it("should return high and low prices", function(done) {
            this.skip();
            this.timeout(10000);
            var trader = require("../lib/trader.js");
            //console.log("Checking high/low from " + start + " to " + now);
            trader.getHighLow("BTC-USD",  5*60, function(err, lowHigh) {
                assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(lowHigh, "expecting lowHigh to not be null");
                assert.ok(lowHigh.low, "expecting lowHigh.low to not be null");
                assert.ok(lowHigh.high, "expecting lowHigh.high to not be null");
                assert.ok(lowHigh.low < lowHigh.high, "expecting low to be lower then high");
                done();
            });

        })
    })

    describe("getCurrentPrice", function() {
        it("should return current price of BTC", function(done) {
            this.timeout(10000);
            var trader = require("../lib/trader.js");
            trader.getCurrentPrice("BTC-USD", function(err, price) {
                assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(price, "expecting price to not be null");
                assert.ok(price >= 1, "expecting price to be 1 or more. Got " + price);
                done();
            })
        })
    })

   /* describe("placeBuyOrder(online)", function() {
        after(function(done) {
            this.timeout(10000);
            utils.sleep(2);
            var authedClient = new Gdax.AuthenticatedClient(
                config.get("GDAX_SANDBOX_API_KEY"),
                config.get("GDAX_SANDBOX_API_SECRET"),
                config.get("GDAX_SANDBOX_PASSPHRASE"),
                config.get("GDAX_SANDBOX_API_URL"));

            //console.log("Created an authed client");
            authedClient.cancelAllOrders({product_id: 'BTC-USD'}, function(orders) {
                console.log("Cancelled existing orders");
                done();
            });

        });

        before(function(done) {
            this.timeout(10000);
            utils.sleep(2);
            var authedClient = new Gdax.AuthenticatedClient(
                config.get("GDAX_SANDBOX_API_KEY"),
                config.get("GDAX_SANDBOX_API_SECRET"),
                config.get("GDAX_SANDBOX_PASSPHRASE"),
                config.get("GDAX_SANDBOX_API_URL"));

            //console.log("Created an authed client");
            authedClient.cancelAllOrders({product_id: 'BTC-USD'}, function(orders) {
                console.log("Cancelled existing orders");
                done();
            });

        });

        it("should place a buy order via API", function(done) {
            this.skip();
            var buyParams = {
                'price': '100.00', // USD
                'size': '0.01',  // BTC
                'product_id': 'BTC-USD',
                'type':'limit'
            };
            trader.placeBuyOrder('online', buyParams, function(err, orderId) {
                assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(orderId, "should return an order ID");
                //check the order
                trader.getOrderById('online', orderId, function(err, orderData) {
                    assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                    assert.ok(orderData, "should return an order object");
                    assert.ok(orderData, "orderData should not be empty");
                    assert.ok(orderData.price, "orderData.price should not be empty");
                    assert.ok(orderData.side, "orderData.side should not be empty");
                    assert.ok(orderData.product_id, "orderData.product_id should not be empty");
                    assert.ok(orderData.size, "orderData.size should not be empty");
                    assert.ok(orderData.type, "orderData.type should not be empty");
                    assert.ok(orderData.id, "orderData.id should not be empty");
                    assert.ok(orderData.status, "orderData.status should not be empty");
                    assert.ok(orderData.time_in_force, "orderData.time_in_force should not be empty");
                    assert.ok(orderData.created_at, "orderData.created_at should not be empty");
                    assert.equal(utils.round(buyParams.price, 2), utils.round(orderData.price, 2),"expecting current order price to be " + buyParams.price);
                    assert.equal(buyParams.product_id, orderData.product_id,"expecting current order price to be " + buyParams.product_id);
                    assert.equal(orderId, orderData.id,"expecting current order id to be " + orderId);
                    assert.equal("limit", orderData.type,"expecting current order type to be 'limit'");
                    assert.equal(utils.round(buyParams.size, 4), utils.round(orderData.size, 4),"expecting current order size to be " + buyParams.size);
                    assert.ok(orderData.status == "pending" || orderData.status == "open", "expecting current order status to be 'pending' or 'open'");
                    done();
                })
            })

        })
    })*/

    describe("placeBuyOrder(paper)", function() {

        beforeEach(function (done) {
            this.timeout(20000);
            dynamodb.updateBalance({USD:4000, BTC:0, LTC:0, ETH:0}, function(err) {
                if(err) {
                    console.log("Error updating balance in AWS " + JSON.stringify(err));
                }
                done();
            })
        })

        afterEach(function(done) {
            this.timeout(20000);
            dynamodb.deleteAwsOrders(function() {
                done();
            })
        });

        it("should place a buy order in AWS", function(done) {
            this.timeout(20000);
            var buyParams = {
                'price': 100, // USD
                'size': 1.4532,  // BTC
                'product_id': 'BTC-USD',
                'type':'limit'
            };
            var trader = require("../lib/trader.js");
            trader.placeBuyOrder('paper', buyParams, function(err, orderId) {
                assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(orderId, "should return an order ID");
                //check the order
                trader.getOrderById('paper', orderId, function(err, orderData) {
                    assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                    assert.ok(orderData, "should return an order object");
                    assert.ok(orderData, "orderData should not be empty");
                    assert.ok(orderData.price, "orderData.price should not be empty");
                    assert.ok(orderData.side, "orderData.side should not be empty");
                    assert.ok(orderData.product_id, "orderData.product_id should not be empty");
                    assert.ok(orderData.size, "orderData.size should not be empty");
                    assert.ok(orderData.type, "orderData.type should not be empty");
                    assert.ok(orderData.id, "orderData.id should not be empty");
                    assert.ok(orderData.status, "orderData.status should not be empty");
                    assert.ok(orderData.time_in_force, "orderData.time_in_force should not be empty");
                    assert.ok(orderData.created_at, "orderData.created_at should not be empty");
                    assert.equal(utils.round(buyParams.price, 2), utils.round(orderData.price, 2),"expecting current order price to be " + buyParams.price);
                    assert.equal(buyParams.product_id, orderData.product_id,"expecting current order price to be " + buyParams.product_id);
                    assert.equal(orderId, orderData.id,"expecting current order id to be " + orderId);
                    assert.equal("limit", orderData.type,"expecting current order type to be 'limit'");
                    assert.equal(utils.round(buyParams.size, 4), utils.round(orderData.size, 4),"expecting current order size to be " + buyParams.size);
                    assert.ok(orderData.status == "pending" || orderData.status == "open", "expecting current order status to be 'pending' or 'open'");
                    done();
                })
            })

        })
    })

    describe("placeSellOrder (online)", function() {
        /*after(function(done) {
            this.timeout(10000);
            utils.sleep(2);
            var authedClient = new Gdax.AuthenticatedClient(
                config.get("GDAX_SANDBOX_API_KEY"),
                config.get("GDAX_SANDBOX_API_SECRET"),
                config.get("GDAX_SANDBOX_PASSPHRASE"),
                config.get("GDAX_SANDBOX_API_URL"));

            //console.log("Created an authed client");
            authedClient.cancelAllOrders({product_id: 'BTC-USD'}, function(orders) {
                console.log("Cancelled existing orders");
                done();
            });
        });*/

        /*before(function(done) {
            this.timeout(10000);
            utils.sleep(2);
            var authedClient = new Gdax.AuthenticatedClient(
                config.get("GDAX_SANDBOX_API_KEY"),
                config.get("GDAX_SANDBOX_API_SECRET"),
                config.get("GDAX_SANDBOX_PASSPHRASE"),
                config.get("GDAX_SANDBOX_API_URL"));

            //console.log("Created an authed client");
            authedClient.cancelAllOrders({product_id: 'BTC-USD'}, function(orders) {
                console.log("Cancelled existing orders");
                done();
            });
        });*/

        it("should fail tp place a sell order for NULL price", function(done) {
            var sellParams = {
                'price': null, // USD
                'size': '0.01', // BTC
                'product_id': 'BTC-USD',
                'type':'limit'
            };
            var trader = require("../lib/trader.js");
            trader.placeSellOrder('online', sellParams, function(err, orderId) {
                assert.ok(err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(!orderId, "should NOT return an order ID");
                done();
            })
        })

        it("should fail tp place a sell order for 0 price", function(done) {
            var sellParams = {
                'price': 0, // USD
                'size': '0.01', // BTC
                'product_id': 'BTC-USD',
                'type':'limit'
            };
            var trader = require("../lib/trader.js");
            trader.placeSellOrder('online', sellParams, function(err, orderId) {
                assert.ok(err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(!orderId, "should NOT return an order ID");
                done();
            })
        })

        it("should fail tp place a sell order for 10 price", function(done) {
            var sellParams = {
                'price': 10.03, // USD
                'size': '0.01', // BTC
                'product_id': 'BTC-USD',
                'type':'limit'
            };
            var trader = require("../lib/trader.js");
            trader.placeSellOrder('online', sellParams, function(err, orderId) {
                assert.ok(err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(!orderId, "should NOT return an order ID");
                done();
            })
        })

        it("should place a sell order via API", function(done) {
            this.skip();
            var sellParams = {
                'price': '1100.00', // USD
                'size': '0.01', // BTC
                'product_id': 'BTC-USD',
                'type':'limit'
            };
            var trader = require("../lib/trader.js");
            trader.placeSellOrder('online', sellParams, function(err, orderId) {
                assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(orderId, "should return an order ID");
                //check the order
                trader.getOrderById('online', orderId, function(err, orderData) {
                    assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                    assert.ok(orderData, "should return an order object");
                    assert.ok(orderData, "orderData should not be empty");
                    assert.ok(orderData.price, "orderData.price should not be empty");
                    assert.ok(orderData.side, "orderData.side should not be empty");
                    assert.ok(orderData.product_id, "orderData.product_id should not be empty");
                    assert.ok(orderData.size, "orderData.size should not be empty");
                    assert.ok(orderData.type, "orderData.type should not be empty");
                    assert.ok(orderData.id, "orderData.id should not be empty");
                    assert.ok(orderData.status, "orderData.status should not be empty");
                    assert.ok(orderData.time_in_force, "orderData.time_in_force should not be empty");
                    assert.ok(orderData.created_at, "orderData.created_at should not be empty");
                    assert.equal(utils.round(sellParams.price, 2), utils.round(sellParams.price, 2),"expecting current order price to be " + sellParams.price);
                    assert.equal(sellParams.product_id, orderData.product_id,"expecting current order price to be " + sellParams.product_id);
                    assert.equal(orderId, orderData.id,"expecting current order id to be " + orderId);
                    assert.equal("limit", orderData.type,"expecting current order type to be 'limit'");
                    assert.equal(utils.round(sellParams.size, 4), utils.round(orderData.size, 4),"expecting current order size to be " + sellParams.size);
                    done();
                })
            })
        })
    })

    describe("placeSellOrder (paper)", function() {
        afterEach(function(done) {
            this.timeout(20000);
            dynamodb.deleteAwsOrders(function() {
                done();
            })
        });

        beforeEach(function (done) {
            this.timeout(20000);
            dynamodb.updateBalance({USD:100, BTC:2.5, LTC:0, ETH:0}, function(err) {
                if(err) {
                    console.log("Error updating balance in AWS " + JSON.stringify(err));
                }
                done();
            })
        })
        it("should place a sell order in AWS", function(done) {
            this.timeout(20000);
            var sellParams = {
                'price': '110.00', // USD
                'size': '2.1234', // BTC
                'product_id': 'BTC-USD',
                'type':'limit'
            };
            var trader = require("../lib/trader.js");
            trader.placeSellOrder('paper', sellParams, function(err, orderId) {
                assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(orderId, "should return an order ID");
                //check the order
                trader.getOrderById('paper', orderId, function(err, orderData) {
                    assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                    assert.ok(orderData, "should return an order object");
                    assert.ok(orderData, "orderData should not be empty");
                    assert.ok(orderData.price, "orderData.price should not be empty");
                    assert.ok(orderData.side, "orderData.side should not be empty");
                    assert.ok(orderData.product_id, "orderData.product_id should not be empty");
                    assert.ok(orderData.size, "orderData.size should not be empty");
                    assert.ok(orderData.type, "orderData.type should not be empty");
                    assert.ok(orderData.id, "orderData.id should not be empty");
                    assert.ok(orderData.status, "orderData.status should not be empty");
                    assert.ok(orderData.created_at, "orderData.created_at should not be empty");
                    assert.ok(orderData.time_in_force, "orderData.time_in_force should not be empty");
                    assert.equal(utils.round(sellParams.price, 2), utils.round(sellParams.price, 2),"expecting current order price to be " + sellParams.price);
                    assert.equal(sellParams.product_id, orderData.product_id,"expecting current order price to be " + sellParams.product_id);
                    assert.equal(orderId, orderData.id,"expecting current order id to be " + orderId);
                    assert.equal("limit", orderData.type,"expecting current order type to be 'limit'");
                    assert.equal(utils.round(sellParams.size, 4), utils.round(orderData.size, 4),"expecting current order size to be " + sellParams.size);
                    assert.ok(orderData.status == "pending" || orderData.status == "open", "expecting current order status to be 'pending' or 'open'");
                    done();
                })
            })
        })
    })

    describe("getLatestTrades", function() {
        it("Should get latest trades", function(done) {
            this.timeout(10000);
            var trader = require("../lib/trader.js");
            trader.getLatestTrades("BTC-USD", function(err, trades) {
                assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(trades, "should return an array o trades");
                assert.equal(100, trades.length, "should return 100 trades");
                done();
            })
        })
    })

    describe("getTradesPage", function() {
        it("Should get latest trades in pages", function(done) {
            this.timeout(10000);
            var trader = require("../lib/trader.js");
            trader.getLatestTrades("BTC-USD", function(err, trades) {
                assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(trades, "should return an array o trades");
                assert.equal(100, trades.length, "should return 100 trades");
                var newestTrade = trades.pop();
                var oldestTrade = trades.shift();
                assert.ok(newestTrade.trade_id, "newestTrade.trade_id should not be empty");
                assert.ok(oldestTrade.trade_id, "oldestTrade.trade_id should not be empty");
                assert.ok("Expecting newest trade ID to be higher than oldest trade ID", newestTrade.trade_id > oldestTrade.trade_id);
                oldestTrade = trades.shift();
                oldestTrade = trades.shift();
                utils.sleep(5);
                trader.getTradesSince("BTC-USD", oldestTrade.trade_id, function(err, trades) {
                    assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                    assert.ok(trades, "should return an array o trades");
                    assert.ok(trades.length >= 1, "should return at least 1 trade");
                    var newestTradePage2 = trades.pop();
                    var oldestTradePage2 = trades.shift();
                    assert.ok(newestTradePage2.trade_id, "newestTradePage2.trade_id should not be empty");
                    assert.ok(oldestTradePage2.trade_id, "oldestTradePage2.trade_id should not be empty");
                    assert.ok("Expecting newest trade ID to be higher than oldest trade ID", newestTradePage2.trade_id > oldestTradePage2.trade_id);
                    assert.ok("Expecting newest trade ID on page2 to be lower than newest trade ID on page 1", newestTrade.trade_id > newestTradePage2.trade_id);
                    assert.ok("Expecting oldest trade ID on page2 to be lower than oldest trade ID on page 1", oldestTrade.trade_id > oldestTradePage2.trade_id);
                    done();
                })

            })
        })
    })

    describe("getCurrentOrder(paper, BTC-USD)", function() {
        it("Should return current order", function(done) {
            this.timeout(10000);
            var newOrder = {
                id:uuidv4(),
                size:2.2354,
                type:"limit",
                status:"open",
                side:"buy",
                product_id:"BTC-USD",
                price:2260.11,
                time_in_force:"GTC"
            };
            dynamodb.placePaperOrder(newOrder,function() {
                var trader = require("../lib/trader.js");
                trader.getCurrentOrder("paper", "BTC-USD", function(err, orderData) {
                    assert.ok(!err, "should not return an error");
                    assert.ok(orderData, "orderData should not be empty. orderData: " + JSON.stringify(orderData));
                    assert.ok(orderData.price, "orderData.price should not be empty");
                    assert.ok(orderData.side, "orderData.side should not be empty");
                    assert.ok(orderData.product_id, "orderData.product_id should not be empty");
                    assert.ok(orderData.size, "orderData.size should not be empty");
                    assert.ok(orderData.type, "orderData.type should not be empty");
                    assert.ok(orderData.id, "orderData.id should not be empty");
                    assert.ok(orderData.status, "orderData.status should not be empty");
                    assert.ok(orderData.time_in_force, "orderData.time_in_force should not be empty");
                    assert.ok(orderData.created_at, "orderDate.created_at should not be empty")
                    assert.equal(newOrder.price, orderData.price,"expecting current order price to be " + newOrder.price);
                    assert.equal(newOrder.side, orderData.side,"expecting current order price to be " + newOrder.side);
                    assert.equal(newOrder.product_id, orderData.product_id,"expecting current order price to be " + newOrder.product_id);
                    assert.equal(newOrder.time_in_force, orderData.time_in_force,"expecting current order time_in_force to be " + newOrder.time_in_force);
                    assert.equal(newOrder.id, orderData.id,"expecting current order id to be " + newOrder.id);
                    assert.equal(newOrder.type, orderData.type,"expecting current order type to be " + newOrder.type);
                    assert.equal(newOrder.size, orderData.size,"expecting current order size to be " + newOrder.size);
                    assert.equal(newOrder.status, orderData.status,"expecting current order status to be " + newOrder.status);
                    done();
                })
            })
        })
    })

    describe("getLastFill", function() {
        before(function(done) {
            this.timeout(10000);
            dynamodb.deleteAwsFills(function(err) {
                if (err) {
                    console.log("Error deleting fills in AWS " + JSON.stringify(err));
                }
                done();
            })
        })

        after(function(done) {
            this.timeout(10000);
            dynamodb.deleteAwsFills(function(err) {
                if (err) {
                    console.log("Error deleting fills in AWS " + JSON.stringify(err));
                }
                done();
            })
        })

        it("should return last fill from AWS", function(done) {
            this.timeout(10000);
            var fillDate = new Date().toISOString();
            var orderId = uuidv4();
            var testFill = {
                "trade_id": 74,
                "product_id": "BTC-USD",
                "price": "10.01",
                "size": "0.01",
                "order_id": orderId,
                "created_at": fillDate,
                "liquidity": "T",
                "fee": "0.00025",
                "settled": true,
                "side": "buy"
            }
            dynamodb.createAwsFill(testFill, function(err) {
                assert.ok(!err, "should not return an error");
                var trader = require("../lib/trader.js");
                trader.getLastFill("paper", "BTC-USD", function(err, lastFill) {
                    assert.ok(!err, "should not return an error");
                    assert.ok(lastFill, "lastFill should not be empty. lastFill: " + JSON.stringify(lastFill));
                    assert.equal(lastFill.order_id, orderId, "Wrong order_id in lastFill");
                    assert.equal(lastFill.created_at, fillDate, "Wrong created_at in lastFill");
                    assert.equal(74, lastFill.trade_id, "Wrong lastFill.trade_id");
                    assert.equal(10.01, lastFill.price, "Wrong lastFill.price");
                    assert.equal("buy", lastFill.side, "Wrong lastFill.side");
                    done();
                })
            })
        })

        it("should return last fill from sandbox", function(done) {
            this.skip();
            var trader = require("../lib/trader.js");
            trader.getLastFill("online", "BTC-USD", function(err, lastFill) {
                assert.ok(!err, "should not return an error");
                assert.ok(lastFill, "lastFill should not be empty. orderData: " + JSON.stringify(lastFill));
                assert.ok(lastFill.order_id, "lastFill should have order_id");
                assert.ok(lastFill.created_at, "lastFill should have created_at");
                assert.ok(lastFill.side, "lastFill should have side");
                assert.ok(lastFill.price, "lastFill should have price");
                assert.ok(lastFill.trade_id, "lastFill should have trade_id");
                done();
            })
        })
    })


    describe("updateOrder", function() {
        it("Should return the same order as the current order", function(done) {
            this.timeout(10000);
            var testOrder = {
                id:uuidv4(),
                size:1,
                type:"limit",
                status:"open",
                side:"sell",
                product_id:"BTC-USD",
                price:2560.34,
                time_in_force:"GTC",
                created_at:new Date().toISOString()
            };

            dynamodb.placePaperOrder(testOrder, function() {
                var trader = require("../lib/trader.js");
                trader.getLatestTrades = function(productId, cb) {
                    cb(null, []);
                }
                trader.updateOrder("paper", testOrder, function(err, updatedOrder) {
                    assert.ok(!err, "should not return an error");
                    assert.ok(updatedOrder, "orderData should not be empty. orderData: " + JSON.stringify(updatedOrder));
                    assert.equal(testOrder.id, updatedOrder.id, "Should return order with the same id");
                    assert.equal("open", updatedOrder.status, "Order status should not have changed");
                    assert.equal(testOrder.created_at, updatedOrder.created_at, "Order created_at should not have changed");
                    assert.ok(!updatedOrder.done_at, "updated order should not have done_at attribute")
                    done();
                })
            })
        })

        it("Should return the same order as the current order", function(done) {
            this.timeout(10000);
            var trades = [
                {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2617.93000000","size":"0.35680000","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767786,"price":"2617.92100000","size":"0.82392126","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2616.15000000","size":"0.07497941","side":"sell"},
                {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.250000","size":"0.01000000","side":"sell"},
                {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.15000000","size":"0.01000000","side":"buy"}
            ];
            var trader = require("../lib/trader.js");
            trader.getLatestTrades = function(productId, cb) {
                cb(null, trades);
            }
            var testOrder = {
                id:uuidv4(),
                size:1,
                type:"limit",
                status:"open",
                side:"sell",
                product_id:"BTC-USD",
                price:2560.34,
                time_in_force:"GTC",
                created_at:new Date().toISOString()
            };

            dynamodb.placePaperOrder(testOrder, function() {
                trader.updateOrder("paper", testOrder, function(err, updatedOrder) {
                    assert.ok(!err, "should not return an error");
                    assert.ok(updatedOrder, "orderData should not be empty. orderData: " + JSON.stringify(updatedOrder));
                    assert.equal(testOrder.id, updatedOrder.id, "Should return order with the same id");
                    assert.equal("open", updatedOrder.status, "Order status should not have changed");
                    assert.equal(testOrder.created_at, updatedOrder.created_at, "Order created_at should not have changed");
                    assert.ok(!updatedOrder.done_at, "updated order should not have done_at attribute")
                    done();
                })
            })
        })

        it("Should update 'sell' order status to 'done'", function(done) {
            this.timeout(10000);
            var trades = [
                {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2560.93000000","size":"1.35680000","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767786,"price":"2617.92100000","size":"0.82392126","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2616.15000000","size":"0.07497941","side":"sell"},
                {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.250000","size":"0.01000000","side":"sell"},
                {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.15000000","size":"0.01000000","side":"buy"}
            ];
            var trader = require("../lib/trader.js");
            trader.getLatestTrades = function(productId, cb) {
                cb(null, trades);
            }
            var testOrder = {
                id:uuidv4(),
                size:1,
                type:"limit",
                status:"open",
                side:"sell",
                product_id:"BTC-USD",
                price:2560.34,
                time_in_force:"GTC",
                created_at:"2017-07-06T00:06:08.53Z"
            };

            dynamodb.placePaperOrder(testOrder, function() {
                trader.updateOrder("paper", testOrder, function(err, updatedOrder) {
                    assert.ok(!err, "should not return an error");
                    assert.ok(updatedOrder, "orderData should not be empty. orderData: " + JSON.stringify(updatedOrder));
                    assert.equal(testOrder.id, updatedOrder.id, "Should return order with the same id");
                    assert.equal("done", updatedOrder.status, "Order status should be 'done'");
                    assert.equal(testOrder.created_at, updatedOrder.created_at, "Order created_at should not have changed");
                    assert.ok(updatedOrder.done_at, "updated order should have non-empty done_at attribute")
                    done();
                })
            })
        })

        it("Should update 'buy' order status to 'done'", function(done) {
            this.timeout(20000);

            var testOrder = {
                id:uuidv4(),
                size:1,
                type:"limit",
                status:"open",
                side:"buy",
                product_id:"BTC-USD",
                price:2560.34,
                time_in_force:"GTC",
                created_at:"2017-07-06T00:06:08.53Z"
            };
            var trader = require("../lib/trader.js");
            trader.getLatestTrades = function(productId, cb) {
                console.log("Calling mock getLatestTrades")
                var trades = [
                    {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2560.93000000","size":"0.35680000","side":"buy"},
                    {"time":"2017-07-06T00:07:23.602Z","trade_id":17767786,"price":"2560.33100000","size":"1.82392126","side":"sell"},
                    {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                    {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2616.15000000","size":"0.07497941","side":"sell"},
                    {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.250000","size":"0.01000000","side":"sell"},
                    {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.15000000","size":"0.01000000","side":"buy"}
                ];
                cb(null, trades);
            }
            dynamodb.placePaperOrder(testOrder, function() {
                trader.updateOrder("paper", testOrder, function(err, updatedOrder) {
                    assert.ok(!err, "should not return an error");
                    assert.ok(updatedOrder, "orderData should not be empty. orderData: " + JSON.stringify(updatedOrder));
                    assert.equal(testOrder.id, updatedOrder.id, "Should return order with the same id");
                    assert.equal("done", updatedOrder.status, "Order status should be 'done'");
                    assert.equal(testOrder.created_at, updatedOrder.created_at, "Order created_at should not have changed");
                    assert.ok(updatedOrder.done_at, "updated order should have non-empty done_at attribute")
                    done();
                })
            })
        })
    })

    describe("getAvailableBalance", function() {
        beforeEach(function (done) {
            this.timeout(10000);
            dynamodb.updateBalance({"USD":0, "BTC":0, "LTC":0, "ETH":0}, function(err) {
                if(err) {
                    console.log("Error updating balance in AWS " + JSON.stringify(err));
                }
                done();
            })
        })

        afterEach(function (done) {
            this.timeout(10000);
            dynamodb.updateBalance({"USD":0, "BTC":0, "LTC":0, "ETH":0}, function(err) {
                if(err) {
                    console.log("Error updating balance in AWS " + JSON.stringify(err));
                }
                done();
            })
        })

        it("should check paper balance and find 4000 USD", function(done) {
            this.timeout(10000);
            dynamodb.updateBalance({"USD":4000, "BTC":0, "LTC":0, "ETH":0}, function(err) {
                assert.ok(!err, "should not return an error. " + JSON.stringify(err))
                var trader = require("../lib/trader.js");
                trader.getAvailableBalance("paper", function(err, balances) {
                    assert.ok(!err, "should not return an error. " + JSON.stringify(err))
                    assert.ok(balances, "balances should not be empty " + JSON.stringify(balances));
                    assert.ok(balances["USD"], "USD balance should not be empty")
                    assert.equal(0, balances["BTC"], "BTC balance should be empty. Found " + balances["BTC"])
                    assert.equal(balances["USD"], 4000, "expecting to find 4000 USD")
                    done();
                })
            })

        })

        it("should check online balance and find some USD and BTC", function(done) {
            this.skip();
            this.timeout(10000);
            var trader = require("../lib/trader.js");
            trader.getAvailableBalance("online", function(err, balances) {
                assert.ok(!err, "should not return an error")
                assert.ok(balances, "balances should not be empty")
                assert.ok(balances["USD"], "USD balance should not be empty")
                assert.ok(balances["BTC"], "BTC balance should not be empty")
                done();
            })
        })

        it("should check paper balance and find 2 BTC", function(done) {
            this.timeout(10000);
            dynamodb.updateBalance({"USD":0, "BTC":2, "LTC":0, "ETH":0}, function() {
                var trader = require("../lib/trader.js");
                trader.getAvailableBalance("paper", function (err, balances) {
                    assert.ok(!err, "should not return an error")
                    assert.ok(balances, "balances should not be empty " + JSON.stringify(balances));
                    assert.equal(0, balances["USD"], "USD balance should be empty")
                    assert.ok(balances["BTC"], "BTC balance should not be empty "+ JSON.stringify(balances));
                    assert.equal(balances["BTC"], 2, "expecting to find 2 BTC " + JSON.stringify(balances));
                    done();
                })
            })
        })
    })
    
    describe("cancelOrder", function() {
        beforeEach(function(done) {
            this.timeout(20000);
//            utils.sleep(2);
            /*var authedClient = new Gdax.AuthenticatedClient(
                config.get("GDAX_SANDBOX_API_KEY"),
                config.get("GDAX_SANDBOX_API_SECRET"),
                config.get("GDAX_SANDBOX_PASSPHRASE"),
                config.get("GDAX_SANDBOX_API_URL"));
            */
            //console.log("Created an authed client");
            //authedClient.cancelAllOrders({product_id: 'BTC-USD'}, function(orders) {
              //  console.log("Cancelled existing orders");
                dynamodb.deleteAwsOrders(function() {
                    dynamodb.updateBalance({"USD":5000, "BTC":0, "LTC":0, "ETH":0}, function(err) {
                        if(err) {
                            console.log("Error updating balance in AWS " + JSON.stringify(err));
                        }
                        done();
                    })
                })
            //});
        });

        afterEach(function(done) {
            this.timeout(20000);
      //      utils.sleep(2);
            /*var authedClient = new Gdax.AuthenticatedClient(
                config.get("GDAX_SANDBOX_API_KEY"),
                config.get("GDAX_SANDBOX_API_SECRET"),
                config.get("GDAX_SANDBOX_PASSPHRASE"),
                config.get("GDAX_SANDBOX_API_URL"));
*/
            //console.log("Created an authed client");
  //          authedClient.cancelAllOrders({product_id: 'BTC-USD'}, function(orders) {
    //            console.log("Cancelled existing orders");
                dynamodb.deleteAwsOrders(function() {
                    dynamodb.updateBalance({"USD":0, "BTC":0, "LTC":0, "ETH":0}, function(err) {
                        if(err) {
                            console.log("Error updating balance in AWS " + JSON.stringify(err));
                        }
                        done();
                    })
                })
      //      });
        });

        it("should cancel an order in AWS", function(done) {
            this.timeout(20000);
            var testOrder = {
                id:uuidv4(),
                size:1,
                type:"limit",
                status:"open",
                side:"buy",
                product_id:"BTC-USD",
                price:2560.34,
                time_in_force:"GTC"
            };
            dynamodb.placePaperOrder(testOrder, function() {
                var trader = require("../lib/trader.js");
                trader.cancelOrder("paper", testOrder.id, function(err) {
                    assert.ok(!err, "should not return an error");
                    dynamodb.getOrderById(testOrder.id, function(err, data) {
                        assert.ok(err, "should return an error")
                        assert.ok(!data, "should not return an order after it was cancelled")
                        assert.equal(glob.NO_DATA, err.code, "expecting error code " + glob.NO_DATA)
                        done();
                    })
                })
            })
        })

        it("should cancel an order in sandbox", function(done) {
            this.skip();
            trader.getCurrentPrice("BTC-USD", function(err, currentPrice) {
                var trader = require("../lib/trader.js");
                trader.getAvailableBalance("online", function(err, balances) {
                    console.log("Current price is " + currentPrice)
                    var buyPrice = utils.round(currentPrice * 0.8, 2);
                    var buySize = Math.min(10, utils.round((Math.min(balances["USD"],10000))/buyPrice, 8));
                    var buyParams = {
                        'price': buyPrice, // USD
                        'size': buySize,
                        'product_id': 'BTC-USD',
                        'type':'limit'
                    };
                    console.log("Will place a buy order for {buySize} BTC-USD at {buyPrice}. Current balance {balance}".format({buySize:buySize,buyPrice:buyPrice,balance:balances["USD"]}))
                    trader.placeBuyOrder('online', buyParams, function(err, orderId) {
                        assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                        assert.ok(orderId, "should return an order ID");
                        trader.cancelOrder("online", orderId, function(err) {
                            assert.ok(!err, "should not return an error");
                            trader.getOrderById('online', orderId, function(err, orderData) {
                                assert.ok(err, "should return an error. Instead returned an order " + JSON.stringify(orderData))
                                assert.ok(!orderData, "should not return an order after it was cancelled")
                                assert.equal(glob.NOT_FOUND, err.code, "expecting error code " + glob.NOT_FOUND)
                                done();
                            })
                        })
                    })
                })
            })
        })
    })
})
