const utils = require("./utils");
const { StatusCodes } = require('http-status-codes');

module.exports.main = async (event) => {

    const { transactionId } = event.pathParameters;

    if (!transactionId) {
        return utils.send(400, {
            message: "Missing userId path param",
            data: {},
          });
    }

    try {
        //const transaction = await getTransactionById(transactionId);
        return utils.send(StatusCodes.OK, { message: "Transaction retrieved successfully.", data: {} });

    } catch (err) {
        console.log(`Error retrieving transaction ${transactionId}`, err);
        return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, { message: "Ops..." });
    }

};