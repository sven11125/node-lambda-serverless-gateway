"use strict";
const Joi = require("joi");

module.exports = Joi.object({
  minPrice: Joi.number()        
    .required()
    .messages({
      'string.pattern.base': `minPrice fails to match the required pattern`,
      'string.base': `minPrice must be a type of string`,
      'string.empty': `minPrice must contain value`,
      'any.required': `minPrice is a required field`,
    }),
});