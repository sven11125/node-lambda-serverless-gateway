const AWS = require("aws-sdk");
const { nanoid } = require('nanoid');
const { isEmpty } = require('lodash')
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
  const { contactId } = event.pathParameters

  if(!contactId) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "contactId" is required.'
    });
  }

  try {
    if(event.routeKey == 'GET /contacts/{contactId}') {
      
      const contact = await dynamo.get({
        TableName: "near-contacts",
        Key: {
          contactId
        }
      }).promise();

      if(!isEmpty(contact)) {
        console.log(`reqId: ${reqId}, msg: Contact detail retrieved successfully!`);
        return utils.send(StatusCodes.OK, {
          message: 'Contact detail retrieved successfully!',
          data: contact
        });
      }
      
      console.log(`reqId: ${reqId}, error: Contact detail not found for contactId: ${contactId} !`);
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `Contact detail not found for contactId: ${contactId} !`,
        data: {}
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