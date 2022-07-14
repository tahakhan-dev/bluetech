function TermsAndCondition(sequelize, Sequelize) {
  const TermsConditionSchema = {
    title: {
      type: Sequelize.STRING,
    },
    terms: {
      type: Sequelize.TEXT,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
  };

  let TermsCondition = sequelize.define("termscondition", TermsConditionSchema);

  return TermsCondition;
}

exports.Terms = TermsAndCondition;
