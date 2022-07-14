function GlobalCounter(sequelize, Sequelize) {
  const globalCounter = {
    counter: {
      type: Sequelize.INTEGER,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  let globalcounter = sequelize.define("globalCounter", globalCounter);

  return globalcounter;
}

exports.GlobalCounter = GlobalCounter;
