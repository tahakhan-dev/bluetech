function LikeModel(sequelize, Sequelize) {
  const likeSchema = {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    likeType: {
      type: Sequelize.STRING,
      defaultValue: "Merchant",
    },
    likedId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: Sequelize.BOOLEAN,
    },
  };

  let Like = sequelize.define("like", likeSchema);

  return Like;
}

function CampaignLikeModel(sequelize, Sequelize) {
  const campLikeSchema = {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    likeType: {
      type: Sequelize.STRING,
      defaultValue: "Campaign",
    },
    likedId: {
      type: Sequelize.INTEGER,
      references: {
        model: "campaigns",
        key: "id",
      },
    },
    status: {
      type: Sequelize.BOOLEAN,
    },
  };

  let campaignLikes = sequelize.define("campaignLikes", campLikeSchema);

  return campaignLikes;
}

exports.CampaignLikeModel = CampaignLikeModel;
exports.LikeModel = LikeModel;
