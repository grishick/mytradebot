/**
 * Created by gsolovyev on 7/23/17.
 */
var assert = require('assert');
var notifierEmail = require("../lib/emailNotifier.js")
var notifierSMS = require("../lib/SMSNotifier")
describe("notifier", function() {
    describe("notify", function() {
        it("should send an email", function(done) {
            this.timeout(10000);
            notifierEmail.notify("test message", function(err) {
                assert.ok(!err, "should not return an error " + JSON.stringify(err))
                done();
            })
        })

        it("should send an SMS", function(done) {
            this.timeout(10000);
            notifierSMS.notify("test message", function(err) {
                assert.ok(!err, "should not return an error " + JSON.stringify(err))
                done();
            })
        })
    })

})