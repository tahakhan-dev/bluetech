const Joi = require("joi");

function SubCategoryModel(sequelize, Sequelize) {
  const subCategorySchema = {
    categoryId: {
      type: Sequelize.INTEGER,
      references: {
        model: "categories",
        key: "id",
      },
    },
    name: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    isDelete: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  let subCategory = sequelize.define("subcategory", subCategorySchema);

  return subCategory;
}

exports.SubCategoryModel = SubCategoryModel;

function validate(subCategory) {
  const schema = {
    name: Joi.string().required().min(4).max(255),
  };
  return Joi.validate(subCategory, schema);
}

exports.validate = validate;
