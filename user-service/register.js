const axios = require("axios");
const utils = require("./utils");
const { StatusCodes } = require("http-status-codes");
const { nanoid } = require("nanoid");
const reqId = nanoid();
const schema = require("./validation/user-schema.js");


module.exports.handler = async (event) => {
    try {
        const params = JSON.parse(event.body);
        const { error } = schema.validate(params, { abortEarly: false });

        if (error) {
            return utils.send(StatusCodes.BAD_REQUEST, {
                errors: error.details.map((item) => item.message),
            });
        }
        const walletId = params.walletName;
        delete params.walletName;

        if (params.email && (await utils.checkEmailExists(params.email))) {
            return utils.send(StatusCodes.CONFLICT, {
                message: "Email already exist",
            });
        } else if (params.phone && (await utils.checkPhoneExists(params.phone))) {
            return utils.send(StatusCodes.CONFLICT, {
                message: "Phone already exist",
            });
        } else if (await utils.checkWalletNameExists(walletId)) {
            return utils.send(StatusCodes.CONFLICT, {
                message: "Wallet name already exist",
            });
        }

        params.userId = nanoid();
        const dbUser = await createUser(params);
        const authResponse = await utils.getAuthResponse(dbUser);
        params.jwtAccessToken = authResponse.jwtAccessToken;
        // const wallet = await createWallet(params, walletId);
        // dbUser.walletId = walletId;

        const response = {
            data: {
                jwtAccessToken: authResponse.jwtAccessToken,
                jwtRefreshToken: authResponse.jwtRefreshToken,
                user: { ...dbUser },
            },
        };

        console.log(`reqId: ${reqId}, User register response `, response);
        await sendVerificationEmail(dbUser, response.data.jwtAccessToken);
        return utils.send(StatusCodes.CREATED, response.data.jwtAccessToken);
    } catch (err) {
        console.log(`reqId: ${reqId}, login err`, err);
        return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: `${err.message}`,
        });
    }
};


const createUser = async (request) => {
    const user = { ...request };

    const params = {
        Item: {
            created: +new Date(),
            status: utils.UserStatus.Active.name,
            isPhoneVerified: false,
            isEmailVerified: false,
            ...user,
        },
        TableName: process.env.DYNAMODB_USER_TABLE,
    };

    await utils.dynamoDb.put(params);
    return params.Item;
};

const sendVerificationEmail = async (userInfo, accessToken) => {

    const userId = userInfo.userId;
    const ttl = Math.floor(Date.now() / 1000) + parseInt(process.env.HASH_KEY_EXPIRY_IN_MILLISECONDS);
    const hashKey = utils.encrypt(`${userId}/${ttl}`);

    let subject = 'Email verification for primelab';
    let href = process.env.APP_DOMAIN + '?hash=' + hashKey + '&jwt=' + accessToken;
    let messageBody = `<h1>Here is the email verification link for primelab</h1><p>Please click <a href="${href}">here</a></p>`;
    console.log('messageBody =====>', messageBody);

    await utils.sendEmail([userInfo.email], process.env.FROM_EMAIL_ADDRESS, process.env.REPLY_TO_EMAIL_ADDRESS, subject, messageBody);
}

const createWallet = async (params, walletId) => {
    try {

        const param = await utils.getParam("/near/api-gateway/url");

        let requestParams = {
            userId: params.userId,
            walletName: walletId,
        };

        if (params.email) {
            requestParams.email = params.email;
        }
        if (params.phone) {
            requestParams.phone = params.phone;
        }

        console.log(`reqId: ${reqId}, wallet request`, requestParams);

        const config = {
            headers: { Authorization: `Bearer ${params.jwtAccessToken}` },
        };

        const walletURL = param.Parameter.Value + "/wallets";
        console.log(`reqId: ${reqId}, walletURL`, walletURL);

        let walletCreateResponse = await axios.post(walletURL, requestParams, config);
        console.log(`reqId: ${reqId}, walletCreateResponse `, walletCreateResponse);

    } catch (err) {
        console.log(`reqId: ${reqId}, walletcreate error `, err);
        throw (err);
    }
};
