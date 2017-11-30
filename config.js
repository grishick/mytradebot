/**
 * Created by gsolovyev on 7/4/17.
 */
'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
var nconf = module.exports = require('nconf');
var path = require('path');

nconf
    // 1. ENV
    .env(['TRADE_MODE', 'GDAX_LIVE_API_KEY', 'GDAX_LIVE_API_SECRET', 'GDAX_LIVE_PASSPHRASE', 'GDAX_LIVE_API_URL', 'DATA_MODE', 'AWS_ORDER_BOOK_NAME', 'AWS_FILLS_BOOK_NAME', 'AWS_ACCOUNT_RECORD_NAME'])
    // 2. Config file
    .file({ file: path.join(__dirname, '_config.json') })
    // 3. Defaults
    .defaults({
        TRADE_MODE: 'sandbox',
        DATA_MODE: 'live',
        AWS_ORDER_BOOK_NAME:'autotest-paper-orders',
        AWS_FILLS_BOOK_NAME:'autotest-paper-fills',
        AWS_ACCOUNT_RECORD_NAME:'autotest-paper-account'
    });

// Check for required settings
checkConfig('TRADE_MODE');
checkConfig('DATA_MODE');

function checkConfig (setting) {
    if (!nconf.get(setting)) {
        throw new Error('You must set the ' + setting + ' in _config.json!');
    }
}
