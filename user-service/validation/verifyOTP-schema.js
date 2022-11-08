const Joi = require("joi");

module.exports = Joi.object({
  email: Joi.alternatives()
    .conditional("phone", {
      is: Joi.string().pattern(/^$/),
      then: Joi.string()
        .pattern(/^[\w\.\-_]+@[\w\-]+\.[\w]{2,3}$/)
        .required(),
      otherwise: Joi.string().pattern(/^[\w\.\-_]+@[\w\-]+\.[\w]{2,3}$|^$/),
    })
    .messages({
      "string.pattern.base": `email fails to match the required pattern`,
      "string.base": `email must be a type of string`,
      "string.empty": `email must contain value`,
      "any.required": `email is a required field`,
    }),

  phone: Joi.alternatives()
    .conditional("email", {
      is: Joi.string().pattern(/^$/),
      then: Joi.string()
        .pattern(/^\+(?:[0-9] ?){6,14}[0-9]$/)
        .required(),
      otherwise: Joi.string().pattern(/^\+(?:[0-9] ?){6,14}[0-9]$|^$/),
    })
    .messages({
      "string.pattern.base": `phone fails to match the required pattern`,
      "string.base": `phone must be a type of string`,
      "string.empty": `phone must contain value`,
      "any.required": `phone is a required field`,
    }),
  OTP: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .message({
      "string.pattern.base": `OTP is not a valid input for OTP, only takes numbers`,
      "string.base": `OTP must be a type of string`,
      "string.empty": `OTP must contain value`,
      "any.required": `OTP is a required field`,
    }),
});
