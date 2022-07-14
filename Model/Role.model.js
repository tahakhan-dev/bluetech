const Joi = require("joi");

function roleModel(sequelize, Sequelize) {
  const Roles = sequelize.define("roles", {
    roleName: {
      type: Sequelize.STRING,
    },
  });

  return Roles;
}

exports.roleModel = roleModel;

function validate(request) {
  const schema = {
    roleName: Joi.string().required().min(4).max(255),
  };
  return Joi.validate(request, schema);
}

exports.validate = validate;
