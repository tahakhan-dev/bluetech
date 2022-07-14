const moment = require("moment");

function OTPModel(sequelize, Sequelize) {
  const otp = sequelize.define("otpverification", {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    token: {
      type: Sequelize.STRING,
    },
    sid: {
      type: Sequelize.STRING,
    },
    isExpired: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });
  return otp;
}

exports.OTPModel = OTPModel;
