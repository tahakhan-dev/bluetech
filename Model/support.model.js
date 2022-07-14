const Joi = require("joi");

function Supportmodel(sequelize, Sequelize) {
    const supportSchema = sequelize.define("support", {
        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: "id"
            }
        },
        email: {
            type: Sequelize.STRING
        },
        number: {
            type: Sequelize.STRING
        },
        question: {
            type: Sequelize.TEXT
        }
    });

    return supportSchema;
}

exports.Supportmodel = Supportmodel;

// function validate(request) {   const schema = {     roleName:
// Joi.string().required().min(4).max(255),   };   return Joi.validate(request,
// schema); } exports.validate = validate;