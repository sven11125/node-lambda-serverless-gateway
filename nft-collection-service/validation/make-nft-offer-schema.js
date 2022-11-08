"use strict";
const Joi = require("joi");

module.exports = Joi.object({
  offerType: Joi.string().equal('NFT', 'TOKEN').required(),
  offerNftId: Joi.string().required(),
  expire: Joi.date().timestamp().required(),
  userId: Joi.string().pattern(/^[a-zA-Z0-9_\- ]{1,21}$/).required(),
});