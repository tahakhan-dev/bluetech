const db = require("../../Model");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const { validate } = require("../../Model/Notification.models");
const Op = db.Sequelize.Op;
const users = db.users;
const NotificationRoutes = db.notificationroute;
const Users = db.users;
const Block = db.blockUserModel;
const Friends = db.friends;
const Notification = db.notification;
const Notificationroute = db.notificationroute;
const fcm = require("../../FCMNotification/fcmnotificatins");
const imagedata = db.imageData;

class notification {
    InserNotification = async (req, res) => {
        try {
         
        

        } catch (error) {
          
        }
      };

    GetNotification = async (req, res) => {
        try {
          let PageNumber = req.query.pageNumber;
          let PageSize = req.query.pageSize;
          let end = (PageNumber * PageSize);
          let start = end - PageSize;
          let tokendata = (req.user);
          let Notifications = await Notification.findAll({
            offset: start,
            limit: parseInt(PageSize),
            include: [
              {
                model: users,
                as: "sendby",
                include: [{model: imagedata,
                  attributes: ['imageId', 'imageUrl'],
                 }],
              },
              {
                model: users,
                as: "receiveby"
                
              },
              {
                model: NotificationRoutes,
                
                
              },
              ],
              where: {
                receiverId:  req.user.id,
                },
                order: [
                  ['NotificationId', 'DESC'],
                ],
          });
          let NotificationsCount = await Notification.findAll({
            
            include: [
              {
                model: users,
                as: "sendby",
                include: [{model: imagedata,
                  attributes: ['imageId', 'imageUrl'],
                 }],
              },
              {
                model: users,
                as: "receiveby"
                
              },
              {
                model: NotificationRoutes,
                
                
              },
              ],
              where: {
                receiverId:  req.user.id,
                },
                order: [
                  ['NotificationId', 'DESC'],
                ],
          });
          let countData = {
            page: parseInt(PageNumber),
            pages: Math.ceil(NotificationsCount.length / PageSize),
            
            totalRecords: NotificationsCount.length,
          };
          if (Notifications) {
            res.status(200).send({
              success: true,
              countData: countData,
              pagesrecorddata: Notifications.length,
              message: "",
              data: Notifications,
              
              
            });
          }
        } catch (error) {
          res.status(500).send({ success: false, message: error.message });
        }
    };

     



 
}
module.exports = notification;
