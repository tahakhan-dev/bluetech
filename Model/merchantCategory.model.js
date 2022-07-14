function merchantCategoryModel(sequelize, Sequelize) {
  const merchantCategory = sequelize.define("merchantcategories", {
    merchantDetailId: {
      type: Sequelize.INTEGER,
      references: {
        model: "merchantDetails",
        key: "id",
      },
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    categoryId: {
      type: Sequelize.INTEGER,
      references: {
        model: "categories",
        key: "id",
      },
    },
  });
  return merchantCategory;
}
exports.merchantCategoryModel = merchantCategoryModel;
