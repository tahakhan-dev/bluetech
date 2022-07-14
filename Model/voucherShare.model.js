function VoucherShareModel(sequelize, Sequelize) {
  const voucherSharingSchema = {
    campaignId: {
      type: Sequelize.INTEGER,
      references: {
        model: "vouchergens",
        key: "id",
      },
    },
    productId: {
      type: Sequelize.INTEGER,
    },
    senderId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    receiverId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    voucherCode: {
      type: Sequelize.STRING,
    },
    voucherQty: {
      type: Sequelize.STRING,
      defaultValue: 1,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },

    vouchergenId: {
      type: Sequelize.INTEGER,
      references: {
        model: "vouchergens",
        key: "id",
      },
    },
    referenceId: {
      type: Sequelize.INTEGER,
      references: {
        model: "vouchergens",
        key: "id",
      },
    },
    personalNote: {
      type: Sequelize.STRING,
    },
    pending: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    statusId: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      references: {
        model: "voucherStatuses",
        key: "id",
      },
    },
  };

  let voucherSharing = sequelize.define("voucherSharing", voucherSharingSchema);

  return voucherSharing;
}

exports.VoucherShareModel = VoucherShareModel;
