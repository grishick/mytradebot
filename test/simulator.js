/**
 * Created by gsolovyev on 7/6/17.
 */
var glob = require("../constants.js");
var assert = require('assert');
var simulator = require("../lib/simulator.js");
describe("simulator", function() {
    describe("matchBuyOrder(trade, order)", function() {
        it("Should return true for trade with price=0.95 and order with price = 0.95", function(done) {
            assert.ok(simulator.matchBuyOrder({price:0.95, time:"2017-07-06T00:06:10.66Z"}, {price:0.95, created_at:"2017-07-06T00:06:09.66Z"}), "expecting 'true'");
            done();
        })

        it("Should return true for trade with price=0.95 and order with price = 0.96", function(done) {
            assert.ok(simulator.matchBuyOrder({price:0.95, time:"2017-07-06T00:06:10.66Z"}, {price:0.96, created_at:"2017-07-05T00:16:10.66Z"}), "expecting 'true'");
            done();
        })

        it("Should return false for trade with price=0.95 and order with price = 0.9", function(done) {
            assert.ok(!simulator.matchBuyOrder({price:0.95, time:"2017-07-06T00:06:10.66Z"}, {price:0.9, created_at:"2017-07-05T00:16:10.66Z"}), "expecting 'false'");
            done();
        })

        it("Should return false for trade with price=0.95 and order with price = 0.96, because the order is more recent than the trade", function(done) {
            assert.ok(!simulator.matchBuyOrder({price:0.95, time:"2017-07-06T00:06:10.66Z"}, {price:0.96, created_at:"2017-07-06T01:16:10.66Z"}), "expecting 'true'");
            done();
        })
    })

    describe("matchSellOrder(trade, order)", function() {
        it("Should return true for trade with price=0.95 and order with price = 0.95", function(done) {
            assert.ok(simulator.matchSellOrder({price:0.95, time:"2017-07-06T00:06:10.66Z"}, {price:0.95, created_at:"2017-07-06T00:05:10.66Z"}), "expecting 'true'");
            done();
        })

        it("Should return true for trade with price=0.95 and order with price = 0.93", function(done) {
            assert.ok(simulator.matchSellOrder({price:0.95,time:"2017-07-06T00:06:10.66Z"}, {price:0.93, created_at:"2017-07-06T00:05:10.66Z"}), "expecting 'true'");
            done();
        })

        it("Should return false for trade with price=0.95 and order with price = 0.99", function(done) {
            assert.ok(!simulator.matchSellOrder({price:0.95,time:"2017-07-06T00:06:10.66Z"}, {price:0.99, created_at:"2017-07-06T00:05:10.66Z"}), "expecting 'false'");
            done();
        })

        it("Should return false for trade with price=0.95 and order with price = 0.93, because the order is more recent than the trade", function(done) {
            assert.ok(!simulator.matchSellOrder({price:0.95,time:"2017-07-06T00:06:10.66Z"}, {price:0.93, created_at:"2017-07-06T00:06:12.66Z"}), "expecting 'true'");
            done();
        })
    })
    describe("tryOrderMatch([trades], order)", function() {
        it("Should not match the 'buy' order, because there are no matching 'sell' trades", function(done) {
            var trades = [
                {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2617.73000000","size":"0.35680000","side":"sell"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767786,"price":"2616.89000000","size":"0.42392126","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2617.73000000","size":"0.07497941","side":"sell"},
                {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.96000000","size":"0.01000000","side":"sell"},
                {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.20000000","size":"0.01000000","side":"buy"}
            ];
            var order = {
                "id": "d0c5340b-6d6c-49d9-b567-48c4bfca13d2",
                "price": "2616.10000000",
                "size": "0.01000000",
                "product_id": "BTC-USD",
                "side": "buy",
                "stp": "dc",
                "type": "limit",
                "time_in_force": "GTC",
                "post_only": false,
                "created_at": "2017-07-05T20:02:28.53864Z",
                "fill_fees": "0.0000000000000000",
                "filled_size": "0.00000000",
                "executed_value": "0.0000000000000000",
                "status": "open",
                "settled": false
            };

            simulator.tryOrderMatch(trades, order, function(err, result) {
                assert.ok(!err, "should not return an error");
                assert.ok(!result, "result should be negative (no-match)");
                done();
            })
        })

        it("Should match the 'buy' order, because is an exactly matching 'sell' trade", function(done) {
            var trades = [
                {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2617.73000000","size":"0.35680000","side":"sell"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767786,"price":"2616.89000000","size":"0.42392126","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2617.73000000","size":"0.07497941","side":"sell"},
                {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.1000000","size":"0.01000000","side":"sell"},
                {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.20000000","size":"0.01000000","side":"buy"}
            ];
            var order = {
                "id": "d0c5340b-6d6c-49d9-b567-48c4bfca13d2",
                "price": "2616.10000000",
                "size": "0.01000000",
                "product_id": "BTC-USD",
                "side": "buy",
                "stp": "dc",
                "type": "limit",
                "time_in_force": "GTC",
                "post_only": false,
                "created_at": "2017-07-05T20:02:28.53864Z",
                "fill_fees": "0.0000000000000000",
                "filled_size": "0.00000000",
                "executed_value": "0.0000000000000000",
                "status": "open",
                "settled": false
            };

            simulator.tryOrderMatch(trades, order, function(err, result) {
                assert.ok(!err, "should not return an error");
                assert.ok(result, "result should be positive (match)");
                done();
            })
        })

        it("Should match the 'buy' order, because is a lower/larger matching 'sell' trade", function(done) {
            var trades = [
                {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2617.73000000","size":"0.35680000","side":"sell"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767786,"price":"2616.89000000","size":"0.42392126","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2616.15000000","size":"0.07497941","side":"sell"},
                {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.250000","size":"0.01000000","side":"sell"},
                {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.15000000","size":"0.01000000","side":"buy"}
            ];
            var order = {
                "id": "d0c5340b-6d6c-49d9-b567-48c4bfca13d2",
                "price": "2616.20000000",
                "size": "0.02000000",
                "product_id": "BTC-USD",
                "side": "buy",
                "stp": "dc",
                "type": "limit",
                "time_in_force": "GTC",
                "post_only": false,
                "created_at": "2017-07-05T20:02:28.53864Z",
                "fill_fees": "0.0000000000000000",
                "filled_size": "0.00000000",
                "executed_value": "0.0000000000000000",
                "status": "open",
                "settled": false
            };

            simulator.tryOrderMatch(trades, order, function(err, result) {
                assert.ok(!err, "should not return an error");
                assert.ok(result, "result should be positive (match)");
                done();
            })
        })

        it("Should not match the 'sell' order, because there is no matching 'buy' trade", function(done) {
            var trades = [
                {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2617.73000000","size":"0.35680000","side":"sell"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767786,"price":"2616.89000000","size":"0.42392126","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2616.15000000","size":"0.07497941","side":"sell"},
                {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.250000","size":"0.01000000","side":"sell"},
                {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.15000000","size":"0.01000000","side":"buy"}
            ];
            var order = {
                "id": "d0c5340b-6d6c-49d9-b567-48c4bfca13d2",
                "price": "2617.920000000",
                "size": "1.01000000",
                "product_id": "BTC-USD",
                "side": "sell",
                "stp": "dc",
                "type": "limit",
                "time_in_force": "GTC",
                "post_only": false,
                "created_at": "2017-07-05T20:02:28.53864Z",
                "fill_fees": "0.0000000000000000",
                "filled_size": "0.00000000",
                "executed_value": "0.0000000000000000",
                "status": "open",
                "settled": false
            };

            simulator.tryOrderMatch(trades, order, function(err, result) {
                assert.ok(!err, "should not return an error");
                assert.ok(!result, "result should be negative (no-match)");
                done();
            })
        })

        it("Should match the 'sell' order, because there are 2 matching 'buy' trades >= the amount of 'sell' order", function(done) {
            var trades = [
                {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2617.93000000","size":"0.35680000","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767786,"price":"2617.92100000","size":"0.82392126","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2616.15000000","size":"0.07497941","side":"sell"},
                {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.250000","size":"0.01000000","side":"sell"},
                {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.15000000","size":"0.01000000","side":"buy"}
            ];
            var order = {
                "id": "d0c5340b-6d6c-49d9-b567-48c4bfca13d2",
                "price": "2617.920000000",
                "size": "1.01000000",
                "product_id": "BTC-USD",
                "side": "sell",
                "stp": "dc",
                "type": "limit",
                "time_in_force": "GTC",
                "post_only": false,
                "created_at": "2017-07-05T20:02:28.53864Z",
                "fill_fees": "0.0000000000000000",
                "filled_size": "0.00000000",
                "executed_value": "0.0000000000000000",
                "status": "open",
                "settled": false
            };

            simulator.tryOrderMatch(trades, order, function(err, result) {
                assert.ok(!err, "should not return an error");
                assert.ok(result, "result should be positive (match)");
                done();
            })
        })

        it("Should not match the 'sell' order, because there are not enough matching 'buy' trades", function(done) {
            var trades = [
                {"time":"2017-07-06T00:06:10.66Z","trade_id":17767829,"price":"2617.93000000","size":"0.35680000","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767786,"price":"2617.92100000","size":"0.82392126","side":"buy"},
                {"time":"2017-07-06T00:00:23.602Z","trade_id":17767785,"price":"2616.90000000","size":"0.58010000","side":"buy"},
                {"time":"2017-07-06T00:06:05.792Z","trade_id":17767828,"price":"2616.15000000","size":"0.07497941","side":"sell"},
                {"time":"2017-07-05T23:58:14.312Z","trade_id":17767731,"price":"2616.250000","size":"0.01000000","side":"sell"},
                {"time":"2017-07-05T23:58:16.628Z","trade_id":17767735,"price":"2616.15000000","size":"0.01000000","side":"buy"}
            ];
            var order = {
                "id": "d0c5340b-6d6c-49d9-b567-48c4bfca13d2",
                "price": "2617.920000000",
                "size": "2.01000000",
                "product_id": "BTC-USD",
                "side": "sell",
                "stp": "dc",
                "type": "limit",
                "time_in_force": "GTC",
                "post_only": false,
                "created_at": "2017-07-05T20:02:28.53864Z",
                "fill_fees": "0.0000000000000000",
                "filled_size": "0.00000000",
                "executed_value": "0.0000000000000000",
                "status": "open",
                "settled": false
            };

            simulator.tryOrderMatch(trades, order, function(err, result) {
                assert.ok(!err, "should not return an error");
                assert.ok(!result, "result should be negative (no-match)");
                done();
            })
        })
    })
})