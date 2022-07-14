const Joi = require("joi");
const db = require("./index");

function ChatModel(sequelize, Sequelize) {
  const Chatschema = {
    
    Friendsid: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "friends",
        key: "id",
      },
      
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
      Message: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    MessageTypeid: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
        
      },
   
    MessageLink: {
      type: Sequelize.STRING,
    },
    
    SoftDelete: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },

    IsReed: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
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

  let Chat = sequelize.define("Chat", Chatschema);

  return Chat;
}

exports.ChatModel = ChatModel;

function validate(Chat) {
  const schema = {
    SenderId: Joi.number().required().max(255),
    ReceiverId: Joi.number().required().max(255),
    Message: Joi.string().required().max(255),
    MessageTypeid: Joi.number().required().max(255),
    MessageLink: Joi.string().required().max(255),
    SoftDelete: Joi.bool(),
    IsReed: Joi.bool(),
    
  };
  return Joi.validate(Chat, schema);
}

exports.validate = validate;
