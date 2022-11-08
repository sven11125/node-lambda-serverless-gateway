const utils = require("../../utils");
const { nanoid } = require('nanoid');
const { DYNAMODB_NFT_COLLECTIONS_TABLE } = process.env;

async function getAll(ownerId) {
  let params = {
    TableName: DYNAMODB_NFT_COLLECTIONS_TABLE,
    ScanIndexForward: true,
    IndexName: "OwnerIdIndex",
    KeyConditionExpression: "#ownerId = :ownerId",
    ExpressionAttributeValues: {
      ":ownerId": ownerId
    },
    ExpressionAttributeNames: {
      "#ownerId": "ownerId"
    }
  }
  const result = await utils.dynamoDb.query(params);
  return result.Items;
}

const createCollection = async (params) => {

  const tableParams = {
    TableName: DYNAMODB_NFT_COLLECTIONS_TABLE,
    Item: {
      collectionId: nanoid(),
      collectionName: params.collectionName,
      ownerId: params.ownerId,
      status: 'active',
      created: +new Date,
      updated: +new Date
    }
  };

  await utils.dynamoDb.put(tableParams);

  return tableParams.Item;
};

module.exports = {
  getAll,
  createCollection
}