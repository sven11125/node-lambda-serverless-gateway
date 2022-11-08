const schema = require("./validation/transaction-schema");
const utils = require("./utils");
const { StatusCodes } = require('http-status-codes');
const { nanoid } = require("nanoid");
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = async (event) => {
    
    const params = JSON.parse(event.body);
    
    const { error } = schema.validate(params);
    
    if(error)
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: "One or more fields are invalid.",
        data: error.details
    });

    try {
        const newTransaction = await createTransaction(params);

        return utils.send(StatusCodes.OK, { message: "Transaction created successfully.", data: newTransaction });

    } catch (err) {
        console.log("Error creating transaction", err);
        return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, { message: "Ops..." });
    }

};

const createTransaction = async (params) => {   
    
    const tableParams = {
      TableName: "near-transactions",
      Item: {
          "transactionId": nanoid(),
          "senderWalletId": params.senderWalletId,
          "receiverWalletId": params.receiverWalletId,
          "transactionValue": params.transactionValue,
          "transactionItemId": params.transactionItemId,
          "type": params.type,
          "tags": params.tags,
          "status": params.status,
          "created": +new Date,
          "updated": +new Date                    
      }
    };

    await docClient.put(tableParams).promise();

    return tableParams.Item;
  };
  