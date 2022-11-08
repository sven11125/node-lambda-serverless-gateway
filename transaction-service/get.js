const utils = require("./utils");
const { StatusCodes } = require('http-status-codes');
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.main = async (event) => {

    const { transactionId } = event.pathParameters;

    if (!transactionId) {
        return utils.send(StatusCodes.BAD_REQUEST, {
            message: "Missing transactionId path param",
            data: {},
          });
    }

    try {
        const transaction = await getTransactionById(transactionId);
        return utils.send(StatusCodes.OK, { message: "Transaction retrieved successfully.", data: transaction });

    } catch (err) {
        console.log(`Error retrieving transaction ${transactionId}`, err);
        return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, { message: "Ops..." });
    }

};


const getTransactionById = async (transactionId) => {   
    
    const tableParams = {
      TableName: "near-transactions",
      Key: {
          transactionId: transactionId
      }
    };

    const result = await docClient.get(tableParams).promise();

    return result.Item;
  };
  