const Joi = require("joi");

function PromoCode(sequelize, Sequelize) {
  const promoCodeSchema = {
    code: {
      type: Sequelize.STRING,
    },
    discount: {
      type: Sequelize.STRING,
    },
    quantity: {
      type: Sequelize.INTEGER,
    },
    limit: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    expireAt: {
      type: Sequelize.STRING,
    },
    discountType: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  };
  let PromoCode = sequelize.define("promoCode", promoCodeSchema);
  return PromoCode;
}

exports.PromoCode = PromoCode;

function validate(PromoCode) {
  const schema = {
    code: Joi.string().required(),
    discount: Joi.string().required(),
    quantity: Joi.number().required(),
    expireAt: Joi.string().required(),
    discountType: Joi.string().required(),
    limit: Joi.number().allow(""),
    isActive: Joi.boolean(),
  };
  return Joi.validate(PromoCode, schema);
}

exports.validate = validate;
