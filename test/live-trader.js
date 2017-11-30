
var assert = require('assert');
var config = require('../config');
var utils = require("../lib/utils.js");
var trader = require("../lib/trader.js");


describe("live-trader", function() {
    describe ("getBalances", function() {
        it("should return all account balances", function(done) {
            this.timeout(10000);
            trader.getBalances("online", function(err, balances) {
                assert.ok(!err, "should not return an error");
                assert.ok(balances, "should not return an error");
                console.log(JSON.stringify(balances));
                done();
            })
        })
    })
    describe("getLastFill", function() {
        it("should return last BTC fill from live account", function(done) {
            this.timeout(10000);
            trader.getLastFill("online", "BTC-USD", function(err, lastFill) {
                assert.ok(!err, "should not return an error");
                assert.ok(lastFill, "lastFill should not be empty. orderData: " + JSON.stringify(lastFill));
                assert.ok(lastFill.order_id, "lastFill should have order_id");
                assert.ok(lastFill.created_at, "lastFill should have created_at");
                assert.ok(lastFill.side, "lastFill should have side");
                assert.ok(lastFill.price, "lastFill should have price");
                assert.ok(lastFill.trade_id, "lastFill should have trade_id");
                assert.ok(lastFill.product_id, "lastFill should have product_d");
                assert.equal("BTC-USD", lastFill.product_id, "expecting BTC-USD fill");
                assert.ok(lastFill.price > 1000, "expecting price to be over 1000");
                assert.equal("buy", lastFill.side, "expecting side to be 'buy'");
                done();
            })
        })

        it("should return last LTC fill from live account", function(done) {
            this.timeout(10000);
            trader.getLastFill("online", "LTC-USD", function(err, lastFill) {
                assert.ok(!err, "should not return an error");
                assert.ok(lastFill, "lastFill should not be empty. orderData: " + JSON.stringify(lastFill));
                assert.ok(lastFill.order_id, "lastFill should have order_id");
                assert.ok(lastFill.created_at, "lastFill should have created_at");
                assert.ok(lastFill.side, "lastFill should have side");
                assert.ok(lastFill.price, "lastFill should have price");
                assert.ok(lastFill.trade_id, "lastFill should have trade_id");
                assert.ok(lastFill.product_id, "lastFill should have product_d");
                assert.equal("LTC-USD", lastFill.product_id, "expecting LTC-USD fill");
                assert.ok(lastFill.price < 200, "expecting price to be under 200");
                assert.ok(lastFill.price > 20, "expecting price to be over 20");
                assert.equal("buy", lastFill.side, "expecting side to be 'buy'");
                done();
            })
        })

        it("should return last LTC fill from live account", function(done) {
            this.timeout(10000);
            trader.getLastFill("online", "ETH-USD", function(err, lastFill) {
                assert.ok(!err, "should not return an error");
                assert.ok(lastFill, "lastFill should not be empty. orderData: " + JSON.stringify(lastFill));
                assert.ok(lastFill.order_id, "lastFill should have order_id");
                assert.ok(lastFill.created_at, "lastFill should have created_at");
                assert.ok(lastFill.side, "lastFill should have side");
                assert.ok(lastFill.price, "lastFill should have price");
                assert.ok(lastFill.trade_id, "lastFill should have trade_id");
                assert.ok(lastFill.product_id, "lastFill should have product_d");
                assert.equal("ETH-USD", lastFill.product_id, "expecting LTC-USD fill");
                assert.ok(lastFill.price < 1000, "expecting price to be under 1000");
                assert.ok(lastFill.price > 100, "expecting price to be over 100");
                assert.equal("buy", lastFill.side, "expecting side to be 'buy'");
                done();
            })
        })
    })
});