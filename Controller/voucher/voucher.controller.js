const db = require("../../Model");
const _ = require("lodash");
const moment = require("moment");
const { ExpireyCheck } = require("../extras/CampaignFeatures");
const limit = require("../extras/DataLimit/index");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const merchant = db.MerchantDetails;
const VoucherShare = db.VoucherShare;
const VoucherStatus = db.voucherStatus;
const CampaignDetail = db.campaignDetail;
const Product = db.product;
const Users = db.users;
const userDetail = db.usersdetail;
const Campaign = db.campaign;
const VoucherGen = db.VoucherGen;
const RedeemeVoucher = db.redeemeVoucher;
const AppBanner = db.AppBannerModel;
const ImageData = db.imageData;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Notification = db.notification;
const Notificationroute = db.notificationroute;
const fcm = require("../../FCMNotification/fcmnotificatins");

class Voucher {
  VoucherFilters = async (getCode, req_userid) => {
    try {
      let camp = null;
      if (getCode) {
        camp = await VoucherGen.findAll({
          where: {
            voucherCode: getCode,
            userId: req_userid,
          },
        });
      } else {
        camp = await VoucherGen.findAll({
          where: {
            userId: req_userid,
          },
        });
      }
      let voucherarray = [];
      let count = 0;
      camp.forEach(async (val, index, array) => {
        let condition = ExpireyCheck(val.expiresAt);
        if (!condition) {
          voucherarray.push(val.id);
        }
        count++;
        if (count == array.length) {
          await VoucherGen.update(
            {
              isExpired: true,
              isActive: false,
            },
            {
              where: {
                id: voucherarray,
              },
            }
          );
        }
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  userVoucherData = async (req, res) => {
    const payloadId = req.user.id;
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let paginations = ArraySlicePagination(PageNumber, PageSize);
    let countDataCurrent, countDataRecieve, countDataappBanners, countCampaigns;

    let qId = req.query.id;
    let whereUp = {
      isActive: true,
      isExpired: false,
      id: req.query.id,
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
    };

    let whereDiff = {
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
    };

    let where = qId ? whereUp : whereDiff;

    let totalCountV = await VoucherGen.count({
      where: {
        userId: payloadId,
        isActive: true,
        isExpired: false,
        expiresAt: {
          [Op.lte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
      },
    });

    let vouchers = await VoucherGen.findAll({
      where: {
        userId: payloadId,
        isActive: true,
        isExpired: false,
        expiresAt: {
          [Op.lte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
      },
      include: [
        {
          model: Campaign,
          where,
        },
        {
          model: Product,
          where: { isActive: 1 },
        },
      ],
    });
    if (vouchers.length > 0) {
      vouchers.map((x, i, arr) => {
        let expirationDate = x.expiresAt;
        let createdDate = x.createdAt;
        let remainingDays = moment(expirationDate).diff(createdDate, "days");
        x.dataValues["remainingDays"] = `${remainingDays} Days Left`;
      });
    }
    let totalCountRV = await VoucherShare.count({
      where: {
        receiverId: payloadId,
        isActive: false,
      },
    });
    let receivedVoucher = await VoucherShare.findAll({
      raw: true,
      nest: true,
      offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
      limit: parseInt(PageSize),
      where: {
        receiverId: payloadId,
        isActive: false,
      },
      include: [
        {
          model: Campaign,
          where,
        },
        {
          model: Users,
          include: [
            {
              model: userDetail,
            },
            {
              model: ImageData,
            },
          ],
        },
        {
          model: Product,
          where: { isActive: 1 },
        },
      ],
    });

    let totalCountB = await AppBanner.count({
      where: {
        isDeleted: false,
      },
    });

    let banners = await AppBanner.findAll({
      offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
      limit: parseInt(PageSize),
      where: {
        isDeleted: false,
      },
      include: [{ model: Campaign }],
    });

    let result = banners.filter((res) => {
      if (res.campaign == null) {
        return true;
      } else if (res.campaign != null) {
        if (
          res.campaign.campaignStartsAt <
            moment(Date.now())
              .tz("Asia/Karachi")
              .format("YYYY-MM-DDTHH:mm:ss") &&
          res.campaign.campaignExpiresAt >
            moment(Date.now()).tz("Asia/Karachi").format("YYYY-MM-DDTHH:mm:ss")
        ) {
          if (res.campaign.isExpired == 1 && res.campaign.isActive == 0) {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    });

    let totalCountC = await Campaign.count({
      where,
    });

    let campaign = await Campaign.findAll({
      nest: true,
      offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
      limit: parseInt(PageSize),
      where,
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
              model: ImageData,
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
    countDataCurrent = {
      page: parseInt(PageNumber),
      pages: Math.ceil(totalCountV / PageSize),
      totalRecords: totalCountV,
    };
    countDataRecieve = {
      page: parseInt(PageNumber),
      pages: Math.ceil(totalCountRV / PageSize),
      totalRecords: totalCountRV,
    };
    countDataappBanners = {
      page: parseInt(PageNumber),
      pages: Math.ceil(totalCountB / PageSize),
      totalRecords: totalCountB,
    };
    countCampaigns = {
      page: parseInt(PageNumber),
      pages: Math.ceil(totalCountC / PageSize),
      totalRecords: totalCountC,
    };

    res.status(200).send({
      success: true,
      currentVouchers: vouchers,
      countDataCurrent,
      receivedVouchers: receivedVoucher,
      countDataRecieve,
      appBanners: result,
      countDataappBanners,
      campaigns: campaign,
      countCampaigns,
    });
  };

  campAndAppbanners = async (req, res) => {
    try {
      let qId = req.query.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let countAppBanner, countCampaign;
      let whereUp = {
        isActive: true,
        isExpired: false,
        id: req.query.id,
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
      };

      let whereDiff = {
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
      };

      let where = qId ? whereUp : whereDiff;
      let banners = await AppBanner.findAll({
        where: {
          isDeleted: false,
        },
        include: [{ model: Campaign }],
      });

      let result = banners.filter((res) => {
        if (res.campaign == null) {
          return true;
        } else if (res.campaign != null) {
          if (
            res.campaign.campaignStartsAt <
              moment(Date.now())
                .tz("Asia/Karachi")
                .format("YYYY-MM-DDTHH:mm:ss") &&
            res.campaign.campaignExpiresAt >
              moment(Date.now())
                .tz("Asia/Karachi")
                .format("YYYY-MM-DDTHH:mm:ss")
          ) {
            if (res.campaign.isExpired == 1 && res.campaign.isActive == 0) {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      });

      let totalcount = await Campaign.count({
        where,
        include: [
          {
            model: db.users,
            where: {
              isBlocked: 0,
              isDelete: 0,
            },

            include: [
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
        ],
      });
      let campaign = await Campaign.findAll({
        nest: true,
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where,
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
      countAppBanner = {
        page: parseInt(PageNumber),
        pages: Math.ceil(result.length / PageSize),
        totalRecords: result.length,
      };
      countCampaign = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      res.status(200).send({
        success: true,
        appBanners: result.slice(paginations.Start, paginations.End),
        countAppBanner,
        campaigns: campaign,
        countCampaign,
      });
    } catch (e) {
      res.status(500).send({ success: false, message: e });
    }
  };

  campAndAppbannersV1 = async (req, res) => {
    try {
      let qId = req.query.id;
      let latitude = req.query.latitude;
      let longtitude = req.query.longitude;
      let actionid = parseInt(req.query.actionid);
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let campaign;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let countCampaign;
      let filterCampgin = [];
      let whereUp = {
        isActive: true,
        isExpired: false,
        id: req.query.id,
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
      };

      let whereDiff = {
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
      };

      let where = qId ? whereUp : whereDiff;

      function paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice(
          (page_number - 1) * page_size,
          page_number * page_size
        );
      }
      //actionid ===> 2 // Withoutlocation
      if (actionid === 2) {
        campaign = await Campaign.findAll({
          where,
          include: [
            {
              model: CampaignDetail,
            },

            {
              model: db.ShippingModel,
            },

            {
              model: db.users,
              required: true,
              where: {
                isBlocked: 0,
                isDelete: 0,
              },

              include: [
                {
                  model: db.usersdetail,
                },
                {
                  model: db.imageData,
                },
                {
                  model: db.MerchantDetails,

                  include: [
                    {
                      model: Users,
                      required: true,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },
                      include: [
                        {
                          model: ImageData,
                        },
                      ],
                    },
                  ],
                },
                {
                  model: db.LikeModel,
                  as: "Likes",
                  include: [
                    {
                      model: db.users,
                      required: true,
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
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
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
              model: db.campaignLikes,
              include: [
                {
                  model: db.users,
                  required: true,
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
        campaign.forEach((res) => {
          //condition change
          let voucherCount =
          res.campaignDetails[0].avaliablityStock /
            res.campaignDetails[0].productQty;
          if (voucherCount >= 1) {
            filterCampgin.push(res);
          }
        });

        console.log(filterCampgin);
      } else {
        campaign = await Campaign.findAll({
          include: [
            {
              model: CampaignDetail,
            },

            {
              model: db.ShippingModel,
            },

            {
              model: db.users,
              required: true,
              where: {
                isBlocked: 0,
                isDelete: 0,
              },

              include: [
                {
                  model: db.usersdetail,
                },
                {
                  model: db.imageData,
                },
                {
                  model: db.MerchantDetails,

                  attributes: [
                    [
                      sequelize.literal(
                        "6371 * acos(cos(radians(" +
                          latitude +
                          ")) * cos(radians(`user->merchantDetails`.`lat`)) * cos(radians(" +
                          longtitude +
                          ") - radians(`user->merchantDetails`.`lng`)) + sin(radians(" +
                          latitude +
                          ")) * sin(radians(`user->merchantDetails`.`lat`)))"
                      ),
                      `distance`,
                    ],
                    "id",
                    "userId",
                    "bussinessName",
                    "storeName",
                    "webSiteUrl",
                    "merchantCode",
                    "likes",
                    "receiveNotification",
                    "lat",
                    "lng",
                    "createdAt",
                    "updatedAt",
                  ],
                  required: true,
                  order: sequelize.col("distance"),
                  include: [
                    {
                      model: Users,
                      required: true,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },
                      include: [
                        {
                          model: ImageData,
                        },
                      ],
                    },
                  ],
                },
                {
                  model: db.LikeModel,
                  as: "Likes",
                  include: [
                    {
                      model: db.users,
                      required: true,
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
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
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
              model: db.campaignLikes,
              include: [
                {
                  model: db.users,
                  required: true,
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

          where,
        });

        campaign.forEach((res) => {
          //condition change
          let voucherCount =
          res.campaignDetails[0].avaliablityStock /
            res.campaignDetails[0].productQty;
          if (voucherCount >= 1) {
            filterCampgin.push(res);
          }
        });

        filterCampgin.sort(
          (a, b) =>
            parseFloat(a.user.merchantDetails[0].dataValues.distance) -
            parseFloat(b.user.merchantDetails[0].dataValues.distance)
        );
      }
      countCampaign = {
        page: parseInt(PageNumber),
        pages: Math.ceil(filterCampgin.length / parseInt(PageSize)),
        totalRecords: filterCampgin.length,
      };

      res.status(200).send({
        success: true,
        campaigns: filterCampgin.slice(paginations.Start, paginations.End),
        countCampaign,
      });
    } catch (e) {
      res.status(500).send({ success: false, message: e });
    }
  };
  getOutOfStockCampaign = async (req, res) => {
    try {
      let campaignIds = req.body;
      let outofStockCampaign = [];

      for (let element of campaignIds) {
        let detailCampaign = await CampaignDetail.findOne({
          where: { campaignId: element.id },
        });
        let getCampaign = await Campaign.findOne({
          where: { id: element.id },
        });
        if (
          detailCampaign.productQty * parseInt(element.qty) <
          detailCampaign.avaliablityStock
        ) {
          if (
            getCampaign.campaignExpiresAt >=
            moment(Date.now()).tz("Asia/Karachi").format("YYYY-MM-DDTHH:mm:ss")
          ) {
            outofStockCampaign.push({
              campaignId: element.id,
              outofstock: true,
              isExpired: false,
              message: "Campaing Is out of Stock",
            });
          } else {
            outofStockCampaign.push({
              campaignId: element.id,
              outofstock: true,
              isExpired: true,
              message: "Campaing Is out of Stock",
            });
          }
        } else {
          if (
            getCampaign.campaignExpiresAt >=
            moment(Date.now()).tz("Asia/Karachi").format("YYYY-MM-DDTHH:mm:ss")
          ) {
            outofStockCampaign.push({
              campaignId: element.id,
              outofstock: false,
              isExpired: false,
              message: "This Campaign has stock you can buy it",
            });
          } else {
            outofStockCampaign.push({
              campaignId: element.id,
              outofstock: false,
              isExpired: true,
              message: "This Campaign has stock you can buy it",
            });
          }
        }
      }
      return res.status(200).send({
        success: true,
        data: outofStockCampaign,
      });
    } catch (error) {
      return res.status(500).send({
        sucess: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  SearchbycampAndAppbannersV1 = async (req, res) => {
    try {
      const search = req.query.search;
      let latitude = req.query.latitude;
      let longtitude = req.query.longitude;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let campaign;
      let countCampaign;
      let filterCampgin = [];
      function paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice(
          (page_number - 1) * page_size,
          page_number * page_size
        );
      }

      campaign = await Campaign.findAll({
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
            required: true,
            where: {
              isBlocked: 0,
              isDelete: 0,
            },

            include: [
              {
                model: db.usersdetail,
              },
              {
                model: db.imageData,
              },
              {
                model: db.MerchantDetails,
                attributes: [
                  [
                    sequelize.literal(
                      "6371 * acos(cos(radians(" +
                        latitude +
                        ")) * cos(radians(`user->merchantDetails`.`lat`)) * cos(radians(" +
                        longtitude +
                        ") - radians(`user->merchantDetails`.`lng`)) + sin(radians(" +
                        latitude +
                        ")) * sin(radians(`user->merchantDetails`.`lat`)))"
                    ),
                    `distance`,
                  ],
                  "id",
                  "userId",
                  "bussinessName",
                  "storeName",
                  "webSiteUrl",
                  "merchantCode",
                  "likes",
                  "receiveNotification",
                  "lat",
                  "lng",
                  "createdAt",
                  "updatedAt",
                ],
                required: true,

                include: [
                  {
                    model: Users,
                    required: true,
                    where: {
                      isBlocked: 0,
                      isDelete: 0,
                    },
                    include: [
                      {
                        model: ImageData,
                      },
                    ],
                  },
                ],
              },
              {
                model: db.LikeModel,
                as: "Likes",
                include: [
                  {
                    model: db.users,
                    required: true,
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
                include: [
                  {
                    model: ImageData,
                    association: db.campaign.hasMany(db.imageData, {
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
            model: db.campaignLikes,
            include: [
              {
                model: db.users,
                required: true,
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

      campaign.forEach((res) => {
        let voucherCount =
          res.campaignDetails[0].productQty *
          res.campaignDetails[0].avaliablityStock;
        if (res.user.products[0].stock > voucherCount) {
          filterCampgin.push(res);
        }
      });
      filterCampgin.sort(
        (a, b) =>
          parseFloat(a.user.merchantDetails[0].dataValues.distance) -
          parseFloat(b.user.merchantDetails[0].dataValues.distance)
      );

      countCampaign = {
        page: parseInt(PageNumber),
        pages: Math.ceil(filterCampgin.length / parseInt(PageSize)),
        totalRecords: filterCampgin.length,
      };

      res.status(200).send({
        success: true,
        campaigns: paginate(
          filterCampgin,
          parseInt(PageSize),
          parseInt(PageNumber)
        ),
        countCampaign,
      });
    } catch (e) {
      res.status(500).send({ success: false, message: e });
    }
  };

  AppbannersV1 = async (req, res) => {
    try {
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let totalCountApp = await AppBanner.count({
        where: {
          isDeleted: false,
        },
      });
      let banners = await AppBanner.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: {
          isDeleted: false,
        },
        include: [
          {
            model: Campaign,
            include: [
              {
                model: db.ShippingModel,
              },
            ],
          },
        ],
      });

      let result = banners.filter((res) => {
        if (res.campaign == null) {
          return true;
        } else if (res.campaign != null) {
          if (
            res.campaign.campaignStartsAt <
              moment(Date.now())
                .tz("Asia/Karachi")
                .format("YYYY-MM-DDTHH:mm:ss") &&
            res.campaign.campaignExpiresAt >
              moment(Date.now())
                .tz("Asia/Karachi")
                .format("YYYY-MM-DDTHH:mm:ss")
          ) {
            if (res.campaign.isExpired == 1 && res.campaign.isActive == 0) {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      });

      let countAppBanner = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalCountApp / PageSize),
        totalRecords: totalCountApp,
      };

      res.status(200).send({
        success: true,
        campaigns: result,
        countAppBanner,
      });
    } catch (e) {
      res.status(500).send({ success: false, message: e });
    }
  };

  currentUserVouchers = async (req, res) => {
    try {
      let filterVouch = [];
      let redeemVouchId = [];
      let pendingVoucherCode = [];
      let shareVoucherUserArray = [];
      const payloadId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let result,
        shareVoucherResp,
        shareVoucherUser,
        filterCode,
        redeemVouch,
        results,
        responseVoucher,
        countData;

      result = await VoucherGen.findAll({
        where: { userId: payloadId, isActive: 1, isExpired: 0, pending: 0 },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Campaign",
                },
              },
              {
                model: db.ShippingModel,
              },
              {
                model: db.users,
                required: true,
                where: {
                  isBlocked: 0,
                  isDelete: 0,
                },

                include: [
                  {
                    model: db.usersdetail,
                  },
                  {
                    model: db.imageData,
                  },
                  {
                    model: db.MerchantDetails,

                    include: [
                      {
                        model: Users,
                        include: [
                          {
                            model: ImageData,
                          },
                        ],
                      },
                    ],
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
                    include: [
                      {
                        model: ImageData,
                        association: db.campaign.hasMany(db.imageData, {
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
            ],
          },
          {
            model: Product,
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
        ],
        order: [['expiresAt', 'ASC']]
      });

      shareVoucherUser = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          senderId: payloadId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: db.ShippingModel,
              },
            ],
          },
        ],
      });
      shareVoucherUser.forEach((res) => {
        shareVoucherUserArray.push(res.referenceId);
      });

      shareVoucherResp = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          receiverId: payloadId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Campaign",
                },
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
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          { model: VoucherGen },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
          { model: VoucherStatus },
        ],
      });

      shareVoucherResp.map((x, i, arr) => {
        if (x.dataValues["referenceId"]) {
          x.dataValues["id"] = x.dataValues["referenceId"];
        }
      });

      shareVoucherResp.forEach((res) => {
        pendingVoucherCode.push(res.voucherCode);
      });

      redeemVouch = await RedeemeVoucher.findAll({
        where: { userId: payloadId, statusId: { [Op.ne]: 3 } },
      });

      redeemVouch.forEach((res) => {
        redeemVouchId.push(res.voucherId);
      });

      responseVoucher = result.filter(
        (val) => !shareVoucherUserArray.includes(val.id)
      );

      filterCode = responseVoucher.filter(
        (val) => !pendingVoucherCode.includes(val.voucherCode)
      );

      shareVoucherResp.forEach((res) => {
        filterVouch.push(res);
      });

      filterCode.forEach((res) => {
        filterVouch.push(res);
      });

      results = filterVouch.filter((val) => !redeemVouchId.includes(val.id));

      let resultList = [
        ...results
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

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(results.length / PageSize),
        totalRecords: results.length,
      };
      res.status(200).send({
        success: true,
        data: results.slice(paginations.Start, paginations.End),
        countData,
        message: "My Vouchers",
      });
    } catch (err) {
      return res
        .status(500)
        .send({ sucess: true, message: err.message || "Something Went Wrong" });
    }
  };
  //Add new api By Compaign Faraz
  currentUserVouchersByCompaign = async (req, res) => {
    try {
      let filterVouch = [];
      let redeemVouchId = [];
      let pendingVoucherCode = [];
      let shareVoucherUserArray = [];
      const payloadId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let result,
        shareVoucherResp,
        shareVoucherUser,
        filterCode,
        redeemVouch,
        results,
        responseVoucher,
        countData;

      result = await VoucherGen.findAll({
        where: { userId: payloadId, isActive: 1, isExpired: 0, pending: 0 },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
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
          },
          {
            model: Product,
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
        ],
      });

      shareVoucherUser = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          senderId: payloadId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
          },
        ],
      });
      shareVoucherUser.forEach((res) => {
        shareVoucherUserArray.push(res.referenceId);
      });

      shareVoucherResp = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          receiverId: payloadId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
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
          },
          {
            model: Product,
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          { model: VoucherGen },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
          { model: VoucherStatus },
        ],
      });

      shareVoucherResp.map((x, i, arr) => {
        if (x.dataValues["referenceId"]) {
          x.dataValues["id"] = x.dataValues["referenceId"];
        }
      });

      shareVoucherResp.forEach((res) => {
        pendingVoucherCode.push(res.voucherCode);
      });

      redeemVouch = await RedeemeVoucher.findAll({
        where: { userId: payloadId, statusId: { [Op.ne]: 3 } },
      });

      redeemVouch.forEach((res) => {
        redeemVouchId.push(res.voucherId);
      });

      responseVoucher = result.filter(
        (val) => !shareVoucherUserArray.includes(val.id)
      );

      filterCode = responseVoucher.filter(
        (val) => !pendingVoucherCode.includes(val.voucherCode)
      );

      shareVoucherResp.forEach((res) => {
        filterVouch.push(res);
      });

      filterCode.forEach((res) => {
        filterVouch.push(res);
      });

      results = filterVouch.filter((val) => !redeemVouchId.includes(val.id));

      let resultList = [
        ...results
          .reduce((mp, o) => {
            if (!mp.has(o.campaignId))
              mp.set(o.campaignId, {
                campaign: o.campaign,
                product: o.product,
                count: 0,
              });
            mp.get(o.campaignId).count++;
            return mp;
          }, new Map())
          .values(),
      ];

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(resultList.length / PageSize),
        totalRecords: resultList.length,
      };
      res.status(200).send({
        success: true,
        data: resultList.slice(paginations.Start, paginations.End),
        countData,
        message: "My Vouchers By Campaign",
      });
    } catch (err) {
      return res
        .status(500)
        .send({ sucess: true, message: err.message || "Something Went Wrong" });
    }
  };

  currentUserVouchersByProduct = async (req, res) => {
    try {
      let filterVouch = [];
      let redeemVouchId = [];
      let pendingVoucherCode = [];
      let shareVoucherUserArray = [];
      const payloadId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let result,
        shareVoucherResp,
        shareVoucherUser,
        filterCode,
        redeemVouch,
        results,
        responseVoucher,
        countData;

      result = await VoucherGen.findAll({
        where: { userId: payloadId, isActive: 1, isExpired: 0, pending: 0 },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Campaign",
                },
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
                model: db.imageData,
                required: false,
                association: db.product.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
        ],
      });

      shareVoucherUser = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          senderId: payloadId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
          },
        ],
      });
      shareVoucherUser.forEach((res) => {
        shareVoucherUserArray.push(res.referenceId);
      });

      shareVoucherResp = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          receiverId: payloadId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
          },
          {
            model: Product,
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          { model: VoucherGen },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
          { model: VoucherStatus },
        ],
      });

      shareVoucherResp.map((x, i, arr) => {
        if (x.dataValues["referenceId"]) {
          x.dataValues["id"] = x.dataValues["referenceId"];
        }
      });

      shareVoucherResp.forEach((res) => {
        pendingVoucherCode.push(res.voucherCode);
      });

      redeemVouch = await RedeemeVoucher.findAll({
        where: { userId: payloadId, statusId: { [Op.ne]: 3 } },
      });

      redeemVouch.forEach((res) => {
        redeemVouchId.push(res.voucherId);
      });

      responseVoucher = result.filter(
        (val) => !shareVoucherUserArray.includes(val.id)
      );

      filterCode = responseVoucher.filter(
        (val) => !pendingVoucherCode.includes(val.voucherCode)
      );

      shareVoucherResp.forEach((res) => {
        filterVouch.push(res);
      });

      filterCode.forEach((res) => {
        filterVouch.push(res);
      });

      results = filterVouch.filter((val) => !redeemVouchId.includes(val.id));

      let resultList = [
        ...results
          .reduce((mp, o) => {
            if (!mp.has(o.productId))
              mp.set(o.productId, {
                product: o,
                count: 0,
              });
            mp.get(o.productId).count++;
            return mp;
          }, new Map())
          .values(),
      ];

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(resultList.length / PageSize),
        totalRecords: resultList.length,
      };
      res.status(200).send({
        success: true,
        data: resultList.slice(paginations.Start, paginations.End),
        countData,
        message: "My Vouchers By Campaign",
      });
    } catch (err) {
      return res
        .status(500)
        .send({ sucess: true, message: err.message || "Something Went Wrong" });
    }
  };

  getUserVoucherByCampaign = async (req, res) => {
    try {
      let filterVouch = [];
      let redeemVouchId = [];
      let pendingVoucherCode = [];
      let shareVoucherUserArray = [];
      let CampaignId = req.query.campaignId;
      let ProductId = req.query.productId;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      const payloadId = req.user.id;
      let result,
        shareVoucherResp,
        shareVoucherUser,
        filterCode,
        redeemVouch,
        results,
        responseVoucher,
        countData;

      result = await VoucherGen.findAll({
        where: {
          campaignId: CampaignId,
          productId: ProductId,
          userId: payloadId,
          isActive: 1,
          isExpired: 0,
          pending: 0,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Campaign",
                },
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
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
        ],
      });

      shareVoucherUser = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          senderId: payloadId,
          campaignId: CampaignId,
          productId: ProductId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },

            include: [
              {
                model: db.ShippingModel,
              },
            ],
          },
        ],
      });
      shareVoucherUser.forEach((res) => {
        shareVoucherUserArray.push(res.referenceId);
      });

      shareVoucherResp = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          receiverId: payloadId,
          campaignId: CampaignId,
          productId: ProductId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: db.ShippingModel,
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
          },
          {
            model: Product,
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          { model: VoucherGen },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
          { model: VoucherStatus },
        ],
      });

      shareVoucherResp.map((x, i, arr) => {
        if (x.dataValues["referenceId"]) {
          x.dataValues["id"] = x.dataValues["referenceId"];
        }
      });

      shareVoucherResp.forEach((res) => {
        pendingVoucherCode.push(res.voucherCode);
      });

      redeemVouch = await RedeemeVoucher.findAll({
        where: { userId: payloadId, statusId: { [Op.ne]: 3 } },
      });

      redeemVouch.forEach((res) => {
        redeemVouchId.push(res.voucherId);
      });

      responseVoucher = result.filter(
        (val) => !shareVoucherUserArray.includes(val.id)
      );

      filterCode = responseVoucher.filter(
        (val) => !pendingVoucherCode.includes(val.voucherCode)
      );

      shareVoucherResp.forEach((res) => {
        filterVouch.push(res);
      });

      filterCode.forEach((res) => {
        filterVouch.push(res);
      });

      results = filterVouch.filter((val) => !redeemVouchId.includes(val.id));

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(results.length / PageSize),
        totalRecords: results.length,
      };
      res.status(200).send({
        success: true,
        data: results.slice(paginations.Start, paginations.End),
        countData,
        message: "My Vouchers By Campaign",
      });
    } catch (err) {
      return res
        .status(500)
        .send({ sucess: true, message: err.message || "Something Went Wrong" });
    }
  };

  getUserVoucherByProduct = async (req, res) => {
    try {
      let filterVouch = [];
      let redeemVouchId = [];
      let pendingVoucherCode = [];
      let shareVoucherUserArray = [];
      let ProductId = req.query.productId;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      const payloadId = req.user.id;
      let result,
        shareVoucherResp,
        shareVoucherUser,
        filterCode,
        redeemVouch,
        results,
        responseVoucher,
        countData;

      result = await VoucherGen.findAll({
        where: {
          productId: ProductId,
          userId: payloadId,
          isActive: 1,
          isExpired: 0,
          pending: 0,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Campaign",
                },
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
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
        ],
      });

      shareVoucherUser = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          senderId: payloadId,
          productId: ProductId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },

            include: [
              {
                model: db.ShippingModel,
              },
            ],
          },
        ],
      });
      shareVoucherUser.forEach((res) => {
        shareVoucherUserArray.push(res.referenceId);
      });

      shareVoucherResp = await VoucherShare.findAll({
        where: {
          pending: 1,
          statusId: 1,
          receiverId: payloadId,
          productId: ProductId,
        },
        include: [
          {
            model: Campaign,
            where: {
              campaignStartsAt: {
                [Op.lte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
              voucherExpiresAt: {
                [Op.gte]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: db.ShippingModel,
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
          },
          {
            model: Product,
            include: [
              {
                model: ImageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Product",
                },
              },
            ],
          },
          { model: VoucherGen },
          {
            model: Users,
            include: [
              {
                model: userDetail,
              },
              {
                model: ImageData,
              },
            ],
          },
          { model: VoucherStatus },
        ],
      });

      shareVoucherResp.map((x, i, arr) => {
        if (x.dataValues["referenceId"]) {
          x.dataValues["id"] = x.dataValues["referenceId"];
        }
      });

      shareVoucherResp.forEach((res) => {
        pendingVoucherCode.push(res.voucherCode);
      });

      redeemVouch = await RedeemeVoucher.findAll({
        where: { userId: payloadId, statusId: { [Op.ne]: 3 } },
      });

      redeemVouch.forEach((res) => {
        redeemVouchId.push(res.voucherId);
      });

      responseVoucher = result.filter(
        (val) => !shareVoucherUserArray.includes(val.id)
      );

      filterCode = responseVoucher.filter(
        (val) => !pendingVoucherCode.includes(val.voucherCode)
      );

      shareVoucherResp.forEach((res) => {
        filterVouch.push(res);
      });

      filterCode.forEach((res) => {
        filterVouch.push(res);
      });

      results = filterVouch.filter((val) => !redeemVouchId.includes(val.id));

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(results.length / PageSize),
        totalRecords: results.length,
      };
      res.status(200).send({
        success: true,
        data: results.slice(paginations.Start, paginations.End),
        countData,
        message: "My Vouchers By Campaign",
      });
    } catch (err) {
      return res
        .status(500)
        .send({ sucess: true, message: err.message || "Something Went Wrong" });
    }
  };

  currentUserVouchersSearchbycode = async (req, res) => {
    try {
      let filterVouch = [];
      let redeemVouchId = [];
      let pendingVoucherCode = [];
      const payloadId = req.user.id;
      let VoucherCode = req.query.VoucherCode;
      let ActionId = parseInt(req.params.ActionId);
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let result, shareVoucherResp, filterCode, redeemVouch, results, countData;
      // ActionId = 1 Use for productname and short_title
      // ActionId = 2 Use for store name
      if (ActionId > 0 && ActionId < 6) {
        switch (ActionId) {
          case 1:
            
            result = await VoucherGen.findAll({
              where: {
                userId: payloadId,
                isActive: 1,
                isExpired: 0,
                pending: 0,
                // voucherCode: {
                //   [Op.like]: VoucherCode + "%",
                // },
              },
              include: [
                {
                  model: Campaign,
                  where: {
                    isActive: true,
                    isExpired: false,
                    campaignStartsAt: {
                      [Op.lte]: moment(Date.now())
                        .tz("Asia/Karachi")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    },
                    voucherExpiresAt: {
                      [Op.gte]: moment(Date.now())
                        .tz("Asia/Karachi")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    },
                  },
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Campaign",
                      },
                    },
                    {
                      model: db.users,
                      required: true,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },
      
                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.imageData,
                        },
                        {
                          model: db.MerchantDetails,
                          // where: {
                          //   [Op.or]: [
                          //     {
                          //       storeName: {
                          //         [Op.like]: VoucherCode + "%",
                          //       },
                          //   },
                          //  ],
                          // },
                          include: [
                            {
                              model: Users,
                              include: [
                                {
                                  model: ImageData,
                                },
                              ],
                            },
                          ],
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
                          include: [
                            {
                              model: ImageData,
                              association: db.campaign.hasMany(db.imageData, {
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
                  ],
                },
                {
                  model: Product,
                  where: {
                    [Op.or]: [
                      {
                    name: {
                      [Op.like]: VoucherCode + "%",
                    },
                    },
                    {
                      short_title: {
                        [Op.like]: VoucherCode + "%",
                      },
                      },
                   ],
                  },
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
                {
                  model: Users,
                  include: [
                    {
                      model: userDetail,
                    },
                    {
                      model: ImageData,
                    },
                  ],
                },
              ],
            });
      
            shareVoucherResp = await VoucherShare.findAll({
              where: {
                pending: 1,
                statusId: 1,
                [Op.or]: [
                  {
                    receiverId: payloadId,
                  },
                ],
                // voucherCode: {
                //   [Op.like]: VoucherCode + "%",
                // },
              },
              include: [
                {
                  model: Campaign,
                  where: {
                    isActive: true,
                    isExpired: false,
                    campaignStartsAt: {
                      [Op.lte]: moment(Date.now())
                        .tz("Asia/Karachi")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    },
                    voucherExpiresAt: {
                      [Op.gte]: moment(Date.now())
                        .tz("Asia/Karachi")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    },
                  },
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Campaign",
                      },
                    },
                    {
                      model: db.users,
                      required: true,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },
      
                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.imageData,
                        },
                        {
                          model: db.MerchantDetails,
                          // where: {
                          //   [Op.or]: [
                          //     {
                          //       storeName: {
                          //         [Op.like]: VoucherCode + "%",
                          //       },
                          //   },
                          //  ],
                            
                          // },
                          include: [
                            {
                              model: Users,
                              include: [
                                {
                                  model: ImageData,
                                },
                              ],
                            },
                          ],
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
                          include: [
                            {
                              model: ImageData,
                              association: db.campaign.hasMany(db.imageData, {
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
                  ],
                },
                {
                  model: Product,
                  where: {
                    [Op.or]: [
                      {
                    name: {
                      [Op.like]: VoucherCode + "%",
                     },
                    },
                    

                    {
                      short_title: {
                        [Op.like]: VoucherCode + "%",
                       },
                      },
                   ],
                  },
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
                { model: VoucherGen },
                {
                  model: Users,
                  include: [
                    {
                      model: userDetail,
                    },
                    {
                      model: ImageData,
                    },
                  ],
                },
                { model: VoucherStatus },
              ],
            });
      
            shareVoucherResp.map((x, i, arr) => {
              if (x.dataValues["referenceId"]) {
                x.dataValues["id"] = x.dataValues["referenceId"];
              }
            });
      
            shareVoucherResp.forEach((res) => {
              pendingVoucherCode.push(res.voucherCode);
            });
      
            redeemVouch = await RedeemeVoucher.findAll({
              where: { userId: payloadId, statusId: { [Op.ne]: 3 } },
            });
      
            redeemVouch.forEach((res) => {
              redeemVouchId.push(res.voucherId);
            });
      
            filterCode = result.filter(
              (val) => !pendingVoucherCode.includes(val.voucherCode)
            );
      
            shareVoucherResp.forEach((res) => {
              filterVouch.push(res);
            });
      
            filterCode.forEach((res) => {
              filterVouch.push(res);
            });
      
            results = filterVouch.filter((val) => !redeemVouchId.includes(val.id));
      
            countData = {
              page: parseInt(PageNumber),
              pages: Math.ceil(results.length / PageSize),
              totalRecords: results.length,
            };
            res.status(200).send({
              success: true,
              data: results.slice(paginations.Start, paginations.End),
              countData,
              message: "My Vouchers",
            });
            break;

          case 2:
            
            result = await VoucherGen.findAll({
              where: {
                userId: payloadId,
                isActive: 1,
                isExpired: 0,
                pending: 0,
                // voucherCode: {
                //   [Op.like]: VoucherCode + "%",
                // },
              },
              include: [
                {
                  model: Campaign,
                  where: {
                    isActive: true,
                    isExpired: false,
                    campaignStartsAt: {
                      [Op.lte]: moment(Date.now())
                        .tz("Asia/Karachi")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    },
                    voucherExpiresAt: {
                      [Op.gte]: moment(Date.now())
                        .tz("Asia/Karachi")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    },
                  },
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Campaign",
                      },
                    },
                    {
                      model: db.users,
                      required: true,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },
      
                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.imageData,
                        },
                        {
                          model: db.MerchantDetails,
                          where: {
                            [Op.or]: [
                              {
                                storeName: {
                                  [Op.like]: VoucherCode + "%",
                                },
                            },
                           ],
                          },
                          include: [
                            {
                              model: Users,
                              include: [
                                {
                                  model: ImageData,
                                },
                              ],
                            },
                          ],
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
                          include: [
                            {
                              model: ImageData,
                              association: db.campaign.hasMany(db.imageData, {
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
                  ],
                },
                {
                  model: Product,
                  // where: {
                  //   [Op.or]: [
                  //     {
                  //   name: {
                  //     [Op.like]: VoucherCode + "%",
                  //   },
                  //   },
                  //  ],
                  // },
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
                {
                  model: Users,
                  include: [
                    {
                      model: userDetail,
                    },
                    {
                      model: ImageData,
                    },
                  ],
                },
              ],
            });
      
            shareVoucherResp = await VoucherShare.findAll({
              where: {
                pending: 1,
                statusId: 1,
                [Op.or]: [
                  {
                    receiverId: payloadId,
                  },
                ],
                // voucherCode: {
                //   [Op.like]: VoucherCode + "%",
                // },
              },
              include: [
                {
                  model: Campaign,
                  where: {
                    isActive: true,
                    isExpired: false,
                    campaignStartsAt: {
                      [Op.lte]: moment(Date.now())
                        .tz("Asia/Karachi")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    },
                    voucherExpiresAt: {
                      [Op.gte]: moment(Date.now())
                        .tz("Asia/Karachi")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    },
                  },
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Campaign",
                      },
                    },
                    {
                      model: db.users,
                      required: true,
                      where: {
                        isBlocked: 0,
                        isDelete: 0,
                      },
      
                      include: [
                        {
                          model: db.usersdetail,
                        },
                        {
                          model: db.imageData,
                        },
                        {
                          model: db.MerchantDetails,
                          where: {
                            [Op.or]: [
                              {
                                storeName: {
                                  [Op.like]: VoucherCode + "%",
                                },
                            },
                           ],
                            
                          },
                          include: [
                            {
                              model: Users,
                              include: [
                                {
                                  model: ImageData,
                                },
                              ],
                            },
                          ],
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
                          include: [
                            {
                              model: ImageData,
                              association: db.campaign.hasMany(db.imageData, {
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
                  ],
                },
                {
                  model: Product,
                  // where: {
                  //   [Op.or]: [
                  //     {
                  //   name: {
                  //     [Op.like]: VoucherCode + "%",
                  //    },
                  //   },
                  //  ],
                  // },
                  include: [
                    {
                      model: ImageData,
                      association: db.campaign.hasMany(db.imageData, {
                        foreignKey: "typeId",
                      }),
                      where: {
                        imageType: "Product",
                      },
                    },
                  ],
                },
                { model: VoucherGen },
                {
                  model: Users,
                  include: [
                    {
                      model: userDetail,
                    },
                    {
                      model: ImageData,
                    },
                  ],
                },
                { model: VoucherStatus },
              ],
            });
      
            shareVoucherResp.map((x, i, arr) => {
              if (x.dataValues["referenceId"]) {
                x.dataValues["id"] = x.dataValues["referenceId"];
              }
            });
      
            shareVoucherResp.forEach((res) => {
              pendingVoucherCode.push(res.voucherCode);
            });
      
            redeemVouch = await RedeemeVoucher.findAll({
              where: { userId: payloadId, statusId: { [Op.ne]: 3 } },
            });
      
            redeemVouch.forEach((res) => {
              redeemVouchId.push(res.voucherId);
            });
      
            filterCode = result.filter(
              (val) => !pendingVoucherCode.includes(val.voucherCode)
            );
      
            shareVoucherResp.forEach((res) => {
              filterVouch.push(res);
            });
      
            filterCode.forEach((res) => {
              filterVouch.push(res);
            });
      
            results = filterVouch.filter((val) => !redeemVouchId.includes(val.id));
      
            countData = {
              page: parseInt(PageNumber),
              pages: Math.ceil(results.length / PageSize),
              totalRecords: results.length,
            };
            res.status(200).send({
              success: true,
              data: results.slice(paginations.Start, paginations.End),
              countData,
              message: "My Vouchers",
            });
            break;
          }

       }


     
    } catch (err) {
      return res
        .status(500)
        .send({ sucess: true, message: err.message || "Something Went Wrong" });
    }
  };

  verifyMerchantCode = async (req, res) => {
    const payloadId = req.user.id;
    let merchantCode = req.params.merchantCode;
    let CampaignId = req.params.campaignId;
    let camp = await Campaign.findOne({
      where: {
        id: CampaignId,
      },
    });
    let mer = await merchant.findOne({
      where: {
        userId: camp.merchantId,
      },
    });

    if (mer && mer.merchantCode != merchantCode) {
      return res.status(404).send({
        success: false,
        data: [],
        message: "Merchant Code Is Not Valid",
      });
    } else if (mer && mer.merchantCode == merchantCode) {
      return res
        .status(200)
        .send({ success: true, message: "Merchant Code Is Valid" });
    }
  };

  userVoucherActivity = async (req, res) => {
    const payloadId = req.user.id;
    let data = [];
    let datavouch = [];
    let result,
      query,
      query1,
      query2,
      query3,
      query4,
      givenAct,
      redeemeAct,
      expiredAct,
      recieveAct,
      declineAct,
      countData,
      query1count,
      queryy3,
      queryy2,
      queryy4,
      queryy,
      query2count,
      queryy1,
      query3count,
      vouCount;
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let paginations = ArraySlicePagination(PageNumber, PageSize);
    let AcitvityId = parseInt(req.query.ActId);
    let currentDate = moment(Date.now())
      .tz("Asia/Karachi")
      .format("YYYY-MM-DDTHH:mm:ss");

    if (AcitvityId > 0 && AcitvityId < 5) {
      query = ` select vs.id,vs.voucherCode,vs.voucherQty,vs.pending,vs.statusId,vss.status,vs.createdAt,p.name as ProductName,p.stock as ProductStock,c.name as ProductcategoryName,s.name as ProductsubcategoryName,su.id as SenderId,su.userName as SenderUserName,ru.id as ReceiverId,ru.userName as ReceiverUserName
          ,cp.id as CampaignId,cp.name as CampaignName,cp.campaignCode,cp.Discount as CampaignDiscount,cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount,md.bussinessName as MerchantBussinessName,md.storeName as MerchantStoreName ,vs.createdAt,'Recieved' AS voucherStatus
          from voucherSharings As vs
          inner join products as p on p.id = vs.productId 
          left join categories as c on c.id = p.categoryId
          left join subcategories as s on s.id = p.subcategoryId
          left join users as su on su.id = vs.senderId
          left join users as ru on ru.id = vs.receiverId
          left join voucherStatuses as vss on vss.id = vs.statusId
          left join campaigns as cp on cp.id = vs.campaignId
          left join merchantDetails as md on md.userId = cp.merchantId
          where vs.receiverId=${payloadId}
          ORDER BY vs.createdAt
          LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      query1 = ` select vs.id,vs.voucherCode,vs.voucherQty,vs.pending,vs.statusId,vss.status,vs.createdAt,p.name as ProductName,p.stock as ProductStock,c.name as ProductcategoryName,s.name as ProductsubcategoryName,su.id as SenderId,su.userName as SenderUserName,ru.id as ReceiverId,ru.userName as ReceiverUserName
          ,cp.id as CampaignId,cp.name as CampaignName,cp.campaignCode,cp.Discount as CampaignDiscount,cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount,md.bussinessName as MerchantBussinessName,md.storeName as MerchantStoreName,vs.createdAt,'Given' AS voucherStatus
          from voucherSharings As vs
          left join products as p on p.id = vs.productId 
          left join categories as c on c.id = p.categoryId
          left join subcategories as s on s.id = p.subcategoryId
          left join users as su on su.id = vs.senderId
          left join users as ru on ru.id = vs.receiverId
          left join voucherStatuses as vss on vss.id = vs.statusId
          left join campaigns as cp on cp.id = vs.campaignId
          left join merchantDetails as md on md.userId = cp.merchantId
          where vs.senderId=${payloadId} and (vs.statusId=2  or vs.statusId=1)
          ORDER BY vs.createdAt DESC
          LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      query1count = `select COUNT(vs.id) as count from voucherSharings As vs
           where vs.senderId=${payloadId} and (vs.statusId=2  or vs.statusId=1)`;

      query2 = ` select vs.id,vs.voucherCode,vs.isExpired,vs.expiresAt,p.name as ProductName,p.stock as ProductStock,c.name as ProductcategoryName,s.name as ProductsubcategoryName,su.userName,cp.id as CampaignId,cp.name 
          as CampaignName,cp.campaignCode,cp.Discount as CampaignDiscount,cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount,md.bussinessName as MerchantBussinessName,md.storeName as MerchantStoreName,vs.createdAt,'Expired' AS voucherStatus
          from vouchergens As vs
          inner join products as p on p.id = vs.productId 
          left join categories as c on c.id = p.categoryId
          left join subcategories as s on s.id = p.subcategoryId
          left join users as su on su.id = vs.userId
          left join campaigns as cp on cp.id = vs.campaignId
          left join merchantDetails as md on md.userId = cp.merchantId
          where vs.userID=${payloadId} and vs.isActive=1 and (vs.isExpired=1 or vs.expiresAt <= '${currentDate}')
          ORDER BY vs.createdAt
          LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      query2count = `select COUNT(vs.id) as count from vouchergens As vs
          where vs.userID=${payloadId} and vs.isActive=1 and (vs.isExpired=1 or vs.expiresAt <= '${currentDate}')`;

      query3 = ` select vs.id,u.userName,vs.name as VoucherRedeemeName,p.name as ProductName,p.stock as ProductStock,c.name as ProductCategoryName,s.name as ProductSubcategoryName,cp.name as CampaignName,cp.campaignCode,cp.Discount as CampaignDiscount,
          cp.id as CampaignId,cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount,vs.statusId,vss.status,md.bussinessName as MerchantBussinessName,md.storeName as MerchantStoreName,do.deliveryName as DeliveryOption,vs.createdAt,'Redeemed' AS voucherStatus
          from redeemeVouchers As vs
          inner join vouchergens as vg on vg.id = vs.voucherId
          left join products as p on p.id = vg.productId 
          left join categories as c on c.id = p.categoryId
          left join subcategories as s on s.id = p.subcategoryId
          left join users as u on u.id = vg.userId
          left join campaigns as cp on cp.id = vg.campaignId
          left join merchantDetails as md on md.userId = cp.merchantId
          left join voucherStatuses as vss on vss.id = vs.statusId
          left join deliveryOptions as do on do.id = vs.redeemeDevOpId
          where vs.userId=${payloadId} and vs.isActive=1 and vs.statusId=2
          ORDER BY vs.createdAt DESC
          LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      query3count = `select COUNT(vs.id) as count from redeemeVouchers As vs
          where vs.userId=${payloadId} and vs.isActive=1 and vs.statusId=2`;

      query4 = ` select vs.id,vs.voucherCode,vs.voucherQty,vs.pending,vs.statusId,vss.status,vs.createdAt,p.name as ProductName,p.stock as ProductStock,c.name as ProductcategoryName,s.name as ProductsubcategoryName,su.id as SenderId,su.userName as SenderUserName,ru.id as ReceiverId,ru.userName as ReceiverUserName
          ,cp.id as CampaignId,cp.name as CampaignName,cp.campaignCode,cp.Discount as CampaignDiscount,cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount,md.bussinessName as MerchantBussinessName,md.storeName as MerchantStoreName,vs.createdAt,'Declined' AS voucherStatus
          from voucherSharings As vs
          left join products as p on p.id = vs.productId 
          left join categories as c on c.id = p.categoryId
          left join subcategories as s on s.id = p.subcategoryId
          left join users as su on su.id = vs.senderId
          left join users as ru on ru.id = vs.receiverId
          left join voucherStatuses as vss on vss.id = vs.statusId
          left join campaigns as cp on cp.id = vs.campaignId
          left join merchantDetails as md on md.userId = cp.merchantId
          where vs.senderId=${payloadId} and vs.statusId=3
          ORDER BY vs.createdAt
          LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      switch (AcitvityId) {
        case 1:
          queryy = query.substring(0, query.indexOf("LIMIT"));
          recieveAct = await db.sequelize.query(queryy);
          queryy1 = query1.substring(0, query1.indexOf("LIMIT"));
          givenAct = await db.sequelize.query(queryy1);
          queryy3 = query3.substring(0, query3.indexOf("LIMIT"));
          redeemeAct = await db.sequelize.query(queryy3);
          queryy2 = query2.substring(0, query2.indexOf("LIMIT"));
          expiredAct = await db.sequelize.query(queryy2);
          queryy4 = query4.substring(0, query4.indexOf("LIMIT"));
          declineAct = await db.sequelize.query(queryy4);

          redeemeAct[0].map((x, i, arr) => {
            data.push(x);
          });
          givenAct[0].map((x, i, arr) => {
            data.push(x);
          });
          recieveAct[0].map((x, i, arr) => {
            data.push(x);
          });

          declineAct[0].map((x, i, arr) => {
            data.push(x);
          });
          expiredAct[0].map((x, i, arr) => {
            data.push(x);
          });
          data.push();
          datavouch = _.sortBy(data, "createdAt").reverse();

          countData = {
            page: parseInt(PageNumber),
            pages: Math.ceil(datavouch.length / PageSize),
            totalRecords: datavouch.length,
          };
          datavouch.slice(paginations.Start, paginations.End).length > 0
            ? res.status(200).send({
                success: true,
                data: datavouch.slice(paginations.Start, paginations.End),
                countData,
                Message: "Voucher Found",
              })
            : res.status(400).send({
                success: false,
                data: datavouch,
                countData,
                Message: "No Voucher Activity Found",
              });
          break;

        case 2:
          result = await db.sequelize.query(query1);
          vouCount = await db.sequelize.query(query1count);
          countData = {
            page: parseInt(PageNumber),
            pages: Math.ceil(vouCount[0][0].count / PageSize),
            totalRecords: vouCount[0][0].count,
          };
          result[0].length > 0
            ? res.status(200).send({
                success: true,
                data: result[0],
                countData,
                Message: "Voucher Found",
              })
            : res.status(400).send({
                success: false,
                data: result[0],
                countData,
                Message: "No Voucher Activity Found",
              });
          break;

        case 3:
          result = await db.sequelize.query(query2);
          vouCount = await db.sequelize.query(query2count);
          countData = {
            page: parseInt(PageNumber),
            pages: Math.ceil(vouCount[0][0].count / PageSize),
            totalRecords: vouCount[0][0].count,
          };
          result[0].length > 0
            ? res.status(200).send({
                success: true,
                data: result[0],
                countData,
                Message: "Voucher Found",
              })
            : res.status(400).send({
                success: false,
                data: result[0],
                countData,
                Message: "No Voucher Activity Found",
              });
          break;

        case 4:
          result = await db.sequelize.query(query3);
          vouCount = await db.sequelize.query(query3count);
          countData = {
            page: parseInt(PageNumber),
            pages: Math.ceil(vouCount[0][0].count / PageSize),
            totalRecords: vouCount[0][0].count,
          };
          result[0].length > 0
            ? res.status(200).send({
                success: true,
                data: result[0],
                countData,
                Message: "Voucher Found",
              })
            : res.status(400).send({
                success: false,
                data: result[0],
                countData,
                Message: "No Voucher Activity Found",
              });
          break;

        default:
          res.status(500).send({ data: [], message: "there is no data " });
      }
    } else {
      return res
        .status(500)
        .send({ Success: false, message: "something went wrong" });
    }
  };

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

      res.status(200).send({ success: true, data: updatedArray });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getPendingVouchers = async (req, res) => {
    try {
      const payloadId = req.user.id;

      let _ = await VoucherShare.findAll({
        raw: true,
        nest: true,
        offset:
          parseInt(req.query.page) * limit.limit
            ? parseInt(req.query.page) * limit.limit
            : 0,
        limit: req.query.page ? limit.limit : 1000000,
        where: {
          receiverId: payloadId,
          isActive: false,
        },
      });
      let countData = {
        page: parseInt(req.query.page),
        pages: Math.ceil(_.length / limit.limit),
        totalRecords: _.length,
      };
      res.status(200).send({ success: true, data: _, countData });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  receiveVouchers = async (req, res) => {
    try {
      const payloadId = req.user.id;
      const { voucherCode } = req.params;

      let recieveVouch = await VoucherShare.findOne({
        where: {
          receiverId: payloadId,
          isActive: false,
          statusId: 1,
          voucherCode: voucherCode,
        },
        include: [
          {
            model: db.product,
          },
        ],
      });

      if (!recieveVouch) {
        return res
          .status(404)
          .send({ success: false, data: " No voucher found" });
      }

      await VoucherShare.update(
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
      let discp = `${recieveVouch.product.name} Has Been Accept by`;
      let discp1 = `You Accepted ${recieveVouch.product.name} From ${currentuser.userName} `;
      //Notification work
      var message = {
        to: Deviceid.fcmtoken,
        notification: {
          title: "givees",
          body: `${discp} ${currentuser.userName}`,
        },
      };

      var message1 = {
        to: req.user.fcmtoken,
        notification: {
          title: "givees",
          body: `${discp1} `,
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

      fcm.send(message1, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: recieveVouch.senderId,
            receiverId: payloadId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp1,
            Title: "Accept",
            RouteId: 19,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: recieveVouch.senderId,
            receiverId: payloadId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp1,
            Title: "Accept",
            RouteId: 19,
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

  cancelVouchers = async (req, res) => {
    try {
      const payloadId = req.user.id;
      const { voucherCode } = req.params;

      let recieveVouch = await VoucherShare.findOne({
        raw: true,
        nest: true,
        where: {
          isActive: false,
          statusId: 1,
          voucherCode: voucherCode,
        },
        include: [
          {
            model: db.product,
          },
        ],
      });

      if (!recieveVouch) {
        return res
          .status(404)
          .send({ success: false, data: " No voucher found" });
      }

      await VoucherShare.update(
        {
          isActive: 0,
          pending: false,
          statusId: 3,
          updatedAt: Date.now(),
        },
        {
          where: {
            isActive: false,
            statusId: 1,
            voucherCode: voucherCode,
          },
        }
      );

      await VoucherGen.update(
        {
          isActive: 0,
          pending: 0,
          //isExpired: 1,
          updatedAt: Date.now(),
        },
        {
          where: {
            voucherCode: voucherCode,
            isActive: 1,
            pending: 1,
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
      let discp = `${recieveVouch.product.name} Has Been Declined by `;
      let discp1 = `You declined ${recieveVouch.product.name} from ${currentuser.userName} `;
      //Notification work
      var message = {
        to: Deviceid.fcmtoken,
        notification: {
          title: "givees",
          body: `${discp} ${currentuser.userName}`,
        },
      };

      var message1 = {
        to: req.user.fcmtoken,
        notification: {
          title: "givees",
          body: `${discp1} `,
        },
      };

      fcm.send(message, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: payloadId,
            receiverId: recieveVouch.senderId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp,
            Title: "Declined",
            RouteId: 5,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: payloadId,
            receiverId: recieveVouch.senderId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp,
            Title: "Declined",
            RouteId: 5,
            IsAction: 0,
            IsCount: 1,
          });
        }
      });

      fcm.send(message1, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: recieveVouch.senderId,
            receiverId: payloadId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp1,
            Title: "Declined",
            RouteId: 20,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: recieveVouch.senderId,
            receiverId: payloadId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp1,
            Title: "Declined",
            RouteId: 20,
            IsAction: 0,
            IsCount: 1,
          });
        }
      });

      res
        .status(200)
        .send({ success: true, data: "You have Canceled this voucher" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  cancelVouchersByOwner = async (req, res) => {
    try {
      const payloadId = req.user.id;
      const { voucherId } = req.params;

      let recieveVouch = await VoucherShare.findOne({
        raw: true,
        nest: true,
        where: {
          isActive: false,
          statusId: 1,
          vouchergenId: voucherId,
        },
        include: [
          {
            model: db.product,
          },
        ],
      });

      if (!recieveVouch) {
        return res
          .status(404)
          .send({ success: false, data: " No voucher found" });
      }

      await VoucherShare.update(
        {
          isActive: 0,
          pending: false,
          statusId: 6,
          updatedAt: Date.now(),
        },
        {
          where: {
            isActive: false,
            statusId: 1,
            vouchergenId: voucherId,
          },
        }
      );

      await VoucherGen.update(
        {
          isActive: 0,
          pending: 0,
          updatedAt: Date.now(),
        },
        {
          where: {
            id: voucherId,
            isActive: 1,
            pending: 1,
          },
        }
      );
      let Deviceid = await Users.findOne({
        where: {
          id: recieveVouch.receiverId,
        },
      });
      let currentuser = await Users.findOne({
        where: {
          id: payloadId,
        },
      });
      let discp = `${recieveVouch.product.name} Has Been Cancelled by`;

      let discp1 = `You took back ${recieveVouch.product.name} from ${currentuser.userName}`;

      //Notification work
      var message = {
        to: Deviceid.fcmtoken,
        notification: {
          title: "givees",
          body: `${recieveVouch.product.name} was taken back by ${currentuser.userName}`,
        },
      };

      var message1 = {
        to: req.user.fcmtoken,
        notification: {
          title: "givees",
          body: `${discp1}`,
        },
      };

      fcm.send(message, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: payloadId,
            receiverId: recieveVouch.receiverId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp,
            Title: "Cancelled",
            RouteId: 8,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: payloadId,
            receiverId: recieveVouch.receiverId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp,
            Title: "Cancelled",
            RouteId: 8,
            IsAction: 0,
            IsCount: 1,
          });
        }
      });

      fcm.send(message1, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: recieveVouch.receiverId,
            receiverId: payloadId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp1,
            Title: "Took back",
            RouteId: 18,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: recieveVouch.receiverId,
            receiverId: payloadId,
            voucherId: recieveVouch.vouchergenId,
            Body: discp1,
            Title: "Took back",
            RouteId: 18,
            IsAction: 0,
            IsCount: 1,
          });
        }
      });
      res
        .status(200)
        .send({ success: true, data: "You have Canceled this voucher" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getVoucherByCode = async (req, res) => {
    try {
      const { voucherCode } = req.params;

      let _ = await Campaign.findOne({
        include: [
          {
            model: VoucherGen,
            where: {
              voucherCode: voucherCode,
            },
            include: [
              {
                model: Product,
              },
            ],
          },
          {
            model: Users,
          },
        ],
      });

      res.status(200).send({ success: true, data: _ });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };
}
module.exports = Voucher;
