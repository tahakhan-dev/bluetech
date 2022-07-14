const db = require("../../Model");
const _ = require("lodash");
const Block = db.blockUserModel;
const UserDetail = db.usersdetail;
const User = db.users;
const Notification = db.notification;
const Friends = db.friends;
const Op = db.Sequelize.Op;
const fcm = require("../../FCMNotification/fcmnotificatins");
const limit = require("../extras/DataLimit/index");
class BlockUser {
  create = async (req, res) => {
    try {
      if (req.user.id == req.params.id)
        return res
          .status(400)
          .send({ success: false, message: "You Can Not Block Your Self" });
      let blockedUser = await Block.findOne({
        where: {
          blockerId: req.user.id,
          blockedId: req.params.id,
        },
      });
      if (!blockedUser) {
        let blockedUser = await Block.findOne({
          where: {
            blockerId: req.params.id,
            blockedId: req.user.id,
          },
        });
        if (blockedUser)
          return res
            .status(409)
            .send({ success: false, message: "This User Is Already Blocked" });
      }
      if (blockedUser)
        return res
          .status(409)
          .send({ success: false, message: "This User Is Already Blocked" });

      let data = {
        blockedId: req.params.id,
        blockerId: req.user.id,
      };

      Friends.destroy({
        where: {
          senderId: req.params.id,
          receiverId: req.user.id,
        },
      });
      Friends.destroy({
        where: {
          senderId: req.user.id,
          receiverId: req.params.id,
        },
      });
      let blockuser = await Block.create(data);

      let Deviceid = await User.findOne({
        where: {
          id: req.params.id,
        },
      });

      let currentuser = await User.findOne({
        where: {
          id: req.user.id,
        },
      });
      if (blockuser)
        //Notification work

        var message = {
          to: req.user.fcmtoken,
          notification: {
            title: "givees",
            body: `You Blocked ${currentuser.userName} `,
          },
        };
      fcm.send(message, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: req.params.id,
            receiverId: req.user.id,
            Body: `You Blocked`,
            Title: "Blocked",
            RouteId: 10,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: req.params.id,
            receiverId: req.user.id,
            Body: `You Blocked`,
            Title: "Blocked",
            RouteId: 10,
            IsAction: 0,
            IsCount: 1,
          });
        }
      });

      return res
        .status(200)
        .send({ success: true, message: "User has Been Blocked" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  UnblockUser = async (req, res) => {
    try {
      let { ReciverId } = req.body;
      let SenderId = req.user.id;
      await Block.destroy({
        where: { blockerId: SenderId, blockedId: ReciverId },
      });
      await Friends.create({
        senderId: SenderId,
        receiverId: ReciverId,
        isPending: 0,
        isFriend: 1,
      });

      let Deviceid = await User.findOne({
        where: {
          id: ReciverId,
        },
      });

      let currentuser = await User.findOne({
        where: {
          id: SenderId,
        },
      });

      var message = {
        to: req.user.fcmtoken,
        notification: {
          title: "givees",
          body: `You Unblocked ${currentuser.userName} `,
        },
      };
      fcm.send(message, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: ReciverId,
            receiverId: SenderId,
            Body: `You Unblocked`,
            Title: "Unblocked",
            RouteId: 14,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: ReciverId,
            receiverId: SenderId,
            Body: `You Unblocked`,
            Title: "Unblocked",
            RouteId: 14,
            IsAction: 0,
            IsCount: 1,
          });
        }
      });

      res
        .status(200)
        .send({ success: true, message: "This User Has been Unblock" });
    } catch (e) {
      res.status(500).send({ success: false, message: e.message });
    }
  };

  getBlockedUsers = async (req, res) => {
    try {
      let getBlockedUsers = await Block.findAll({
        raw: true,
        nest: true,
        offset:
          parseInt(req.query.page) * limit.limit
            ? parseInt(req.query.page) * limit.limit
            : 0,
        limit: req.query.page ? limit.limit : 1000000,
        where: {
          blockerId: req.user.id,
        },
      });
      if (getBlockedUsers.length) {
        let users = getBlockedUsers;
        let counter = 0;
        let allUsers = [];
        users.forEach(async (elem, index, array) => {
          let blockedid = elem.blockedId;
          allUsers.push(blockedid);
          counter++;
          if (counter == array.length) {
            let getusers = await User.findAll({
              where: {
                id: allUsers,
              },
              include: [
                {
                  model: UserDetail,
                },
              ],
            });
            let countData = {
              page: parseInt(req.query.page),
              pages: Math.ceil(allUsers.length / limit.limit),
              totalRecords: allUsers.length,
            };
            res.send({ success: true, getusers, countData });
          }
        });
      } else
        res.status(200).send({ success: true, message: "No Users found." });
    } catch (err) {
      res.send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };
}
module.exports = BlockUser;
