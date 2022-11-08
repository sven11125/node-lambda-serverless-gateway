const Joi = require("joi");

module.exports = Joi.object({
    
    firstName: Joi.string().pattern(/^[a-zA-Z ]+$/).required(),

    lastName: Joi.string().pattern(/^[a-zA-Z ]+$/),

    jobTitle: Joi.string().pattern(/^[a-zA-Z0-9 ]+$/),

    email: Joi.array().items(
        Joi.object({
            address: Joi.string().pattern(/^[\w\.\-_]+@[\w\-]+\.[\w]{2,4}$|^$/).required(),
            type: Joi.string().valid('personal', 'corporative', 'other').required()
          })
    ).required(),

    phone: Joi.array().items(
        Joi.object({ // E.164
            number: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
            type: Joi.string().valid('mobile', 'home', 'company', 'other')
          })
    ).required(),

    address: Joi.array().items(
        Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            region: Joi.string(),
            country: Joi.string(),
            postalCode: Joi.string(),
            type: Joi.string().valid('home', 'company', 'other'),
          })
    ),
    
    companies: Joi.array().items(
        Joi.string().pattern(/^[a-zA-Z0-9 ]+$/)
    ),

    groups: Joi.array().items(
        Joi.string().pattern(/^[a-zA-Z0-9_\- ]+$/)
    ),

    dob: Joi.string(),

    importSource: Joi.string().pattern(/^[a-zA-Z0-9_\- ]+$/),

    appId: Joi.string().pattern(/^[a-zA-Z0-9_\- ]+$/)
});