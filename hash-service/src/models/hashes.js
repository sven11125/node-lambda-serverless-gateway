// TODO: use alias to reference ~lib/ instead of ../../src/lib
const dynamodb = require('../lib/dynamodb');

const { TABLE_NAME_HASHES } = process.env;

/**
 * Create or update a hash
 * @param {string} id - hash UUID
 * @param {string} fingerPrint - fingerPrint of input
 * @param {object} data - any other information about the hash
 * @param {string} [conditionExpression] - optional condition
 * @return {Promise<DocumentClient.AttributeMap>}
 */
async function upsertHash(
    { id, fingerPrint, hk, sk, ...data }, conditionExpression = undefined) {
  const { Attributes } = await dynamodb.update({
    TableName: TABLE_NAME_HASHES,
    Key: {
      hk: `HASH#${ id }`,
      sk: `fingerPrint=${ fingerPrint }`,
    },
    ...dynamodb.marshallUpdateRequest(
        { ...data, id, fingerPrint, hk1: `FINGER_PRINT#${ fingerPrint }`, sk1: `id=${ id }` }),
    ...(conditionExpression
        ? {
          ConditionExpression: conditionExpression,
        }
        : {}),
    ReturnValues: 'ALL_NEW',
  }).promise();

  return Attributes;
}

async function getHash(id, fingerPrint) {
  const { Item } = await dynamodb.get({
    TableName: TABLE_NAME_HASHES,
    Key: {
      hk: `HASH#${ id }`,
      sk: `fingerPrint=${ fingerPrint }`,
    },
  }).promise();
  return Item;
}

module.exports = {
  upsertHash,
  getHash,
};
