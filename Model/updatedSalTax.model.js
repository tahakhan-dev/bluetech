function UpdatedSalTax(sequelize, Sequelize) {
  const UpdatedSalTaxSchema = {
    userId: {
      type: Sequelize.STRING,
    },
    saleTax: {
      type: Sequelize.STRING,
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  const UpdatedSalTax = sequelize.define("updatedSalTax", UpdatedSalTaxSchema);
  return UpdatedSalTax;
}

exports.updatedSalTax = UpdatedSalTax;
