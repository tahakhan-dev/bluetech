const _ = require("lodash");
const db = require("../../Model");
const randomstring = require("crypto-random-string");
const moment = require("moment");
const {
  create,
  getCampaing,
  getCampaingByMerchantId,
  getAllCampaing,
  searchCampaignByMerchantUserName,
  getAllCampaingSearch,
  update_step_1,
  update_step_2,
  searchCampaignByProductName,
} = require("../extras/CampaignRepo/CampaignRepo");
const fs = require("fs");
const { validate } = require("../../Model/campaign.model");
const cloudinary = require("../../config/cloudinary.config");
const FindPermission = require("../extras/FindPermission");
const { campaign, campaignDetail } = require("../../Model");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const limit = require("../extras/DataLimit");
const Merchant = db.MerchantDetails;
const detail = db.campaignDetail;
const CampaignDetail = db.campaignDetail;
const AppBanner = db.AppBannerModel;
const product = db.product;
const Product = db.product;
const ImageData = db.imageData;
const users = db.users;
const VoucherGen = db.VoucherGen;
const Op = db.Sequelize.Op;

class Campaign {
  distance = (lat1, lon1, lat2, lon2) => {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;

    return dist;
  };

  create = async (req, res) => {
    let { error } = validate(req.body);
    if (error)
      return res.status(400).send({
        success: false,
        message: error.details[0].message,
      });

    let getPermission = await FindPermission(req.user.id);

    if (getPermission) {
      if (getPermission.canCreateCampion) {
        const campaign = _.pick(req.body, [
          "name",
          "merchantId",
          "description",
          "Discount",
          "campaignStartsAt",
          "campaignExpiresAt",
          "voucherExpiresAt",
          "shippingStatus",
          "curbSideFlag",
          "isActive",
          "counter",
          "campaingAmount",
          "campaignLongName",
          "lat",
          "lng",
        ]);

        campaign.campaignCode = randomstring({
          length: 10,
          type: "distinguishable",
        });

        let campaingDet = await db.campaign.findAll({
          where: { name: campaign.name, isActive: 1, isExpired: 0 },
        });

        if (campaingDet.length > 0) {
          return res
            .status(400)
            .send({ success: false, message: "This name is already exists!" });
        }

        let merchant = await Merchant.findOne({
          where: {
            userId: req.body.merchantId,
          },
        });
        if (!merchant)
          return res.status(200).send({
            code: 404,
            success: true,
            message: "This merchant Is Not Avaliable",
          });

        if (!req.files.length)
          return res.status(200).send({
            code: 501,
            success: false,
            message: "Image is required.",
          });
        else {
          let files = req.files;
          let imgArr = [];
          const rndStr = randomstring({ length: 10 });
          const dir = `uploads/campaigns/${rndStr}/thumbnail/`;
          let sliderArr = [];
          let counter = 0;
          Promise.all(
            files.map((x) => {
              return new Promise((resolve, reject) => {
                cloudinary
                  .uploads(x.path, dir)
                  .then((uploadRslt) => {
                    if (uploadRslt) {
                      imgArr.push({
                        imageType: "Campaign",
                        imageId: uploadRslt.id,
                        typeId: null,
                        imageUrl: uploadRslt.url,
                        userId: req.user.id,
                      });
                      sliderArr.push({
                        imageType: "Campaign",
                        imageId: uploadRslt.id,
                        typeId: null,
                        imageUrl: uploadRslt.url,
                        sliderIndex: counter,
                      });
                      counter++;
                      fs.unlinkSync(x.path);
                      resolve();
                    } else {
                      reject({
                        success: false,
                        status: 501,
                        message: "An error occured while uploading the Image.",
                      });
                    }
                  })
                  .catch((error) => {
                    reject({
                      success: false,
                      status: 501,
                      message:
                        error.message ||
                        "An error occured while uploading the Image.",
                    });
                  });
              });
            })
          )
            .then(async (data) => {
              let count = 0;
              let producterror = [];
              JSON.parse(req.body.products).forEach(
                async (vals, index, array) => {
                  try {
                    let result = await product.findOne({
                      where: {
                        id: vals.productid,
                      },
                    });
                    if (result.stock < vals.avaliablityStock) {
                      producterror.push({
                        error: {
                          productName: result.name,
                          stock: result.stock,
                          message: `Given stock: ${vals.avaliablityStock} avaliable Stock: ${result.stock}`,
                        },
                      });
                    }
                    count++;
                    if (count == array.length) {
                      if (producterror.length) {
                        res.status(409).send(producterror);
                      } else {
                        try {
                          create(campaign, req, res, imgArr, sliderArr);
                        } catch (error) {}
                      }
                    }
                  } catch (err) {
                    return res.status(500).send({
                      success: false,
                      message: err.message || "Something Went Wrong",
                    });
                  }
                }
              );
            })
            .catch((error) => {
              res.status(501).send({
                success: false,
                message:
                  error.message ||
                  "An error occured while uploading the Image.",
              });
            });
        }
      } else {
        res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permissions!",
        });
      }
    } else {
      res.status(200).send({
        code: 401,
        success: false,
        message: "You don't have permissions!",
      });
    }
  };

  update_step_1 = async (req, res) => {
    let getPermission = await FindPermission(req.user.id);
    try {
      if (getPermission) {
        if (getPermission.canCreateCampion) {
          const campaign = _.pick(req.body, [
            "name",
            "description",
            "Discount",
            "campaignStartsAt",
            "campaignExpiresAt",
            "voucherExpiresAt",
            "shippingStatus",
            "curbSideFlag",
            "counter",
            "campaingAmount",
            "campaignLongName",
            "lat",
            "lng",
          ]);
          console.log('=============campaign body===================');
          console.log(campaign);
          console.log('=============campaign body===================');

          if (
            campaign.voucherExpiresAt >
            moment(Date.now()).tz("Asia/Karachi").format("YYYY-MM-DDTHH:mm:ss")
          ) {
            await VoucherGen.update(
              { expiresAt: campaign.voucherExpiresAt },
              {
                where: {
                  campaignId: req.params.id,
                },
              }
            );
          }

          if (
            campaign.campaignExpiresAt >
            moment(Date.now()).tz("Asia/Karachi").format("YYYY-MM-DDTHH:mm:ss")
          ) {
            console.log('======================expiry greater than todays date');
            await db.campaign.update(
              { isExpired: 0, isActive: 1 },
              {
                where: {
                  id: req.params.id,
                },
              }
            );
          }

          update_step_1(campaign, req.params.id, req, res);
        } else {
          res.status(200).send({
            code: 401,
            success: false,
            message: "You don't have permissions!",
          });
        }
      } else {
        res.status(401).send({
          code: 401,
          success: false,
          message: "You don't have permissions!",
        });
      }
    } catch (e) {
      res.status(500).send({ success: false, message: e.message });
    }
  };

  update_step_2 = async (req, res) => {
    try {
      const data = _.pick(req.body, ["products"]);
      let logError = [];
      let schema = [];
      let counter = 0;
      data.products.forEach(async (val, index, array) => {
        let campdetail = await detail.findOne({
          where: {
            campaignId: req.params.id,
            productId: val.productid,
          },
        });
        let productdata = await product.findOne({
          where: {
            id: val.productid,
          },
        });
        if (productdata) {
          let currentCampaingStock = campdetail.avaliablityStock;
          let currentProductStock = productdata.stock;
          let additionStock = val.avaliablityStock;

          let addition = currentCampaingStock + additionStock;
          if (addition == currentCampaingStock) {
            schema.push({
              productid: productdata.id,
              qty: val.qty,
              avaliablityStock: addition,
              addstock: additionStock,
            });
          } else if (additionStock > currentProductStock) {
            logError.push({
              error: {
                productName: productdata.name,
                stock: productdata.stock,
                message: `Given stock: ${addition} avaliable Stock: ${productdata.stock}`,
              },
            });
          } else {
            schema.push({
              productid: productdata.id,
              qty: val.qty,
              avaliablityStock: addition,
              addstock: additionStock,
            });
          }
          counter++;
          if (counter == array.length) {
            if (logError.length) {
              res.status(409).send(logError);
            } else {
              await update_step_2(schema, req, res);
            }
          }
        }
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message || "Something Went Wrong",
      });
    }
  };
  getCampaignByLocation = async (req, res) => {
    try {
      let nearestCamp = [];
      const { lat, lng, miles } = req.query;

      let merchantInfo = await db.campaign.findAll({
        raw: true,
        nest: true,
        where: {
          isActive: true,
          isExpired: false,
        },
        include: [
          {
            model: db.campaignDetail,
          },
        ],
      });

      // GET LAT LNG
      for (var i = 0; i < merchantInfo.length; i++) {
        // if this location is within 0.1KM of the user, add it to the list
        if (
          this.distance(
            parseInt(merchantInfo[i].campaignDetails.lat),
            parseInt(merchantInfo[i].campaignDetails.lng),
            lat,
            lng
          ) <= miles
        ) {
          nearestCamp.push(merchantInfo[i]);
        }
      }
      if (nearestCamp.length)
        return res.status(200).send({ success: true, data: nearestCamp });

      return res.status(200).send({ success: true, data: merchantInfo });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Something Went Wrong",
      });
    }
  };

  getcampaings = async (req, res) => {
    try {
      let campaings = await getCampaing(req, req.params.id);
      if (campaings) {
        let countData = {
          page: parseInt(req.query.page),
          pages: Math.ceil(campaings.length / limit.limit),
          totalRecords: campaings.length,
        };
        res.status(200).send({ success: true, campaings, countData });
      }
    } catch (error) {
      return res.status(500).send({
        message: error.message || "Something Went Wrong",
      });
    }
  };

  getcampaingsByMerchantId = async (req, res) => {
    let campaings = await getCampaingByMerchantId(req, req.params.id);
    try {
      let countData = {
        page: parseInt(req.query.page),
        pages: Math.ceil(campaings.length / limit.limit),
        totalRecords: campaings.length,
      };
      return res.status(200).send({ success: true, campaings, countData });
    } catch (error) {
      return res.status(500).send({
        message: error.message || "Something Went Wrong",
      });
    }
  };

  activateCampaign = async (req, res) => {
    try {
      let campaignID = req.params.id;
      let campDetail = await db.campaign.findOne({
        where: {
          id: campaignID,
          isExpired: 1,
          isActive: 0,
        },
      });

      if (!campDetail)
        return res
          .status(404)
          .send({ success: false, data: [], message: "No Campagin Found" });

      if (
        campDetail.campaignExpiresAt >=
        moment(Date.now()).tz("Asia/Karachi").format("YYYY-MM-DDTHH:mm:ss")
      ) {
        await db.campaign.update(
          { isExpired: 0, isActive: 1 },
          { where: { id: campaignID } }
        );
        res
          .status(200)
          .send({ success: true, message: "Campaign Has Been Activated!" });
      } else {
        res.status(404).send({
          success: false,
          data: [],
          message:
            "Set Campaing Expiry date greater than today date to activate campaign",
        });
      }
    } catch (error) {
      return res.status(500).send({
        message: error.message || "Something Went Wrong",
      });
    }
  };

  searchCampaign = async (req, res) => {
    try {
      const search = req.query.search;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      const foundUsers = await searchCampaignByMerchantUserName(search);
      const foundProducts = await searchCampaignByProductName(search);

      const foundCamps = await db.campaign.findAll({
        nest: true,
        where: {
          isActive: true,
          isExpired: false,
          campaignStartsAt: {
            [Op.lte]: moment(Date.now())
              .tz("Asia/Karachi")
              .format("YYYY-MM-DDTHH:mm:ss"),
          },
          campaignExpiresAt: {
            [Op.gte]: moment(Date.now())
              .tz("Asia/Karachi")
              .format("YYYY-MM-DDTHH:mm:ss"),
          },
          [Op.or]: [
            {
              name: {
                [Op.like]: "%" + search + "%",
              },
            },
            {
              description: {
                [Op.like]: "%" + search + "%",
              },
            },
          ],
        },
        include: [
          {
            model: CampaignDetail,
          },

          {
            model: db.ShippingModel,
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
            model: db.campaignLikes,
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
            model: ImageData,
            association: db.campaign.hasMany(db.imageData, {
              foreignKey: "typeId",
            }),
            where: {
              imageType: "Campaign",
            },
          },
        ],
      });

      let countDataCamp = {
        page: parseInt(PageNumber),
        pages: Math.ceil(foundCamps.length / PageSize),
        totalRecords: foundCamps.length,
      };
      let countDataProduct = {
        page: parseInt(PageNumber),
        pages: Math.ceil(foundProducts.length / PageSize),
        totalRecords: foundProducts.length,
      };
      let countDatausers = {
        page: parseInt(PageNumber),
        pages: Math.ceil(foundUsers.length / PageSize),
        totalRecords: foundUsers.length,
      };

      res.status(200).send({
        success: true,
        users: foundUsers.slice(paginations.Start, paginations.End),
        countDatausers,
        campaigns: foundCamps.slice(paginations.Start, paginations.End),
        countDataCamp,
        products: foundProducts.slice(paginations.Start, paginations.End),
        countDataProduct,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Something Went Wrong",
      });
    }
  };

  getAllCampaing = async (req, res) => {
    try {
      let camps = await getAllCampaing(req, res);
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      if (camps) {
        
        if (parseInt(req.params.ActionId) == 3) {
          res.send({ success: true, data: camps.data });
        } else {
          let countData = {
            page: parseInt(PageNumber),
            pages: Math.ceil(camps.count / PageSize),
            totalRecords: camps.count,
          };
          res.send({
            success: true,
            data: camps.data,
            countData,
          });
        }
      } else {
        res
          .status(200)
          .send({ code: 404, success: false, message: "No Campaign Found" });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Something Went Wrong",
      });
    }
  };

  searchCampaignbyAdmin = async (req, res) => {
    try {
      let camps = await getAllCampaingSearch(req, res);
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      if (camps) {
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(camps.count / PageSize),
          totalRecords: camps.count,
        };

        if (parseInt(req.params.ActionId) == 3) {
          res.send({ success: true, data: camps });
        } else {
          res.send({
            success: true,
            data: camps.data,
            countData,
          });
        }
      } else {
        res
          .status(200)
          .send({ code: 404, success: false, message: "No Campaign Found" });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Something Went Wrong",
      });
    }
  };

  fetchAllCampaign = async (req, res) => {
    let count = [];

    let getPermission = await FindPermission(req.user.id);

    if (getPermission.roleId != 1)
      return res.status(404).send({
        success: false,
        message: "You are not authenticated to this route",
      });

    let campaingCount = await db.campaign.findAndCountAll();
    let memeber = await users.findAndCountAll({
      include: [
        {
          model: db.permissions,
          where: {
            roleId: 2,
          },
        },
      ],
    });
    let customer = await users.findAndCountAll({
      include: [
        {
          model: db.permissions,
          where: {
            roleId: 4,
          },
        },
      ],
    });

    let merchant = await users.findAndCountAll({
      include: [
        {
          model: db.permissions,
          where: {
            roleId: 3,
          },
        },
      ],
    });
    let sales = await db.transaction.findAndCountAll();

    count.push({
      campCount: campaingCount.count,
      memberCount: memeber.count,
      salesCount: sales.count,
      cutomerCount: customer.count,
      merchantCount: merchant.count,
    });

    res.status(200).send({ success: true, data: count });
  };

  deleteCampaing = async (req, res) => {
    try {
      const { id } = req.params;
      let getPermission = await FindPermission(req.user.id);

      if (getPermission && !getPermission.canDeleteCampion)
        return res
          .status(200)
          .send({ code: 401, message: "You dont have permission" });

      let payload = {
        isActive: false,
        isExpired: true,
      };

      let appbaner = await AppBanner.findAll({
        where: { campaingId: id, isDeleted: 0 },
      });

      let campaingVoucher = await VoucherGen.findAll({
        where: { campaignId: id, isActive: 1, pending: 0, isExpired: 0 },
      });

      if (appbaner.length > 0) {
        return res.status(404).send({
          success: false,
          message: "This Campaign Has AppBanner It can't be deleted",
        });
      } else if (campaingVoucher.length > 0) {
        return res.status(404).send({
          success: false,
          message: "This Campaign Has Voucher It can't be deleted",
        });
      } else {
        await campaign.update(payload, {
          where: {
            id: id,
          },
        });
        return res
          .status(200)
          .send({ success: true, message: "Successfully Deleted" });
      }
    } catch (error) {
      return res.status(500).send({
        message: error.message || "Something Went Wrong",
      });
    }
  };
  fetchActiveCampaigns = async (req, res) => {
    let campaignArray = req.body.campainIds;
    if (!campaignArray || campaignArray.length <= 0)
      return res.status(403).send({ success: false, data: "" });
    let activeCampaigns = await db.campaign.findAll({
      where: {
        id: campaignArray,
        isActive: true,
        isExpired: false,
        campaignStartsAt: {
          [Op.lte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
        campaignExpiresAt: {
          [Op.gte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
      },
      include: [
        {
          model: CampaignDetail,
          required: true,
          where :{avaliablityStock: {[Op.gt]: 0, }, },
        },
      ],
    });

    


    if (!activeCampaigns)
      return res.status(404).send({ success: false, data: "" });

    res.status(200).send({ success: true, data: activeCampaigns });
  };
}
module.exports = Campaign;
