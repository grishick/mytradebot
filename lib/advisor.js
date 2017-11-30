/**
 * Created by gsolovyev on 7/4/17.
 */
var glob = require("../constants.js");
var utils = require("../lib/utils.js");
var format = require('string.format');
function advise(current, rise, dip, stopLossRatio, lastFill, currentOrder, cb) {
    if(!currentOrder && !lastFill) {
        //buying
        var targetPrice = utils.floor(current * (1 - dip), 2);
        cb(null, {action:glob.BUY, price:targetPrice});
    } else if(!currentOrder && lastFill) {
        var targetPrice = utils.round(Math.max(Number(current) + 0.05, Number(lastFill.price) * (1 + rise)), 2);
        cb(null, {action:glob.SELL, price:targetPrice});
    } else if(currentOrder.side == glob.SELL) {
        if(current < (1 - dip * stopLossRatio) * lastFill.price) {
            //check for stop loss
            var targetPrice = utils.floor(current * ( 1 + rise), 2);
            if(targetPrice < currentOrder.price) {
                cb(null, {action:glob.REPLACE, price:targetPrice});
            } else {
                cb(null, {action:glob.KEEP})
            }
        } else {
            //check if sell price is still correct
            var targetPrice = utils.round(Math.max(Number(current) + 0.05, Number(lastFill.price) * (1 + rise)), 2);
            var fallbackPrice = utils.floor(current * ( 1 + dip), 2);
            if(targetPrice == Number(currentOrder.price) || (Number(current) - 0.05 <= currentOrder.price && currentOrder.price <= Number(current) + 0.05)) {
                cb(null, {action:glob.KEEP})
            } else if (currentOrder.price < lastFill.price) {
                //this order has been lowered deliberately
                cb(null, {action:glob.KEEP})
            } else {
                //we must have changed rise
                cb(null, {action:glob.REPLACE, price:targetPrice});
            }
        }
    } else if(currentOrder.side == glob.BUY) {
        var targetPrice = utils.round(current * (1 - dip), 2);
        if(targetPrice > currentOrder.price) {
            cb(null, {action:glob.REPLACE, price:targetPrice});
        } else {
            cb(null, {action:glob.KEEP})
        }
    } else {
        cb({code:glob.BAD_ORDER}, null);
    }
}

module.exports = {
    advise:advise
}
