const db = require("../../Model");
const _ = require("lodash");
const moment = require("moment");
const randomstring = require("crypto-random-string");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const Users = db.users;
const Notification = db.notification;
const UsersDetails = db.usersdetail;
const VoucherGen = db.VoucherGen;
const VoucherRedeeme = db.redeemeVoucher;
const VoucherStatus = db.voucherStatus;
const DeliveryOption = db.deliveryOption;
const Orders = db.orders;
const Permissions = db.permissions;
const VoucherMerchantRedeeme = db.voucherMerchantRedeeme;
const Campaign = db.campaign;
const ImageData = db.imageData;
const CampaignDetail = db.campaignDetail;
const Product = db.product;
const VoucherShare = db.VoucherShare;
const MerchantDetails = db.MerchantDetails;
const { renderResetPassword } = require("../extras/RenderFiles");
const Op = db.Sequelize.Op;
const emailModule = require("../../Mail/Nodemailer");
const fcm = require("../../FCMNotification/fcmnotificatins");
class RedeeneVoucher {
  checkVoucher = async (req, res) => {
    const userId = req.user.id;
    let { voucherCode } = req.body;
    // check, whether voucher is expired or not
    try {
      let result = await VoucherGen.findOne({
        where: {
          userId: userId,
          voucherCode: voucherCode,
          pending: 0,
          isActive: 1,
          isExpired: 0,
          expiresAt: { [Op.gte]: moment().toDate() },
        },
      });
      result != null
        ? res.send({ success: true, data: result, message: "Voucher Is Valid" })
        : res.send({
            success: true,
            data: null,
            message: "No Voucher has been found ",
          });
    } catch (e) {
      res
        .status(400)
        .send({ success: false, message: "there is error in something" });
    }
  };

  redeemeVoucher = async (req, res) => {
    let voucherRedeemId,
      merchantId,
      response,
      resVouch,
      body,
      result,
      query,
      query2,
      productName,
      username,
      routeid,
      Descrip,
      vouchResponse;
    const rndStr = randomstring({
      length: 10,
      type: "distinguishable",
    });
    req.body.redeemeDevOpId == 2
      ? (body = _.pick(req.body, [
          "voucherId",
          "redeemeDevOpId",
          "campaignId",
          "voucherCode",
          "statusId",
          "isActive",
        ]))
      : (body = _.pick(req.body, [
          "voucherId",
          "voucherCode",
          "name",
          "phonenumber",
          "country",
          "address",
          "address2",
          "city",
          "province",
          "postalcode",
          "emailId",
          "instruction",
          "redeemeDevOpId",
          "redeemeDevTypeId",
          "campaignId",
        ]));
    body.userId = req.user.id;
    if (req.body.redeemeDevOpId == 2) {
      body.statusId = 2;
      body.isActive = 1;
    }
    try {
      response = await VoucherGen.findOne({ where: { id: body.voucherId } });
      resVouch = await VoucherRedeeme.findOne({
        where: { voucherId: body.voucherId, isActive: 0 },
      });
      if (response != null && resVouch == null) {
        query2 = `select vs.id,vs.voucherCode,vs.isExpired,vs.expiresAt,vs.createdAt,p.name as ProductName,p.stock as ProductStock,c.name as ProductcategoryName,s.name as ProductsubcategoryName,su.userName,cp.name as CampaignName,
                        cp.campaignCode,(SELECT globalCounters.counter FROM globalCounters WHERE globalCounters.id = 1) as CampaignCounter,cp.Discount as CampaignDiscount,cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount,md.bussinessName as MerchantBussinessName,md.storeName as MerchantStoreName,tdd.transactionCode as TransactionId
                        from vouchergens As vs
                        inner join products as p on p.id = vs.productId 
                        left join categories as c on c.id = p.categoryId
                        left join subcategories as s on s.id = p.subcategoryId
                        left join users as su on su.id = vs.userId
                        left join campaigns as cp on cp.id = vs.campaignId
                        left join merchantDetails as md on md.userId = cp.merchantId
                        left join ( 
                            select tr.userId,tr.transactionCode from transactions as tr
                            inner join transactionDetails as trd on trd.transactionId = tr.id
                            where trd.campaignId = ${body.campaignId} and tr.userId = ${req.user.id}
                            group by (trd.transactionId)
                            order by trd.transactionId desc
                            limit 1
                            )
                            as tdd on tdd.userId = su.id
                        where vs.id=${body.voucherId}`;

        result = await VoucherRedeeme.create(body);
        voucherRedeemId = result.id;

        query = `Select c.merchantId from vouchergens AS v inner join campaigns AS c on c.id = v.campaignId where v.id = ${body.voucherId} limit 1`;
        let respMer = await db.sequelize.query(query);

        respMer[0].forEach((res) => {
          merchantId = res.merchantId;
        });
        vouchResponse = await db.sequelize.query(query2);
        vouchResponse[0].forEach((resvouchresponse) => {
          productName = resvouchresponse.ProductName;
          username = resvouchresponse.userName;
        });
        if (req.body.redeemeDevOpId === 2) {
          Descrip = `${productName} Has Been Redeemed`;
          routeid = 7;

          await VoucherMerchantRedeeme.create({
            merchantId: merchantId,
            userId: req.user.id,
            redeemeVoucherId: voucherRedeemId,
            redeemeDevOpId: body.redeemeDevOpId,
            statusId: body.statusId,
            isActive: 0,
          });

          await Orders.create({
            OrderId: rndStr,
            userId: req.user.id,
            merchantId: merchantId,
            campaignId: body.campaignId,
            statusId: body.statusId,
            redeemeVoucherId: voucherRedeemId,
            voucherId: body.voucherId,
          });

          await VoucherGen.update(
            { isActive: 0, pending: 0, isExpired: 1, updatedAt: Date.now() },
            { where: { id: body.voucherId } }
          );
        } else {
          routeid = 12;
          Descrip = `Your ${productName} Voucher Redeeme Query Is send To merchant wait for the response`;
          await VoucherMerchantRedeeme.create({
            merchantId: merchantId,
            userId: req.user.id,
            redeemeVoucherId: voucherRedeemId,
            redeemeDevOpId: body.redeemeDevOpId,
          });

          let merchantEmail = await Users.findOne({
            where: {
              id: merchantId,
            },
          });

          const mailOptions = {
            from: "giveesapp@gmail.com",
            to: merchantEmail.email,
            subject: "Redeemed Voucher",
            html: renderResetPassword(
              `Your approval is required for a request to proceed with its execution`,
              "Approval Required For A Request",
              `https://givees-ad181.web.app/merchant-orders`,
              "To Approve or Reject this query",
              "Click this Button"
            ),
          };

          await emailModule.sendMail(mailOptions);
        }

        // Faraz Add Cancel Share Voucher If i am redeemed my own voucher

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
              voucherCode: body.voucherCode,
              receiverId: { [Op.ne]: req.user.id },
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
              userId: { [Op.ne]: req.user.id },
              voucherCode: body.voucherCode,
            },
          }
        );

        await VoucherGen.update(
          {
            pending: 0,
          },
          {
            where: {
              userId: req.user.id,
              voucherCode: body.voucherCode,
            },
          }
        );

        let Deviceid = await Users.findOne({
          where: {
            id: req.user.id,
          },
        });

        // Notification work
        var message = {
          to: Deviceid.fcmtoken,
          notification: {
            title: "givees",
            body: Descrip,
          },
        };

        let merchantResp = await db.usersdetail.findOne({
          where: { userId: parseInt(merchantId) },
        });

