const AWS = require("aws-sdk");
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
	console.log('Event', event)
	const { appId } = event.pathParameters;
	const body = JSON.parse(event.body);

	if (!appId) {
		return utils.send(StatusCodes.BAD_REQUEST, {
			message: "appId required in path Param"
		});
	}
	if (!body.userId) {
		return utils.send(StatusCodes.BAD_REQUEST, {
			message: "userId required in body"
		});
	}

	try {
		if (event.routeKey == 'DELETE /apps/connected/{appId}') {
			const { Items = [] } = await dynamo.query({
				TableName: "near-connected-apps",
				IndexName: "userId-Index",
				KeyConditionExpression: "userId = :userId",
				ExpressionAttributeValues: {
					":userId": body.userId
				},
				ReturnConsumedCapacity: "TOTAL",
			}).promise();


			Items.forEach(async (item) => {
				if (item.appId === appId) {
					await dynamo.delete({
						TableName: "near-connected-apps",
						Key: {
							connectionId: item.connectionId
						}
					}).promise();
				}
			});
			
			console.log(`msg: App deletes successfully!`);
			return utils.send(StatusCodes.OK, {
				message: 'App deletes successfully!'
			});
		} else {
			console.log(`error: Unsupported route: ${event.routeKey}`);
			return utils.send(StatusCodes.NOT_FOUND, {
				message: `Unsupported route: ${event.routeKey}`,
			});
		}
	} catch (error) {
		console.log(`error: Error deleting app from the user`);
		return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
			message: 'Error deleting app from the user',
			data: error.message
		});
	}
} 