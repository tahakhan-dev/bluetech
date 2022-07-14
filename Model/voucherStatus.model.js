function voucherStatusModel(sequelize, Sequelize) {
  const voucherStatusSchema = {
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      isNumeric: true,
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

  let voucherStatus = sequelize.define("voucherStatus", voucherStatusSchema);

  return voucherStatus;
}

exports.voucherStatusModel = voucherStatusModel;
