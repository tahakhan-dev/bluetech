const winston = require("winston");
const db = require("../../Model");
const Joi = require("joi");
const roles = db.roles;

module.exports = async function (roleId, reqBody, res) {
  try {
    let role = await roles.findOne({
      raw: true,
      where: {
        id: roleId,
      },
    });

    if (role.roleName == "Merchant") {
      let { error } = validateMerchant(reqBody);
      if (error) {
        return res
          .status(501)
          .send({ success: false, message: error.details[0].message });
      } else {
        return "Merchant";
      }
    } else {
      let { error } = validateUser(reqBody);
      if (error) {
        return res.send({ success: false, message: error.details[0].message });
      } else {
        return "User";
      }
    }
  } catch (err) {
    winston.error(err);
  }

  function validateUser(User) {
    const schema = {
      userName: Joi.string().required().max(255),
      email: Joi.string().required().min(10).max(255).email(),
      password: Joi.string().required().max(255),
      roleId: Joi.number().required(),
      firstName: Joi.string().required().max(255),
      lastName: Joi.string().required().max(255),
      address: Joi.string().max(255).allow(""),
      street: Joi.string().max(255).allow(""),
      country: Joi.string().allow(""),
      city: Joi.string().allow(""),
      state: Joi.string().allow(""),
      zipCode: Joi.string().allow(""),
      dob: Joi.string().allow(""),
      phoneNumber: Joi.string().allow(""),
      imagePath: Joi.string(),
      gender: Joi.string().allow(""),
      bio: Joi.string().max(255).allow(""),
    };
    return Joi.validate(User, schema);
  }

  function validateMerchant(User) {
    const schema = {
      userName: Joi.string().required(),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      roleId: Joi.number().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      bussinessName: Joi.string().required(),
      storeName: Joi.string().required(),
      webSiteUrl: Joi.string().allow(""),
      categoryIds: Joi.array().items(Joi.number()).required(),
      address: Joi.string().allow(),
      street: Joi.string().allow(""),
      country: Joi.string().allow(),
      city: Joi.string().allow(),
      state: Joi.string().allow(""),
      location: Joi.string().allow(""),
      zipCode: Joi.string().allow(""),
      dob: Joi.string().allow(""),
      phoneNumber: Joi.string().allow(""),
      imagePath: Joi.string(),
      gender: Joi.string().allow(""),
      bio: Joi.string().allow(""),
      receiveNotification: Joi.boolean().required(),
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    };

    return Joi.validate(User, schema);
  }
};
