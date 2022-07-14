function MerchantDetails(sequelize, Sequelize) {
  const merchantDetails = sequelize.define("merchantDetails", {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    bussinessName: {
      type: Sequelize.STRING,
    },
    storeName: {
      type: Sequelize.STRING,
    },
    webSiteUrl: {
      type: Sequelize.STRING,
    },
    merchantCode: {
      type: Sequelize.STRING,
    },
    likes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    receiveNotification: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    lat: {
      type: Sequelize.STRING,
    },
    lng: {
      type: Sequelize.STRING,
    },
    street: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    country: {
      type: Sequelize.STRING,
    },
    location: {
      type: Sequelize.STRING,
    },
  });
  return merchantDetails;
}
exports.MerchantDetails = MerchantDetails;
