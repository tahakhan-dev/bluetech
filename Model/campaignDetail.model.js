const Joi = require("joi");

function CampaignDetailModel(sequelize, Sequelize) {
  const campaignDetailSchema = {
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
    productId: {
      type: Sequelize.INTEGER,
      references: {
        model: "products",
        key: "id",
      },
    },
    productName: {
      type: Sequelize.STRING,
    },
    productQty: {
      type: Sequelize.INTEGER,
    },
    avaliablityStock: {
      type: Sequelize.INTEGER,
    },
    lat: {
      type: Sequelize.STRING,
    },
    lng: {
      type: Sequelize.STRING,
    },
  };

  let CampaignDetail = sequelize.define("campaignDetail", campaignDetailSchema);

  return CampaignDetail;
}

exports.CampaignDetailModel = CampaignDetailModel;

function validate(Category) {
  // const schema = {
  //     name : Joi.string().required().min(4).max(255),
  // };
  // return Joi.validate(Category, schema);
}

exports.validate = validate;
