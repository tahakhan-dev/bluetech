const Joi = require("joi");

function CampaignNetAmountModel(sequelize, Sequelize) {
  const campaignNetAmountSchema = {
    campaignId: {
      type: Sequelize.INTEGER,
      references: {
        model: "campaigns",
        key: "id",
      },
    },
    campaignCode: {
      type: Sequelize.STRING,
    },
    totalAmount: {
      type: Sequelize.STRING,
    },
    discountAmount: {
      type: Sequelize.STRING,
    },
    netAmount: {
      type: Sequelize.STRING,
    },
  };

  let CampaignNetAmount = sequelize.define(
    "campaignNetAmount",
    campaignNetAmountSchema
  );

  return CampaignNetAmount;
}

exports.CampaignNetAmountModel = CampaignNetAmountModel;

function validate(Category) {}

exports.validate = validate;
