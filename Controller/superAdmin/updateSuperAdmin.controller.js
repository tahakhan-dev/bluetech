const db = require("../../Model");
const _ = require("lodash");
const randomstring = require("crypto-random-string");
const fs = require("fs");
const cloudinary = require("../../config/cloudinary.config");

const FindPermission = require("../extras/FindPermission");
const FindMembersRole = require("../extras/FindMemberRole");
const UpdatePermission = require("../extras/UpdatePermission");
const {
  validatePermissionGetAccess,
} = require("../extras/ValidateWithPermissions");
const { product, category } = require("../../Model");

const ImageData = db.imageData;
const Permissions = db.permissions;
const Users = db.users;
const UsersDetail = db.usersdetail;
const Merchnatdetails = db.MerchantDetails;
const merchantCategory = db.merchantCategoryModel;

class UpdateSuperAdmin {
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
      return { success: false, message: err.message };
    }
  };

  updateMember_ = async ({ req, res, isMerchant }) => {
    try {
      await FindMembersRole(req.params.roleId, res, req);
      let userId = req.params.userId;
      let user_ = {
        userName: req.body.userName,
      };
      let userNa = await Users.findOne({
        where: { userName: req.body.userName },
      });
      if (userNa && userNa.id != req.params.userId) {
        return res
          .status(400)
          .send({ success: false, message: "User Name Already Exists" });
      }

      await UsersDetail.findOne({
        raw: true,
        where: {
          userId,
        },
      });
      let userInfo = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        street: req.body.street,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        dob: req.body.dob,
        zipCode: req.body.zipCode,
        phoneNumber: req.body.phoneNumber,
        gender: req.body.gender,
        bio: req.body.bio,
        public_profile: req.body.public_profile,
      };

      let imgData = _.pick(req.body, [
        "userId",
        "imageId",
        "typeId",
        "imageUrl",
        "imageType",
      ]);
      let Updateerrors = [];
      if (req.file) {
        let rndStr;
        let foundImgData = await ImageData.findOne({
          raw: true,
          where: {
            userId: userId,
            imageType: "User",
          },
        });
        if (foundImgData) {
          rndStr = foundImgData.imageId.slice(14, 24);
        } else {
          rndStr = randomstring({
            length: 10,
          });
        }
        const dir = `uploads/users/${rndStr}/thumbnail/`;
        const path = req.file.path;

        cloudinary
          .uploads(path, dir)
          .then(async (uploadRslt) => {
            if (uploadRslt) {
              fs.unlinkSync(path);
              if (foundImgData) {
                imgData.userId = userId;
                imgData.imageId = uploadRslt.id;
                imgData.typeId = userId;
                imgData.imageUrl = uploadRslt.url;
                imgData.imageType = "User";

                cloudinary
                  .remove(foundImgData.imageId)
                  .then((rmvFile) => {
                    if (!rmvFile)
                      throw new Error(
                        "An error occured while updating the Image."
                      );
                  })
                  .catch((error) => {
                    return res.status(501).send({
                      success: false,
                      message:
                        error.message ||
                        "An error occured while updating the Image.",
                    });
                  });

                const createdImg = await ImageData.update(imgData, {
                  where: {
                    id: foundImgData.id,
                  },
                });
              } else {
                userInfo.imagePath = uploadRslt.url;
                imgData.userId = userId;
                imgData.imageId = uploadRslt.id;
                imgData.typeId = userId;
                imgData.imageUrl = uploadRslt.url;
                imgData.imageType = "User";

                const createdImg = await ImageData.create(imgData);
              }
              if (isMerchant) {
                let merchantExtradetails = _.pick(req.body, [
                  "bussinessName",
                  "storeName",
                  "webSiteUrl",
                  "categoryIds",
                  "receiveNotification",
                  "lat",
                  "lng",
                  "location",
                ]);

                let updateMerchnatdetail = await Merchnatdetails.update(
                  merchantExtradetails,
                  {
                    where: {
                      userId: req.params.userId,
                    },
                  }
                );

                if (updateMerchnatdetail[0]) {
                  let getallmerchantCategory = await merchantCategory.findAll({
                    raw: true,
                    where: {
                      userId: req.params.userId,
                    },
                    include: [
                      {
                        model: category,
                      },
                    ],
                  });

                  if (getallmerchantCategory.length) {
                    res
                      .status(200)
                      .send({ success: true, getallmerchantCategory });
                    let compareId = JSON.parse(
                      merchantExtradetails.categoryIds
                    );
                    let getCatId = getallmerchantCategory.map(
                      (x) => x.categoryId
                    );
                    let bulkCreateMerchantCategory = [];
                    let DeletedCategoryId = getCatId.filter(
                      (obj) => !compareId.some((obj2, index) => obj == obj2)
                    );
                    let PresentCategoryId = getCatId.filter((obj) =>
                      compareId.some((obj2, index) => obj == obj2)
                    );
                    let CreateCategoryId = compareId.filter(
                      (obj) =>
                        !PresentCategoryId.some((obj2, index) => obj == obj2)
                    );
                    CreateCategoryId.map((x) =>
                      bulkCreateMerchantCategory.push({
                        merchantDetailId:
                          getallmerchantCategory[0].merchantDetailId,
                        userId: req.params.userId,
                        categoryId: x,
                      })
                    );
                    if (DeletedCategoryId.length) {
                      DeletedCategoryId.map(async (x) => {
                        let getProducts = await product.findOne({
                          where: {
                            categoryId: x,
                            merchantId: req.params.userId,
                          },
                        });
                        if (getProducts) {
                          getallmerchantCategory
                            .filter(function (cats) {
                              return cats.categoryId === x;
                            })
                            .map(function (cats) {
                              Updateerrors.push(cats.category.name);
                            });
                        } else {
                          await merchantCategory.destroy({
                            where: {
                              userId: req.params.userId,
                              categoryId: x,
                            },
                          });
                        }
                      });
                    }
                    if (CreateCategoryId.length) {
                      await merchantCategory.bulkCreate(
                        bulkCreateMerchantCategory
                      );
                    }
                  }
                }
              }
              await Users.update(user_, {
                where: {
                  id: req.params.userId,
                },
              });

              await UsersDetail.update(userInfo, {
                where: {
                  userId: req.params.userId,
                },
              });

              if (Updateerrors.length) {
                return res.status(200).send({
                  success: true,
                  message: `Merchant Details Are Updated Succesfully,You can't delete ${Updateerrors} Categories`,
                });
              } else {
                return res.status(200).send({
                  success: true,
                  message: "Merchant Details Updated Succesfully",
                });
              }
            } else {
              return res.status(501).send({
                success: false,
                message: "An error occured while updating the Image.",
              });
            }
          })
          .catch((error) => {
            return res.status(500).send({
              success: false,
              message: error.message,
            });
          });
      } else {
        if (isMerchant) {
          let merchantExtradetails = _.pick(req.body, [
            "bussinessName",
            "storeName",
            "webSiteUrl",
            "categoryIds",
            "receiveNotification",
            "lat",
            "lng",
            "location",
          ]);

          let updateMerchnatdetail = await Merchnatdetails.update(
            merchantExtradetails,
            {
              where: {
                userId: req.params.userId,
              },
            }
          );

          if (updateMerchnatdetail[0]) {
            let getallmerchantCategory = await merchantCategory.findAll({
              raw: true,
              nest: true,
              where: {
                userId: req.params.userId,
              },
              include: [
                {
                  model: category,
                },
              ],
            });

            if (getallmerchantCategory.length) {
              let compareId = JSON.parse(merchantExtradetails.categoryIds);
              let getCatId = getallmerchantCategory.map((x) => x.categoryId);
              let bulkCreateMerchantCategory = [];
              let DeletedCategoryId = getCatId.filter(
                (obj) => !compareId.some((obj2, index) => obj == obj2)
              );
              let PresentCategoryId = getCatId.filter((obj) =>
                compareId.some((obj2, index) => obj == obj2)
              );
              let CreateCategoryId = compareId.filter(
                (obj) => !PresentCategoryId.some((obj2, index) => obj == obj2)
              );
              CreateCategoryId.map((x) =>
                bulkCreateMerchantCategory.push({
                  merchantDetailId: getallmerchantCategory[0].merchantDetailId,
                  userId: req.params.userId,
                  categoryId: x,
                })
              );
              if (DeletedCategoryId.length) {
                DeletedCategoryId.map(async (x) => {
                  let getProducts = await product.findOne({
                    where: {
                      categoryId: x,
                      merchantId: req.params.userId,
                    },
                  });
                  if (getProducts) {
                    getallmerchantCategory
                      .filter(function (cats) {
                        return cats.categoryId === x;
                      })
                      .map(function (cats) {
                        Updateerrors.push(cats.category.name);
                      });
                  } else {
                    await merchantCategory.destroy({
                      where: {
                        userId: req.params.userId,
                        categoryId: x,
                      },
                    });
                  }
                });
              }
              if (CreateCategoryId.length) {
                await merchantCategory.bulkCreate(bulkCreateMerchantCategory);
              }
            }
          }
        }
        await Users.update(user_, {
          where: {
            id: req.params.userId,
          },
        });

        await UsersDetail.update(userInfo, {
          where: {
            userId: req.params.userId,
          },
        });

        if (Updateerrors.length) {
          return res.status(200).send({
            success: true,
            message: `Merchant Details Are Updated Succesfully,You can't delete ${Updateerrors} Categories`,
          });
        } else {
          return res.status(200).send({
            success: true,
            message: "Merchant Details Updated Succesfully",
          });
        }
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };

  updateMember = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);

      let roleMember = await FindMembersRole(req.params.roleId, res, req);

      if (roleMember.roleName == "Admin") {
        let permissionIs = null;
        if (req.params.userId == req.user.id) {
          permissionIs = getPermission.canUpdateOwnAccount;
        } else {
          permissionIs = getPermission.canUpdateAdmin;
        }
        validatePermissionGetAccess({
          permissionIs,
          req,
          res,
          _func: this.updateMember_({
            req,
            res,
            isMerchant: false,
          }),
        });
      } else if (roleMember.roleName == "User") {
        let permissionIs = null;
        if (req.params.userId == req.user.id) {
          permissionIs = getPermission.canUpdateOwnAccount;
        } else {
          permissionIs = getPermission.canUpdateUser;
        }
        validatePermissionGetAccess({
          permissionIs,
          req,
          res,
          _func: this.updateMember_({
            req,
            res,
            isMerchant: false,
          }),
        });
      } else if (roleMember.roleName == "Merchant") {
        let permissionIs = null;
        if (req.params.userId == req.user.id) {
          permissionIs = getPermission.canUpdateOwnAccount;
        } else {
          permissionIs = getPermission.canUpdateMerchant;
        }
        validatePermissionGetAccess({
          permissionIs,
          req,
          res,
          _func: this.updateMember_({
            req,
            res,
            isMerchant: true,
          }),
        });
      } else if (roleMember.roleName == "Super Admin") {
        let permissionIs = null;
        if (req.params.userId == req.user.id) {
          permissionIs = getPermission.canUpdateOwnAccount;
        } else {
          permissionIs = getPermission.canUpdateAdmin;
        }
        validatePermissionGetAccess({
          permissionIs,
          req,
          res,
          _func: this.updateMember_({
            req,
            res,
            isMerchant: false,
          }),
        });
      } else {
        res.status(200).send({
          code: 404,
          success: true,
          message: "Role does not Exist!",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  updateMemberPermissions = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      let userPermission = await this.filterMemberFromRole(req.params.userId);
      let roleMember = await FindMembersRole(req.params.roleId, res, req);

      if (roleMember.roleName == "Admin") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canUpdateAdmin,
          req,
          res,
          _func: UpdatePermission({
            req,
            res,
            userPermission,
          }),
        });
      } else if (roleMember.roleName == "Merchant") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canUpdateMerchant,
          req,
          res,
          _func: UpdatePermission({
            req,
            res,
            userPermission,
          }),
        });
      } else if (roleMember.roleName == "User") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canUpdateUser,
          req,
          res,
          _func: UpdatePermission({
            req,
            res,
            userPermission,
          }),
        });
      } else {
        res.status(401).send({
          success: false,
          message: "You don't have permissions!",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };
}

module.exports = UpdateSuperAdmin;
