const Joi = require("joi");

module.exports = Joi.object({
    walletId: Joi.string(),
    userId: Joi.string().pattern(/^[a-zA-Z0-9_\- ]{1,21}$/).required(),
    walletName: Joi.string().required(),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required()
});