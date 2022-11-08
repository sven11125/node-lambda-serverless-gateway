const AWS = require("aws-sdk");
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require("./utils");
const schema = require("./validation/wallet-schema");
const crypto = require('crypto');
const axios = require("axios");

let options = {}

if (process.env.IS_OFFLINE) {
  options = {
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
  }
}

const dynamo = new AWS.DynamoDB.DocumentClient(options);

module.exports.main = async (event, context) => {

  let walletJSON = JSON.parse(event.body);
  const { error } = schema.validate(walletJSON)

  if (error) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: "One or more fields are invalid.",
      data: error.details
    });
  }

  try {
    if (event.routeKey == 'POST /wallets') {
      let isPrimary = null;
      const queryOutput = await dynamo.query({
        "TableName": "near-wallets",
        "ScanIndexForward": true,
        "IndexName": "userId-Index",
        "KeyConditionExpression": "#key_userId = :key_userId",
        "ExpressionAttributeValues": {
          ":key_userId": walletJSON.userId
        },
        "ExpressionAttributeNames": {
          "#key_userId": "userId"
        }
      }).promise();

      queryOutput.Count > 0 ? isPrimary = false : isPrimary = true;

      const isWallet_exists = await dynamo.query({
        "TableName": "near-wallets",
        "ScanIndexForward": true,
        "IndexName": "walletName-Index",
        "KeyConditionExpression": "#wallet_name = :wallet_name",
        "ExpressionAttributeValues": {
          ":wallet_name": walletJSON.walletName
        },
        "ExpressionAttributeNames": {
          "#wallet_name": "walletName"
        }
      }).promise();

      if (isWallet_exists.Count > 0) {
        return utils.send(404, {
          message: `walletName: ${walletJSON.walletName} already exists.`
        });
      }

      // Blockchain Call (Pending further for Transaction API)

      const in_user_id_lcase = walletJSON.userId.toLowerCase();
      const user_id_small = in_user_id_lcase.replace(/[^a-zA-Z0-9]/g, "");

      const URL = "https://pb3fwehgb8.execute-api.us-east-1.amazonaws.com/dev/account";
      const apiHeaders = {
        "Content-Type": "application/json",
        "x-api-key": "OgQoUm48gsBNCqOvikhfiby09hkBNR8Z7HRYqeX0d",
      };

      const apiParams = {
        "operation": "create_wallet",
        "tags": {
          "app_id": "101",
          "action_id": 210,
          "user_id": user_id_small,
          "transaction_id": nanoid()
        },
        "args": {
          "new_account_id": walletJSON.walletName,
          "email": walletJSON.email,
          "phone": walletJSON.phone
        },
      }

      const response = await axios.post(`${URL}`, apiParams, {
        headers: apiHeaders,
      });

      let walletBody = {
        walletId: nanoid(),
        userId: walletJSON.userId,
        walletName: walletJSON.walletName,
        pubKey: crypto.createHash('sha256', walletJSON.walletName).digest('hex'), // (dependant)
        blockchainHash: crypto.createHash('sha256', walletJSON.walletName).digest('hex'), // (dependant)
        walletIconUrl: "", // (dependant)
        isPrimary: isPrimary,
        status: "pending",
        created: +new Date(),
        updated: +new Date(),
      }

      await dynamo.put({
        TableName: "near-wallets",
        Item: walletBody
      }).promise();

      return utils.send(StatusCodes.OK, {
        message: 'Wallet created successfully!',
        data: {
          walletBody
        }
      });
    } else {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `Unsupported route: ${event.routeKey}`
      });
    }
  } catch (error) {
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error adding wallet to the user!',
      data: error.message
    });
  }
};