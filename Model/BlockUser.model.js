const Joi = require("joi");

function blockUserModel(sequelize, Sequelize) {
  const BlockUser = sequelize.define("BlockUser", {
    blockerId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    blockedId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
  });

  return BlockUser;
}

exports.blockUserModel = blockUserModel;
