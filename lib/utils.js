/**
 * Created by gsolovyev on 7/4/17.
 */
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function floor(value, decimals) {
    return Number(Math.floor(value+'e'+decimals)+'e-'+decimals);
}

function sleep(seconds) {
    var e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {}
}

module.exports = {
    round:round,
    floor:floor,
    sleep:sleep
}