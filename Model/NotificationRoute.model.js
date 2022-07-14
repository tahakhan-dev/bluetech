const Joi = require("joi");
const db = require("./index");

function NotificationRouteModel(sequelize, Sequelize) {
  const NotificationRoutechema = {
    RouteId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
       },
      
    Route: {
        type: Sequelize.STRING,
        allowNull: false,
        
      },
   
    SoftDelete: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    
    
  };

  let NotificationRoute = sequelize.define("NotificationRoute", NotificationRoutechema);

  return NotificationRoute;
}

exports.NotificationRouteModel = NotificationRouteModel;

function validate(NotificationRoute) {
  const schema = {
    
    Route: Joi.string().required().max(255),
    SoftDelete: Joi.bool(),
    
  };
  return Joi.validate(NotificationRoute, schema);
}

exports.validate = validate;
