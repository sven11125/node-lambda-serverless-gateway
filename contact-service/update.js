const AWS = require("aws-sdk");
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require("./utils");
const schema = require("./validation/contact-update-schema");

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
  let contactJSON = JSON.parse(event.body);

  try {
    
    if(!contactId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "contactId" is required.'
      });
    }
  
    const { error } = schema.validate(contactJSON)
    
    if(error) {
      console.log(`reqId: ${reqId}, error: One or more fields are invalid.`);
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: "One or more fields are invalid.",
        data: error.details
      });
    }

    if(event.routeKey == 'PUT /contacts/{contactId}') {
        
        let updateExpression='set';
        let ExpressionAttributeNames={};
        let ExpressionAttributeValues = {};
        for (const item in contactJSON) {
          updateExpression += ` #${item} = :${item} ,`;
          ExpressionAttributeNames['#'+item] = item ;
          ExpressionAttributeValues[':'+item]=contactJSON[item];
        }
        updateExpression= updateExpression.slice(0, -1);

        const params = {
          TableName: 'near-contacts',
          Key: {
           contactId,
          },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: ExpressionAttributeNames,
          ExpressionAttributeValues: ExpressionAttributeValues,
          ConditionExpression: 'attribute_exists(contactId)',
          ReturnValues: "UPDATED_NEW"
        };
    

        const data = await dynamo.update(params).promise();
  
        if(data) {
          console.log(`reqId: ${reqId}, msg: Contact updated successfully!`);
          return utils.send(StatusCodes.OK, {
            message: 'Contact updated successfully!',
            data
          });
        }

        console.log(`reqId: ${reqId}, error: Unable to update contact`);
        return utils.send(StatusCodes.NOT_FOUND, {
          message: `Unable to update contact`,
          data: {}
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
      console.log(`reqId: ${reqId}, error: Error updating contactId:${contactId}  not found `);
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `Error updating contact. contactId: ${contactId} not found!`
      });
    }
    console.log(`reqId: ${reqId}, error: Error updating contacts`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error updating contacts!',
      data: error.message
    });
  } 
};