const Joi = require("joi");

function AppliedPromocode(sequelize, Sequelize) {
  const promoCodeSchema = {
    promocodeId: {
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
  };
  let AppliedPromocode = sequelize.define("appliedPromocode", promoCodeSchema);
  return AppliedPromocode;
}

exports.AppliedPromocode = AppliedPromocode;

function validate(promoCodeSchema) {
  const schema = {
    code: Joi.string().required(),
    discount: Joi.string().required(),
    quantity: Joi.number().required(),
    expireAt: Joi.string().required(),
  };
  return Joi.validate(PromoCode, schema);
}

exports.validate = validate;
