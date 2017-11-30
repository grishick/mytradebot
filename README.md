# README #

This is a simple GDAX tradebot that runs on AWS Lambda or from a terminal. The code is NodeJS and uses [gdax-node library] (https://github.com/coinbase/gdax-node).

## How this bot works ##

This bot places limit buy and sell orders on GDAX based on input parameters and current price. All the price setting logic is contained in lib/advisor.js.
The bot uses the following parameters to determine limit price for selling and buying:

### Trading Parameters ###
* PRODUCT_ID (GDAX trade pare identifier. One of: LTC-USD, BTC-USD, ETH-USD)
* MIN_TRADE (the minimum size of a buy order in USD)
* MAX_TRADE (maximum size of a buy order in USD)
* RISE (multiplier for setting limit sell order. E.g. a value of 0.03 will set a sell order at the price that is 3% higher than the fill price of the last BUY order)
* DIP (multiplier for setting limit buy order. E.g. a value of 0.10 will set a buy order at the prices that is 10% lower than the current asset ticker)
* STOP_LOSS_RATIO (multiplier for re-setting a sell order when the price falls below the buy price. E.g. a value of 3, will direct the bot to replace a sell order with a lower one when tiker price drops below (last fill price) * (1 - DIP * 3). The new limit order will have the price based on current ticket price and RISE parameter: new price = current price * (1 + RISE).
* CANCEL_BUY_AFTER - order life time. GDAX currently supports the following values "hour", "day" and "min" [GDAX API Documentation] (https://docs.gdax.com/#place-a-new-order). 

### API Parameters ###
* MODE - the bot supports two modes "paper" and "live". In "paper" mode the bot will place orders in AWS Dynamo instead of placing real orders on GDAX. In "live" mode the orders will be placed on GDAX.
* TRADE_MODE - trading mode on GDAX. Can be "live" or "sandbox". GDAX seems to have dropped support for sandbox trading, so "sandbox" mode has not been working for a while now.
* NOTIFIER - how to send trade and error notifications. Currently, the bot supports two notification methods: text message and email. For text messaging the bot uses AWS SNS [Amazon Simple Notification Service] (https://aws.amazon.com/sns/) and for emails, the bot uses AWS SES [Amazon Simple Email Service] (https://aws.amazon.com/ses/). Both services require additional set up steps, so please read the AWS docs to set those up.
* DATA_MODE - similar to TRADE_MODE. Indicates whether to use "sandbox" or "live" data feed from GDAX. As of the time of writing, GDAX "sanbox" data feed is not working.
* GDAX_LIVE_API_URL - URL for GDAX API. Set to https://api.gdax.com unless GDAX changes it.
* GDAX_LIVE_API_KEY - your Live API key for GDAX. See [GDAX API Authentication] (https://docs.gdax.com/#authentication)
* GDAX_LIVE_PASSPHRASE - your Live API passphrase for GDAX. See [GDAX API Authentication] (https://docs.gdax.com/#authentication)
* GDAX_LIVE_API_SECRET - your Live API secret for GDAX. See [GDAX API Authentication] (https://docs.gdax.com/#authentication)
* NOTIFICATION_EMAIL_SUBJ - subject for notification emails.
* NOTIFICATION_RECIPIENT_EMAIL - where to send notification emails.
* NOTIFICATION_SENDER_EMAIL - "from" address for notification emails.
* NOTIFICATION_PHONE_NUMBER - where to send notification texts. The phone number should be in international format, e.g. "+18881234567".

## Packaging ##
The bot is packaged as a zip file for uploading to AWS Lambda. You can create the zip file by running 
<code>npm run package</code>

## Setting up on AWS ##
In order to run the bot on AWS, you will need an Amazon Web Services account [AWS] (https://aws.amazon.com/) and you will need to sign up for the following AWS services:
* AWS Lambda (https://aws.amazon.com/lambda/)
* AWS SNS (https://aws.amazon.com/sns/)
* AWS SES (https://aws.amazon.com/ses/)
* AWS CloudWatch (https://aws.amazon.com/cloudwatch/)
* AWS IAM (https://console.aws.amazon.com/iam/)
* AWS DynamoDB. You need this only for paper-mode testing. See [Paper trading on AWS DynamoDB](#papertrading) below. (https://aws.amazon.com/dynamodb/) 

### AWS Lambda Setup ###
#### Create IAM Role ####
Before you can set up an AWS Lambda function, you need to create an IAM role for this function. Open AWS IAM (https://console.aws.amazon.com/iam/) in your browser and navigate to Roles. Click "Create role" button. On next screen select "Lambda" as type of trusted entity. Click "Next: Permissions". Attach the following permissions:
* AmazonDynamoDBFullAccess
* AmazonSESFullAccess
* CloudWatchLogsFullAccess
* AWSLambdaBasicExecutionRole
* AmazonSNSFullAccess
* CloudWatchEventsFullAccess

Note: these permissions are broader than what is required by the trader function to run, but I haven't had the time to figure out exact permissions. If you know your way around IAM, you can set up more restrictive permissions.

Click "Next: Review". Give your IAM role a name, such as "trader". 

#### Create AWS Function ####
After you sign up for AWS Lambda servce go to AWS Lambda Dashboard and select N. Virginia region [Lambda Dashboard US East 1] (https://console.aws.amazon.com/lambda/home?region=us-east-1). GDAX servers are running on AWS in N Virginia region, so it is better to set up the lambda function in the same region.

Click on "Create Function" link, on the next screen click "Author from scratch". Give your function a name, e.g "GDAX BTC trader". Select "Select an existing role" under "Role" and select the name of the IAM role that you have created in the previous section (e.g. "trader") under "Existing role".

On the next screen under "Function code" section select "Upload a .ZIP file" in "Code entry type" menu. Selec "Node.js 6.10" as runtime. Type "lambda.handler" into "Handler" field.
Open terminal and run  <code>npm run package</code> to create <i>mytradebot.zip</i> file. 

Return to AWS Lambda window in your browser, click "Upload" under "Function package" and upload <i>mytradebot.zip</i>.

Next, scroll down to "Environment Variables" and create an environment variable for each of the parameters listed in API Parameters and Trading Parameters sections above.

Next, scroll up (or down, depends on how AWS console UI changes) to configuring event triggers. Event Triggers are what triggers your Lambda function to run. I use schedule rule to trigger the function once a minute. This trigger can be configured as a CloudWatch Event with schedule expression "rate(1 minute)". As of the time of writing, CloudWatch does not support firing schedule events more frequently.
 
## Testing ##

### Unit tests ###
Mocha based unit tests are in "test" folder. Run <code>mocha</code> to run through all the tests. Some tests require these environment variables to be set: 
* NOTIFICATION_EMAIL_SUBJ - subject for notification emails.
* NOTIFICATION_RECIPIENT_EMAIL - where to send notification emails.
* NOTIFICATION_SENDER_EMAIL - "from" address for notification emails.
* NOTIFICATION_PHONE_NUMBER - where to send notification texts. The phone number should be in international format, e.g. "+18881234567".

###  <a name="papertrading"></a> Paper trading on AWS DynamoDB ###

TBD

## Running from command line ##
TBD