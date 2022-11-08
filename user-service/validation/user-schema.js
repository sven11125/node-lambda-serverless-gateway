const Joi = require('joi');

module.exports = Joi.object({
  email: Joi.alternatives()
    .conditional('phone', {
      is: Joi.string().pattern(/^$/),
      then: Joi.string()
        .pattern(/^[\w\.\-_]+@[\w\-]+\.[\w]{2,3}$/)
        .required(),
      otherwise: Joi.string().pattern(/^[\w\.\-_]+@[\w\-]+\.[\w]{2,3}$|^$/),
    })
    .messages({
      'string.pattern.base': `email fails to match the required pattern`,
      'string.base': `email must be a type of string`,
      'string.empty': `email must contain value`,
      'any.required': `email is a required field`,
    }),

  phone: Joi.alternatives()
    .conditional('email', {
      is: Joi.string().pattern(/^$/),
      then: Joi.string()
        .pattern(/^\+(?:[0-9] ?){6,14}[0-9]$/)
        .required(),
      otherwise: Joi.string().pattern(/^\+(?:[0-9] ?){6,14}[0-9]$|^$/),
    })
    .messages({
      'string.pattern.base': `phone fails to match the required pattern`,
      'string.base': `phone must be a type of string`,
      'string.empty': `phone must contain value`,
      'any.required': `phone is a required field`,
    }),

  walletName: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[a-zA-Z0-9-_]{2,59}.near$/)
    .required()
    .messages({
      'string.pattern.base': `walletId fails to match the required pattern`,
      'string.base': `walletId must be a type of string`,
      'string.empty': `walletId must contain value`,
      'any.required': `walletId is a required field`,
    }),

  firstName: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[a-zA-Z ]+$/)
    .required()
    .messages({
      'string.pattern.base': `fullName fails to match the required pattern`,
      'string.base': `fullName must be a type of string`,
      'string.empty': `fullName must contain value`,
      'any.required': `fullName is a required field`,
    }),

  lastName: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[a-zA-Z ]+$/)
    .required()
    .messages({
      'string.pattern.base': `lastName fails to match the required pattern`,
      'string.base': `lastName must be a type of string`,
      'string.empty': `lastName must contain value`,
      'any.required': `lastName is a required field`,
    }),

  countryCode: Joi.string().min(2).max(4).required().messages({
    'string.base': `countryCode must be a type of string`,
    'string.empty': `countryCode must contain value`,
    'any.required': `countryCode is a required field`,
  }),

  dob: Joi.string(),

  nftId: Joi.string().pattern(/^[a-zA-Z0-9-_]{21}$/),
});
