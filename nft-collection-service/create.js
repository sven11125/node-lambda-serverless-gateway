const { nanoid } = require('nanoid');
const schema = require('./validation/collection-schema');
const { StatusCodes } = require('http-status-codes');
const utils = require("./utils");
const { createCollection } = require("./lib/model/nft-collection");

module.exports.handler = async (event) => {
  const reqId = nanoid();  //for msg logging
  const params = JSON.parse(event.body);

  const { error } = schema.validate(params);

  if (error)
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: "One or more fields are invalid.",
      data: error.details
    });

  try {
    const newCollection = await createCollection(params);
    return utils.send(StatusCodes.OK, { message: "Collection created successfully.", data: newCollection });
  } catch (error) {
    console.log(`reqId: ${reqId}, error: Error adding Collection to the user`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error creating collection to the user!',
      data: error.message
    });
  }
};
