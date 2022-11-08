const utils = require("./utils");
const { getAll } = require("./lib/model/nft-collection");
const { StatusCodes } = require('http-status-codes');

module.exports.handler = async (event) => {
  const { pathParameters } = event;
  try {
    const { ownerId } = pathParameters;

    if (!ownerId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "ownerId" is required.'
      });
    }

    const result = await getAll(ownerId);

    const response = {
      message: "NFT Collections retrieved successfully.",
      data: result,
    };

    return utils.send(StatusCodes.OK, response);
  } catch (err) {
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Internal Server Error",
      body: err.message
    });
  }
};

