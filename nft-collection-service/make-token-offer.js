const utils = require("./utils");
const { StatusCodes } = require('http-status-codes');
const schema = require("./validation/make-token-offer-schema")
const { OfferAction } = require("./utils");
const { createOffer } = require("./lib/model/nft-offer");
const { getNftById } = require("./lib/model/nft");

module.exports.handler = async (event) => {
  const { pathParameters } = event;
  const body = JSON.parse(event.body);

  try {
    const { nftId } = pathParameters;

    if (!nftId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "nftId" is required.'
      });
    }

    const { error } = schema.validate(body, { abortEarly: false });
    if (error)
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: "One or more fields are invalid or missing.",
        data: error.details.map((item) => item.message)
      });

    const nft = await getNftById(nftId);
    if (!nft) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `NFT not found by nftId: ${nftId} !`
      });
    }

    if (body.price < nft.minPrice) {
      const response = {
        message: `Offering price is low than minimum. minimum price: ${nft.minPrice || 0}`
      };
      return utils.send(StatusCodes.BAD_REQUEST, response);
    }
    body.nftId = nftId;
    body.action = OfferAction.INITIAL;
    const result = await createOffer(Object.assign(nftId, body));

    const response = {
      message: "The TOKEN offer has been initialized successfully.",
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
