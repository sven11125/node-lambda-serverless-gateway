const utils = require("../../utils");
const { OfferType } = require("../../utils");
const { nanoid } = require('nanoid');
const { DYNAMODB_NFT_OFFERS_TABLE } = process.env;

const createOffer = async (params) => {

  const tableParams = {
    TableName: DYNAMODB_NFT_OFFERS_TABLE,
    Item: {
      offerId: nanoid(),
      nftId: params.nftId,
      offerType: params.offerType,
      ...(params.offerType === OfferType.TOKEN && { offerPrice: params.offerPrice }),
      ...(params.offerNftId === OfferType.NFT && { offerNftId: params.offerNftId }),
      action: params.action,
      status: 'pending',
      userId: params.userId,
      expire: params.expire,
      created: +new Date,
      updated: +new Date
    }
  };

  await utils.dynamoDb.put(tableParams);

  return tableParams.Item;
};

module.exports = {
  createOffer,
}