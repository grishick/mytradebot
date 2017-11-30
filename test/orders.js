/**
 * Created by gsolovyev on 7/17/17.
 */
var glob = require("../constants.js");
var assert = require('assert');
var Gdax = require('gdax');
var config = require('../config');
var utils = require("../lib/utils.js");
var trader = require("../lib/trader.js");
var dynamodb = require("../lib/dynamodb.js")
var format = require('string.format');
const uuidv4 = require('uuid/v4');
describe("orders", function() {
    describe("getOrderBook", function () {
        it("should get order book", function (done) {
            trader.getOrderBook("BTC-USD", function (err, orders, resp) {
                assert.ok(!err, "should not return an error. Error: " + JSON.stringify(err));
                assert.ok(orders, "should return orders object");
                assert.ok(orders["bids"], "should return orders.bids object");
                assert.ok(orders["asks"], "should return orders.asks object");
                var totalBidSize = 0;
                for(var i in orders.bids) {
                    totalBidSize += orders.bids[i][1] * orders.bids[i][2];
                }
                var totalAskSize = 0;
                for(var i in orders.asks) {
                    totalAskSize += orders.asks[i][1] * orders.asks[i][2];
                }
                if(totalAskSize > totalBidSize) {
                    console.log("Supply/demand = {totalAskSize} / {totalBidSize} = {supplyDemand}".format({totalAskSize:totalAskSize, totalBidSize:totalBidSize, supplyDemand:(totalAskSize/totalBidSize)}))
                }
                done();
            })

        })
    })
});