const db = require("../../Model");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const moment = require("moment");
const UserDetail = require("./userDetail.controller");
const { imageData } = require("../../Model");
const sequelize = db.Sequelize;
const Permissions = db.permissions;
const Op = db.Sequelize.Op;

class GetMerchant {
  getMerchants = async (req, res) => {
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let latitude = req.query.latitude;
    let longtitude = req.query.longitude;
    let actionid = parseInt(req.query.actionid);
    let qId = req.query.id;
    let members;
    let whereUp = {
      id: req.query.id,
      isBlocked: false,
    };
    let whereDiff = { isBlocked: false, isDelete: false };
    let where = qId ? whereUp : whereDiff;

    function paginate(array, page_size, page_number) {
      
      return array.slice(
        (page_number - 1) * page_size,
        page_number * page_size
      );
    }


    try {
      
      //actionid ===> 2 // Withoutlocation
      if(actionid === 2){
        members = await db.users.findAll({
          raw: false,
          nest: true,
          
          where,
          include: [
            {
              model: Permissions,
              where: {
                roleId: 3,
              },
            },
            {
              model: db.imageData,
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
                  // where: {
                  //   isBlocked: 0,
                  //   isDelete: 0,
                  // },
                },
              ],
            },
            {
              model: db.WishListModel,
            },
            {
              model: db.MerchantDetails,
              include: [
                {
                  model: db.merchantCategoryModel,
                  
                  include: [
                    {
                      model: db.category,
                    },
                  ],
                },
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
                  [Op.gt]: moment(Date.now())
                    .tz("Asia/Karachi")
                    .format("YYYY-MM-DDTHH:mm:ss"),
                },
              },
              include: [
                {
                  model: db.ShippingModel,
                },
                {
                  model: db.campaignDetail,
                  where: {
                    avaliablityStock: {
                      [Op.gte]: 1,
                    },
                  },
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
   }
    else{
      members = await db.users.findAll({
        raw: false,
        nest: true,
       
        where,
        include: [
          {
            model: Permissions,
            where: {
              roleId: 3,
            },
          },
          {
            model: db.imageData,
            // association: db.users.hasMany(db.imageData, {
            //   foreignKey: "typeId",
            // }),
            // where: {
            //   imageType: "User",
            // },
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
                // where: {
                //   isBlocked: 0,
                //   isDelete: 0,
                // },
              },
            ],
          },
          {
            model: db.WishListModel,
          },
          {
            model: db.MerchantDetails,
            attributes: [[sequelize.literal('6371 * acos(cos(radians(' + latitude + ')) * cos(radians(`merchantDetails`.`lat`)) * cos(radians(' + longtitude + ') - radians(`merchantDetails`.`lng`)) + sin(radians(' + latitude + ')) * sin(radians(`merchantDetails`.`lat`)))'),`distance`],"id","userId","bussinessName","storeName","webSiteUrl","merchantCode","likes","receiveNotification","lat","lng","createdAt","updatedAt"],
            include: [
              {
                model: db.merchantCategoryModel,
                
                include: [
                  {
                    model: db.category,
                  },
                ],
              },
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
                [Op.gt]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: db.ShippingModel,
              },
              {
                model: db.campaignDetail,
                where: {
                  avaliablityStock: {
                    [Op.gte]: 1,
                  },
                },
                
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
              // {
              //   model: db.CategoryModel,
              //   association: db.MerchantDetails.hasMany(db.CategoryModel, {
              //     foreignKey: "merchantDetailId",
              //   }),
              // },
            ],
          },
        ],
      });
      members.sort((a, b) => parseFloat(a.merchantDetails[0].dataValues.distance) - parseFloat(b.merchantDetails[0].dataValues.distance));
    }
      let countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(members.length / parseInt(PageSize)),
        totalRecords: members.length,
      };

      res.status(200).send({
        success: true,
        data: paginate(members, parseInt(PageSize), parseInt(PageNumber)),
        countData,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error,
      });
    }
  };

