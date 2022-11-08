const Joi = require('joi');

module.exports = Joi.object({
    senderWalletId: Joi.string().pattern(new RegExp('^[a-zA-Z0-9-_]{21}$')).required(),
    receiverWalletId: Joi.string().pattern(new RegExp('^[a-zA-Z0-9-_]{21}$')).required(),
    transactionValue: Joi.string().required(),
    transactionItemId: Joi.string().required(),
    type: Joi.string().required(),
    tags: Joi.array().items( Joi.string().pattern(/[0-9a-zA-Z.]+/) ),
    status: Joi.string().pattern(/[0-9a-zA-Z.]+/)
}).min(1);