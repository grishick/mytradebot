/**
 * Created by gsolovyev on 7/4/17.
 */
var glob = require("../constants.js");
var assert = require('assert');
describe("advisor", function() {
    describe("advise(current=52.3, dip=0.02, currentOrder={price:52, side:buy})", function() {
        it("Should advise to keep current BUY order, because price is on downward approach to target.", function(done) {
            var advisor = require("../lib/advisor.js");
            advisor.advise(52.3, 0.002, 0.2, 2, null, {price:52, side:glob.BUY}, function(err, advice) {
                assert.ok(!err, "Should not return an error");
                assert.equal(advice.action, glob.KEEP, "Should advise to keep current BUY order");
                done();
            })
        })
    })

    describe("advise(current=53.3, dip=0.02, currentOrder={price:52, side:buy})", function() {
        it("Should advise to replace current BUY order with a higher one, because new target is higher then current target.", function(done) {
            var advisor = require("../lib/advisor.js");
            advisor.advise(53.3, 0.002, 0.02, 2, null, {price:52, side:glob.BUY}, function(err, advice) {
                assert.ok(!err, "Should not return an error");
                assert.equal(advice.action, glob.REPLACE, "advice.action should be REPLACE");
                assert.equal(advice.price, 52.23, "advice.price should be 52.23");
                done();
            })
        })
    })

    describe("advise(current=53.3, dip=0.02, currentOrder={price:52, side:buy})", function() {
        it("Should advise to replace current BUY order with a higher one based on current-0.01, because current trading price is lower than new target.", function(done) {
            var advisor = require("../lib/advisor.js");
            advisor.advise(53.3, 0.002, 0.02, 2, null, {price:52, side:glob.BUY}, function(err, advice) {
                assert.ok(!err, "Should not return an error");
                assert.equal(advice.action, glob.REPLACE, "advice.action should be REPLACE");
                assert.equal(advice.price, 52.23, "advice.price should be 52.23");
                done();
            })
        })
    })

    describe("advise(current=53.3, dip=0.02, rise=0.004, lastFill = {price:51.792828}, currentOrder={price:52, side:sell})", function() {
        it("Should advise to keep current order", function(done) {
            var advisor = require("../lib/advisor.js");
            advisor.advise(51.3, 0.004, 0.02, 2, {price:51.792828}, {price:52, side:glob.SELL}, function(err, advice) {
                assert.ok(!err, "Should not return an error");
                assert.equal(advice.action, glob.KEEP, "Should advise to keep current SELL order. Instead getting " + JSON.stringify(advice));
                done();
            })
        })
    })

    describe("advise(current=92, dip=0.08, rise=0.02, lastFill = {price:91.26}, currentOrder={price:92.17, side:sell}", function() {
        it("Should advise to replace current SELL order with a higher one, because rise changed from 1% to 2%", function(done) {
            var advisor = require("../lib/advisor.js");
            advisor.advise(92, 0.02, 0.08, 2, {price:91.26}, {price:92.17, side:glob.SELL}, function(err, advice) {
                assert.ok(!err, "Should not return an error");
                assert.equal(advice.action, glob.REPLACE, "advice.action should be REPLACE");
                assert.equal(advice.price, 93.09, "advice.price should be 93.09");
                done();
            })
        })
    })

    describe("advise(current=300, dip=0.08, rise=0.02, lastFill = {price:377.98}, currentOrder={price:385.54, side:sell}", function() {
        it("Should advise to replace current SELL order with a lower one, because price dipped twice as low", function(done) {
            var advisor = require("../lib/advisor.js");
            advisor.advise(300, 0.02, 0.08, 2, {price:377.98}, {price:385.54, side:glob.SELL}, function(err, advice) {
                assert.ok(!err, "Should not return an error");
                assert.equal(advice.action, glob.REPLACE, "advice.action should be REPLACE");
                assert.equal(advice.price, 306, "advice.price should be 306");
                done();
            })
        })
    })

    describe("advise(current=49, dip=0.03, currentOrder=null)", function() {
        it("Should advise to buy at 47.53", function(done) {
            var advisor = require("../lib/advisor.js");
            advisor.advise(49, 0.005, 0.03, 2, null, null, function(err, advice) {
                assert.ok(!err, "Should not return an error");
                assert.equal(advice.action, glob.BUY, "Should advise to buy");
                assert.equal(advice.price, 47.53, "advice.price should be 47.53");
                done();
            })
        })
    })

    describe("advise(high=9, current=8, margin=0.01, currentOrder={price:52, side:nowhere})", function() {
        it("Should return an error", function(done) {
            var advisor = require("../lib/advisor.js");
            advisor.advise(49, 0.03, 0.05, 2, null, {price:52, side:"nowhere"}, function(err, advice) {
                assert.ok(err, "Should return an error, because currentOrder.direction is invalid");
                assert.equal(err.code, glob.BAD_ORDER, "err.code should be 'badorder'");
                done();
            })
        })
    })

    describe("advise(current=46.33, dip=0.1, currentOrder=null)", function() {
        it("Should advise to buy at 41.69", function(done) {
            var advisor = require("../lib/advisor.js");
            advisor.advise(46.33, 0.03, 0.1, 2, null, null, function(err, advice) {
                assert.ok(!err, "Should not return an error");
                assert.equal(advice.action, glob.BUY, "Should advise to buy");
                assert.equal(advice.price, 41.69, "advice.price should be 46.33");
                done();
            })
        })
    })
})