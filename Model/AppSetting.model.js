const Joi = require("joi");
const db = require("./index");

function AppSettingModel(sequelize, Sequelize) {
  const AppSettingchema = {
    Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
       },
      
    Name: {
        type: Sequelize.STRING,
        allowNull: false,
        
      },

      key: {
        type: Sequelize.STRING(500),
        
      },

      IsActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
      },  
   
    SoftDelete: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    
    
  };

  let AppSettingRoute = sequelize.define("AppSetting", AppSettingchema);

  return AppSettingRoute;
}

exports.AppSettingModel = AppSettingModel;