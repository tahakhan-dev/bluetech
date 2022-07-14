const Joi = require("joi");
const db = require("./index");

function NotificationModel(sequelize, Sequelize) {
  const Notificationchema = {
    NotificationId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
       },
       senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        
      },
      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      voucherId: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "vouchergens",
          key: "id",
        },
      },
      Body: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    Title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
   
      RouteId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "NotificationRoutes",
        key: "RouteId",
      },
    },
    SoftDelete: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },

    IsReed: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },

    IsAction: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },

    IsCount: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },

    createdAt: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    updatedAt: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    }
    
    
  };

  let Notification = sequelize.define("Notification", Notificationchema);

  return Notification;
}

exports.NotificationModel = NotificationModel;

function validate(Notification) {
  const schema = {
    senderId: Joi.number().required().max(255),
    receiverId: Joi.number().required().max(255),
    Body: Joi.string().required().max(255),
    routeid: Joi.number().required().max(255),
    Title: Joi.string().required().max(255),
    SoftDelete: Joi.bool(),
    IsReed: Joi.bool(),
    IsAction: Joi.bool(),
    IsCount: Joi.bool(),
  };
  return Joi.validate(Notification, schema);
}

exports.validate = validate;
