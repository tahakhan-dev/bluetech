const db = require("../../Model");
const _ = require("lodash");
const randomstring = require("crypto-random-string");

const bcrypt = require("bcrypt");
const {
  adminPermission,
  merchantPermission,
  superAdminPermission,
  userPermission,
} = require("../extras/Permission");
const valideRole = require("../extras/validateWithRole");
const fs = require("fs");

const FindPermission = require("../extras/FindPermission");
const FindMembersRole = require("../extras/FindMemberRole");
const {
  validatePermissionGetAccess,
} = require("../extras/ValidateWithPermissions");

const cloudinary = require("../../config/cloudinary.config");

const Permissions = db.permissions;
const Users = db.users;
const UsersDetail = db.usersdetail;
const Merchnatdetails = db.MerchantDetails;
const ImageData = db.imageData;
const merchantCategory = db.merchantCategoryModel;
const Op = db.Sequelize.Op;

class SuperAdmin {
  filterMemberFromRole = async (userId) => {
    try {
      let members = await Users.findAll({
        limit: 1,
        raw: true,
        nest: true,
        where: {
          isDelete: false,
          isBlocked: false,
        },
        include: [
          {
            model: Permissions,
            where: {
              userId: userId,
            },
          },
        ],
      });
      return members[0];
    } catch (err) {
      return err;
    }
  };

  registerMember = async (value, res) => {
    try {
      await Permissions.create(value);

      return res
        .status(201)
        .send({ success: true, message: "Member Created Successfully!" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  merchantCreator = async ({
    req,
    res,
    merchantExtradetails,
    details,
    permissionDefine,
  }) => {
    try {
      let merchantDetails = await Merchnatdetails.create(merchantExtradetails);
      if (merchantDetails) {
        let bulkCreateMerchantCategory = [];
        let count = 0;
        merchantExtradetails.categoryIds.forEach(async (val, index, array) => {
          bulkCreateMerchantCategory.push({
            merchantDetailId: merchantDetails.id,
            userId: merchantDetails.userId,
            categoryId: val,
          });
          count++;
          if (array.length == count) {
            merchantCategory
              .bulkCreate(bulkCreateMerchantCategory)
              .then(() => {
                // Notice: There are no arguments here, as of right now you'll have to...
                return merchantCategory.findAll();
              })
              .then((users) => {})
              .catch((err) => {});
          }
        });
      }
      await UsersDetail.create(details);
      return this.registerMember(permissionDefine, res);
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  createMember = async ({ req, res }) => {
    try {
      let rolevelidation = await valideRole(req.body.roleId, req.body, res);
      let roleMember = await FindMembersRole(req.body.roleId, res, req);
      let permissionDefine;

      if (roleMember.roleName == "Merchant" && rolevelidation == "Merchant") {
        permissionDefine = merchantPermission;
      } else if (roleMember.roleName == "User") {
        permissionDefine = userPermission;
      } else if (roleMember.roleName == "Admin") {
        permissionDefine = adminPermission;
      } else if (roleMember.roleName == "Super Admin") {
        permissionDefine = superAdminPermission;
      } else {
        res
          .status(200)
          .send({ code: 404, success: false, message: "Role Does not exist" });
      }

      let result = await Users.findOne({
        raw: true,
        where: {
          [Op.or]: [
            {
              email: {
                [Op.eq]: req.body.email,
              },
            },
            {
              userName: {
                [Op.eq]: req.body.userName,
              },
            },
          ],
        },
      });

      if (result && result.email == req.body.email)
        return res
          .status(409)
          .send({ success: false, message: "Email Already Exist!." });
      if (result && result.userName == req.body.userName)
        return res
          .status(409)
          .send({ success: false, message: "Username cannot be same!." });
      const user = _.pick(req.body, ["userName", "email", "password"]);
      let merchantExtradetails = _.pick(req.body, [
        "bussinessName",
        "storeName",
        "webSiteUrl",
        "receiveNotification",
        "categoryIds",
        "lat",
        "lng",
        "street",
        "state",
        "city",
        "country",
        "location",
      ]);
      let details = _.pick(req.body, [
        "firstName",
        "lastName",
        "address",
        "street",
        "country",
        "city",
        "state",
        "zipCode",
        "dob",
        "imagePath",
        "phoneNumber",
        "gender",
        "bio",
      ]);
      let imgData = _.pick(req.body, [
        "userId",
        "imageId",
        "typeId",
        "imageUrl",
        "imageType",
      ]);
      user.emailVerified = 1;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      let userResponse;

      if (rolevelidation == "Merchant" || rolevelidation == "User") {
        userResponse = await Users.create(user);
      }

      const newUserId = userResponse.dataValues.id;

      if (req.file) {
        const rndStr = randomstring({ length: 10 });
        let dir = `uploads/users/${rndStr}/thumbnail/`;
        const path = req.file.path;
        cloudinary
          .uploads(path, dir)
          .then(async (uploadRslt) => {
            if (uploadRslt) {
              imgData.userId = newUserId;
              imgData.imageId = uploadRslt.id;
              imgData.typeId = newUserId;
              imgData.imageUrl = uploadRslt.url;
              imgData.imageType = "User";

              await ImageData.create(imgData);

              fs.unlinkSync(path);

              details.userId = userResponse.dataValues.id;
              permissionDefine.userId = userResponse.dataValues.id;
              permissionDefine.roleId = req.body.roleId;

              merchantExtradetails.merchantCode = randomstring({
                length: 5,
                type: "distinguishable",
              });
              merchantExtradetails.userId = userResponse.dataValues.id;

              if (roleMember.roleName == "Merchant") {
                return this.merchantCreator({
                  req,
                  res,
                  merchantExtradetails,
                  details,
                  permissionDefine,
                });
              }

              await UsersDetail.create(details);

              this.registerMember(permissionDefine, res);
            }
          })
          .catch((error) => {
            res.status(501).send({
              success: false,
              message:
                error.message ||
                "Some error occurred while Uploading the Image.",
            });
          });
      } else {
        details.userId = userResponse.dataValues.id;
        permissionDefine.userId = userResponse.dataValues.id;
        permissionDefine.roleId = req.body.roleId;

        merchantExtradetails.merchantCode = randomstring({
          length: 5,
          type: "distinguishable",
        });
        merchantExtradetails.userId = userResponse.dataValues.id;

        if (roleMember.roleName == "Merchant") {
          return this.merchantCreator({
            req,
            res,
            merchantExtradetails,
            details,
            permissionDefine,
          });
        }

        await UsersDetail.create(details);

        this.registerMember(permissionDefine, res);
      }
    } catch (err) {
      return res.status(501).send({
        success: false,
        message: err.message || "Some error occurred while creating the Role.",
      });
    }
  };

  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      let roleMember = await FindMembersRole(req.body.roleId, res, req);
      if (roleMember.roleName == "Admin") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canCreateAdmin,
          req,
          res,
          _func: this.createMember({ req, res }),
        });
      } else if (roleMember.roleName == "User") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canCreateUser,
          req,
          res,
          _func: this.createMember({ req, res }),
        });
      } else if (roleMember.roleName == "Merchant") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canCreateMerchant,
          req,
          res,
          _func: this.createMember({ req, res }),
        });
      } else if (roleMember.roleName == "Super Admin") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canCreateAdmin,
          req,
          res,
          _func: this.createMember({ req, res }),
        });
      } else {
        res
          .status(200)
          .send({ code: 404, success: false, message: "Role Not Found" });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };
}

module.exports = SuperAdmin;
