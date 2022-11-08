const utils = require("./utils");
const { StatusCodes } = require("http-status-codes");
const { nanoid } = require("nanoid");
var randomGen = require("random-gen");
const schema = require("./validation/user-authentication-confirm-schema.js");
const reqId = nanoid();
module.exports.handler = async (event) => {
    try {
        const params = JSON.parse(event.body);

        const { error } = schema.validate(params, { abortEarly: false });
        if (error)
            if (error) {
                return utils.send(StatusCodes.BAD_REQUEST, {
                    errors: error.details.map((item) => item.message),
                });
            }

        if (!(await utils.checkWalletNameExists(params.walletID))) {
            return utils.send(StatusCodes.NOT_FOUND, {
                message: "WalletID does not exist",
            });
        }

        const walletInfoResult = await getWalletInformationByID(params.walletID);
        const walletInfo = walletInfoResult.Items[0];
        const userId = walletInfo.userId;

        const verifyOTPResult = await verifyOTP(userId, params.OTP);
        console.log(`reqId: ${reqId}, verifyOTPResult `, verifyOTPResult);

        const currentTime = Math.floor(Date.now() / 1000);
        const createdTime = Math.floor(verifyOTPResult[0].created / 1000);
        const timeDifference = currentTime - createdTime;

        console.log(`reqId: ${reqId}, currentTime `, currentTime);
        console.log(`reqId: ${reqId}, currentTime `, createdTime);
        console.log(`reqId: ${reqId}, timeDifference `, timeDifference);
        if (timeDifference > parseInt(process.env.OTP_EXPIRY_IN_SECONDS)) {

            const expireOTPResult = await expireOTP(userId, params.OTP, verifyOTPResult[0].ttl);
            console.log(`reqId: ${reqId}, expireOTPResult `, expireOTPResult);
            return utils.send(StatusCodes.NOT_FOUND, {
                message: "OTP is expired",
            });
        }

        if (verifyOTPResult.length == 0) {

            return utils.send(StatusCodes.NOT_FOUND, {
                message: "Invalid WalletID/OTP ",
            });
        } else if (verifyOTPResult[0].status == utils.OtpStatus.Expired.name) {
            return utils.send(StatusCodes.NOT_FOUND, {
                message: "OTP is expired",
            });
        }

        const expireOTPResult = await expireOTP(userId, params.OTP, verifyOTPResult[0].ttl);
        console.log(`reqId: ${reqId}, expireOTPResult `, expireOTPResult);

        const userInfoResult = await getUserInformationByID(userId);
        const userInfo = userInfoResult.Items[0];
        const authResponse = await utils.getAuthResponse(userInfo);
        const response = {
            data: {
                jwtAccessToken: authResponse.jwtAccessToken,
                jwtRefreshToken: authResponse.jwtRefreshToken,
                user: { ...userInfo },
            },
        };
        return utils.send(StatusCodes.CREATED, response);
    } catch (err) {
        console.log(`reqId: ${reqId}, verify err`,err);
        return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: `${err.message}`,
        });
    }
};

const expireOTP = async (userId, otp, ttl) => {
    const params = {
        TableName: process.env.DYNAMODB_OTP_TABLE,
        Key: {
            userId: userId,
            ttl: ttl,
        },
        UpdateExpression: "set #status = :status",
        ConditionExpression: "userId = :userId AND code = :code",
        ExpressionAttributeValues: {
            ":status": utils.OtpStatus.Expired.name,
            ":userId": userId,
            ":code": otp,
        },
        ExpressionAttributeNames: {
            "#status": "status",
        },
        ReturnValues: "UPDATED_NEW",
    };
    console.log(`reqId: ${reqId}, params `, params);
    const result = await utils.dynamoDb.update(params);
    return result;
};

const getWalletInformationByID = async (walletId) => {
    const params = {
        TableName: process.env.DYNAMODB_WALLET_TABLE,
        IndexName: "walletName-Index",
        KeyConditionExpression: "walletName = :walletName",
        ExpressionAttributeValues: {
            ":walletName": walletId,
        },
    };
    const result = await utils.dynamoDb.query(params);
    return result;
};
const getUserInformationByID = async (userId) => {
    const params = {
        TableName: process.env.DYNAMODB_USER_TABLE,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId,
        },
    };
    const result = await utils.dynamoDb.query(params);
    return result;
};

const verifyOTP = async (userId, otp) => {
    const params = {
        TableName: process.env.DYNAMODB_OTP_TABLE,
        FilterExpression: "userId = :userId AND code = :code",
        ExpressionAttributeValues: {
            ":userId": userId,
            ":code": otp,
        },
    };
    const result = await utils.dynamoDb.scan(params);
    return result;
};
