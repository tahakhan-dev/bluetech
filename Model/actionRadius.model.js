function ActionRadius(sequelize, Sequelize) {
  const Action = {
    miles: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  };

  let action = sequelize.define("actionradius", Action);

  return action;
}

exports.ActionRadiusModel = ActionRadius;
