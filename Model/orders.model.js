const Joi = require("joi");

function Orders(sequelize, Sequelize) {
  const orderSchema = {
    OrderId: {
      type: Sequelize.STRING,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    merchantId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    campaignId: {
      type: Sequelize.INTEGER,
      references: {
        model: "campaigns",
        key: "id",
      },
    },
    redeemeVoucherId: {
      type: Sequelize.INTEGER,
      references: {
        model: "redeemeVouchers",
        key: "id",
      },
    },
    statusId: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      references: {
        model: "voucherStatuses",
        key: "id",
      },
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  };
  let Orders = sequelize.define("orders", orderSchema);
  return Orders;
}

exports.Orders = Orders;
