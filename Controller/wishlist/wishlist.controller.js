const db = require("../../Model");
const _ = require("lodash");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const wishlist = db.WishListModel;
const campaing = db.campaign;
const campaingdetail = db.campaignDetail;
const product = db.product;
const merchantDetail = db.MerchantDetails;
const permission = db.permissions;
const user = db.users;
const ShippingModel = db.ShippingModel;

const moment = require("moment");
const Op = db.Sequelize.Op;

const limit = require("../extras/DataLimit/index");
class WishlistController {
  create = async (req, res) => {
    try {
      let findCampaing = await campaing.findOne({
        where: {
          id: req.params.campaingid,
        },
      });

      if (!findCampaing)
        return res
          .status(200)
          .send({ code: 404, success: true, message: "Campaing Not Found" });

      let getWishlist = await wishlist.findOne({
        where: {
          userId: req.user.id,
          campaignId: req.params.campaingid,
        },
      });

      if (getWishlist)
        return res
          .status(200)
          .send({ success: true, message: "Item Already Exist's" });

      let schema = {
        campaignId: req.params.campaingid,
        userId: req.user.id,
      };

      let wslist = await wishlist.create(schema);
      if (wslist) return res.status(200).send({ success: true, wslist });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message });
    }
  };

  getCampaignWishList = async (req, res) => {
    try {
      let array = [];
      let countwhislist;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let wishList = await db.campaign.findAll({
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
        },
        include: [
          {
            model: db.campaignDetail,
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
            model: db.imageData,
            association: db.campaign.hasMany(db.imageData, {
              foreignKey: "typeId",
            }),
            where: {
              imageType: "Campaign",
            },
          },
        ],
      });

      wishList.forEach((element) => {
        element.campaignLikes.forEach((resp) => {
          if (resp.userId == req.user.id) {
            array.push(element);
          }
        });
      });

      countwhislist = {
        page: parseInt(PageNumber),
        pages: Math.ceil(array.length / PageSize),
        totalRecords: array.length,
      };

      res.status(200).send({
        success: true,
        data: array.slice(paginations.Start, paginations.End),
        countwhislist,
      });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  };

  getFriendCampaignWishList = async (req, res) => {
    try {
      let array = [];
      let wishList = await db.campaign.findAll({
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
        },
        include: [
          {
            model: db.campaignDetail,
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
            model: db.imageData,
            association: db.campaign.hasMany(db.imageData, {
              foreignKey: "typeId",
            }),
            where: {
              imageType: "Campaign",
            },
          },
        ],
      });

      wishList.forEach((element) => {
        element.campaignLikes.forEach((resp) => {
          if (resp.userId == req.params.id) {
            array.push(element);
          }
        });
      });

      res.status(200).send({
        success: true,
        data: array,
      });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  };

  getMerchantWishList = async (req, res) => {
    try {
      let array = [];
      let merarray = [];
      let usersIDS = [];
      let countwhislist;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let members = await db.users.findAll({
        raw: false,
        nest: true,

        include: [
          {
            model: db.permissions,
            where: {
              roleId: 3,
            },
          },
          {
            model: db.usersdetail,
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
            model: db.WishListModel,
          },
          {
            model: db.MerchantDetails,
            include: [
              { model: user,
                include: [
                  {
                    model: db.imageData,
                    // required: false,
                    // association: db.users.hasMany(db.imageData, {
                    //   foreignKey: "userId",
                    // }),
                    // where: {
                    //   imageType: 'User',
                    // },
  
                  },
                ], 
                where: { isBlocked: 0, isDelete: 0 } 
              }
            ],
          },
          {
            model: db.campaign,
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
            },

            include: [
              {
                model: db.campaignDetail,
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
                model: db.imageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Campaign",
                },
              },
            ],
          },
        ],
      });

      let merchantId = await permission.findAll({ where: { roleId: 3 } });

      if (merchantId.length > 0) {
        merchantId.forEach((res) => {
          merarray.push(res.userId);
        });
      }

      if (merarray.length > 0) {
        for (let val of merarray) {
          let userIds = await user.findOne({
            where: { id: val, [Op.or]: [{ isBlocked: 1 }, { isDelete: 1 }] },
          });
          if (userIds != null) {
            usersIDS.push(userIds.id);
          }
        }
      }

      members.forEach((element) => {
        element.Likes.forEach((resp) => {
          if (resp.userId == req.user.id) {
            if (!usersIDS.includes(resp.likedId)) {
              array.push(element);
            }
          }
        });
      });

      countwhislist = {
        page: parseInt(PageNumber),
        pages: Math.ceil(array.length / PageSize),
        totalRecords: array.length,
      };

      res.status(200).send({
        success: true,
        data: array.slice(paginations.Start, paginations.End),
        countwhislist,
      });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  };

  getFriendMerchantWishList = async (req, res) => {
    try {
      let array = [];
      let merarray = [];
      let usersIDS = [];
      let members = await db.users.findAll({
        raw: false,
        nest: true,

        include: [
          {
            model: db.permissions,
            where: {
              roleId: 3,
            },
          },
          {
            model: db.usersdetail,
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
            model: db.WishListModel,
          },
          {
            model: db.MerchantDetails,
            include: [
            { model: user, 
              where: { isBlocked: 0, isDelete: 0 }, 
              include: [
                {
                  model: db.imageData,
                  where: {
                    imageType: "User",
                  },
                },
              ],
            }
          ],
          },
          {
            model: db.campaign,
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
            },

            include: [
              {
                model: db.campaignDetail,
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
                model: db.imageData,
                association: db.campaign.hasMany(db.imageData, {
                  foreignKey: "typeId",
                }),
                where: {
                  imageType: "Campaign",
                },
              },
            ],
          },
          
        ],
      });

      let merchantId = await permission.findAll({ where: { roleId: 3 } });

      if (merchantId.length > 0) {
        merchantId.forEach((res) => {
          merarray.push(res.userId);
        });
      }

      if (merarray.length > 0) {
        for (let val of merarray) {
          let userIds = await user.findOne({
            where: { id: val, [Op.or]: [{ isBlocked: 1 }, { isDelete: 1 }] },
          });
          if (userIds != null) {
            usersIDS.push(userIds.id);
          }
        }
      }

      members.forEach((element) => {
        element.Likes.forEach((resp) => {
          if (resp.userId == req.params.id) {
            if (!usersIDS.includes(resp.likedId)) {
              array.push(element);
            }
          }
        });
      });

      res.status(200).send({
        success: true,
        data: array,
      });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  };

  getWishlist = async (req, res) => {
    try {
      let wslist = await wishlist.findAll({
        offset:
          parseInt(req.query.page) * limit.limit
            ? parseInt(req.query.page) * limit.limit
            : 0,
        limit: req.query.page ? limit.limit : 1000000,
        where: {
          userId: req.user.id,
        },
        include: [
          {
            model: campaing,
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
            },
            include: [
              {
                model: campaingdetail,
                include: [
                  {
                    model: product,
                  },
                ],
              },
              {
                model: ShippingModel,
              },
              {
                model: user,
                include: [
                  {
                    model: merchantDetail,
                  },
                ],
              },
            ],
          },
        ],
      });
      let countData = {
        page: parseInt(req.query.page),
        pages: Math.ceil(wslist.length / limit.limit),
        totalRecords: wslist.length,
      };

      if (wslist) res.status(200).send({ success: true, wslist, countData });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  destroyFromWishlist = async (req, res) => {
    try {
      let getWishlist = await wishlist.findOne({
        where: {
          userId: req.user.id,
          campaignId: req.params.campaingid,
        },
      });

      if (!getWishlist)
        return res
          .status(200)
          .send({ code: 404, success: true, message: "Item Not Found" });

      let deletefromWishlist = await wishlist.destroy({
        where: {
          userId: req.user.id,
          campaignId: req.params.campaingid,
        },
      });

      if (deletefromWishlist)
        return res
          .status(200)
          .send({ success: true, message: "Item Removed From Wishlist" });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };
}

module.exports = WishlistController;
