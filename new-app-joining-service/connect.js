const AWS = require("aws-sdk");
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require("./utils");
const schema = require("./validation/app-connection-schema");

let options = {}

if (process.env.IS_OFFLINE) {
	options = {
		region: 'us-east-1',
		endpoint: 'http://localhost:8000'
	}
}

const dynamo = new AWS.DynamoDB.DocumentClient(options);

module.exports.handler = async (event) => {

	console.log(event)
	const reqId = nanoid();  //for msg logging
	const timeStamp = new Date().getTime();

	// event.headers.authorization.users = {}
	const appConnectionJSON = JSON.parse(event.body);
	const { error } = schema.validate(appConnectionJSON)

	if (error) {
		console.log(`reqId: ${reqId}, error: One or more fields are invalid.`);
		return utils.send(StatusCodes.BAD_REQUEST, {
			message: "One or more fields are invalid.",
			data: error.details
		});
	}

	try {
		if (event.routeKey == 'POST /apps/connect') {
			const { Items = [] } = await dynamo.query({
				TableName: "near-connected-apps",
				IndexName: "userId-Index",
    		KeyConditionExpression: "userId = :userId",
    		ExpressionAttributeValues: {
       	 ":userId": appConnectionJSON.userId
    		},
				ReturnConsumedCapacity: "TOTAL",
			}).promise();

			
			Items.forEach(item => {
				if (item.appId === appConnectionJSON.appId) {
					throw new Error("App already connected to the user")
				}
			});
			await dynamo.put({
				TableName: "near-connected-apps",
				Item: {
					connectionId: reqId,
					...appConnectionJSON,
					status: 'active',
					created: timeStamp,
					updated: timeStamp
				}
			}).promise();

			appConnectionJSON.connectionId = reqId

			console.log(`reqId: ${reqId}, msg: Connection added successfully!`);
			return utils.send(StatusCodes.OK, {
				message: 'App connects successfully!',
				data: {
					...appConnectionJSON
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
		console.log(`reqId: ${reqId}, error: Error connecting app to the user`);
		return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
			message: 'Error connecting apps to the user!',
			data: error.message
		});
	}
}; 
