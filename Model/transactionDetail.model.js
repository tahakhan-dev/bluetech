function TransactionDetail(sequelize, Sequelize) {
  const transactionDetailSchema = {
    transactionId: {
      type: Sequelize.INTEGER,
      references: {
        model: "transactions",
        key: "id",
      },
    },
    transactionCode: {
      type: Sequelize.STRING,
    },
    campaignId: {
      type: Sequelize.STRING,
    },
    camName: {
      type: Sequelize.STRING,
    },
    campAmount: {
      type: Sequelize.INTEGER,
    },
    voucherRange: {
      type: Sequelize.STRING,
    },
  };
  let TransactionDetail = sequelize.define(
    "transactionDetail",
    transactionDetailSchema
  );
  return TransactionDetail;
}

exports.TransactionDetail = TransactionDetail;
