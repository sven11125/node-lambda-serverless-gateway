const Joi = require("joi");

module.exports = Joi.object({

    appId: Joi.string().pattern(/[0-9a-zA-Z .,]+/),

    userId: Joi.string().pattern(/^[a-zA-Z0-9]+$/),
 
});