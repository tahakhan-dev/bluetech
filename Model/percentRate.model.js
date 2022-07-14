function PercentRate(sequelize, Sequelize) {
  const Percent = {
    percentRate: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  };

  let percentRate = sequelize.define("percentrate", Percent);

  return percentRate;
}

exports.Percentrate = PercentRate;
