const { StatusCodes } = require('http-status-codes');
const Hashes = require('../../src/models/hashes');
const HttpError = require('../../src/lib/error');
const http = require('../../src/lib/http');

module.exports.handler = async (event) => {
  try {
    const { id, fingerPrint } = JSON.parse(event.body);
    const item = await Hashes.getHash(id, fingerPrint);
    if(!item){
      throw new HttpError(
          StatusCodes.BAD_REQUEST,
          `Hash '${id}' not found or provided fingerPrint does not match`,
      );
    }
    const { hk, sk, hk1, sk1, ...hash } = item;

    return http.send(StatusCodes.OK, hash);
  } catch (e) {
    return http.send(e.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: e.message,
      data: e.data,
    });
  }
};
