const AWS = require("aws-sdk");
const utils = require("./utils");
const { StatusCodes } = require("http-status-codes");
var randomGen = require("random-gen");
const schema = require("./validation/verifyOTP-schema");

module.exports.handler = async (req) => {
  try {
    const params = JSON.parse(req.body);
    const { error } = schema.validate(params, { abortEarly: false });
    if (error)
      if (error) {
        return utils.send(StatusCodes.BAD_REQUEST, {
          errors: error.details.map((item) => item.message),
        });
      }

    let userId = "";
    if (req.body.email) {
      const users = await getUserInformationByEmail(req.body.email);
      const userInfo = users.Items[0];
      userId = userInfo.userId;
    } else {
      const users = await getUserInformationByPhone(req.body.phone);
      const userInfo = users.Items[0];
      userId = userInfo.userId;
    }

    const verifyOTPResult = await getOTP(userId, req.body.OTP);
    if (verifyOTPResult.length == 0) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: "Incorrect code, please enter a valid code",
      });
    }

    console.log({ verifyOTPResult });

    return;

    // if (!(await utils.checkWalletNameExists(params.walletID))) {
    //   return utils.send(StatusCodes.NOT_FOUND, {
    //     message: "WalletID does not exist",
    //   });
    // }

    // const users = await getWalletInformationByID(params.walletID);
    // const userInfo = users.Items[0];
    // const userId = userInfo.userId;

    // const verifyOTPResult = await verifyOTP(userId, params.OTP);
    // if (verifyOTPResult.length == 0) {
    //   return utils.send(StatusCodes.NOT_FOUND, {
    //     message: "Invalid WalletID/OTP ",
    //   });
    // }

    // const userInfoResult = await getUserInformationByID(userId);
    // const userInfo = userInfoResult.Items[0];
    // const authResponse = await utils.getAuthResponse(userInfo);
    // const response = {
    //   data: {
    //     jwtAccessToken: authResponse.jwtAccessToken,
    //     jwtRefreshToken: authResponse.jwtRefreshToken,
    //     user: { ...userInfo },
    //   },
    // };
    // return utils.send(StatusCodes.CREATED, response);
  } catch (err) {
    console.log(err);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Ops...",
    });
  }
};

const getUserInformationByEmail = async (email) => {
  const params = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };
  const result = await utils.dynamoDb.query(params);
  return result;
};

const getUserInformationByPhone = async (phone) => {
  const params = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    KeyConditionExpression: "phone = :phone",
    ExpressionAttributeValues: {
      ":phone": phone,
    },
  };
  const result = await utils.dynamoDb.query(params);
  return result;
};

const getOTP = async (userId, otp) => {
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
