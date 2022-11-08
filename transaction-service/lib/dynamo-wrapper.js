/**
 * Author : Muhammad Zubair Altaf
 * Date Created : 02/24/2022
 * Purpose : Purpose of this file is to make a generic wrapper for dynamoDB methods
 */

import documentClient from "./model/document-client";

const DynamoWrapper = {};

/**
 * DynamoDB wrapper function to get objects from db
 *
 * @param {object} params
 */
DynamoWrapper.scan = async (params) => {
  let { tableName, filterExpression, expressionAttributeValues, result } =
    params;

  var dbParams = {
    TableName: tableName,
  };

  if (filterExpression) dbParams.FilterExpression = filterExpression;

  if (expressionAttributeValues)
    dbParams.ExpressionAttributeValues = expressionAttributeValues;

  if (result && result.startKey) {
    params.ExclusiveStartKey = params.result.startKey;
  } else {
    result = {
      Items: [],
    };
  }

  return documentClient
    .scan(dbParams)
    .promise()
    .then(function (data) {
      result.Items = result.Items.concat(data.Items);
      return result.Items;
    })
    .catch(function (err) {
      throw new Error(err);
    });
};

export { DynamoWrapper };
