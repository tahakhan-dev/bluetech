const db = require("../../Model");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { validate } = require("../../Model/userDetail.model");
const cloudinary = require("../../config/cloudinary.config");
const randomstring = require("crypto-random-string");

const { getAllimagesByTypeAndTypeId } = require("../extras/getImages");

const ImageData = db.imageData;
const Userdetail = db.usersdetail;
const Users = db.users;
const Op = db.Sequelize.Op;

class UserDetail {
  create = async (req, res) => {
    const { error } = validate(req.body);

    if (error)
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });

    Userdetail.findAll({
      where: {
        userId: req.user.id,
      },
    })
      .then(async (result) => {
        if (!result.length && result[0].dataValues.userId) {
        } else {
          const user = _.pick(req.body, [
            "firstName",
            "lastName",
            "address",
            "street",
            "country",
            "city",
            "state",
            "zipCode",
            "dob",
            "gender",
            "phoneNumber",
            "gender",
            "bio",
            "phoneCountry",
          ]);
          let imgData = _.pick(req.body, [
            "userId",
            "imageId",
            "typeId",
            "imageUrl",
            "imageType",
          ]);

          user.userId = req.user.id;

          if (req.file) {
            const rndStr = randomstring({ length: 10 });
            const dir = `uploads/users/${rndStr}/thumbnail/`;
            const path = req.file.path;
            cloudinary
              .uploads(path, dir)
              .then(async (result) => {
                if (result) {
                  fs.unlinkSync(path);

                  user.imagePath = result.url;

                  const createdUserDetail = await Userdetail.create(user);

                  if (createdUserDetail) {
                    imgData.userId = req.user.id;
                    imgData.imageId = result.id;
                    imgData.typeId = createdUserDetail.dataValues.id;
                    imgData.imageUrl = result.url;
                    imgData.imageType = "User";

                    const createdImg = await ImageData.create(imgData);
                    return res
                      .status(200)
                      .send({ success: true, createdUserDetail, ImageData });
                  } else {
                    return res.status(501).send({
                      success: false,
                      message:
                        "An error occured while Creating the Userdetails.",
                    });
                  }
                } else
                  return res.status(501).send({
                    success: false,
                    message: "An error occured while Uploading the Image.",
                  });
              })
              .catch((error) => {
                return res.status(501).send({
                  success: false,
                  message: "An error occured while Uploading the Image.",
                });
              });
          } else {
            user.imagePath = null;
            await Userdetail.create(user)
              .then((data) => {
                res.status(200).send({ success: true, data });
              })
              .catch((err) => {
                res.status(501).send({
                  success: false,
                  message:
                    err.message ||
                    "Some error occurred while creating the user details.",
                });
              });
          }
        }
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message:
            err.message ||
            "Some error occurred while creating the user details.",
        });
      });
  };

  getCurrentMembter = async (id) => {
    try {
      let members = await Users.findAll({
        raw: true,
        nest: true,
        where: {
          id: id,
        },

        include: [
          {
            model: db.usersdetail,
            where: {
              userId: id,
            },
          },

          {
            model: db.imageData,
            where: {
              imageType: "User",
              userId: id,
            },
          },
        ],
      });

      return members;
    } catch (err) {
      return err;
    }
  };

  getUsers = async (id) => {
    try {
      let members = await Users.findAll({
        raw: true,
        nest: true,
        where: {
          id: id,
        },

        include: [
          {
            model: db.usersdetail,
            where: {
              userId: id,
            },
          },
        ],
      });

      return members;
    } catch (err) {
      return err;
    }
  };

  updateCurrentUser = async ({ id, userDetails, userName, password }) => {
    try {
      const current_user = await db.users.findOne({
        raw: true,
        where: { id },
      });

      if (current_user.email) {
        await db.usersdetail.update(userDetails, {
          where: {
            userId: id,
          },
        });
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        let up_password = await bcrypt.hash(password, salt);
        await Users.update(
          { password: up_password },
          {
            where: {
              id: id,
            },
          }
        );
      }

      await db.users.update(
        { userName },
        {
          where: {
            id: id,
          },
        }
      );
      const user_info = await this.getUsers(id);

      return { success: true, message: "Details Updated", data: user_info };
    } catch (error) {
      return { success: false, message: error.message || "error" };
    }
  };

  checkPhoneNumber = async (user) => {
    try {
      let alreayNumber = await Userdetail.findOne({
        raw: true,
        where: {
          [Op.and]: [
            { phoneCountry: user.phoneCountry },
            { phoneNumber: user.phoneNumber },
          ],
        },
      });

      return alreayNumber;
    } catch (err) {
      return err;
    }
  };

  checkUserName = async (name) => {
    try {
      let alreadyName = await Users.findOne({
        raw: true,
        where: {
          userName: name,
        },
      });

      return alreadyName;
    } catch (err) {
      return err;
    }
  };

  update = async (req, res) => {
    try {
      let phoneInfo;
      const user = _.pick(req.body, [
        "firstName",
        "lastName",
        "address",
        "street",
        "country",
        "city",
        "state",
        "zipCode",
        "dob",
        "phoneNumber",
        "gender",
        "public_profile",
        "bio",
        "new_password",
        "phoneCountry",
      ]);
      let imgData = _.pick(req.body, [
        "userId",
        "imageId",
        "typeId",
        "imageUrl",
        "imageType",
      ]);
      let alreadyUserName = await this.checkUserName(req.body.userName);

      if (user.phoneNumber) {
        phoneInfo = await Userdetail.findOne({
          where: {
            [Op.and]: [
              { phoneNumber: user.phoneNumber },
              { phoneCountry: user.phoneCountry },
            ],
          },
        });
      }
      if (
        alreadyUserName &&
        alreadyUserName?.userName &&
        alreadyUserName.id != req.params.id
      ) {
        return res
          .status(200)
          .send({ success: false, message: "User Name Already Exist!" });
      }

      if (
        phoneInfo &&
        phoneInfo?.phoneNumber &&
        phoneInfo.userId != req.params.id
      ) {
        return res.status(200).send({
          success: false,
          message: "User Phone Number Already Exist!",
        });
      }
      let foundUser = await Userdetail.findOne({
        raw: true,
        where: { userId: req.params.id },
      });
      if (!foundUser)
        return res
          .status(404)
          .send({ success: true, message: "Userdetail not found." });

      if (req.file) {
        let rndStr;
        let foundImgData = await ImageData.findOne({
          raw: true,
          where: { typeId: req.params.id, imageType: "User" },
        });

        if (foundImgData) {
          rndStr = foundImgData.imageId.slice(14, 24);
        } else {
          rndStr = randomstring({ length: 10 });
        }

        const dir = `uploads/users/${rndStr}/thumbnail/`;
        const path = req.file.path;

        cloudinary
          .uploads(path, dir)
          .then(async (imgResult) => {
            fs.unlinkSync(path);

            if (foundImgData === null) {
              imgData.userId = req.params.id;
              imgData.imageId = imgResult.id;
              imgData.typeId = req.params.id;
              imgData.imageUrl = imgResult.url;
              imgData.imageType = "User";

              user.userId = req.params.id;
              user.imagePath = imgResult.url;

              let updatedUserdetails = await Userdetail.update(user, {
                where: {
                  userId: req.params.id,
                },
              });

              if (updatedUserdetails[0]) {
                if (req.body.new_password) {
                  const salt = await bcrypt.genSalt(10);
                  let password = await bcrypt.hash(req.body.new_password, salt);
                  await Users.update(
                    { password: password },
                    {
                      where: {
                        id: req.params.id,
                      },
                    }
                  );
                } else if (req.body.userName)
                  await Users.update(
                    { userName: req.body.userName },
                    {
                      where: {
                        id: req.params.id,
                      },
                    }
                  );
                await ImageData.create(imgData);

                let info = await this.getCurrentMembter(req.params.id);
                
                res.status(200).send({
                  success: true,
                  message: "Successfully Updated!",
                  data: info,
                  
                });
              }
            } else {
              if (
                alreadyUserName &&
                alreadyUserName?.userName &&
                alreadyUserName.id != req.params.id
              ) {
                return res.status(200).send({
                  success: false,
                  message: "User Name Already Exist!",
                });
              }

              if (
                phoneInfo &&
                phoneInfo?.phoneNumber &&
                phoneInfo.userId != req.params.id
              )
                return res.status(200).send({
                  success: false,
                  message: "Phone Number Already Exist!",
                });

              imgData.userId = req.params.id;
              imgData.imageId = imgResult.id;
              imgData.typeId = req.params.id;
              imgData.imageUrl = imgResult.url;
              imgData.imageType = "User";

              cloudinary
                .remove(foundImgData.imageId)
                .then(async (rmvFile) => {
                  if (rmvFile) {
                    const createdImg = await ImageData.update(imgData, {
                      where: { imageUrl: foundImgData.imageUrl },
                    });

                    user.userId = req.user.id;
                    user.imagePath = imgResult.url;

                    let updatedUserdetails = await Userdetail.update(user, {
                      where: {
                        userId: req.params.id,
                      },
                    });

                    if (updatedUserdetails[0]) {
                      if (req.body.new_password) {
                        const salt = await bcrypt.genSalt(10);
                        let password = await bcrypt.hash(
                          req.body.new_password,
                          salt
                        );
                        await Users.update(
                          { password: password },
                          {
                            where: {
                              id: req.params.id,
                            },
                          }
                        );
                      } 
                      else if (req.body.isShowFriend) {
          
                        await Users.update(
                          { isShowFriend: req.body.isShowFriend },
                          {
                            where: {
                              id: req.params.id,
                            },
                          }
                        );
                      }
                      else if (req.body.userName)
                        await Users.update(
                          { userName: req.body.userName },
                          {
                            where: {
                              id: req.params.id,
                            },
                          }
                        );

                      let info = await this.getCurrentMembter(req.params.id);
                          
                      res.status(200).send({
                        success: true,
                        message: "Successfully Updated!",
                        data: info,
                      });
                    } else
                      res.status(200).send({
                        success: false,
                        message:
                          "Some error occurred while updating the Userdetails.",
                      });
                  } else {
                    return res.status(501).send({
                      success: false,
                      message: "An error occured while updating the Image.",
                    });
                  }
                })
                .catch((error) => {
                  return res.status(501).send({
                    success: false,
                    message:
                      error.message ||
                      "An error occured while updating the Image.",
                  });
                });
            }
          })
          .catch((error) => {
            return res.status(501).send({
              success: false,
              message:
                error.message ||
                "Some error occurred while updating the Userdetails.",
            });
          });
      } else {
        if (req.body.new_password) {
          const salt = await bcrypt.genSalt(10);
          let password = await bcrypt.hash(req.body.new_password, salt);
          await Users.update(
            { password: password, userName: req.body.userName },
            {
              where: {
                id: req.params.id,
              },
            }
          );
        }
        else if (req.body.isShowFriend) {
          
          await Users.update(
            { isShowFriend: req.body.isShowFriend },
            {
              where: {
                id: req.params.id,
              },
            }
          );
        }
        else if (req.body.userName)
          await Users.update(
            { userName: req.body.userName },
            {
              where: {
                id: req.params.id,
              },
            }
          );

        user.userId = req.params.id;

        Userdetail.update(user, { where: { userId: req.params.id } })
          .then(async (data) => {
            try {
              let members = await Users.findAll({
                raw: true,
                nest: true,
                include: [
                  {
                    model: db.permissions,
                    where: {
                      userId: req.params.id,
                    },
                  },
                ],
                include: [
                  {
                    model: db.usersdetail,
                    where: {
                      userId: req.params.id,
                    },
                  },
                ],
              });

              Promise.all(
                members.map(async (x) => {
                  let user = new Object(x);
                  return getAllimagesByTypeAndTypeId("User", x.id).then(
                    (objs) => {
                      if (objs) {
                        if (objs.getImages.length) {
                          user["imgs"] = objs.getImages[0];
                          if (objs.getIndexs.length) {
                            user["indexes"] = objs.getIndexs;
                          }
                        }
                      }
                      return user;
                    }
                  );
                })
              ).then((data) => {
                res.status(200).send({
                  success: true,
                  message: "User Details Updated!",
                  data: data,
                });
              });
            } catch (error) {
              res.status(501).send({
                success: false,
                message:
                  error.message ||
                  "Some error occurred while updating the Userdetails.",
              });
            }
          })
          .catch((err) => {
            res.status(501).send({
              success: false,
              message:
                err.message ||
                "Some error occurred while updating the Userdetails.",
            });
          });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message:
          error.message ||
          "Some error occurred while updating the user details.",
      });
    }
  };

  getUserDetail = async (req, res) => {
    try {
      let userId = req.params.id;
      let members = await Users.findOne({
        raw: true,
        nest: true,
        where: {
          id: userId,
        },

        include: [
          {
            model: db.usersdetail,
            where: {
              userId: userId,
            },
          },
        ],
      });

      members
        ? res
            .status(200)
            .send({ success: true, data: members, message: "UserDetail" })
        : res
            .status(200)
            .send({ success: true, data: null, message: "No User Found" });
    } catch (err) {
      res.status(400).send({ success: false, message: err });
    }
  };
}

module.exports = UserDetail;
