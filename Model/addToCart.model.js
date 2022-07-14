function addToCartModel(sequelize, Sequelize) {
  const addToCart = sequelize.define("addtocart", {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    campaingId: {
      type: Sequelize.INTEGER,
      references: {
        model: "campaigns",
        key: "id",
      },
    },
    qty: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });
  return addToCart;
}
exports.addToCartModel = addToCartModel;
