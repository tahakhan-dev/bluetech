const db = require("../../../Model");
const moment = require("moment");

const Users = db.users;
const DetailedUser = db.usersdetail;
const ImageData = db.imageData;
const Likes = db.LikeModel;
const Friends = db.friends;
const Op = db.Sequelize.Op;

const getUserAccorStatus = async function ({ isBlock, key, userId }) {
  try {
    if (isBlock) {
      let userInfo = await Users.findOne({
        raw: true,
        nest: true,
        where: { isDelete: false, isBlocked: false, [key]: [userId] },
        include: [
          {
            model: ImageData,
          },
          {
            model: DetailedUser,
            
          },

          {
            model: db.MerchantDetails,
          },
        ],
        attributes: ["userName", "id", "email", "userType"],
      });

      return userInfo;
    }

    let userInfo = await Users.findAll({
      nest: true,
      where: { isDelete: false, isBlocked: false, [key]: [userId] },

      include: [
        {
          model: ImageData,
        },
        {
          model: DetailedUser,
          include: {
            as: "blocked",
            model: db.blockUserModel,
          },
        },
        {
          model: db.MerchantDetails,
        },
        {
          model: Likes,
          include: [
            {
              as: "Likes",
              model: db.users,
              where: {
                isBlocked: 0,
                isDelete: 0,
              },

              include: [
                {
                  model: db.campaign,
                  where: {
                    isActive: true,
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
                },
                {
                  model: db.usersdetail,
                },
                {
                  model: db.LikeModel,
                  as: "Likes",
                  include: [
                    { model: db.users, where: { isBlocked: 0, isDelete: 0 } },
                  ],
                },
                {
                  model: db.MerchantDetails,
                  include: [
                    { 
                      model: db.users, 
                      where: { isBlocked: 0, isDelete: 0 },
                      include: [
                        {
                        model: ImageData,
                        },
                      ], 
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: db.campaignLikes,

          include: [
            {
              model: db.campaign,
              where: {
                isActive: true,
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
                { model: db.campaignDetail },
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
          model: Friends,
          as: "receiver",
        },
        {
          model: Friends,
          as: "sender",
        },
      ],
    });
    return userInfo;
  } catch (err) {
    return err;
  }
};

const getUserBySearchName = async function ({
  isFriend,
  isBlock,
  key,
  userId,
  publicProfile,
}) {
  try {
    if (isBlock) {
      let userInfo = await Users.findOne({
        raw: true,
        nest: true,
        where: { isDelete: false, isBlocked: false, [key]: [userId] },
        attributes: ["userName", "id", "email", "userType"],
      });

      return userInfo;
    }

    let userInfo = await Users.findOne({
      raw: true,
      nest: true,
      where: { isDelete: false, isBlocked: false, [key]: [userId] },

      include: [
        (!isFriend && publicProfile) || !publicProfile
          ? {
              model: DetailedUser,
              attributes: ["imagePath", "firstName", "public_profile"],
            }
          : isFriend
          ? {
              model: DetailedUser,
              attributes: [
                "imagePath",
                "firstName",
                "public_profile",
                "lastName",
              ],
            }
          : null,
      ],
    });

    return userInfo;
  } catch (err) {
    return err;
  }
};

const updateUser = async function ({ req, res, userId, status, key }) {
  try {
    await Users.update({ [key]: status }, { where: { id: userId } });

    return res
      .status(200)
      .send({ success: true, message: "Successfully Done!" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Something Went Wrong!",
    });
  }
};

module.exports.getUserAccorStatus = getUserAccorStatus;
module.exports.updateUser = updateUser;
module.exports.getUserBySearchName = getUserBySearchName;
