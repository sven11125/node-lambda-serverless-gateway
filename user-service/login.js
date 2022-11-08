const utils = require("./utils");
const { StatusCodes } = require("http-status-codes");
const { nanoid } = require("nanoid");
var randomGen = require("random-gen");
const schema = require("./validation/user-authentication-schema.js");
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

        await checkPrevOTP(userId);

        const userInfoResult = await getUserInformationByID(userId);

        const userInfo = userInfoResult.Items[0];

        const otp = randomGen.number(6);

        const otpResult = await createOTP(userId, otp);

        const otpMessageSubject = "OTP from primelab";
        const otpMessage = "Your One Time Password to login is " + otp;
        let channelType = params.channelType;
        if (params.channelType && params.channelType == "email" && userInfo.email.length) {
            await utils.sendEmail([userInfo.email], process.env.FROM_EMAIL_ADDRESS, process.env.REPLY_TO_EMAIL_ADDRESS.split(","), otpMessageSubject, otpMessage);
        } else if (params.channelType && params.channelType == "phone" && userInfo.phone.length) {
            await utils.sendSMS(userInfo.phone, otpMessage);
        } else {
            if (userInfo.phone.length) {
                channelType = "phone";
                await utils.sendSMS(userInfo.phone, otpMessage);
            } else {
                channelType = "email";
                await utils.sendEmail([userInfo.email], process.env.FROM_EMAIL_ADDRESS, process.env.REPLY_TO_EMAIL_ADDRESS, otpMessageSubject, otpMessage);
            }
        }

        let response = {
            walletId: params.walletId,
            channelType: params.channelType ? params.channelType : channelType,
        };

        if (channelType === "phone") {
            let phoneLength = userInfo.phone.length - 4;
            let maskedPhone = userInfo.phone.substring(userInfo.phone.length - 4, userInfo.phone.length);

            maskedPhone = "*".repeat(phoneLength) + maskedPhone;
            response.phone = maskedPhone;
        } else {
            const [emailName, domain] = userInfo.email.split("@");

            console.log(`reqId: ${reqId}, email name and domain `, emailName, domain);

            let emailNameLength = emailName.length - 2;
            let maskedEmailName = emailName.substring(0, 2) + "*".repeat(emailNameLength);

            let [provider, tld] = domain.split(".");
            let providerLength = provider.length - 3;

            let maskedProviderName = provider.substring(0, 3) + "*".repeat(providerLength);

            let maskedEmail = maskedEmailName + "@" + maskedProviderName +"."+tld;
            response.email = maskedEmail;
        }
        return utils.send(StatusCodes.OK, response);
    } catch (err) {
        console.log(err);
        console.log(`reqId: ${reqId}, login err `, err);
        return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: `${err.message}`,
        });
    }
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

const createOTP = async (userId, otp) => {
    const params = {
        Item: {
            userId: userId,
            code: otp,
            created: +new Date(),
            ttl: Math.floor(Date.now() / 1000) + parseInt(process.env.OTP_EXPIRY_IN_SECONDS),
            status: utils.OtpStatus.Active.name,
        },
        TableName: process.env.DYNAMODB_OTP_TABLE,
    };

    await utils.dynamoDb.put(params);
    return params.Item;
};

const checkPrevOTP = async (userId) => {
    const params = {
        TableName: process.env.DYNAMODB_OTP_TABLE,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId,
        },
    };
    const getOTPResult = await utils.dynamoDb.query(params);
    console.log(`reqId: ${reqId}, login getOTPResult`, getOTPResult);
    if (getOTPResult.Count > 0) {
        const expireOTPResult = await deletePrevOTP(userId, getOTPResult.Items[0].code, getOTPResult.Items[0].ttl);
    }
};

const deletePrevOTP = async (userId, otp, ttl) => {
    const params = {
        TableName: process.env.DYNAMODB_OTP_TABLE,
        Key: {
            userId: userId,
            ttl: ttl,
        },
        ConditionExpression: "userId = :userId AND code = :code",
        ExpressionAttributeValues: {
            ":userId": userId,
            ":code": otp,
        },
    };
    console.log(`reqId: ${reqId}, params `, params);
    const result = await utils.dynamoDb.delete(params);
    return result;
};
