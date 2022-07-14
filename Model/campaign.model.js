const Joi = require("joi");

function CampaignModel(sequelize, Sequelize) {
  const campaignSchema = {
    name: {
      type: Sequelize.STRING,
    },
    campaignCode: {
      type: Sequelize.STRING,
    },
    merchantId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    description: {
      type: Sequelize.STRING,
    },
    Discount: {
      type: Sequelize.STRING,
      defaultValue: "0",
    },
    campaignLongName: {
      type: Sequelize.STRING,
    },
    likes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    campaignStartsAt: {
      type: Sequelize.STRING,
    },
    campaignExpiresAt: {
      type: Sequelize.STRING,
    },
    voucherExpiresAt: {
      type: Sequelize.STRING,
    },
    shippingStatus: {
      type: Sequelize.INTEGER,
      references: {
        model: "shippings",
        key: "id",
      },
    },
    curbSideFlag: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    isExpired: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    counter: {
      type: Sequelize.STRING,
    },
    campaingAmount: {
      type: Sequelize.STRING,
    },
  };

  let Campaign = sequelize.define("campaign", campaignSchema);

  return Campaign;
}

exports.CampaignModel = CampaignModel;

function validate(campaing) {
  const schema = {
    name: Joi.string().required().max(255),
    merchantId: Joi.number().required().max(255),
    description: Joi.string().required().max(255),
    Discount: Joi.string().required().max(255),
    campaignStartsAt: Joi.string().required().max(255),
    campaignExpiresAt: Joi.string().required().max(255),
    voucherExpiresAt: Joi.string().required().max(255),
    shippingStatus: Joi.number().required().max(255),
    curbSideFlag: Joi.bool().required(),
    products: Joi.required(),
    counter: Joi.string().required(),
    campaingAmount: Joi.string().required(),
    campaignLongName: Joi.string().required(),
    isActive: Joi.bool(),
    lat: Joi.string().required(),
    lng: Joi.string().required(),
  };
  return Joi.validate(campaing, schema);
}

exports.validate = validate;
