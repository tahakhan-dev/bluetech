function Transaction(sequelize, Sequelize) {
  const transactionSchema = {
    userId: {
      type: Sequelize.INTEGER,
      foreignKey: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    netAmount: {
      type: Sequelize.FLOAT,
    },
    discount: {
      type: Sequelize.FLOAT,
    },
    salesTax: {
      type: Sequelize.FLOAT,
    },
    paymentType: {
      type: Sequelize.STRING,
    },
    paymentId: {
      type: Sequelize.STRING,
    },
    transactionCode: {
      type: Sequelize.STRING,
    },
  };
  let Transaction = sequelize.define("transaction", transactionSchema);
  return Transaction;
}

exports.Transaction = Transaction;
