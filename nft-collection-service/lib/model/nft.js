const utils = require("../../utils");
const { DYNAMODB_NFTS_TABLE } = process.env;

async function getNftById(nftId) {
  let params = {
    TableName: DYNAMODB_NFTS_TABLE,
    Key: {
      nftId
    }
  }
  const result = await utils.dynamoDb.get(params);
  return result.Item;
}

async function updateNftById(nftId, inputParams) {
  let params = {
    TableName: DYNAMODB_NFTS_TABLE,
    Key: {
      nftId
    },
    ...utils.constructUpdateExpressions(inputParams)
  }
  const result = await utils.dynamoDb.update(params);
  console.log(result);
  return result.Item;
}

module.exports = {
  getNftById,
  updateNftById,
}