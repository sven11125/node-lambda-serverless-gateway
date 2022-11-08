const utils = require("./utils");
const { StatusCodes } = require('http-status-codes');

module.exports.main = async (event) => {

    // const { transactionId } = event.pathParameters;

    // if (!transactionId) {
    //     return utils.send(400, {
    //         message: "Missing userId path param",
    //         data: {},
    //       });
    // }

    try {
        //const transaction = await getTransactionById(transactionId);
        return utils.send(StatusCodes.OK, { message: "Transactions list retrieved successfully.", data: {} });

    } catch (err) {
        console.log(`Error retrieving list of transactions`, err);
        return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, { message: "Ops..." });
    }

};