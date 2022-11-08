const utils = require("./utils");
const { DYNAMODB_NFT_COLLECTIONS_TABLE } = process.env;

module.exports.handler = async (event) => {
  const { pathParameters } = event;
  try {
    const { nftCollectionId } = pathParameters;

    if (!nftCollectionId) {
      return utils.send(404, {
        message: 'The path parameter "nftCollectionId" is required.'
      });
    }

    const collection = await getCollectionById(nftCollectionId);

    const response = {
      message: "NFT Collection retrieved successfully.",
      data: collection,
    };

    return utils.send(200, response);
  } catch (err) {
    return utils.send(500, {
      message: "Internal Server Error",
      body: err.message
    });
  }
};

const getCollectionById = async (collectionId) => {
  const tableParams = {
    TableName: DYNAMODB_NFT_COLLECTIONS_TABLE,
    Key: {
      collectionId: collectionId
    }
  };
  const result = await utils.dynamoDb.get(tableParams);
  return result.Item;
};
