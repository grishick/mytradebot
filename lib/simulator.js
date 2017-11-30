/**
 * Created by gsolovyev on 7/6/17.
 */
var config = require('../config');
var utils = require("../lib/utils.js");
var format = require('string.format');
function tryOrderMatch(trades, order, cb) {
    var matchedSize = 0.00000000;
    var tradeSide = order.side == "buy" ? "sell" : "buy";
    var matchF = order.side == "buy" ? matchBuyOrder : (order.type == "limit" ? matchSellOrder : matchBuyOrder);
    var result = false;
    var priceMatch = false;
    for(var i = 0; i < trades.length; i++) {
        if(trades[i].side == tradeSide) {
            if(matchF(trades[i], order)) {
                priceMatch = true;
                matchedSize += utils.round(trades[i].size,8);
                if(matchedSize >= utils.round(order.size,8)) {
                    result = true;
                    break;
                }
            }
        }
    }
    if(!result && priceMatch) {
        console.log("not enough volume to match the order. Matched {matched} out of {target}".format({matched:matchedSize, target:order.size}));
    }
    cb(null, result);
}

function matchBuyOrder(trade, order) {
    return utils.round(trade.price, 8) <= utils.round(order.price, 8) && trade.time > order.created_at;
}

function matchSellOrder(trade, order) {
    return utils.round(trade.price, 8) >= utils.round(order.price, 8) && trade.time > order.created_at;
}

module.exports = {
    tryOrderMatch:tryOrderMatch,
    matchSellOrder:matchSellOrder,
    matchBuyOrder:matchBuyOrder
}
