const Joi = require("joi");

function saleTaxModel(sequelize, Sequelize) {
  const SaleTax = sequelize.define("saletax", {
    saletax: {
      type: Sequelize.STRING,
    },
  });

  return SaleTax;
}

exports.saleTaxModel = saleTaxModel;
