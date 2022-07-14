function deliveryTypeModel(sequelize, Sequelize) {
  const deliveryTypeSchema = {
    deliveryTypeName: {
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

  let deliveryType = sequelize.define("deliveryType", deliveryTypeSchema);

  return deliveryType;
}

exports.deliveryTypeModel = deliveryTypeModel;
