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
  const { contactId } = event.pathParameters
  
  if(!contactId) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "contactId" is required.'
    });
  }
    
  try {

    if(event.routeKey == 'DELETE /contacts/{contactId}') {
        
        await dynamo.delete({
              TableName: "near-contacts",
              Key: { contactId },
              ConditionExpression: 'attribute_exists(contactId)'
        }).promise();
        
        console.log(`reqId: ${reqId}, msg: Contact with contactId: ${contactId} deleted successfully!`);
        return utils.send(StatusCodes.OK, {
          message: 'Contact deleted successfully!'
        });

      } else {
        console.log(`reqId: ${reqId}, error: Unsupported route: ${event.routeKey}`);
        return utils.send(StatusCodes.NOT_FOUND, {
          message: `Unsupported route: ${event.routeKey}`,
          data: error.details
        });
      }
  } catch (error) {
    if(error.code == 'ConditionalCheckFailedException') {
      console.log(`reqId: ${reqId}, error: Error deleting contactId:${contactId}  not found `);
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `Error deleting contact. contactId: ${contactId} not found!`
      });
    }

    console.log(`reqId: ${reqId}, error: Error deleting contacts to the user`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error deleting contacts to the user!',
      data: error.message
    });
  } 
};