const AWS = require("aws-sdk");
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require("./utils");
const schema = require("./validation/contact-schema");

let options = {}

if(process.env.IS_OFFLINE) {
  options = {
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
  }
}

const dynamo = new AWS.DynamoDB.DocumentClient(options);

module.exports.main = async (event, context) => {
  
  const reqId = nanoid();  //for msg logging
  let contactJSON = JSON.parse(event.body);
  const { error } = schema.validate(contactJSON)
  
  if(error) {
    console.log(`reqId: ${reqId}, error: One or more fields are invalid.`);
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: "One or more fields are invalid.",
      data: error.details
    });
  }
    
  try {
    if(event.routeKey == 'POST /contacts') {
        contactJSON.contactId = nanoid()

        await dynamo.put({
            TableName: "near-contacts",
            Item: contactJSON
        }).promise();
        
        console.log(`reqId: ${reqId}, msg: Contact added successfully!`);
        return utils.send(StatusCodes.OK, {
          message: 'Contact added successfully!',
          data: {
            contactJSON
          }
        });
      } else {
        console.log(`reqId: ${reqId}, error: Unsupported route: ${event.routeKey}`);
        return utils.send(StatusCodes.NOT_FOUND, {
          message: `Unsupported route: ${event.routeKey}`,
          data: error.details
        });
      }
  } catch (error) {
    console.log(`reqId: ${reqId}, error: Error adding contacts to the user`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error adding contacts to the user!',
      data: error.message
    });
  } 
};