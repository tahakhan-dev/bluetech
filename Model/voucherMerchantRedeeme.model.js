function voucherMerchantRedeemeModel(sequelize, Sequelize) {
  const voucherMerchantRedeemeSchema = {
    merchantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      isNumeric: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    redeemeVoucherId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      isNumeric: true,
    },
    statusId: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      references: {
        model: "voucherStatuses",
        key: "id",
      },
    },
    deliveryTime: {
      type: Sequelize.STRING,
    },
    redeemeDevOpId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "deliveryOptions",
        key: "id",
      },
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  };

  let voucherMerchantRedeeme = sequelize.define(
    "voucherMerchantRedeeme",
    voucherMerchantRedeemeSchema
  );

  return voucherMerchantRedeeme;
}

exports.voucherMerchantRedeemeModel = voucherMerchantRedeemeModel;
