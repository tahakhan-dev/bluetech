const db = require("../../Model");
const _ = require("lodash");
const path = require("path");
const moment = require("moment");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateUser, socialUser } = require("../../Model/user.model");
const Emailverification = require("../extras/Emailverification");
const sendVerificationEmail = require("../extras/EmailverificationSend");
const { userPermission } = require("../extras/Permission");
const cloudinary = require("../../config/cloudinary.config");
const randomstring = require("crypto-random-string");
const Op = db.Sequelize.Op;

const { ArraySlicePagination } = require("../extras/pagination/pagination");

const {
  getUserAccorStatus,
  getUserBySearchName,
} = require("../extras/GetUserAccorStatus");
const limit = require("../extras/DataLimit/index");
const { setUserStateToken } = require("../../cache/redis.service");

var privateKEY = fs.readFileSync("config/cert/private.key", "utf8");

const Permissions = db.permissions;
const UsersDetail = db.usersdetail;
const Users = db.users;
const Block = db.blockUserModel;
const merchantDetails = db.MerchantDetails;
const Roles = db.roles;
const Friends = db.friends;
const Likes = db.LikeModel;
const WishList = db.WishListModel;
const ImageData = db.imageData;
const emailverification = db.Emailverification;
const Appsetting =  db.appsetting;
class User {
  create = async (req, res) => {
    const { error } = validateUser(req.body);
    if (error)
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    const userAge = moment().diff(req.body.dob, "years");

    if (req.body.dob && userAge < 13)
      return res.status(400).send({
        success: false,
        message: "Under 13 are not allowed to create account.",
        userge: `You are ${userAge} Years Old.`,
      });

    let usernameRes = await Users.findOne({
      where: { email: req.body.userName },
    });

    if (usernameRes != null)
      return res
        .status(200)
        .send({ success: false, message: "This user name already exists!" });

    let userResponses = await Users.findOne({
      where: { email: req.body.email },
    });

    if (userResponses != null)
      return res
        .status(200)
        .send({ success: false, message: "This email already exists!" });

    if (req.body.phoneNumber.length > 0) {
      let resp = await UsersDetail.findOne({
        where: { phoneNumber: req.body.phoneNumber },
      });
      if (resp != null)
        return res.status(200).send({
          success: false,
          message: "This number already exist enter another number",
        });
    }
    Users.findOne({
      raw: true,
      nest: true,
      where: {
        email: req.body.email,
      },
      include: [
        {
          model: db.usersdetail,
        },
      ],
    })
      .then(async (result) => {
        if (result && result.email == req.body.email) {
          res
            .status(200)
            .send({ success: false, message: "Email Already Exist!." });
        } else if (result) {
          if (
            (result && result.isBlocked == 1) ||
            (result && result.isDelete == 1) ||
            (result.isDelete == 1 && result.isBlocked == 1)
          ) {
            return res.status(200).send({
              success: false,
              message: "Your Account is Deleted or Suspended by admin",
            });
          }
        } else if (
          result &&
          req?.body?.phoneNumber &&
          result?.usersdetails?.phoneNumber == req.body.phoneNumber
        ) {
          return res
            .status(200)
            .send({ success: false, message: "Phone Number Already Exist!." });
        } else {
          let createdImg;
          const customUser = _.pick(req.body, [
            "userName",
            "email",
            "password",
            "userType",
            "gender",
          ]);
          let imgData = _.pick(req.body, [
            "userId",
            "imageId",
            "typeId",
            "imageUrl",
            "imageType",
          ]);
          const foundUserName = await Users.findOne({
            where: { userName: customUser.userName },
          });
          let isChat = await Appsetting.findOne({where:{id:1}})
          const salt = await bcrypt.genSalt(10);
          customUser.password = await bcrypt.hash(customUser.password, salt);
          customUser.isBlocked = false;
          customUser.isDelete = false;
          if(isChat.IsActive == 1){
            customUser.isChat = true;
          }
          if (
            foundUserName &&
            foundUserName.dataValues.userName == customUser.userName
          )
            return res.status(200).send({
              success: false,
              message: "This user name already exists!.",
            });

          if (customUser.userType == "custom") {
            Users.create(customUser)
              .then((data) => {
                Roles.findAll({
                  where: {
                    roleName: "User",
                  },
                })
                  .then(async (result) => {
                    let details = _.pick(req.body, [
                      "firstName",
                      "lastName",
                      "dob",
                      "about",
                      "phoneNumber",
                      "phoneCountry",
                    ]);
                    const rndStr = randomstring({ length: 10 });
                    let dir = `uploads/users/${rndStr}/thumbnail/`;
                    if (req.file) {
                      const path = req.file.path;
                      cloudinary
                        .uploads(path, dir)
                        .then(async (uploadRslt) => {
                          let userId = data.dataValues.id;
                          imgData.userId = userId;
                          imgData.imageId = uploadRslt.id;
                          imgData.typeId = userId;
                          imgData.imageUrl = uploadRslt.url;
                          imgData.imageType = "User";

                          createdImg = await ImageData.create(imgData);
                          fs.unlinkSync(path);

                          let roleId = result[0].dataValues.id;
                          details.userId = userId;

                          await UsersDetail.create(details);

                          let permissionobj = userPermission;

                          permissionobj.userId = userId;
                          permissionobj.roleId = roleId;

                          Permissions.create(permissionobj);
                          res.status(200).send({
                            success: true,
                            message:
                              "Registeration Successful. Please verify your email.",
                            data,
                            createdImg,
                          });
                          sendVerificationEmail(
                            req,
                            res,
                            data.dataValues.id,
                            data.dataValues.email,
                            data.dataValues.userName
                          );
                        })
                        .catch((error) => {
                          return res.status(501).send({
                            success: false,
                            message:
                              "An error occured while Creating the User.",
                          });
                        });
                    } else {
                      let roleId = result[0].dataValues.id;
                      let userId = data.dataValues.id;
                      details.userId = data.dataValues.id;
                      details.imagePath = null;

                      await UsersDetail.create(details);

                      let permissionobj = userPermission;

                      permissionobj.userId = userId;
                      permissionobj.roleId = roleId;

                      Permissions.create(permissionobj);
                      res.status(200).send({
                        success: true,
                        message:
                          "Registeration Successful. Please verify your email.",
                        data,
                      });
                      sendVerificationEmail(
                        req,
                        res,
                        data.dataValues.id,
                        data.dataValues.email,
                        data.dataValues.userName
                      );
                    }
                  })
                  .catch((err) => {
                    res.status(501).send({
                      success: false,
                      message:
                        err.message ||
                        "Some error occurred while creating the User.",
                    });
                  });
              })
              .catch((err) => {
                res.status(501).send({
                  success: false,
                  message:
                    err.message ||
                    "Some error occurred while creating the User.",
                });
              });
          } else {
            res
              .status(200)
              .send({ success: false, message: "User Type is Invalid." });
          }
        }
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message:
            err.message || "Some error occurred while creating the User.",
        });
      });
  };

  checkCustomUser = async (email, userName) => {
    try {
      let customUser = await Users.findOne({
        raw: true,
        nest: true,
        where: {
          [Op.or]: [
            { email: email, userType: "custom" },
            { userName: userName },
          ],
        },
      });

      if (customUser && customUser.userName == userName) {
        return {
          success: true,
          data: customUser,
          message: "User Name already exist",
        };
      } else if (customUser && customUser.email == email) {
        return {
          success: true,
          data: customUser,
          message: "User Already Exist Please Login from Email Password",
        };
      } else {
        return { success: false, data: customUser };
      }
    } catch (error) {
      return { success: false, message: error };
    }
  };

  checkCurrentUser = async (req, res) => {
    try {
      let currentUser = await Users.findOne({
        raw: true,
        nest: true,
        where: {
          email: req.body.email,
        },
      });
      if (currentUser && currentUser.email) {
        return res
          .status(200)
          .send({ success: true, already_register: true, currentUser });
      } else {
        return res
          .status(200)
          .send({ success: true, already_register: false, currentUser });
      }
    } catch (error) {
      res.status(503).send({
        success: false,
        message: error.message || "Something went wrong!",
      });
    }
  };

  getCurrentUser = async (id) => {
    try {
      let c_user = await Users.findAll({
        raw: true,
        nest: true,
        where: {
          id: id,
        },

        include: [
          {
            model: UsersDetail,
            where: {
              userId: id,
            },
          },
          {
            model: Likes,
          },
          {
            model: WishList,
          },
        ],
      });

      return c_user;
    } catch (err) {
      return err;
    }
  };

  social = async (req, res) => {
    const { error } = socialUser(req.body);
    if (error)
      return res.send({ success: false, message: error.details[0].message });

    try {
      Users.findOne({
        where: [
          {
            email: req.body.email,
          },
        ],
      })
        .then(async (result) => {
          if (
            (result && result.dataValues.isBlocked == true) ||
            (result && result.dataValues.isDelete == true)
          ) {
            res.status(200).send({
              success: false,
              message: "This Account is Suspended or Deleted by Admin",
            });
          } else if (result && result.dataValues.email) {
            let Token = AuthTokenGen(result.dataValues.id);

            let members = await Users.findAll({
              raw: true,
              nest: true,
              include: [
                {
                  model: Permissions,
                  where: {
                    userId: result.dataValues.id,
                  },
                },
              ],
              include: [
                {
                  model: db.usersdetail,
                  where: {
                    userId: result.dataValues.id,
                  },
                },
              ],
            });

            setUserStateToken(Token, 48 * 60 * 60)
              .then((success) => {})
              .catch((error) => {
                res.status(200).send({
                  success: false,
                  message: error.message,
                });
              });


              let userupdate = await Users.update(
                {
                  fcmtoken: req.body.fcmtoken,
                },
                {
                  where: {
                  id: result.dataValues.id,
                  },
                }
              )

            res.header("x-auth-token", Token).status(200).send({
              success: true,
              message: "Successfully logged in",
              data: members,
              accessToken: Token,
            });
          } else {
            const socialUser = _.pick(req.body, [
              "userName",
              "email",
              "userType",
            ]);
            socialUser.isBlocked = false;
            socialUser.isDelete = false;
            socialUser.emailVerified = true;
            let details = _.pick(req.body, ["firstName", "lastName"]);
            if (
              socialUser.userType == "facebook" ||
              socialUser.userType == "gmail"
            ) {
              let userNameresp = await Users.findOne({
                where: { email: req.body.userName },
              });

              if (userNameresp != null) {
                return res
                  .status(200)
                  .send({ success: false, message: "User Name Exists" });
              }

              let userresp = await Users.findOne({
                where: { email: req.body.email },
              });

              if (userresp != null) {
                return res
                  .status(200)
                  .send({ success: false, message: "User Already Exists" });
              }

              let customUser = await this.checkCustomUser(
                req.body.email,
                req.body.userName
              );

              if (customUser.success)
                return res.status(200).send({
                  success: false,
                  message: customUser.message,
                });

              Users.create(socialUser)
                .then((data) => {
                  Roles.findAll({
                    where: {
                      roleName: "User",
                    },
                  })
                    .then(async (result) => {
                      let roleId = result[0].dataValues.id;
                      let userId = data.dataValues.id;
                      details.imagePath = "";
                      details.userId = data.dataValues.id;

                      let details_update = await UsersDetail.create(details);

                      let permissionobj = userPermission;

                      permissionobj.userId = userId;
                      permissionobj.roleId = roleId;

                      await Permissions.create(permissionobj);

                      let Token = AuthTokenGen(data.dataValues.id);

                      setUserStateToken(Token, 48 * 60 * 60)
                        .then((success) => {})
                        .catch((error) => {
                          res.status(200).send({
                            success: false,
                            message: error.message,
                          });
                        });

                      let c_user = await Users.findAll({
                        raw: true,
                        nest: true,
                        where: {
                          id: userId,
                        },

                        include: [
                          {
                            model: UsersDetail,
                            where: {
                              userId: userId,
                            },
                          },
                          {
                            model: Likes,
                          },
                          {
                            model: WishList,
                          },
                        ],
                      });

                     

                      let userupdate = await Users.update(
                        {
                          fcmtoken: req.body.fcmtoken,
                        },
                        {
                          where: {
                          id: userId,
                          },
                        }
                      )


                      res.status(200).send({
                        success: true,
                        message: "Created Successfully",
                        data: c_user,
                        accessToken: Token,
                        already_register: true,
                        id: userId,
                      });
                    })
                    .catch((err) => {
                      res.status(500).send({
                        success: false,
                        message:
                          err.message ||
                          "Some error occurred while creating the User.",
                      });
                    });
                })
                .catch((err) => {
                  res.status(500).send({
                    success: false,
                    message:
                      err.message ||
                      "Some error occurred while creating the User.",
                  });
                });
            } else {
              res.status(200).send({
                success: false,
                message: "User Type Error.",
              });
            }
          }
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              err.message || "Some error occurred while creating the User.",
          });
        });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Some error occurred while creating the User.",
      });
    }
  };

  paginate = (page, pageSize) => {
    const offset = page * pageSize;
    const limit = pageSize;

    return {
      page: parseInt(offset),
      limit: parseInt(limit),
    };
  };

  getAllCustomer = async (req, res) => {
    try {
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let userID = req.user.id;
      let userArray = [];
      let resData = [];
      let blockerIds = [];
      let friendSenderIds = [];
      let friendRecieverIds = [];
      let blockerResp = [];
      let userRole,
        blockResult,
        blockerResponse,
        users,
        blocker,
        results,
        countData,
        filterUsers,
        friendSenderData,
        friendRecieverData,
        cusData,
        valData;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      userArray.push(userID);

      userRole = await Roles.findOne({
        raw: true,
        where: {
          roleName: "User",
        },
      });

      users = await Users.findAll({
        raw: false,
        nest: true,
        where: { emailVerified: 1, isBlocked: false, isDelete: false },

        include: [
          {
            model: db.friends,
            as: "receiver",
          },
          {
            model: db.friends,
            as: "sender",
          },
          {
            model: Permissions,
            where: {
              roleId: userRole.id,
            },
          },
          {
            model: UsersDetail,
          },
          {
            model: ImageData,
          },
        ],
      });

      blocker = await Block.findAll({ where: { blockedId: req.user.id } });

      blocker.forEach((res) => {
        blockerIds.push(res.blockerId);
      });

      blockerResponse = await Block.findAll({
        where: { blockerId: req.user.id },
      });

      blockerResponse.forEach((res) => {
        blockerResp.push(res.blockedId);
      });

      blockResult = users.filter((val) => !blockerResp.includes(val.id));

      results = blockResult.filter((val) => !blockerIds.includes(val.id));

      filterUsers = results.filter((item) => {
        if (item.id != req.user.id) {
          return item;
        }
      });

      friendSenderData = await Friends.findAll({
        where: { senderId: req.user.id, isPending: 0, isFriend: 1 },
      });

      friendSenderData.forEach((res) => {
        friendSenderIds.push(res.receiverId);
      });

      friendRecieverData = await Friends.findAll({
        where: { receiverId: req.user.id, isPending: 0, isFriend: 1 },
      });

      friendRecieverData.forEach((res) => {
        friendRecieverIds.push(res.senderId);
      });

      cusData = filterUsers.filter((val) => !friendSenderIds.includes(val.id));

      resData = cusData.filter((val) => !friendRecieverIds.includes(val.id));

      valData = resData.filter((val) => !userArray.includes(val.id));

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(valData.length / PageSize),
        totalRecords: valData.length,
      };

      return res.send({
        success: true,
        data: valData.slice(paginations.Start, paginations.End),
        countData,
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getCustomerById = async (req, res) => {
    try {
      const { userId } = req.params;
      const payloadId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      let visitedUser = await UsersDetail.findOne({
        raw: true,
        where: {
          userId: userId,
        },
      });

      let _blockMember = await Block.findOne({
        raw: true,
        where: {
          [Op.or]: [
            {
              blockerId: {
                [Op.eq]: payloadId,
              },
            },
            {
              blockedId: {
                [Op.eq]: payloadId,
              },
            },
          ],
        },
      });

      if (visitedUser && _blockMember) {
        let info = await getUserAccorStatus({
          isFriend: false,
          isBlock: true,
          key: "id",
          userId,
          publicProfile: visitedUser.public_profile,
        });
      }

      let _res = await Friends.findOne({
        raw: true,
        where: {
          isPending: false,
          isFriend: true,
          [Op.or]: [
            {
              senderId: {
                [Op.eq]: payloadId,
              },
            },
            {
              receiverId: {
                [Op.eq]: payloadId,
              },
            },
          ],
        },
      });

      if (_res) {
        let info = await getUserAccorStatus({
          isFriend: true,
          isBlock: false,
          key: "id",
          userId,
          publicProfile: visitedUser.public_profile,
        });

        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(info.length / PageSize),
          totalRecords: info.length,
        };
        return res.status(200).send({
          success: true,
          data: info.slice(paginations.Start, paginations.End),
          countData,
        });
      } else {
        let _ = await getUserAccorStatus({
          isFriend: false,
          isBlock: false,
          key: "id",
          userId,
          publicProfile: visitedUser.public_profile,
        });

        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(_.length / PageSize),
          totalRecords: _.length,
        };
        res.status(200).send({
          success: true,
          data: _.slice(paginations.Start, paginations.End),
          countData,
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getCustomerFriendsById = async (req, res) => {
    try {
      const payloadId = req.params.customerId;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      let _res = await db.friends.findAll({
        raw: true,
        where: {
          isPending: false,
          isFriend: true,
          [Op.or]: [
            {
              senderId: {
                [Op.eq]: payloadId,
              },
            },
            {
              receiverId: {
                [Op.eq]: payloadId,
              },
            },
          ],
        },
      });

      if (!_res.length)
        return res
          .status(200)
          .send({ success: false, message: "No Friends Yet!" });

      let _friends = [];
      let counter = 0;
      _res.forEach(async (val, index, array) => {
        if (val.senderId == payloadId) {
          _friends.push(val.receiverId);
        } else {
          _friends.push(val.senderId);
        }
        counter++;
        if (counter == array.length) {
          let getuser = await db.users.findAll({
            where: { isBlocked: false, isDelete: false },
            include: [
              {
                model: db.usersdetail,
                where: {
                  userId: _friends,
                },
              },
              {
                model: ImageData,
              },
            ],
            attributes: ["id", "userName", "email", "isBlocked"],
          });
          getuser.forEach((x) => {
            x.dataValues["usersdetails"] = x.dataValues.usersdetails[0];
          });
          let countData = {
            page: parseInt(PageNumber),
            pages: Math.ceil(getuser.length / limit.limit),
            totalRecords: getuser.length,
          };
          if (getuser.length) {
            res.status(200).send({
              success: true,
              data: getuser.slice(paginations.Start, paginations.End),
              // data:getuser,
              FriendsCount: getuser.length,
              countData,
            });
          } else {
            res
              .status(200)
              .send({ success: false, message: "No Friends yet !" });
          }
        }
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  verifyEmail = async (req, res) => {
    const token = req.params.token;

    let response = await emailverification.findAll({
      where: { token: token, isExpired: 1 },
    });

    if (response.length > 0) {
      res.sendFile(path.join(ROOTPATH, "public/TokenExpired.html"));
    } else {
      Emailverification(token, res)
        .then((res) => res)
        .catch((err) => {});
    }
  };

  getMerchantByCode = async (req, res) => {
    try {
      let merchantcode = req.params.code;

      let users = await Users.findAll({
        nest: true,
        raw: true,
        include: [
          {
            model: UsersDetail,
          },
          {
            model: merchantDetails,
            where: {
              merchantCode: merchantcode,
            },
          },
        ],
      });
      res.status(200).send({ success: true, data: users });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  searchByUserName = async (req, res) => {
    try {
      const { userName, userId } = req.body;
      const payloadId = req.user.id;

      let visitedUser = await Users.findOne({
        raw: true,
        nest: true,
        where: {
          userName: userName,
        },
        include: [
          {
            model: UsersDetail,
          },
        ],
      });

      let _blockMember = await Block.findOne({
        raw: true,
        where: {
          [Op.or]: [
            {
              blockerId: {
                [Op.eq]: payloadId,
              },
            },
            {
              blockedId: {
                [Op.eq]: payloadId,
              },
            },
          ],
        },
      });

      if (_blockMember) {
        let info = await getUserBySearchName({
          isFriend: false,
          isBlock: true,
          key: "userName",
          userId: userName,
          publicProfile: visitedUser.usersdetails.public_profile,
        });
        res.status(200).send({ success: true, data: info });
      }

      let _res = await Friends.findOne({
        raw: true,
        where: {
          isPending: false,
          isFriend: true,
          [Op.or]: [
            {
              senderId: {
                [Op.eq]: userId,
              },
            },
            {
              receiverId: {
                [Op.eq]: userId,
              },
            },
          ],
        },
      });

      if (_res) {
        let info = await getUserBySearchName({
          isFriend: true,
          isBlock: false,
          key: "userName",
          userId: userName,
          publicProfile: visitedUser.usersdetails.public_profile,
        });
        res.status(200).send({ success: true, data: info });
      } else {
        let _ = await getUserBySearchName({
          isFriend: false,
          isBlock: false,
          key: "userName",
          userId: userName,
          publicProfile: visitedUser.usersdetails.public_profile,
        });
        res.status(200).send({ success: true, data: _ });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };
}
// meta: {anon: false, expiry:}
function AuthTokenGen(id, meta) {
  var i = "GIVEES";
  var s = "givees@gmail.com";
  var signOptions = {
    issuer: i,
    subject: s,
    algorithm: "RS256",
  };
  var payload = {
    id: id,
  };
  // jwt.sign(payload, config.get("JWT.privateKey"))
  var token = jwt.sign(payload, privateKEY, signOptions);
  // This function is pushing the jwt to a cache Any jwt not in this cache is not
  // usable
  return token;
}

module.exports = User;
