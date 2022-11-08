const AWS = require("aws-sdk");
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require("./utils");

let options = {}

if(process.env.IS_OFFLINE) {
  options = {
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
  }
}

const dynamo = new AWS.DynamoDB.DocumentClient(options);

module.exports.main = async (event, context) => {

  const reqId = nanoid(); 

  try {
    if(event.routeKey == 'GET /contacts/list') {
        const params = {
            TableName: "near-contacts",
        };

        let scanResults = [];
        let items;
        do {
            items =  await dynamo.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey  = items.LastEvaluatedKey;
        } while(typeof items.LastEvaluatedKey !== "undefined");
        
    
        return utils.send(StatusCodes.OK, {
            message: 'Contact list retrieved successfully!',
            data: scanResults
        });

    } else {
      console.log(`reqId: ${reqId}, error: Unsupported route: ${event.routeKey}`);
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `Unsupported route: ${event.routeKey}`,
        data: error.message
      });
    }
  } catch (error) {
    console.log(`reqId: ${reqId}, error: Error to get contact detail!`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error to get contact detail!',
      data: error.message
    });
  } 
};