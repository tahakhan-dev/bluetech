function WishListModel(sequelize, Sequelize) {
  const WishListSchema = {
    campaignId: {
      type: Sequelize.INTEGER,
      references: {
        model: "campaigns",
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
  };

  let WishList = sequelize.define("wishlist", WishListSchema);

  return WishList;
}

exports.WishListModel = WishListModel;
