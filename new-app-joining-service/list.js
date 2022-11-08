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

module.exports.handler = async (event) => {
	console.log(event)
	let appDetails = []

	const reqId = nanoid();  //for msg logging

	try {
		const { userId } = event.queryStringParameters
		if (!userId) {
			return utils.send(StatusCodes.BAD_REQUEST, {
				message: "userId is required in query params"
			});
		}

		if (userId && event.routeKey == 'GET /apps/connected') {
			const { Items } = await dynamo.query({
				TableName: "near-connected-apps",
				IndexName: "UserIdIndex",
    		KeyConditionExpression: "userId = :userId",
    		ExpressionAttributeValues: {
       	 ":userId": userId
    		},
				ReturnConsumedCapacity: "TOTAL",
			}).promise();

			for (const record of Items)   {
				console.log(record.appId)
				const { Item } = await dynamo.get({
					TableName: "near-apps",
					Key: {
						appId: record.appId
					}
				}).promise();
				appDetails.push(Item)
			}
			console.log('details', appDetails)

			console.log(`reqId: ${reqId}, msg: Connected apps found!`);
			return utils.send(StatusCodes.OK, {
				message: 'Apps retrieved successfully!',
				data: appDetails
			});
		} else {
			console.log(`reqId: ${reqId}, error: Unsupported route: ${event.routeKey}`);
			return utils.send(StatusCodes.NOT_FOUND, {
				message: `Unsupported route: ${event.routeKey}`,
				data: error.details
			});
		}
	} catch (error) {
		console.log(`reqId: ${reqId}, error: Error retreiving apps from the user`);
		return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
			message: 'Error retreiving apps from the user!',
			data: error.message
		});
	}
}
