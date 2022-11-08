"use strict";
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const { DateTime } = require("luxon");
const crypto = require('crypto');

const algorithm = process.env.CRYPTO_ALGORITHM;
const secretKey = process.env.CRYPTO_KEY;
const iv = process.env.CRYPTO_IV;

const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
const TOKEN_EXPIRY_IN_MILLISECONDS = process.env.TOKEN_EXPIRY_IN_MILLISECONDS;
const REFRESH_TOKEN_EXPIRY_IN_MILLISECONDS = process.env.REFRESH_TOKEN_EXPIRY_IN_MILLISECONDS;
const parameterStore = new AWS.SSM()
const awsWrapped = AWS;

let options = {}

if (process.env.IS_OFFLINE) {
    options = {
        region: 'local',
        endpoint: 'http://localhost:8000'
    }
}

const client = new awsWrapped.DynamoDB.DocumentClient(options);


const getParam = (param) => {
    return new Promise((res, rej) => {
        parameterStore.getParameter(
            {
                Name: param,
            },
            (err, data) => {
                if (err) {
                    return rej(err);
                }
                return res(data);
            }
        );
    });
};

const getAuthResponse = async (user) => {
    const accessToken = jwt.sign(user, SECRET_KEY, {
        expiresIn: TOKEN_EXPIRY_IN_MILLISECONDS,
    });

    const refreshToken = jwt.sign(user, REFRESH_SECRET_KEY, {
        expiresIn: REFRESH_TOKEN_EXPIRY_IN_MILLISECONDS,
    });

    return {
        jwtAccessToken: accessToken,
        jwtRefreshToken: refreshToken,
        user: user,
    };
};

const verifyAccessToken = async (req) => {
    let token = req.headers["Authorization"];
    if (token) throw new Error("Access Token is required.");

    jwt.verify(token, SECRET_KEY, function (err, decoded) {
        if (err) {
            return false;
        } else {
            req.decoded = decoded;
            return true;
        }
    });
};

const verifyRefreshToken = async (refreshToken) => {
    jwt.verify(refreshToken, REFRESH_SECRET_KEY, function (err, decoded) {
        if (err) {
            return false;
        } else {
            req.decoded = decoded;
            return true;
        }
    });
};

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

const send = (statusCode, data) => {
    const responseHeaders = {
        "Content-Type": "application/json",
        // Required for CORS support to work
        "Access-Control-Allow-Origin": "*",
        // Required for cookies, authorization headers with HTTPS
        "Access-Control-Allow-Credentials": true,
    };
    return {
        statusCode: statusCode,
        headers: responseHeaders,
        body: JSON.stringify(data, null, 2),
    };
};

const checkEmailExists = async (email) => {
    const params = {
        TableName: process.env.DYNAMODB_USER_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email,
        },
    };
    const result = await dynamoDb.scan(params);
    return result.length ? true : false;
};

const checkPhoneExists = async (phone) => {
    const params = {
        TableName: process.env.DYNAMODB_USER_TABLE,
        FilterExpression: "phone = :phone",
        ExpressionAttributeValues: {
            ":phone": phone,
        },
    };
    const result = await dynamoDb.scan(params);
    return result.length ? true : false;
};

const checkWalletNameExists = async (walletId) => {
    const params = {
        TableName: process.env.DYNAMODB_WALLET_TABLE,
        IndexName: "WalletNameIndex",
        KeyConditionExpression: "walletName = :walletName",
        ExpressionAttributeValues: {
            ":walletName": walletId,
        },
    };
    const result = await dynamoDb.query(params);
    return result.Count ? true : false;
};

//Get difference in years for given date vs current date
const getDateDifference = (inputDate, inputFormat, unit) => {
    inputDate = DateTime.fromFormat(inputDate, inputFormat);
    const currentDate = DateTime.now();
    const difference = currentDate.diff(inputDate, unit)[unit];
    return difference;
};

const sendSMS = async function (toNumber, message) {
    var params = {
        Message: message,
        PhoneNumber: toNumber,
    };

    try {
        var publishTextPromise = await new AWS.SNS({ apiVersion: "2010-03-31" }).publish(params).promise();
        return publishTextPromise.MessageId;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const sendEmail = async function (toEmailAddresses, fromEmailAddress, replyToEmailAddresses, subject, messageBody) {
    // Create sendEmail params
    var params = {
        Destination: {
            ToAddresses: toEmailAddresses,
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: messageBody,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: fromEmailAddress,
        ReplyToAddresses: [],
    };

    try {
        var publishEmailPromise = await new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(params).promise();
        return publishEmailPromise.MessageId;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

//NOTE: USER STATUS
class UserStatus {
    static Active = new UserStatus("active");
    static Blocked = new UserStatus("blocked");
    static Deleted = new UserStatus("deleted");

    constructor(name) {
        this.name = name;
    }
}

class OtpStatus {
    static Active = new UserStatus("active");
    static Expired = new UserStatus("expired");
    constructor(name) {
        this.name = name;
    }
}

const encrypt = (text) => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return encrypted.toString('hex');
};

const decrypt = (text) => {

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(text, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = {
    getParam,
    verifyRefreshToken,
    getAuthResponse,
    verifyAccessToken,
    client,
    UserStatus,
    OtpStatus,
    dynamoDb,
    awsWrapped,
    send,
    getDateDifference,
    sendSMS,
    sendEmail,
    checkEmailExists,
    checkPhoneExists,
    checkWalletNameExists,
    encrypt,
    decrypt
};
