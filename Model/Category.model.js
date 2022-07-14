const Joi = require("joi");

function CategoryModel(sequelize, Sequelize) {
  const categorySchema = {
    name: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    isDelete: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  };

  let Category = sequelize.define("category", categorySchema);

  return Category;
}

exports.CategoryModel = CategoryModel;

function validate(Category) {
  const schema = {
    name: Joi.string().required(),
    description: Joi.string().required(),
    isActive: Joi.boolean(),
  };
  return Joi.validate(Category, schema);
}

exports.validate = validate;
