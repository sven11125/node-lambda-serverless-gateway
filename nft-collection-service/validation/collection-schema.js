const Joi = require('joi');

module.exports = Joi.object({
    collectionName: Joi.string().required(),
    ownerId: Joi.string().pattern(/^[a-zA-Z0-9_\- ]{1,21}$/).required(),
    status: Joi.string()
}).min(1);