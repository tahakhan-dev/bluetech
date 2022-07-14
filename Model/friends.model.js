function FriendsModel(sequelize, Sequelize) {
  const friendSchema = {
    senderId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    receiverId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    isPending: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    isFriend: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  let Friends = sequelize.define("friends", friendSchema);

  return Friends;
}

exports.FriendsModel = FriendsModel;
