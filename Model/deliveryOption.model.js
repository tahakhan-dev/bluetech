function deliveryOptionModel(sequelize, Sequelize) {
  const deliveryOptionSchema = {
    deliveryName: {
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

  let deliveryOption = sequelize.define("deliveryOption", deliveryOptionSchema);

  return deliveryOption;
}

exports.deliveryOptionModel = deliveryOptionModel;
