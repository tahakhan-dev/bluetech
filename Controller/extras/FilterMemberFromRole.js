const db = require("../../Model");

const limit = require("../extras/DataLimit");
const { ArraySlicePagination } = require("../extras/pagination/pagination");

const Permissions = db.permissions;
const Users = db.users;
const DetailedUser = db.usersdetail;
const Merchantdetail = db.MerchantDetails;
const Likes = db.LikeModel;
const WishList = db.WishListModel;
const ImageData = db.imageData;

module.exports = async function (req, res, userId, isBlocked, isRetur) {
  try {
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let paginations = ArraySlicePagination(PageNumber, PageSize);
    let members = await Users.findAll({
      raw: true,
      nest: true,
      where: {
        isDelete: false,
        isBlocked: isBlocked,
      },
      include: [
        userId
          ? {
              model: Permissions,
              where: {
                roleId: req.params.roleId,
                userId: userId,
              },
            }
          : {
              model: Permissions,
              where: {
                roleId: req.params.roleId,
              },
            },
        {
          model: DetailedUser,
        },
        {
          model: Likes,
        },
        {
          model: WishList,
        },
        {
          model: Merchantdetail,
        },
        {
          model: ImageData,
        },
      ],
    });

    var setObj = new Set();

    var result = members.reduce((acc, item) => {
      if (!setObj.has(item.id)) {
        setObj.add(item.id, item);
        acc.push(item);
      }
      return acc;
    }, []);

    let countData = {
      page: parseInt(PageNumber),
      pages: Math.ceil(result.length / PageSize),
      totalRecords: result.length,
    };
    if (PageNumber && PageSize) {
      return res
        .status(200)
        .send({
          success: true,
          data: result.slice(paginations.Start, paginations.End),
          countData,
        });
    } else {
      return res.status(200).send({ success: true, data: result, countData });
    }
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Something went wrong!",
    });
  }
};
