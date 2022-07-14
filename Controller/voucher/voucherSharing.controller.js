const db = require("../../Model");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const VoucherShare = db.VoucherShare;
const VoucherGen = db.VoucherGen;
const Product = db.product;

const friends = db.friends;
const UserDetail = db.usersdetail;
const Block = db.blockUserModel;
const Campaign = db.campaign;
const Op = db.Sequelize.Op;
const limit = require("../extras/DataLimit/index");
const Users = db.users;
const Notification = db.notification;
const Notificationroute = db.notificationroute;
const fcm = require("../../FCMNotification/fcmnotificatins");
const fs = require("fs");
var privateKEY = fs.readFileSync("config/cert/private.key", "utf8");
const {
  setShareVoucherLinkToken,
  getShareVoucherLinkToken,
} = require("../../cache/redis.service");

class VoucherSharing {
  getVoucherHistoryByCode = async (req, res) => {
    try {
      let shareArray = [];
      let updatedArray;
      let filterIndex;
      let lastIndex;

      const payloadId = req.user.id;
      const voucherCode = req.params.voucherCode;

      let _ = await VoucherShare.findAll({
        raw: true,
        nest: true,
        offset:
          parseInt(req.query.page) * limit.limit
            ? parseInt(req.query.page) * limit.limit
            : 0,
        limit: req.query.page ? limit.limit : 1000000,
        where: {
          voucherCode: voucherCode,
          isActive: true,
        },
      });
      shareArray = _;
      lastIndex = shareArray.length;

      for (let i = 0; i < shareArray.length; i++) {
        if (shareArray[i].senderId == payloadId) {
          filterIndex = i;
          updatedArray = shareArray.slice(filterIndex, lastIndex);
          break;
        }
        if (shareArray[i].receiverId == payloadId) {
          filterIndex = i;
          updatedArray = shareArray.slice(filterIndex, lastIndex);
          break;
        }
      }
      let countData = {
        page: parseInt(req.query.page),
        pages: Math.ceil(updatedArray.length / limit.limit),
        totalRecords: updatedArray.length,
      };
      res.status(200).send({ success: true, data: updatedArray, countData });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  shareVoucher = async (req, res) => {
    try {
      let voucher_info = {};
      let userd

      const info = _.pick(req.body, [
        "campaignId",
        "productId",
        "receiverId",
        "voucherCode",
        "personalNote",
      ]);
      
      if (req.user.id == parseInt(info.receiverId))
        return res.status(404).send({
          success: false,
          message: "You Can't Send this Voucher to YourSelf",
        });

      let _res = await friends.findOne({
        where: {
          isPending: false,
          isFriend: true,
          senderId: req.user.id,
          receiverId: parseInt(info.receiverId),
        },
      });

      if (!_res) {
        userd = await UserDetail.findOne({
          where: {
            userId: parseInt(info.receiverId),
          },
        });
        
        if (userd.public_profile == false)
          return res.status(403).send({
            success: false,
            message: "This User Is private you Cannot send voucher",
          });
      }
      else
      {
        userd = await UserDetail.findOne({
          where: {
            userId: parseInt(info.receiverId),
          },
        });
        
        if (userd.public_profile == false)
          return res.status(403).send({
            success: false,
            message: "This User Is private you Cannot send voucher",
          });
      }

      let blockFr = await Block.findOne({
        where: {
          blockerId: req.user.id,
          blockedId: parseInt(info.receiverId),
        },
      });

      if (blockFr)
        return res.status(403).send({
          success: false,
          message: "You Block this user Cannot send voucher",
        });

      const getVouchers = await VoucherGen.findOne({
        raw: true,
        where: {
          voucherCode: info.voucherCode,
          userId: req.user.id,
          isActive: true,
          pending: 0,
        },
        
      });

      const getproductname = await Product.findOne({
        where: {
          id: getVouchers.productId,
        },
        
      });
      
      if (!getVouchers)
        return res.status(404).send({
          success: false,
          data: [],
          message: "No voucher found or maybe you send wrong Id ",
        });

      let vouch = await VoucherShare.findOne({
        where: {
          senderId: req.user.id,
          receiverId: info.receiverId,
          voucherCode: info.voucherCode,
          
          [Op.and]: [
            {
              statusId: {
                [Op.ne]: 3,
              },
            },
            {
              statusId: {
                [Op.ne]: 6,
              },
            },
          ],
            
          
        },
      });

      if (vouch) {
        return res
          .status(404)
          .send({ success: false, message: "You Already Share Voucher!!" });
      } else {
        info.senderId = req.user.id;

        if (!getVouchers.pending) {
          info.productId = getVouchers.productId;
          info.campaignId = getVouchers.campaignId;
          info.vouchergenId = getVouchers.id;

          voucher_info = getVouchers;

          info.referenceId = getVouchers.id;

          delete voucher_info.id;
          voucher_info.userId = info.receiverId;
          voucher_info.isActive = true;
          voucher_info.pending = true;
          voucher_info.expiresAt = getVouchers.expiresAt;
          voucher_info.voucherCreateDate = new Date()
            .toISOString()
            .substring(0, 7);

          await VoucherShare.create(info);
          let create_share_voucher = await VoucherGen.create(voucher_info);

          info.voucherCode = create_share_voucher.get({
            plain: true,
          }).voucherCode;

          VoucherShare.update(
            {
              vouchergenId: create_share_voucher.id,
            },
            {
              where: {
                voucherCode: create_share_voucher.voucherCode,
                receiverId: create_share_voucher.userId,
                pending: 1,
                statusId: 1,
              },
            }
          );
          let Deviceid = await Users.findOne({
            where: {
              id: info.receiverId,
              
            },
          });
          let currentuser = await Users.findOne({
            where: {
              id: req.user.id,
            },
          });
          let descp = `Send a ${getproductname.name}`;
          console.log("=====================",userd.firstName)
          let descp1 = `${getproductname.name} has been given to ${userd.firstName} ${userd.lastName} `
          //Notification work
          var message = {
            to: Deviceid.fcmtoken,
            notification: {
              title: "givees",
              body: `${getproductname.name} has been received from ${currentuser.userName}`,
            },
          };

          var message1 = {
            to: req.user.fcmtoken,
            notification: {
              title: "givees",
              body: `${descp1}`,
            },
          };

          fcm.send(message, async function (err, response) {
            if (err) {
              await Notification.create({
                senderId: req.user.id,
                receiverId: parseInt(info.receiverId),
                voucherId: create_share_voucher.id,
                Body: descp,
                Title: "Send",
                RouteId: 3,
                IsAction: 1,
                IsCount: 1,
              });
              
            } else {
              await Notification.create({
                senderId: req.user.id,
                receiverId: parseInt(info.receiverId),
                voucherId: create_share_voucher.id,
                Body: descp,
                Title: "Send",
                RouteId: 3,
                IsAction: 1,
                IsCount: 1,
              });
            }
          });

          fcm.send(message1, async function (err, response) {
            if (err) {
              await Notification.create({
                senderId: parseInt(info.receiverId),
                receiverId: req.user.id,
                voucherId: create_share_voucher.id,
                Body: descp1,
                Title: "Send",
                RouteId: 17,
                IsAction: 1,
                IsCount: 1,
              });
              
            } else {
              await Notification.create({
                senderId: parseInt(info.receiverId),
                receiverId: req.user.id,
                voucherId: create_share_voucher.id,
                Body: descp1,
                Title: "Send",
                RouteId: 17,
                IsAction: 1,
                IsCount: 1,
              });
            }
          });


          res
            .status(200)
            .send({ success: true, message: "Voucher Shared Successfully!" });
        } else {
          return res.status(409).send({
            success: false,
            message: "Pending voucher can not be shared!",
          });
        }
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  SendShareVoucherinPublicLink = async (req, res) => {
    try {
      const info = _.pick(req.body, [
        "campaignId",
        "productId",
        "voucherCode",
        "personalNote",
      ]);

      const getVouchers = await VoucherGen.findOne({
        raw: true,
        where: {
          voucherCode: info.voucherCode,
          userId: req.user.id,
          isActive: true,
          pending: 0,
        },
        
      });

     
      
      if (!getVouchers)
        return res.status(404).send({
          success: false,
          data: [],
          message: "No voucher found or maybe you send wrong Id ",
        });

      let vouch = await VoucherShare.findOne({
        where: {
          senderId: req.user.id,
          receiverId: null,
          voucherCode: info.voucherCode,
          
          [Op.and]: [
            {
              statusId: {
                [Op.ne]: 3,
              },
            },
            {
              statusId: {
                [Op.ne]: 6,
              },
            },
          ],
            
          
        },
      });

      if (vouch) {
        return res
          .status(404)
          .send({ success: false, message: "You Already create a link!!" });
      }


      let voucherlink = await getShareVoucherLinkToken(info.voucherCode);

      if (!voucherlink) {
        

      


        var i = "GIVEES";
        var s = "givees@gmail.com";
        var signOptions = {
          issuer: i,
          subject: s,
          algorithm: "RS256",
        };

        var token = jwt.sign(info, privateKEY, signOptions);

        setShareVoucherLinkToken(info.voucherCode, token, 48 * 60 * 60)
          .then((success) => {
            return res.status(200).send({
              success: true,
              data: info.voucherCode,
              message: "Sucessfully Creadeted a Link",
            });
          })
          .catch((error) => {
            res.status(200).send({
              success: false,
              message: error.message,
            });
          });
      } else {
        return res.status(200).send({
          success: true,
          Data: info.voucherCode,
          message: "Sucessfully Creadeted a Link",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  ReceivedShareVoucherinPublicLink = async (req, res) => {
    try {
      const payloadId = req.user.id;
      const { voucherCode } = req.params;

      // let recieveVouch = await VoucherGen.findOne({
      //   where: {
      //  // receiverId: payloadId,
      //     isActive: true,
      //     isExpired: 0,
      //     voucherCode: voucherCode,
      //   },
        
      // });

      // if (recieveVouch) {
      //   return res
      //     .status(404)
      //     .send({ success: false, data: " No voucher found" });
      // }
//Update voucher will be change into create vouchere
      await VoucherShare.create(
        {
          isActive: true,
          pending: false,
          statusId: 2,
          updatedAt: Date.now(),
        },
        {
          where: {
            isActive: false,
            statusId: 1,
            voucherCode: voucherCode,
            receiverId: payloadId,
          },
        }
      );

      await VoucherShare.update(
        {
          pending: false,
          statusId: 4,
          updatedAt: Date.now(),
        },
        {
          where: {
            isActive: false,
            statusId: 1,
            voucherCode: voucherCode,
            receiverId: { [Op.ne]: payloadId },
          },
        }
      );

      await VoucherGen.update(
        {
          isActive: 0,
          pending: 0,
          isExpired: 1,
          updatedAt: Date.now(),
        },
        {
          where: {
            userId: { [Op.ne]: payloadId },
            voucherCode: voucherCode,
          },
        }
      );

      await VoucherGen.update(
        {
          pending: 0,
        },
        {
          where: {
            userId: payloadId,
            voucherCode: voucherCode,
          },
        }
      );
      
      let Deviceid = await Users.findOne({
        where: {
          id: recieveVouch.senderId,
        },
      });
      let currentuser = await Users.findOne({
        where: {
          id: payloadId,
        },
      });
      let discp = `${recieveVouch.product.name} Has Been Accept by`
      //Notification work
      var message = {
        to: Deviceid.fcmtoken,
        notification: {
          title: "givees",
          body: `${discp} ${currentuser.userName}`,
        },
      };
      fcm.send(message, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: payloadId,
            receiverId: recieveVouch.senderId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp,
            Title: "Accept",
            RouteId: 4,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: payloadId,
            receiverId: recieveVouch.senderId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp,
            Title: "Accept",
            RouteId: 4,
            IsAction: 0,
            IsCount: 1,
          });
        }
      });

      res
        .status(200)
        .send({ success: true, data: "You have received this voucher" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };
}
module.exports = VoucherSharing;
