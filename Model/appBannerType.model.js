function BannerTypeModel(sequelize, Sequelize) {
  const BannerType = sequelize.define("appbannertype", {
    bannerType: {
      type: Sequelize.STRING,
    },
  });
  return BannerType;
}
exports.BannerTypeModel = BannerTypeModel;
