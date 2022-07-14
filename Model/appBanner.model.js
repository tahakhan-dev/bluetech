function AppBannerModel(sequelize, Sequelize) {
  const AppBanner = sequelize.define("appbanner", {
    campaingId: {
      type: Sequelize.INTEGER,
      references: {
        model: "campaigns",
        key: "id",
      },
    },
    url: {
      type: Sequelize.STRING,
    },
    bannerType: {
      type: Sequelize.INTEGER,
      references: {
        model: "appbannertypes",
        key: "id",
      },
    },
    percentage: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    imageId: {
      type: Sequelize.STRING,
    },
    imageUrl: {
      type: Sequelize.STRING,
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  });
  return AppBanner;
}
exports.AppBannerModel = AppBannerModel;