        if (routeid != 12) {
          fcm.send(message, async function (err, response) {
            if (err) {
              await Notification.create({
                senderId: req.user.id,
                receiverId: req.user.id,
                voucherId: body.voucherId,
                Body: Descrip,
                Title: `${vouchResponse[0][0].MerchantStoreName}`,
                RouteId: routeid,
                IsAction: 0,
                IsCount: 1,
              });
             } 
            else {
              await Notification.create({
                senderId: req.user.id,
                receiverId: req.user.id,
                voucherId: body.voucherId,
                Body: Descrip,
                Title: `${vouchResponse[0][0].MerchantStoreName}`,
                RouteId: routeid,
                IsAction: 0,
                IsCount: 1,
              });
            }
          });
        }

        res.status(200).send({
          success: true,
          data: vouchResponse[0],
          message:
            "Your Voucher Redeeme Query Is send To merchant wait for the response",
        });
      } else {
        res.status(404).send({
          success: false,
          data: [],
          message: "This Voucher Is Not valid",
        });
      }
    } catch (e) {
      res.status(400).send({ success: false, message: e.message });
    }
  };

  merchantReedem = async (req, res) => {
    let voucherReId, voucherId, userPerm, query, result, Descrip;
    let { ActionId, voucherRedeemId, deliveryTime } = req.body;

    deliveryTime != null || deliveryTime != undefined ? null : "";

    const rndStr = randomstring({
      length: 10,
      type: "distinguishable",
    });

    userPerm = await Permissions.findOne({
      where: {
        userId: req.user.id,
        roleId: 3,
      },
    });

    console.log('==============userPerm====================');
    console.log(userPerm);
    console.log('==============userPerm====================');

    if (!userPerm) {
      return res.status(404).send({ success: false, message: "No user Found" });
    }

    if (userPerm && userPerm.roleId != 3) {
      return res
        .status(404)
        .send({ success: false, message: "You Don't Have Permission" });
    }

    if (ActionId > 0 && ActionId < 3) {
      if (ActionId == 1) {
        try {
          voucherReId = await VoucherMerchantRedeeme.findOne({
            where: {
              id: voucherRedeemId,
              merchantId: req.user.id,
              isActive: 1,
              statusId: 1,
            },
          });

          console.log('=================voucherReId====================');
          console.log(voucherReId);
          console.log('=================voucherReId====================');

          if (!voucherReId)
            return res
              .status(404)
              .send({ success: false, message: "No Reedeme Voucher Found" });

          query = `Select u.id as userId,uud.firstName as merchantFirstName,md.storeName as MerchantStoreName,uud.lastName as merchantLastName, p.name as ProductName, md.userId as merchantId,cp.id as campaignId,vm.redeemeVoucherId as redeemeVoucherId, vg.id as voucherId
                    from voucherMerchantRedeemes AS vm
                    inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
                    left join vouchergens as vg on vg.id = rv.voucherId
                    left join voucherStatuses as vs on vs.id = vm.statusId
                    left join merchantDetails as md on md.userId = vm.merchantId
                    left join users as u on u.id = rv.userId
                    left join usersdetails as uud on uud.userId = u.id
                    left join products as p on p.id = vg.productId
                    left join categories as c on c.id = p.categoryId
                    left join subcategories as s on s.id = p.subcategoryId
                    left join campaigns as cp on cp.id = vg.campaignId
                    left join deliveryOptions as do on do.id = rv.redeemeDevOpId
                    where vm.merchantId = ${req.user.id} and vm.id=${voucherRedeemId} and vm.statusId=1 and vm.isActive=1 `;

          result = await db.sequelize.query(query);

          console.log('================result=================');
          console.log(result);
          console.log('================result=================');

          await VoucherMerchantRedeeme.update(
            {
              statusId: 2,
              isActive: 0,
              deliveryTime: deliveryTime,
              updatedAt: Date.now(),
            },
            { where: { id: voucherRedeemId } }
          );

          voucherId = await VoucherRedeeme.findOne({
            where: { id: voucherReId.redeemeVoucherId },
          });

          console.log('==============voucherId=================');
          console.log(voucherId);
          console.log('==============voucherId=================');

          await VoucherRedeeme.update(
            { statusId: 2, isActive: 1, updatedAt: Date.now() },
            { where: { id: voucherReId.redeemeVoucherId } }
          );

          await VoucherGen.update(
            { isActive: 0, pending: 0, isExpired: 1, updatedAt: Date.now() },
            { where: { id: voucherId.voucherId } }
          );

          await Orders.create({
            OrderId: rndStr,
            userId: result[0][0].userId,
            merchantId: result[0][0].merchantId,
            campaignId: result[0][0].campaignId,
            statusId: 2,
            redeemeVoucherId: result[0][0].redeemeVoucherId,
            voucherId: result[0][0].voucherId,
          });

          let Deviceid = await Users.findOne({
            where: {
              id: result[0][0].userId,
            },
          });
          console.log('====================Deviceid============');
          console.log(Deviceid);
          console.log('====================Deviceid============');

          Descrip = `Your ${result[0][0].ProductName} Has Been Processed`;
          // Notification work
          var message = {
            to: Deviceid.fcmtoken,
            notification: {
              title: "givees",
              body: Descrip,
            },
          };

          let merchantResp = await db.usersdetail.findOne({
            where: { userId: parseInt(result[0][0].merchantId) },
          });

          console.log('==============merchantResp================');
          console.log(merchantResp);
          console.log('==============merchantResp================');

          fcm.send(message, async function (err, response) {
            if (err) {
              await Notification.create({
                senderId: req.user.id,
                receiverId: result[0][0].userId,
                voucherId: result[0][0].voucherId,
                Body: Descrip,
                Title: `${result[0][0].MerchantStoreName}`,
                RouteId: 13,
                IsAction: 0,
                IsCount: 1,
              });
            } else {
              await Notification.create({
                senderId: req.user.id,
                receiverId: result[0][0].userId,
                voucherId: result[0][0].voucherId,
                Body: Descrip,
                Title: `${result[0][0].MerchantStoreName}`,
                RouteId: 13,
                IsAction: 0,
                IsCount: 1,
              });
            }
          });

          res.status(200).send({
            success: true,
            message: "Your Voucher has been Successfully Redeeme",
          });
        } catch (e) {
          res.status(400).send({ success: false, message: e.message });
        }
      } else if (ActionId == 2) {
        try {
          voucherReId = await VoucherMerchantRedeeme.findOne({
            where: { id: voucherRedeemId, merchantId: req.user.id },
          });

          console.log('=================voucherReId=================');
          console.log(voucherReId);
          console.log('=================voucherReId=================');

          if (!voucherReId)
            return res
              .status(404)
              .send({ success: false, message: "No Reedeme Voucher Found" });

          query = `Select u.id as userId,uud.firstName as merchantFirstName,uud.lastName as merchantLastName p.name as ProductName, md.userId as merchantId,cp.id as campaignId,vm.redeemeVoucherId as redeemeVoucherId, vg.id as voucherId
                    from voucherMerchantRedeemes AS vm
                    inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
                    left join vouchergens as vg on vg.id = rv.voucherId
                    left join voucherStatuses as vs on vs.id = vm.statusId
                    left join merchantDetails as md on md.userId = vm.merchantId
                    left join users as u on u.id = rv.userId
                    left join usersdetails as uud on uud.userId = u.id
                    left join products as p on p.id = vg.productId
                    left join categories as c on c.id = p.categoryId
                    left join subcategories as s on s.id = p.subcategoryId
                    left join campaigns as cp on cp.id = vg.campaignId
                    left join deliveryOptions as do on do.id = rv.redeemeDevOpId
                    where vm.merchantId = ${req.user.id} and vm.id=${voucherRedeemId} and vm.statusId=1 and vm.isActive=1 `;

          result = await db.sequelize.query(query);

          console.log('======================result===================');
          console.log(result);
          console.log('======================result===================');

          await Orders.create({
            OrderId: rndStr,
            userId: result[0][0].userId,
            merchantId: result[0][0].merchantId,
            campaignId: result[0][0].campaignId,
            redeemeVoucherId: result[0][0].redeemeVoucherId,
            statusId: 3,
            voucherId: result[0][0].voucherId,
          });

          await VoucherMerchantRedeeme.update(
            { statusId: 3, isActive: 0, updatedAt: Date.now() },
            { where: { id: voucherRedeemId } }
          );

          voucherId = await VoucherRedeeme.findOne({
            where: { id: voucherReId.redeemeVoucherId },
          });

          console.log('===============voucherId=================');
          console.log(voucherId);
          console.log('===============voucherId=================');

          await VoucherRedeeme.update(
            { statusId: 3, isActive: 1, updatedAt: Date.now() },
            { where: { id: voucherReId.redeemeVoucherId } }
          );

          let Deviceid = await Users.findOne({
            where: {
              id: result[0][0].userId,
            },
          });

          console.log('====================Deviceid====================');
          console.log(Deviceid);
          console.log('====================Deviceid====================');
          
          Descrip = `Your ${result[0][0].ProductName} Has Been Declined`;
          // Notification work
          var message = {
            to: Deviceid.fcmtoken,
            notification: {
              title: "givees",
              body: Descrip,
            },
          };
          // fcm.send(message, async function (err, response) {
          //   if (err) {
          //     await Notification.create({
          //       senderId: req.user.id,
          //       receiverId: result[0][0].userId,
          //       voucherId: result[0][0].voucherId,
          //       Body: Descrip,
          //       Title: `${result[0][0].merchantFirstName} ${result[0][0].merchantLastName}`,
          //       RouteId: 15,
          //       IsAction: 0,
          //       IsCount: 1,
          //     });
          //   } else {
          //     await Notification.create({
          //       senderId: req.user.id,
          //       receiverId: result[0][0].userId,
          //       voucherId: result[0][0].voucherId,
          //       Body: Descrip,
          //       Title: `${result[0][0].merchantFirstName} ${result[0][0].merchantLastName}`,
          //       RouteId: 13,
          //       IsAction: 0,
          //       IsCount: 1,
          //     });
          //   }
          // });
          res.status(200).send({
            success: true,
            message: "Your Voucher has Declined By Merchant",
          });
        } catch (e) {
          res.status(400).send({ success: false, message: e.message });
        }
      }
    } else {
      return res
        .status(500)
        .send({ Success: false, message: "something went wrong" });
    }
  };

  showRedeemVoucher = async (req, res) => {
    try {
      let query, result, userPerm, countVoucher;
      let { ActionId } = req.params;
      let merchantId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      userPerm = await Permissions.findOne({
        where: {
          userId: merchantId,
          roleId: 3,
        },
      });

      if (!userPerm) {
        return res
          .status(404)
          .send({ success: false, message: "No user Found" });
      }

      if (userPerm && userPerm.roleId != 3) {
        return res
          .status(404)
          .send({ success: false, message: "You Don't Have Permission" });
      }

      ActionId =
        ActionId == 1
          ? { Active: 1, statusId: 1 }
          : ActionId == 2
          ? { Active: 0, statusId: 2 }
          : { Active: 0, statusId: 3 };
      // ActionId 1--> show Pending
      // ActionId 2--> show Approved
      // ActionId 3--> show Declined

      query = `Select vm.id,u.userName,uud.firstName as userFirstName,uud.lastName as userLastName ,uud.phoneNumber as userPhoneNumber,vg.voucherCode,rv.name,rv.phonenumber,rv.address,rv.city,rv.province,rv.postalcode,rv.emailId,rv.instruction, vs.status,do.deliveryName,dt.deliveryTypeName as deliveryType,md.bussinessName as MerchantBussinessName
        ,md.storeName as MerchantStoreName,p.name as productName,p.stock as ProductStock,c.name as ProductcategoryName,s.name as ProductsubcategoryName,cp.name as CampaignName,cp.campaignCode,cp.Discount as CampaignDiscount,
        cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount, vm.createdAt
        from voucherMerchantRedeemes AS vm
        inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
        left join vouchergens as vg on vg.id = rv.voucherId
        left join voucherStatuses as vs on vs.id = vm.statusId
        left join merchantDetails as md on md.userId = vm.merchantId
        left join users as u on u.id = rv.userId
        left join usersdetails as uud on uud.userId = u.id
        left join products as p on p.id = vg.productId
        left join categories as c on c.id = p.categoryId
        left join subcategories as s on s.id = p.subcategoryId
        left join campaigns as cp on cp.id = vg.campaignId
        left join deliveryOptions as do on do.id = rv.redeemeDevOpId
        left join deliveryTypes as dt on dt.id = rv.redeemeDevTypeId
        where vm.merchantId = ${merchantId} and vm.statusId = 1 and vm.isActive = 1 and do.id = ${
        req.params.ActionId
      } ORDER BY vm.id DESC
        LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      let totalcount = `select COUNT(vm.id) as count from voucherMerchantRedeemes AS vm
        inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
        left join deliveryOptions as do on do.id = rv.redeemeDevOpId
        where vm.merchantId = ${merchantId} and vm.statusId = 1 and vm.isActive = 1 and do.id = ${req.params.ActionId} ORDER BY vm.id DESC`;

      result = await db.sequelize.query(query);
      let totalQuery = await db.sequelize.query(totalcount);

      countVoucher = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalQuery[0][0].count / PageSize),
        totalRecords: totalQuery[0][0].count,
      };

      result[0].length > 0
        ? res.status(200).send({
            success: true,
            data: result[0],
            countVoucher,
            message: "Redeeme Voucher Found",
          })
        : res.status(200).send({
            success: true,
            data: [],
            message: "NO redeeme voucher found",
          });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  showRedeemVoucherSearch = async (req, res) => {
    try {
      let query, result, userPerm, countVoucher;
      let { ActionId } = req.params;
      let merchantId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let searchQuery = req.query.searchQuery;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      userPerm = await Permissions.findOne({
        where: {
          userId: merchantId,
          roleId: 3,
        },
      });

      if (!userPerm) {
        return res
          .status(404)
          .send({ success: false, message: "No user Found" });
      }

      if (userPerm && userPerm.roleId != 3) {
        return res
          .status(404)
          .send({ success: false, message: "You Don't Have Permission" });
      }

      ActionId =
        ActionId == 1
          ? { Active: 1, statusId: 1 }
          : ActionId == 2
          ? { Active: 0, statusId: 2 }
          : { Active: 0, statusId: 3 };
      // ActionId 1--> show Pending
      // ActionId 2--> show Approved
      // ActionId 3--> show Declined

      query = `Select vm.id,u.userName,uud.firstName as userFirstName,uud.lastName as userLastName ,uud.phoneNumber as userPhoneNumber,vg.voucherCode,rv.name,rv.phonenumber,rv.address,rv.city,rv.province,rv.postalcode,rv.emailId,rv.instruction, vs.status,do.deliveryName,dt.deliveryTypeName as deliveryType,md.bussinessName as MerchantBussinessName
        ,md.storeName as MerchantStoreName,p.name as productName,p.stock as ProductStock,c.name as ProductcategoryName,s.name as ProductsubcategoryName,cp.name as CampaignName,cp.campaignCode,cp.Discount as CampaignDiscount,
        cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount, vm.createdAt
        from voucherMerchantRedeemes AS vm
        inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
        left join vouchergens as vg on vg.id = rv.voucherId
        left join voucherStatuses as vs on vs.id = vm.statusId
        left join merchantDetails as md on md.userId = vm.merchantId
        left join users as u on u.id = rv.userId
        left join usersdetails as uud on uud.userId = u.id
        left join products as p on p.id = vg.productId
        left join categories as c on c.id = p.categoryId
        left join subcategories as s on s.id = p.subcategoryId
        left join campaigns as cp on cp.id = vg.campaignId
        left join deliveryOptions as do on do.id = rv.redeemeDevOpId
        left join deliveryTypes as dt on dt.id = rv.redeemeDevTypeId
        where vm.merchantId = ${merchantId} and vm.statusId = 1 and vm.isActive = 1 and do.id = ${
        req.params.ActionId
      } and ((vg.voucherCode LIKE '%${searchQuery}%') OR (u.userName LIKE '%${searchQuery}%') OR (p.name LIKE '%${searchQuery}%') ) ORDER BY vm.id DESC
        LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      let totalcount = `select COUNT(vm.id) as count from voucherMerchantRedeemes AS vm
        inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
        left join vouchergens as vg on vg.id = rv.voucherId
        left join users as u on u.id = rv.userId
        left join products as p on p.id = vg.productId
        left join deliveryOptions as do on do.id = rv.redeemeDevOpId
        where vm.merchantId = ${merchantId} and vm.statusId = 1 and vm.isActive = 1 and do.id = ${req.params.ActionId} and ((vg.voucherCode LIKE '%${searchQuery}%') OR (u.userName LIKE '%${searchQuery}%') OR (p.name LIKE '%${searchQuery}%') )`;

      result = await db.sequelize.query(query);
      let totalQuery = await db.sequelize.query(totalcount);

      countVoucher = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalQuery[0][0].count / PageSize),
        totalRecords: totalQuery[0][0].count,
      };

      result[0].length > 0
        ? res.status(200).send({
            success: true,
            data: result[0],
            countVoucher,
            message: "Redeeme Voucher Found",
          })
        : res.status(200).send({
            success: true,
            data: [],
            message: "NO redeeme voucher found",
          });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  showRedeemVoucherSearchAdmin = async (req, res) => {
    try {
      let query, result, userPerm, countVoucher;
      let { ActionId, merchantId } = req.params;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let searchQuery = req.query.searchQuery;

      userPerm = await Permissions.findOne({
        where: {
          userId: merchantId,
          roleId: 3,
        },
      });

      if (!userPerm) {
        return res
          .status(404)
          .send({ success: false, message: "No user Found" });
      }

      if (userPerm && userPerm.roleId != 3) {
        return res
          .status(404)
          .send({ success: false, message: "You Don't Have Permission" });
      }

      ActionId =
        ActionId == 1
          ? { Active: 1, statusId: 1 }
          : ActionId == 2
          ? { Active: 0, statusId: 2 }
          : { Active: 0, statusId: 3 };
      // ActionId 1--> show Pending
      // ActionId 2--> show Approved
      // ActionId 3--> show Declined

      query = `Select vm.id,u.userName,uud.firstName as userFirstName,uud.lastName as userLastName ,uud.phoneNumber as userPhoneNumber,vg.voucherCode,rv.name,rv.phonenumber,rv.address,rv.city,rv.province,rv.postalcode,rv.emailId,rv.instruction, vs.status,do.deliveryName,dt.deliveryTypeName as deliveryType,md.bussinessName as MerchantBussinessName
        ,md.storeName as MerchantStoreName,p.name as productName,p.stock as ProductStock,c.name as ProductcategoryName,s.name as ProductsubcategoryName,cp.name as CampaignName,cp.campaignCode,cp.Discount as CampaignDiscount,
        cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount, vm.createdAt
        from voucherMerchantRedeemes AS vm
        inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
        left join vouchergens as vg on vg.id = rv.voucherId
        left join voucherStatuses as vs on vs.id = vm.statusId
        left join merchantDetails as md on md.userId = vm.merchantId
        left join users as u on u.id = rv.userId
        left join usersdetails as uud on uud.userId = u.id
        left join products as p on p.id = vg.productId
        left join categories as c on c.id = p.categoryId
        left join subcategories as s on s.id = p.subcategoryId
        left join campaigns as cp on cp.id = vg.campaignId
        left join deliveryOptions as do on do.id = rv.redeemeDevOpId
        left join deliveryTypes as dt on dt.id = rv.redeemeDevTypeId
        where vm.merchantId = ${merchantId} and vm.statusId = 1 and vm.isActive = 1 and do.id = ${
        req.params.ActionId
      } and ((vg.voucherCode LIKE '%${searchQuery}%') OR (u.userName LIKE '%${searchQuery}%') OR (p.name LIKE '%${searchQuery}%') ) ORDER BY vm.id DESC
        LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      let totalcount = `select COUNT(vm.id) as count from voucherMerchantRedeemes AS vm
        inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
        left join vouchergens as vg on vg.id = rv.voucherId
        left join users as u on u.id = rv.userId
        left join products as p on p.id = vg.productId
        left join deliveryOptions as do on do.id = rv.redeemeDevOpId
        where vm.merchantId = ${merchantId} and vm.statusId = 1 and vm.isActive = 1 and do.id = ${req.params.ActionId} and ((vg.voucherCode LIKE '%${searchQuery}%') OR (u.userName LIKE '%${searchQuery}%') OR (p.name LIKE '%${searchQuery}%') )`;

      result = await db.sequelize.query(query);
      let totalQuery = await db.sequelize.query(totalcount);

      countVoucher = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalQuery[0][0].count / PageSize),
        totalRecords: totalQuery[0][0].count,
      };

      result[0].length > 0
        ? res.status(200).send({
            success: true,
            data: result[0],
            countVoucher,
            message: "Redeeme Voucher Found",
          })
        : res.status(200).send({
            success: true,
            data: [],
            message: "NO redeeme voucher found",
          });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  userRedeemVoucherStatus = async (req, res) => {
    const userId = req.user.id;
    let { ActionId } = req.params;
    let result;

    ActionId =
      ActionId == 1 ? { Active: 1, statusId: 2 } : { Active: 1, statusId: 3 };

    // ActionId 1--> show Approved
    // ActionId 2--> show Declined

    try {
      result = await VoucherRedeeme.findAll({
        include: [
          { model: Users },
          { model: VoucherGen },
          { model: VoucherStatus },
          { model: DeliveryOption },
        ],
        where: {
          userId: userId,
          isActive: ActionId.Active,
          statusId: ActionId.statusId,
        },
      });
      result.length > 0
        ? res.status(200).send({ success: true, data: result })
        : res
            .status(200)
            .send({ success: true, data: null, message: "No result found" });
    } catch (e) {
      res
        .send(400)
        .status({ success: false, message: "There Is Some Error", erro: e });
    }
  };

  ActivityLog = async (req, res) => {
    try {
      let ActionId = parseInt(req.params.ActionId);
      let campaignId = parseInt(req.params.campaignId);
      let result, camp, merch, likess, campImage;

      // ActionId 1--> show All
      // ActionId 2--> show Given
      // ActionId 3--> show Expired
      // ActionId 4--> show Redeemed
      // ActionId 5--> show Declined

      if (ActionId > 0 && ActionId < 6) {
        switch (ActionId) {
          case 1:
            camp = await Campaign.findOne({
              where: {
                id: campaignId,
              },
            });
            campImage = await ImageData.findAll({
              where: { imageType: "Campaign", typeId: campaignId },
            });
            merch = await MerchantDetails.findAll({
              where: { userId: camp.merchantId },
              include: [
                { model: db.users, include: [{ model: db.usersdetail }] },
              ],
            });

            likess = await db.LikeModel.findAll({
              where: { likedId: merch[0].userId },
              include: [
                {
                  model: db.users,
                  where: {
                    isBlocked: 0,
                    isDelete: 0,
                  },
                },
              ],
            });

            merch.map((x, i, arr) => {
              x.dataValues["Likes"] = likess;
            });

            result = await Campaign.findAll({
              where: {
                id: campaignId,
              },
              include: [
                {
                  model: CampaignDetail,
                  include: [
                    {
                      model: Product,
                    },
                  ],
                },
                {
                  model: VoucherShare,
                  senderId: req.user.id,
                  where: {
                    [Op.or]: [
                      {
                        statusId: 2,
                      },
                      {
                        statusId: 1,
                      },
                    ],
                  },
                  include: [
                    { model: VoucherGen },
                    {
                      model: Users,
                      include: [{ model: ImageData }, { model: UsersDetails }],
                    },
                    {
                      model: Users,
                      as: "Receiver",
                      include: [{ model: ImageData }, { model: UsersDetails }],
                    },
                  ],
                },
              ],
            });

            result.map((x, i, arr) => {
              x.dataValues["merchantDetails"] = merch;
              x.dataValues["CampaignImageData"] = campImage;
            });
            break;

          case 2:
            camp = await Campaign.findOne({
              where: {
                id: campaignId,
              },
            });
            campImage = await ImageData.findAll({
              where: { imageType: "Campaign", typeId: campaignId },
            });
            merch = await MerchantDetails.findAll({
              where: { userId: camp.merchantId },
              include: [
                { model: db.users, include: [{ model: db.usersdetail }] },
              ],
            });

            likess = await db.LikeModel.findAll({
              where: { likedId: merch[0].userId },
              include: [
                {
                  model: db.users,
                  where: {
                    isBlocked: 0,
                    isDelete: 0,
                  },
                },
              ],
            });

            merch.map((x, i, arr) => {
              x.dataValues["Likes"] = likess;
            });

            result = await Campaign.findAll({
              where: {
                id: campaignId,
              },
              include: [
                {
                  model: ImageData,
                  where: { imageType: "Campaign" },
                },
                {
                  model: CampaignDetail,
                  include: [
                    {
                      model: Product,
                    },
                  ],
                },
                {
                  model: VoucherShare,
                  senderId: req.user.id,
                  where: {
                    [Op.or]: [
                      {
                        statusId: 2,
                      },
                      {
                        statusId: 1,
                      },
                    ],
                  },
                  include: [
                    { model: VoucherGen },
                    {
                      model: Users,
                      include: [{ model: ImageData }, { model: UsersDetails }],
                    },
                    {
                      model: Users,
                      as: "Receiver",
                      include: [
                        { model: db.friends, as: "receiver" },
                        { model: ImageData },
                        { model: UsersDetails },
                      ],
                    },
                  ],
                },
              ],
            });

            result.map((x, i, arr) => {
              x.dataValues["merchantDetails"] = merch;
              x.dataValues["CampaignImageData"] = campImage;
              x.dataValues["voucherStatus"] = "Given";
            });
            break;

          case 3:
            camp = await Campaign.findOne({
              where: {
                id: campaignId,
              },
            });
            campImage = await ImageData.findAll({
              where: { imageType: "Campaign", typeId: campaignId },
            });
            merch = await MerchantDetails.findAll({
              where: { userId: camp.merchantId },
              include: [
                { model: db.users, include: [{ model: db.usersdetail }] },
              ],
            });

            likess = await db.LikeModel.findAll({
              where: { likedId: merch[0].userId },
              include: [
                {
                  model: db.users,
                  where: {
                    isBlocked: 0,
                    isDelete: 0,
                  },
                },
              ],
            });

            merch.map((x, i, arr) => {
              x.dataValues["Likes"] = likess;
            });
            result = await Campaign.findAll({
              where: {
                id: campaignId,
              },
              include: [
                {
                  model: CampaignDetail,
                  include: [
                    {
                      model: Product,
                    },
                  ],
                },
                {
                  model: VoucherGen,
                  where: {
                    isActive: 1,
                    [Op.or]: [
                      {
                        isExpired: 1,
                      },
                      {
                        expiresAt: {
                          [Op.gte]: moment(Date.now())
                            .tz("Asia/Karachi")
                            .format("YYYY-MM-DDTHH:mm:ss"),
                        },
                      },
                    ],
                  },
                  include: [
                    { model: Users, include: [{ model: UsersDetails }] },
                  ],
                },
              ],
            });
            result.map((x, i, arr) => {
              x.dataValues["merchantDetails"] = merch;
              x.dataValues["CampaignImageData"] = campImage;
              x.dataValues["voucherStatus"] = "Expired";
            });
            break;

          case 4:
            try {
              camp = await Campaign.findOne({
                where: {
                  id: campaignId,
                },
              });
              campImage = await ImageData.findAll({
                where: { imageType: "Campaign", typeId: campaignId },
              });
              merch = await MerchantDetails.findAll({
                where: { userId: camp.merchantId },
                include: [
                  { model: db.users, include: [{ model: db.usersdetail }] },
                ],
              });

              likess = await db.LikeModel.findAll({
                where: { likedId: merch[0].userId },
                include: [
                  {
                    model: db.users,
                    where: {
                      isBlocked: 0,
                      isDelete: 0,
                    },
                  },
                ],
              });

              merch.map((x, i, arr) => {
                x.dataValues["Likes"] = likess;
              });
              result = await Campaign.findAll({
                where: {
                  id: campaignId,
                },
                include: [
                  {
                    model: VoucherRedeeme,
                    include: [
                      { model: Users, include: [{ model: UsersDetails }] },
                    ],
                    where: {
                      statusId: 2,
                    },
                  },
                  {
                    model: CampaignDetail,
                    include: [
                      {
                        model: Product,
                      },
                    ],
                  },
                  {
                    model: VoucherShare,
                    include: [
                      { model: Users, include: [{ model: UsersDetails }] },
                      {
                        model: Users,
                        as: "Receiver",
                        include: [{ model: UsersDetails }],
                      },
                    ],
                  },
                ],
              });
              result.map((x, i, arr) => {
                x.dataValues["merchantDetails"] = merch;
                x.dataValues["CampaignImageData"] = campImage;
                x.dataValues["voucherStatus"] = "Redeemed";
              });
            } catch (e) {}

            break;
          case 5:
            try {
              camp = await Campaign.findOne({
                where: {
                  id: campaignId,
                },
              });
              campImage = await ImageData.findAll({
                where: { imageType: "Campaign", typeId: campaignId },
              });
              merch = await MerchantDetails.findAll({
                where: { userId: camp.merchantId },
                include: [
                  { model: db.users, include: [{ model: db.usersdetail }] },
                ],
              });

              likess = await db.LikeModel.findAll({
                where: { likedId: merch[0].userId },
                include: [
                  {
                    model: db.users,
                    where: {
                      isBlocked: 0,
                      isDelete: 0,
                    },
                  },
                ],
              });

              merch.map((x, i, arr) => {
                x.dataValues["Likes"] = likess;
              });
              result = await Campaign.findAll({
                where: {
                  id: campaignId,
                },
                include: [
                  {
                    model: VoucherRedeeme,
                    include: [
                      { model: Users, include: [{ model: UsersDetails }] },
                    ],
                    where: {
                      statusId: 2,
                    },
                  },
                  {
                    model: CampaignDetail,
                    include: [
                      {
                        model: Product,
                      },
                    ],
                  },
                  {
                    model: VoucherShare,
                    where: { statusId: 3 },
                    include: [
                      { model: Users, include: [{ model: UsersDetails }] },
                      {
                        model: Users,
                        as: "Receiver",
                        include: [{ model: UsersDetails }],
                      },
                    ],
                  },
                ],
              });
              result.map((x, i, arr) => {
                x.dataValues["merchantDetails"] = merch;
                x.dataValues["CampaignImageData"] = campImage;
                x.dataValues["voucherStatus"] = "Declined";
              });
            } catch (e) {}
            break;
        }

        if (result.length == 0)
          return res
            .status(200)
            .send({ success: false, data: [], message: "No data found" });

        res
          .status(200)
          .send({ success: true, data: result, message: "Data found" });
      }
    } catch (e) {
      res
        .status(500)
        .send({ success: false, data: e, message: "their is some error " });
    }
  };

  FullActivityLogHistory = async (req, res) => {
    try {
      let ActionId = parseInt(req.params.ActionId);
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let end = PageNumber * PageSize;
      let start = end - PageSize;
      let totalrecords = 0;
      let result = [];
      let data = [];
      let shareanother = [];
      let RedeemedVoucher, SendVoucher, ReceiveVoucher, ExpireOrders;
      let currentuserid = req.user.id;
      let currentDate = moment(Date.now())
        .tz("Asia/Karachi")
        .format("YYYY-MM-DDTHH:mm:ss");
      function paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice(
          (page_number - 1) * page_size,
          page_number * page_size
        );
      }
      // ActionId 1--> show All
      // ActionId 2--> show SendVoucher
      // ActionId 3--> show ReceiveVoucher
      // ActionId 4--> show Redeemed
      // ActionId 5--> show ExpireOrders

      if (ActionId > 0 && ActionId < 6) {
        switch (ActionId) {
          case 1:
            SendVoucher = await VoucherShare.findAll({
              where: { senderId: currentuserid },
              include: [
                {
                  model: VoucherStatus,
                },
                {
                  model: db.users,
                  include: [
                    {
                      model: ImageData,
                      required: false,

                      where: {
                        imageType: "User",
                      },
                    },
                    {
                      model: db.usersdetail,
                    },
                  ],
                },
                {
                  model: db.users,
                  as: "Receiver",
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      where: {
                        imageType: "User",
                      },
                    },
                    {
                      model: db.usersdetail,
                    },
                  ],
                },
                {
                  model: VoucherGen,
                },
                {
                  model: VoucherGen,
                  as: "vouchShare",
                },
                {
                  model: Campaign,
                  include: [
                    {
                      model: CampaignDetail,
                    },

                    {
                      model: db.users,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },

                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.MerchantDetails,
                        },
                        {
                          model: db.LikeModel,
                          as: "Likes",
                          include: [
                            {
                              model: db.users,
                              where: {
                                isBlocked: 0,
                                isDelete: 0,
                              },
                            },
                          ],
                        },
                        {
                          model: Product,
                          where: { isActive: true },
                        },
                      ],
                    },

                    {
                      model: db.ShippingModel,
                    },
                  ],
                },
                {
                  model: Product,
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      association: Product.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
              ],
              order: [["updatedAt", "DESC"]],
            });

            ReceiveVoucher = await VoucherShare.findAll({
              where: { receiverId: currentuserid },
              include: [
                {
                  model: VoucherStatus,
                },
                {
                  model: db.users,
                  include: [
                    {
                      model: ImageData,
                      required: false,

                      where: {
                        imageType: "User",
                      },
                    },
                    {
                      model: db.usersdetail,
                    },
                  ],
                },
                {
                  model: db.users,
                  as: "Receiver",
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      where: {
                        imageType: "User",
                      },
                    },
                    {
                      model: db.usersdetail,
                    },
                  ],
                },
                {
                  model: VoucherGen,
                },
                {
                  model: VoucherGen,
                  as: "vouchShare",
                },
                {
                  model: Campaign,
                  include: [
                    {
                      model: CampaignDetail,
                    },

                    {
                      model: db.users,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },

                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.MerchantDetails,
                        },
                        {
                          model: db.LikeModel,
                          as: "Likes",
                          include: [
                            {
                              model: db.users,
                              where: {
                                isBlocked: 0,
                                isDelete: 0,
                              },
                            },
                          ],
                        },
                        {
                          model: Product,
                          where: { isActive: true },
                        },
                      ],
                    },

                    {
                      model: db.ShippingModel,
                    },
                  ],
                },
                {
                  model: Product,
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      association: Product.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
              ],
              order: [["updatedAt", "DESC"]],
            });

            RedeemedVoucher = await VoucherRedeeme.findAll({
              where: { userId: currentuserid },
              include: [
                {
                  model: db.orders,
                  include: [
                    {
                      model: VoucherStatus,
                    },
                  ],
                },
                {
                  model: DeliveryOption,
                },
                {
                  model: db.deliveryType,
                },
                {
                  model: VoucherMerchantRedeeme,
                },
                {
                  model: VoucherStatus,
                },
                {
                  model: VoucherGen,
                  include: [
                    {
                      model: Product,
                      include: [
                        {
                          model: ImageData,
                          required: false,
                          association: Product.hasMany(db.imageData, {
                            foreignKey: "typeId",
                          }),
                          where: {
                            imageType: "Product",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  model: Campaign,
                  include: [
                    {
                      model: CampaignDetail,
                    },

                    {
                      model: db.users,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },

                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.MerchantDetails,
                        },
                        {
                          model: db.imageData,
                          where: {
                            imageType: "User",
                          },

                        },
                        {
                          model: db.LikeModel,
                          as: "Likes",
                          include: [
                            {
                              model: db.users,
                              where: {
                                isBlocked: 0,
                                isDelete: 0,
                              },
                            },
                          ],
                        },
                        {
                          model: Product,
                          where: { isActive: true },
                        },
                      ],
                    },

                    {
                      model: db.ShippingModel,
                    },
                  ],
                },
              ],
              order: [["updatedAt", "DESC"]],
            });

            ExpireOrders = await VoucherGen.findAll({
              where: { userId: currentuserid, isExpired: 1, isActive: 0,  
                expiresAt: {  [db.Sequelize.Op.lte]: moment(Date.now())
                          .tz("Asia/Karachi")
                          .format("YYYY-MM-DDTHH:mm:ss"),
                      },
              },

              include: [
                {
                  model: Users,
                },
                {
                  model: Product,
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      association: Product.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
                {
                  model: Campaign,
                  include: [
                    {
                      model: CampaignDetail,
                    },

                    {
                      model: db.users,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },

                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.MerchantDetails,
                        },
                        {
                          model: db.LikeModel,
                          as: "Likes",
                          include: [
                            {
                              model: db.users,
                              where: {
                                isBlocked: 0,
                                isDelete: 0,
                              },
                            },
                          ],
                        },
                        {
                          model: Product,
                          where: { isActive: true },
                        },
                      ],
                    },

                    {
                      model: db.ShippingModel,
                    },
                  ],
                },
                {
                  model: VoucherRedeeme,
                  as: "RedeemeVo",
                  where: { statusId: { [Op.ne]: 3 } },
                  required: false,
                },
                {
                  model: VoucherShare,
                  as: "vouchShare",
                  required: false,
                },
              ],
              order: [["updatedAt", "DESC"]],
            });

            SendVoucher.map((x, i, arr) => {
              x.dataValues["Actiontype"] = 2;
              data.push(x);
            });
            ReceiveVoucher.map((x, i, arr) => {
              x.dataValues["Actiontype"] = 3;
              data.push(x);
            });
            RedeemedVoucher.map((x, i, arr) => {
              x.dataValues["Actiontype"] = 4;
              data.push(x);
            });

            ExpireOrders.map((x, i, arr) => {
              if (x.RedeemeVo.length === 0 && x.vouchShare.length === 0) {
                x.dataValues["Actiontype"] = 5;
                data.push(x);
              } else if (x.RedeemeVo.length === 0 && x.vouchShare.length > 0) {
                shareanother = [];
                x.vouchShare.map((y, i, arr) => {
                  if (y.isActive === true && y.statusId === 2) {
                    shareanother.push(y);
                  }
                });
                if (shareanother.length === 0) {
                  x.dataValues["Actiontype"] = 5;
                  data.push(x);
                }
              }
            });
            let dataholder = [];
            dataholder = _.sortBy(data, "updatedAt").reverse();
            totalrecords = dataholder.length;

            result = paginate(dataholder, PageSize, PageNumber);
            break;

          case 2:
            SendVoucher = await VoucherShare.findAll({
              offset: start,
              limit: parseInt(PageSize),
              where: { senderId: currentuserid },
              include: [
                {
                  model: VoucherStatus,
                },
                {
                  model: db.users,
                  include: [
                    {
                      model: ImageData,
                      required: false,

                      where: {
                        imageType: "User",
                      },
                    },
                    {
                      model: db.usersdetail,
                    },
                  ],
                },
                {
                  model: db.users,
                  as: "Receiver",
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      where: {
                        imageType: "User",
                      },
                    },
                    {
                      model: db.usersdetail,
                    },
                  ],
                },
                {
                  model: VoucherGen,
                },
                {
                  model: VoucherGen,
                  as: "vouchShare",
                },
                {
                  model: Campaign,
                  include: [
                    {
                      model: CampaignDetail,
                    },

                    {
                      model: db.users,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },

                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.MerchantDetails,
                        },
                        {
                          model: db.LikeModel,
                          as: "Likes",
                          include: [
                            {
                              model: db.users,
                              where: {
                                isBlocked: 0,
                                isDelete: 0,
                              },
                            },
                          ],
                        },
                        {
                          model: Product,
                          where: { isActive: true },
                        },
                      ],
                    },

                    {
                      model: db.ShippingModel,
                    },
                  ],
                },
                {
                  model: Product,
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      association: Product.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
              ],
              order: [["updatedAt", "DESC"]],
            });

            result = SendVoucher;

            let countSendVoucher = await VoucherShare.count({
              where: { senderId: currentuserid, statusId: { [Op.ne]: 4 } },
              col: "id",
            });
            totalrecords = countSendVoucher;
            break;

          case 3:
            ReceiveVoucher = await VoucherShare.findAll({
              offset: start,
              limit: parseInt(PageSize),
              where: { receiverId: currentuserid },
              include: [
                {
                  model: db.users,
                  include: [
                    {
                      model: ImageData,
                      required: false,

                      where: {
                        imageType: "User",
                      },
                    },
                    {
                      model: db.usersdetail,
                    },
                  ],
                },
                {
                  model: db.users,
                  as: "Receiver",
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      where: {
                        imageType: "User",
                      },
                    },
                    {
                      model: db.usersdetail,
                    },
                  ],
                },
                {
                  model: VoucherGen,
                },
                {
                  model: VoucherGen,
                  as: "vouchShare",
                },
                {
                  model: Campaign,
                  include: [
                    {
                      model: CampaignDetail,
                    },

                    {
                      model: db.users,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },

                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.MerchantDetails,
                        },
                        {
                          model: db.LikeModel,
                          as: "Likes",
                          include: [
                            {
                              model: db.users,
                              where: {
                                isBlocked: 0,
                                isDelete: 0,
                              },
                            },
                          ],
                        },
                        {
                          model: Product,
                          where: { isActive: true },
                        },
                      ],
                    },

                    {
                      model: db.ShippingModel,
                    },
                  ],
                },
                {
                  model: Product,
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      association: Product.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
              ],
              order: [["updatedAt", "DESC"]],
            });
            result = ReceiveVoucher;
            let countReceiverVoucher = await VoucherShare.count({
              where: { receiverId: currentuserid },
              col: "id",
            });
            totalrecords = countReceiverVoucher;
            break;

          case 4:
            try {
              RedeemedVoucher = await VoucherRedeeme.findAll({
                offset: start,
                limit: parseInt(PageSize),
                where: { userId: currentuserid },
                include: [
                  {
                    model: db.orders,
                    include: [
                      {
                        model: VoucherStatus,
                      },
                    ],
                  },
                  {
                    model: DeliveryOption,
                  },
                  {
                    model: db.deliveryType,
                  },
                  {
                    model: VoucherMerchantRedeeme,
                  },
                  {
                    model: VoucherStatus,
                  },
                  {
                    model: VoucherGen,
                    include: [
                      {
                        model: Product,
                        include: [
                          {
                            model: ImageData,
                            required: false,
                            association: Product.hasMany(db.imageData, {
                              foreignKey: "typeId",
                            }),
                            where: {
                              imageType: "Product",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    model: Campaign,
                    include: [
                      {
                        model: CampaignDetail,
                      },

                      {
                        model: db.users,
                        where: {
                          isBlocked: 0,
                          isDelete: 0,
                        },

                        include: [
                          {
                            model: db.usersdetail,
                          },
                          {
                            model: db.MerchantDetails,
                          },
                          {
                            model: db.imageData,
                            where: {
                              imageType: "User",
                            },

                          },
                          {
                            model: db.LikeModel,
                            as: "Likes",
                            include: [
                              {
                                model: db.users,
                                where: {
                                  isBlocked: 0,
                                  isDelete: 0,
                                },
                              },
                            ],
                          },
                          {
                            model: Product,
                            where: { isActive: true },
                          },
                        ],
                      },

                      {
                        model: db.ShippingModel,
                      },
                    ],
                  },
                ],
                order: [["updatedAt", "DESC"]],
              });
              result = RedeemedVoucher;

              let countRedeemedVoucher = await VoucherRedeeme.count({
                where: { userId: currentuserid },
                col: "id",
              });
              totalrecords = countRedeemedVoucher;
            } catch (e) {}

            break;

          case 5:
            try {
              ExpireOrders = await VoucherGen.findAll({
                where: { userId: currentuserid, isExpired: 1, isActive: 0,
                  expiresAt: {  [db.Sequelize.Op.lte]: moment(Date.now())
                    .tz("Asia/Karachi")
                    .format("YYYY-MM-DDTHH:mm:ss"),
                },
                },
                // offset: start,
                // limit: parseInt(PageSize),
                include: [
                  {
                    model: Users,
                  },
                  {
                    model: Product,
                    include: [
                      {
                        model: ImageData,
                        required: false,
                        association: Product.hasMany(db.imageData, {
                          foreignKey: "typeId",
                        }),
                        where: {
                          imageType: "Product",
                        },
                      },
                    ],
                  },
                  {
                    model: Campaign,
                    include: [
                      {
                        model: CampaignDetail,
                      },

                      {
                        model: db.users,
                        where: {
                          isBlocked: 0,
                          isDelete: 0,
                        },

                        include: [
                          {
                            model: db.usersdetail,
                          },
                          {
                            model: db.MerchantDetails,
                          },
                          {
                            model: db.LikeModel,
                            as: "Likes",
                            include: [
                              {
                                model: db.users,
                                where: {
                                  isBlocked: 0,
                                  isDelete: 0,
                                },
                              },
                            ],
                          },
                          {
                            model: Product,
                            where: { isActive: true },
                          },
                        ],
                      },

                      {
                        model: db.ShippingModel,
                      },
                    ],
                  },
                  {
                    model: VoucherRedeeme,
                    as: "RedeemeVo",
                    where: { statusId: { [Op.ne]: 3 } },
                    required: false,
                  },
                  {
                    model: VoucherShare,
                    as: "vouchShare",
                    required: false,
                  },
                ],
                order: [["updatedAt", "DESC"]],
              });
              ExpireOrders.map((x, i, arr) => {
                if (x.RedeemeVo.length === 0 && x.vouchShare.length === 0) {
                  result.push(x);
                } else if (
                  x.RedeemeVo.length === 0 &&
                  x.vouchShare.length > 0
                ) {
                  shareanother = [];
                  x.vouchShare.map((y, i, arr) => {
                    if (y.isActive === true && y.statusId === 2) {
                      shareanother.push(y);
                    }
                  });
                  if (shareanother.length === 0) {
                    result.push(x);
                  }
                }
              });
              totalrecords = result.length;
              result = paginate(result, PageSize, PageNumber);
            } catch (e) {}
            break;
        }

        if (result.length == 0) {
          return res
            .status(200)
            .send({ success: false, data: [], message: "No data found" });
        } else {
          let countdata = {
            page: parseInt(PageNumber),
            pages: Math.ceil(totalrecords / parseInt(PageSize)),
            totalRecords: totalrecords,
          };
          res.status(200).send({
            success: true,
            data: result,
            datacount: countdata,
            message: "Data found",
          });
        }
      }
    } catch (e) {
      res
        .status(500)
        .send({ success: false, data: e, message: "their is some error " });
    }
  };

  //Detailedin activitylogHistory
  DetailedinActivityLogHistory = async (req, res) => {
    try {
      let ActionId = parseInt(req.params.ActionId);
      let Voucherid = parseInt(req.params.VoucherId);
      let result = [];
      let PendingOrder,
        DeliveredOrder,
        SendVoucher,
        ReceiveVoucher,
        ExpireVouchers;
      let currentuserid = req.user.id;
      let currentDate = moment(Date.now())
        .tz("Asia/Karachi")
        .format("YYYY-MM-DDTHH:mm:ss");

      // ActionId 1--> show All
      // ActionId 2--> show Given
      // ActionId 3--> show Expired
      // ActionId 4--> show Redeemed
      // ActionId 5--> show Declined

      if (ActionId > 0 && ActionId < 6) {
        switch (ActionId) {
          case 1:
            DeliveredOrder = await Orders.findOne({
              where: { redeemeVoucherId: Voucherid, userId: currentuserid },
              include: [
                {
                  model: VoucherStatus,
                },
                {
                  model: VoucherGen,
                  include: [
                    {
                      model: Product,
                      include: [
                        {
                          model: ImageData,
                          required: false,
                          association: Product.hasMany(db.imageData, {
                            foreignKey: "typeId",
                          }),
                          where: {
                            imageType: "Product",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  model: Campaign,
                  include: [
                    {
                      model: CampaignDetail,
                    },

                    {
                      model: db.users,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },

                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.MerchantDetails,
                        },
                        {
                          model: db.LikeModel,
                          as: "Likes",
                          include: [
                            {
                              model: db.users,
                              where: {
                                isBlocked: 0,
                                isDelete: 0,
                              },
                            },
                          ],
                        },
                        {
                          model: Product,
                          where: { isActive: true },
                        },
                      ],
                    },
                  ],
                },
              ],
            });
            if (!DeliveredOrder) {
              DeliveredOrder = await VoucherRedeeme.findOne({
                where: {
                  voucherId: Voucherid,
                  userId: currentuserid,
                  statusId: 4,
                },
                include: [
                  {
                    model: VoucherStatus,
                  },
                  {
                    model: VoucherGen,
                    include: [
                      {
                        model: Product,
                        include: [
                          {
                            model: ImageData,
                            required: false,
                            association: Product.hasMany(db.imageData, {
                              foreignKey: "typeId",
                            }),
                            where: {
                              imageType: "Product",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    model: Campaign,
                    include: [
                      {
                        model: CampaignDetail,
                      },

                      {
                        model: db.users,
                        where: {
                          isBlocked: 0,
                          isDelete: 0,
                        },

                        include: [
                          {
                            model: db.usersdetail,
                          },
                          {
                            model: db.MerchantDetails,
                          },
                          {
                            model: db.LikeModel,
                            as: "Likes",
                            include: [
                              {
                                model: db.users,
                                where: {
                                  isBlocked: 0,
                                  isDelete: 0,
                                },
                              },
                            ],
                          },
                          {
                            model: Product,
                            where: { isActive: true },
                          },
                        ],
                      },
                    ],
                  },
                ],
              });
            }
            result = DeliveredOrder;
            break;

          case 2:
            SendVoucher = await VoucherShare.findAll({
              where: { referenceId: Voucherid, senderId: currentuserid },
              include: [
                {
                  model: VoucherGen,
                  as: "vouchShare",
                },
                {
                  model: db.users,
                  include: [
                    {
                      model: ImageData,
                      required: false,

                      where: {
                        imageType: "User",
                      },
                    },
                  ],
                },
                {
                  model: db.users,
                  as: "Receiver",
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      where: {
                        imageType: "User",
                      },
                    },
                  ],
                },
              ],
            });
            result = SendVoucher;
            break;

          case 3:
            ReceiveVoucher = await VoucherShare.findAll({
              where: { vouchergenId: Voucherid, receiverId: currentuserid },
              include: [
                {
                  model: VoucherGen,
                },
                {
                  model: db.users,
                  as: "Receiver",
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      where: {
                        imageType: "User",
                      },
                    },
                  ],
                },
                {
                  model: Campaign,
                  include: [
                    {
                      model: CampaignDetail,
                    },

                    {
                      model: db.users,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },

                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.MerchantDetails,
                        },
                        {
                          model: db.LikeModel,
                          as: "Likes",
                          include: [
                            {
                              model: db.users,
                              where: {
                                isBlocked: 0,
                                isDelete: 0,
                              },
                            },
                          ],
                        },
                        {
                          model: Product,
                          where: { isActive: true },
                        },
                      ],
                    },
                  ],
                },
                {
                  model: Product,
                  include: [
                    {
                      model: ImageData,
                      required: false,
                      association: Product.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
              ],
            });
            result = ReceiveVoucher;
            break;

          case 4:
            try {
              let RedeemedVoucher = await VoucherRedeeme.findAll({
                offset: start,
                limit: parseInt(PageSize),
                where: { userId: currentuserid, voucherId: Voucherid },
                include: [
                  {
                    model: db.orders,
                    include: [
                      {
                        model: VoucherStatus,
                      },
                    ],
                  },
                  {
                    model: DeliveryOption,
                  },
                  {
                    model: db.deliveryType,
                  },
                  {
                    model: VoucherMerchantRedeeme,
                  },
                  {
                    model: VoucherStatus,
                  },
                  {
                    model: VoucherGen,
                    include: [
                      {
                        model: Product,
                        include: [
                          {
                            model: ImageData,
                            required: false,
                            association: Product.hasMany(db.imageData, {
                              foreignKey: "typeId",
                            }),
                            where: {
                              imageType: "Product",
                            },
                          },
                        ],
                      },
                      {
                        model: VoucherShare,
                        required: false,
                        where: {
                          receiverId: currentuserid,
                          isActive: 1,
                          statusId: 2,
                        },
                      },
                    ],
                  },
                  {
                    model: Campaign,
                    include: [
                      {
                        model: CampaignDetail,
                      },

                      {
                        model: db.users,
                        where: {
                          isBlocked: 0,
                          isDelete: 0,
                        },

                        include: [
                          {
                            model: db.usersdetail,
                          },
                          {
                            model: db.MerchantDetails,
                          },
                          {
                            model: db.LikeModel,
                            as: "Likes",
                            include: [
                              {
                                model: db.users,
                                where: {
                                  isBlocked: 0,
                                  isDelete: 0,
                                },
                              },
                            ],
                          },
                          {
                            model: Product,
                            where: { isActive: true },
                          },
                        ],
                      },
                    ],
                  },
                ],
                order: [["updatedAt", "DESC"]],
              });
              result = RedeemedVoucher;
            } catch (e) {}

            break;

          case 5:
            try {
              ExpireVouchers = await VoucherGen.findOne({
                where: { id: Voucherid, isExpired: 1 },
                include: [
                  {
                    model: VoucherShare,
                    required: false,
                    where: {
                      receiverId: currentuserid,
                    },
                  },
                ],
              });
              result = ExpireVouchers;
            } catch (e) {}
            break;
        }

        if (result.length == 0) {
          return res
            .status(200)
            .send({ success: false, data: [], message: "No data found" });
        } else {
          // let countdata = {
          //   page: parseInt(PageNumber),
          //   pages: Math.ceil(totalrecords / parseInt(PageSize)),
          //   totalRecords: totalrecords,
          // };
          res.status(200).send({
            success: true,
            data: result,
            //datacount: countdata,
            message: "Data found",
          });
        }
      }
    } catch (e) {
      res
        .status(500)
        .send({ success: false, data: e, message: "their is some error " });
    }
  };
}

module.exports = RedeeneVoucher;
