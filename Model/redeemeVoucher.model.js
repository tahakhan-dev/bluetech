function redeemeVoucherModel(sequelize, Sequelize) {
  const redeemeVoucherSchema = {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
      isNumeric: true,
    },
    campaignId: {
      type: Sequelize.INTEGER,
      references: {
        model: "campaigns",
        key: "id",
      },
      allowNull: false,
      isNumeric: true,
    },
    voucherId: {
      type: Sequelize.INTEGER,
      references: {
        model: "vouchergens",
        key: "id",
      },
      allowNull: false,
      isNumeric: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    phonenumber: {
      type: Sequelize.STRING,
      allowNull: true,
      isNumeric: true,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    address2: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    country: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    province: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    postalcode: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    emailId: {
      type: Sequelize.STRING,
      allowNull: true,
      isEmail: true,
    },
    instruction: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    redeemeDevOpId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "deliveryOptions",
        key: "id",
      },
    },
    redeemeDevTypeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 3,
      references: {
        model: "deliveryTypes",
        key: "id",
      },
    },
    statusId: {
      type: Sequelize.INTEGER,
      defaultValue: 4,
      allowNull: false,
      references: {
        model: "voucherStatuses",
        key: "id",
      },
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  };

  let redeemeVoucher = sequelize.define("redeemeVoucher", redeemeVoucherSchema);

  return redeemeVoucher;
}

exports.redeemeVoucherModel = redeemeVoucherModel;
