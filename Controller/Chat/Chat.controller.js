const db = require("../../Model");
const _ = require("lodash");
const io = require("../../SocketIo/Socket.js");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const { validate } = require("../../Model/Chat.models");
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Chats = db.chats;
const users = db.users;
const AppSetting = db.appsetting;
const userdetail = db.usersdetail;
const UsersDetail = db.usersdetail;
const Blockuser = db.blockUserModel;
const ImageData = db.imageData;
const Permissions = db.permissions;
const Roles = db.roles;
const Users = db.users;
const Block = db.blockUserModel;
const Friends = db.friends;
const Notification = db.notification;
const Notificationroute = db.notificationroute;
const fcm = require("../../FCMNotification/fcmnotificatins");
const stripe = require("stripe")("sk_test_6igcQIhxkTVN9Zi6EfZs6fdU");

class chat {
  EnableChat = async (req, res) => {
    try {
      let chatis = "";
      let chatoption = req.body.chatoption;
      await AppSetting.update(
        {
          IsActive: chatoption,
        },
        {
          where: {
            Id: 1,
          },
        }
      );
      if (chatoption == "true") {
        await users.update(
          { isChat: chatoption },
          { where: { isDelete: false } }
        );
        chatis = "Enable";
      } else {
        await users.update(
          { isChat: chatoption },
          { where: { isDelete: false } }
        );
        chatis = "Disable";
      }
      res
        .status(200)
        .send({ success: true, message: `Sucessfully ${chatis} Chat Option` });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  GetChatPermission = async (req, res) => {
    try {
      let getChatOption = await AppSetting.findOne({
        where: {
          Id: 1,
        },
      });
      if (getChatOption) {
        res.status(200).send({
          success: true,
          data: getChatOption,
          message: "ChatPermission",
        });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  Testing = async (req, res) => {
    try {
      
      const distancedata = await db.MerchantDetails.findAll({
         attributes: [[sequelize.literal(`6371 * acos(cos(radians(24.967343)) * cos(radians(lat)) * cos(radians(67.172710) - radians(lng)) + sin(radians(24.967343)) * sin(radians(lat)))`),'distance'],"bussinessName"],
         order: sequelize.col('distance'),
          
      });
      res.status(200).send({ success: true, data: distancedata });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };
}
module.exports = chat;
