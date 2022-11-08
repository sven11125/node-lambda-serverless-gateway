const AWS = require("aws-sdk");
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require("./utils");

let options = {}

if (process.env.IS_OFFLINE) {
  options = {
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
  }
}

const dynamo = new AWS.DynamoDB.DocumentClient(options);

module.exports.main = async (event, context) => {

  const reqId = nanoid();

  const querystring = event.queryStringParameters || {};
  const search = querystring.search;
  let params;

  if ((typeof search !== undefined && search == '') || (search && !/^([a-zA-Z0-9_-]{0,21})$/.test(search))) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      errors: [
        {
          appName: "appName is not a valid input"
        }
      ]
    });
  } else {
    params = search ?
      {
        TableName: "near-apps",
        FilterExpression: "#appName = :appName",
        ExpressionAttributeNames: { "#appName": "appName" },
        ExpressionAttributeValues: { ":appName": search }
      } : {
        TableName: "near-apps",
      }
  }

  try {
    if (event.routeKey == 'GET /apps') {
      let scanResults = [];
      let items;
      do {
        items = await dynamo.scan(params).promise();
        items.Items.forEach((item) => {
          item.created = new Date(item.created).toISOString();
          item.updated = new Date(item.updated).toISOString();
          scanResults.push(item);
        });
        params.ExclusiveStartKey = items.LastEvaluatedKey;
      } while (typeof items.LastEvaluatedKey !== "undefined");

      const searchResult = search && Object.keys(scanResults[0] || {}).length < 1 && {
        error: 'unable to find the app'
      }

      return utils.send(StatusCodes.OK,
        search ? searchResult.error ? {
          errors: [{
            message:searchResult.error
          }] 
        } : { 
          success: true,
          message: 'App retrieved successfully!',
          data: scanResults[0] 
        } : {
          success: true,
          message: 'Apps retrieved successfully!',
          data: scanResults 
        }
      );

    } else {
      console.log(`reqId: ${reqId}, error: Unsupported route: ${event.routeKey}`);
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `Unsupported route: ${event.routeKey}`,
        data: error.message
      });
    }
  } catch (error) {
    console.log(`reqId: ${reqId}, error: Error to get apps!`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error to get apps!',
      data: error.message
    });
  }
};