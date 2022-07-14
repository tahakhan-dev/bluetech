const Joi = require("joi");
const db = require("./index");

function UsersDetailModel(sequelize, Sequelize) {
  const UserDetailschema = {
    firstName: {
      type: Sequelize.STRING,
    },
    lastName: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    street: {
      type: Sequelize.STRING,
    },
    country: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    zipCode: {
      type: Sequelize.STRING,
    },
    dob: {
      type: Sequelize.STRING,
    },
    phoneNumber: {
      type: Sequelize.STRING,
    },
    phoneCountry: {
      type: Sequelize.STRING,
    },
    about: {
      type: Sequelize.STRING,
    },
    imagePath: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.STRING,
    },
    public_profile: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    bio: {
      type: Sequelize.TEXT,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
  };

  let UsersDetail = sequelize.define("usersdetail", UserDetailschema);

  return UsersDetail;
}

exports.UsersDetailModel = UsersDetailModel;

function validate(User) {
  const schema = {
    firstName: Joi.string(),
    lastName: Joi.string(),
    address: Joi.string(),
    street: Joi.string(),
    country: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string(),
    dob: Joi.string().allow(""),
    phoneNumber: Joi.string(),
    imagePath: Joi.string(),
    phoneCountry: Joi.string(),
    about: Joi.string().allow(""),
    gender: Joi.string(),
    public_profile: Joi.boolean(),
    bio: Joi.string().allow(""),
    new_password: Joi.string(),
    userName: Joi.string(),
  };
  return Joi.validate(User, schema);
}

exports.validate = validate;
