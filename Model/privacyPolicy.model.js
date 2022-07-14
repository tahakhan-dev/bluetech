function PrivacyPolicyModel(sequelize, Sequelize) {
  const privacypolicy = {
    title: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.TEXT,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    isDelete: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  let PrivacyPolicyModel = sequelize.define("privacypolicy", privacypolicy);

  return PrivacyPolicyModel;
}

exports.PrivacyPolicyModel = PrivacyPolicyModel;
