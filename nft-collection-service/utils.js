"use strict";
const _ = require('underscore');
const AWS = require("aws-sdk");
const xray = require("aws-xray-sdk");

const { IS_OFFLINE, IS_LOCAL } = process.env;
const awsWrapped = IS_LOCAL ? AWS : xray.captureAWS(AWS);
const client = IS_OFFLINE
  ? new awsWrapped.DynamoDB.DocumentClient({
    region: "localhost",
    endpoint: "http://localhost:8000",
  })
  : new awsWrapped.DynamoDB.DocumentClient();

const OfferType = {
  TOKEN: 'TOKEN',
  NFT: 'NFT'
}

const OfferAction = {
  INITIAL: 'initial',
  COUNTER: 'counter'
}

const OfferStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

const dynamoDb = {
  get: (params) => client.get(params).promise(),
  scan: async (params) => {
    let resultArr = [];
    await client.scan(params, onScan).promise();
    return resultArr;

    function onScan(err, data) {
      if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        data.Items.forEach(function (itemdata) {
          resultArr.push(itemdata);
        });
        // continue scanning if we have more items
        if (typeof data.LastEvaluatedKey != "undefined") {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          client.scan(params, onScan);
        }
      }
    }
  },
  batchGet: (params) => client.batchGet(params).promise(),
  batchWrite: (params) => client.batchWrite(params).promise(),
  query: (params) => client.query(params).promise(),
  put: (params) => client.put(params).promise(),
  update: (params) => client.update(params).promise(),
  delete: (params) => client.delete(params).promise(),
  transactWriteItems: (params) => client.transactWrite(params).promise(),
};

const constructUpdateExpressions = (inputParams) => {
  // Function to generate update expression for DynamoDB automatically based on the inputParams
  let updateExpression = '';
  const finalExpression = {};
  const expAttrNames = {};
  const expAttValues = {};
  const systemValReplacements = {
    status: 'x_status'
  };
  for (let attr in inputParams) {
    let emptyExpAttrNames = false;
    const replacedAttrVal = attr && systemValReplacements[attr] ? systemValReplacements[attr] : '';
    if (replacedAttrVal && !updateExpression) {
      updateExpression += `set #${replacedAttrVal} = :new_${attr}`;
    } else if (replacedAttrVal) {
      updateExpression += `, #${replacedAttrVal} = :new_${attr}`;
    }
    if (!replacedAttrVal && attr && !updateExpression) {
      updateExpression += `set ${attr} = :new_${attr}`;
    } else if (!replacedAttrVal && attr) {
      updateExpression += `, ${attr} = :new_${attr}`;
    }
    if (attr) {
      expAttValues[`:new_${attr}`] = inputParams[attr];
    }
    if (replacedAttrVal) {
      expAttrNames[`#${replacedAttrVal}`] = attr;
    }
  }
  if (!_.isEmpty(updateExpression)) {
    finalExpression.UpdateExpression = updateExpression;
  }
  if (!_.isEmpty(expAttrNames)) {
    finalExpression.ExpressionAttributeNames = expAttrNames;
  }
  if (!_.isEmpty(expAttValues)) {
    finalExpression.ExpressionAttributeValues = expAttValues;
  }
  return finalExpression;
};

const send = (statusCode, data) => {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  };

  return {
    statusCode: statusCode,
    headers: responseHeaders,
    body: JSON.stringify(data, null, 2),
  };
};

module.exports = {
  OfferType,
  OfferAction,
  OfferStatus,
  dynamoDb,
  send,
  constructUpdateExpressions,
};