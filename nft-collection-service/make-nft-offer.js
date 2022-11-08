const utils = require("./utils");
const { StatusCodes } = require('http-status-codes');
const schema = require("./validation/make-nft-offer-schema")
const { createOffer } = require("./lib/model/nft-offer");
const { OfferAction } = require("./utils");
const { getNftById } = require("./lib/model/nft");


module.exports.handler = async (event) => {
  const { pathParameters } = event;
  const body = JSON.parse(event.body);

  try {
    const { nftId } = pathParameters;
    const { error } = schema.validate(body, { abortEarly: false });
    if (error)
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: "One or more fields are invalid or missing.",
        data: error.details.map((item) => item.message)
      });

    if (!nftId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "nftId" is required.'
      });
    }

    const nft = await getNftById(nftId);
    if (!nft) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `NFT not found by nftId: ${nftId} !`
      });
    }

    body.nftId = nftId;
    body.action = OfferAction.INITIAL;
    const result = await createOffer(Object.assign(nftId, body));

    const response = {
      message: "The NFT offer has been initialized successfully.",
      data: result
    };
    return utils.send(StatusCodes.OK, response);
  } catch (err) {
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Internal Server Error",
      body: err
    });
  }
};
