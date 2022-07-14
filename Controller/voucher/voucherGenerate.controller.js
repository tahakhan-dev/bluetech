const _ = require("lodash");
const randomstring = require("crypto-random-string");
const db = require("../../Model");
const { ExpireyCheck } = require("../extras/CampaignFeatures");
const {
  TransactionStripe,
  TransactionPayPal,
} = require("../extras/Transaction");
const { result } = require("lodash");
const Voucher = db.VoucherGen;
const User = db.users;
const Notification = db.notification;
const CampaignDetail = db.campaignDetail;
const Transaction = db.transaction;
const TransactionDetail = db.transactionDetail;
const { findCamaing, updateCamaing } = require("./voucher.service");
const fcm = require("../../FCMNotification/fcmnotificatins");
class VoucherGenerate {
  checkPaypal = async (req, res) => {
    TransactionPayPal(req.body.token)
      .then((response) => {
        res.status(200).send({ success: true, response });
      })
      .catch((err) => {
        res.status(500).send({ success: false, message: err.message });
      });
  };

  generateVoucher = async ({ req, res, info }) => {
    try {
      Voucher.create(info);
      return res
        .status(200)
        .send({ success: true, message: "Voucher Generated Succussfully!" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  handlePromo = async ({ code, userId }) => {
    try {
      if (code) {
        let p_code = await db.promoCode.findOne({
          raw: true,
          where: { code: code, isActive: true },
        });

        let _ = await db.AppliedPromocode.create({
          userId: userId,
          promocodeId: p_code.id,
        });

        await db.promoCode.update(
          { quantity: p_code.quantity - 1 },
          {
            where: {
              id: p_code.id,
            },
          }
        );
        return { success: true };
      }
    } catch (error) {
      return { message: error, success: false };
    }
  };

  create = async (req, res) => {
    try {
      let details = req.body.details;
      let error = [];
      let arra = [];
      let campaingsarray = [];
      let campID = [];
      let resultList;
      let count = 0;
      let productqtys;
      let generateVoucher;
      let VoucherDate = new Date().toISOString().substring(0, 7);
      if (details) {
        let cart = details.cart;
        cart.forEach(async (cartVal, index, array) => {
          let getcampaing = await findCamaing(cartVal.camid);
          if (!getcampaing) {
            error.push({
              message: "Campaign Not Found or Has Been Expired",
              campaingId: cartVal.camid,
              getcampaing,
            });
          } else {
            let getexpierydate = await ExpireyCheck(
              getcampaing.campaignExpiresAt
            );
            if (!getexpierydate) {
              await updateCamaing(getcampaing.id);
              error.push({
                message:
                  "You Can Not Generate Voucher For The Desired Product Limit Is Expired",
                Campaing: cartVal.camid,
              });
            }
            campaingsarray.push(getcampaing);
            campID.push(cartVal.camid);
          }
          count++;
          if (array.length == count) {
            if (error.length) {
              return res.status(500).send({ success: false, message: error });
            }
            const campaigsdetails = await CampaignDetail.findAll({
              raw: true,
              where: {
                campaignId: campID,
              },
            });

            let transaction = {
              userId: req.user.id,
              netAmount: details.paymentInfo.netAmount,
              salesTax: details.paymentInfo.salesTax,
              discount: details.paymentInfo.discount,
              paymentType: details.paymentInfo.paymentType,
              paymentId: details.paymentInfo.paymentId,
            };

            transaction.transactionCode = randomstring({
              length: 10,
              type: "distinguishable",
            });
            let check_trans = await Transaction.findOne({
              where: { paymentId: transaction.paymentId },
            });

            if (check_trans)
              return res.status(200).send({
                message: "Charge Id Already Exist",
                
              });
            let transactioncreate = await Transaction.create(transaction);

            if (!transactioncreate.isNewRecord) {
              let payloads = [];
              let countter = 0;
              let campaingIDs = [];
              campaingsarray.forEach(async (val, index, array) => {
                let payload = {
                  transactionId: transactioncreate.id,
                  transactionCode: transactioncreate.transactionCode,
                  campaignId: val.id,
                  camName: val.name,
                  campAmount: val.campaingAmount,
                };
                campaingIDs.push(val.id);
                payloads.push(payload);
                countter++;
                if (countter == array.length) {
                  let transdetail = await TransactionDetail.bulkCreate(
                    payloads
                  );

                  if (transdetail.length) {
                    const campaigsdetail = await CampaignDetail.findAll({
                      raw: true,
                      where: {
                        campaignId: campaingIDs,
                      },
                    });

                    if (campaigsdetail.length) {
                      let voucerGens = [];
                      let vouchercount = 0;
                      campaigsdetail.forEach(async (val, index, array) => {
                        let getcamping = campaingsarray.find(
                          (v) => v.id == val.campaignId
                        );
                        let productqty = parseInt(
                          details.cart[index].camaign_qty
                        );
                        if (val.avaliablityStock < productqty) {
                          error.push({
                            error: {
                              CampaingID: val.id,
                              Qty: productqty,
                              message: `Sorry Vouchers We Need: ${productqtys} Avaliable Voucher: ${val.avaliablityStock}`,
                            },
                          });
                        } else {
                          let diduction = val.avaliablityStock - productqty;
                          arra.push({
                            transicationID: transdetail[index].transactionId,
                            CampaignID: val.campaignId,
                            voucherQuantity: productqty,
                          });
                          await CampaignDetail.update(
                            {
                              avaliablityStock: diduction,
                            },
                            {
                              where: {
                                id: val.id,
                              },
                            }
                          );

                          for (let i = 0; i < productqty; i++) {
                            let voucherGenPayload = {
                              campaignId: val.campaignId,
                              productId: val.productId,
                              userId: req.user.id,
                              expiresAt: getcamping.voucherExpiresAt,
                              transactionDetailId: transdetail[index].id,
                              voucherCreateDate: VoucherDate,
                            };
                            voucherGenPayload.voucherCode = randomstring({
                              length: 10,
                              type: "distinguishable",
                            });
                            voucerGens.push(voucherGenPayload);
                          }
                        }
                        vouchercount++;
                        if (array.length == vouchercount) {
                          if (error.length) {
                            res.send(error);
                          } else {
                            generateVoucher = await Voucher.bulkCreate(
                              voucerGens
                            );

                            if (!generateVoucher)
                              return res.status(404).send({
                                success: false,
                                message:
                                  "Their is Some error in creating voucher",
                              });
                            //problem
                            if (arra.length <= 1) {
                              var vouchid = generateVoucher[0].id;
                              var vouchlen = generateVoucher.length - 1;
                              var vouchSum = vouchid + vouchlen;

                              await TransactionDetail.update(
                                { voucherRange: `${vouchid}-${vouchSum}` },
                                {
                                  where: {
                                    transactionId: arra[0].transicationID,
                                    campaignId: arra[0].CampaignID,
                                  },
                                }
                              );
                            } else {
                              resultList = [
                                ...generateVoucher
                                  .reduce((mp, o) => {
                                    if (!mp.has(o.campaignId))
                                      mp.set(o.campaignId, {
                                        ...o,
                                        count: 0,
                                      });
                                    mp.get(o.campaignId).count++;
                                    return mp;
                                  }, new Map())
                                  .values(),
                              ];
                              if (resultList.length === arra.length) {
                                resultList.forEach(async (res, i) => {
                                  var vouchid = res.dataValues.id;
                                  var vouchlen = res.count;
                                  var vouchSum = vouchid + vouchlen - 1;
                                  //if (res.dataValues.campaignId == arra[i].CampaignID)
                                  // {
                                  let query = `update transactionDetails set voucherRange ='${vouchid}-${vouchSum}'
                                             where transactionId = ${arra[i].transicationID} And campaignId = ${arra[i].CampaignID};`;
                                  await db.sequelize.query(query);
                                  // }
                                });
                              }
                            }
                          }

                          // if (generateVoucher.length) {
                          //Notification work
                          let Deviceid = await User.findOne({
                            where: {
                              id: req.user.id,
                            },
                          });

                          let getcampaing2 = await findCamaing(val.campaignId);
                          console.log(getcampaing2);
                          let descp = `${getcampaing2.name} campaign was purchased from ${getcampaing2.user.merchantDetails[0].storeName}`;
                          var message = {
                            to: Deviceid.fcmtoken,
                            notification: {
                              title: "givees",
                              body: descp,
                            },
                          };
                          fcm.send(message, async function (err, response) {
                            if (err) {
                              await Notification.create({
                                senderId: req.user.id,
                                receiverId: req.user.id,
                                Body: descp,
                                Title: `${getcampaing2.name}-${getcampaing2.user.merchantDetails[0].storeName}`,
                                RouteId: 11,
                                IsAction: 0,
                                IsCount: 1,
                              });
                            } else {
                              await Notification.create({
                                senderId: req.user.id,
                                receiverId: req.user.id,
                                Body: descp,
                                Title: `${getcampaing2.name}-${getcampaing2.user.merchantDetails[0].storeName}`,
                                RouteId: 11,
                                IsAction: 0,
                                IsCount: 1,
                              });
                            }
                          });
                          res.status(200).send({
                            success: true,
                            data: getcampaing2,
                            message: "Voucher Generated SUccessfully",
                          });
                        }
                      });
                    }
                  }
                }
              });
            }
          }
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  verify = async (token) => {
    try {
      let verfication = token;

      switch (verfication.paymentType) {
        case "stripe":
          try {
            let stripe = await TransactionStripe(token.paymentId);
            if (stripe.charges.data[0].paid) {
              return true;
            } else {
              return false;
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
          break;

        case "paypal":
          try {
            let paypal = await TransactionPayPal(token.paymentId);

            if (paypal.success) {
              return paypal.success;
            }
          } catch (error) {
            return { success: false, message: error.message };
          }
          break;

        default:
          break;
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };
}

module.exports = VoucherGenerate;