  searchBygetMerchants = async (req, res) => {
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let latitude = req.query.latitude;
    let longtitude = req.query.longitude;
    const search = req.query.search;
    let members;
    function paginate(array, page_size, page_number) {
      
      return array.slice(
        (page_number - 1) * page_size,
        page_number * page_size
      );
    }


    try {
      
      
      
      members = await db.users.findAll({
        raw: false,
        nest: true,
       
        where: {
          isBlocked: false, 
          isDelete: false,
        },
        include: [
          {
            model: Permissions,
            where: {
              roleId: 3,
            },
          },
          {
            model: db.imageData,
            // association: db.users.hasMany(db.imageData, {
            //   foreignKey: "typeId",
            // }),
            // where: {
            //   imageType: "User",
            // },
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
                // where: {
                //   isBlocked: 0,
                //   isDelete: 0,
                // },
              },
            ],
          },
          {
            model: db.WishListModel,
          },
          {
            model: db.MerchantDetails,
            attributes: [[sequelize.literal('6371 * acos(cos(radians(' + latitude + ')) * cos(radians(`merchantDetails`.`lat`)) * cos(radians(' + longtitude + ') - radians(`merchantDetails`.`lng`)) + sin(radians(' + latitude + ')) * sin(radians(`merchantDetails`.`lat`)))'),`distance`],"id","userId","bussinessName","storeName","webSiteUrl","merchantCode","likes","receiveNotification","lat","lng","createdAt","updatedAt"],
            required:true,
            where: {
             
              [Op.or]: [
                {
                  storeName: {
                    [Op.like]: "%" + search + "%",
                  },
                },
                {
                  bussinessName: {
                    [Op.like]: "%" + search + "%",
                  },
                },
              ],
    
            },
            include: [
              {
                model: db.merchantCategoryModel,
                
                include: [
                  {
                    model: db.category,
                  },
                ],
              },
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
                [Op.gt]: moment(Date.now())
                  .tz("Asia/Karachi")
                  .format("YYYY-MM-DDTHH:mm:ss"),
              },
            },
            include: [
              {
                model: db.ShippingModel,
              },
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
              // {
              //   model: db.CategoryModel,
              //   association: db.MerchantDetails.hasMany(db.CategoryModel, {
              //     foreignKey: "merchantDetailId",
              //   }),
              // },
            ],
          },
        ],
      });
      members.sort((a, b) => parseFloat(a.merchantDetails[0].dataValues.distance) - parseFloat(b.merchantDetails[0].dataValues.distance));
    
      let countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(members.length / parseInt(PageSize)),
        totalRecords: members.length,
      };

      res.status(200).send({
        success: true,
        data: paginate(members, parseInt(PageSize), parseInt(PageNumber)),
        countData,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error,
      });
    }
  };

  get_merchantsV1 = async (req, res) => {
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;

    let qId = req.query.id;
    let whereUp = {
      id: req.query.id,
      isBlocked: false,
      isDelete: false,
    };
    let whereDiff = { isBlocked: false, isDelete: false };
    let where = qId ? whereUp : whereDiff;

    try {
      let totalcount = await db.users.count({
        where,
      });
      let members = await db.users.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where,
        include: [
          {
            model: Permissions,
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
            model: db.MerchantDetails,
          },
        ],
      });

      let countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      res.status(200).send({
        success: true,
        data: members,
        countData,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };

  searchMerchant = async (req, res) => {
    let SearchQuery = req.params.searchQuery;
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let members;
    let paginations = ArraySlicePagination(PageNumber, PageSize);
    let userWhere, merchantWhere;

    try {
      let foundU = await db.users.findOne({
        where: {
          isBlocked: false,
          isDelete: false,
          userName: {
            [Op.like]: "%" + SearchQuery + "%",
          },
        },
      });

      if (foundU) {
        userWhere = {
          isBlocked: false,
          isDelete: false,
          userName: {
            [Op.like]: "%" + SearchQuery + "%",
          },
        };
        merchantWhere = {};
      } else {
        userWhere = {
          isBlocked: false,
          isDelete: false,
        };

        merchantWhere = {
          [Op.or]: [
            {
              bussinessName: {
                [Op.like]: "%" + SearchQuery + "%",
              },
            },
            {
              storeName: {
                [Op.like]: "%" + SearchQuery + "%",
              },
            },
          ],
        };
      }
      let totalcount = await db.users.count({
        where: userWhere,
        include: [
          {
            model: Permissions,
            where: {
              roleId: 3,
            },
          },
          {
            model: db.imageData,
            // association: db.users.hasMany(db.imageData, {
            //   foreignKey: "typeId",
            // }),
            // where: {
            //   imageType: "User",
            // },
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
            where: merchantWhere,
            include: [
              {
                model: db.merchantCategoryModel,
                include: [
                  {
                    model: db.category,
                  },
                ],
              },
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
                [Op.gt]: moment(Date.now())
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
      members = await db.users.findAll({
        raw: false,
        nest: true,
        where: userWhere,
        include: [
          {
            model: Permissions,
            where: {
              roleId: 3,
            },
          },
          {
            model: db.imageData,
            // association: db.users.hasMany(db.imageData, {
            //   foreignKey: "typeId",
            // }),
            // where: {
            //   imageType: "User",
            // },
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
            where: merchantWhere,
            include: [
              {
                model: db.merchantCategoryModel,
                include: [
                  {
                    model: db.category,
                  },
                ],
              },
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
                [Op.gt]: moment(Date.now())
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

      let countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      res.status(200).send({
        success: true,
        data: members,
        countData,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };

  getActivityMerchant = async (req, res) => {
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;

    let qId = req.query.id;
    let whereUp = {
      id: req.query.id,
      isBlocked: false,
    };

    let whereDiff = { isBlocked: false, isDelete: false };
    let where = qId ? whereUp : whereDiff;

    try {
      let totalcount = await db.users.count({
        where,
        include: [
          {
            model: Permissions,
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
          },
          {
            model: db.campaign,
            where: {
              isActive: true,
              isExpired: false,
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
      let members = await db.users.findAll({
        raw: false,
        nest: true,
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where,
        include: [
          {
            model: Permissions,
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
          },
          {
            model: db.campaign,
            where: {
              isActive: true,
              isExpired: false,
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

      let countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      res.status(200).send({
        success: true,
        data: members,
        countData,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };

  getMerchantsCode = async (req, res) => {
    try {
      let IsMerchant = await db.users.findOne({
        where: { id: req.user.id, isBlocked: 0, isDelete: 0 },
        include: [
          {
            model: Permissions,
            where: { roleId: 3 },
          },
        ],
      });
      if (!IsMerchant)
        return res
          .status(404)
          .send({ success: false, data: [], message: "No Merchant Found" });

      let MerchantCode = await db.MerchantDetails.findOne({
        where: {
          userId: req.user.id,
        },
      });

      if (!MerchantCode)
        return res.status(404).send({
          success: false,
          data: [],
          message: "No Merchant Code Found",
        });

      res.status(200).send({
        success: true,
        data: MerchantCode,
        message: "Merchant Code Found",
      });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };
}
module.exports = GetMerchant;
