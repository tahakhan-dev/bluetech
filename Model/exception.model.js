function exceptionModel(sequelize, Sequelize) {
  const exceptionschema = {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    DeviceType: {
      type: Sequelize.STRING,
    },
    errorMessage: {
      type: Sequelize.TEXT,
    },
  };

  let Exception = sequelize.define("exception", exceptionschema);

  return Exception;
}

exports.exceptionModel = exceptionModel;
