function FriendsStatusModel(sequelize, Sequelize) {
  const friendStatusSchema = {
    name: {
      type: Sequelize.STRING,
    },
  };

  let FriendStatus = sequelize.define("friendStatus", friendStatusSchema);

  return FriendStatus;
}

exports.FriendsStatusModel = FriendsStatusModel;
