const db = require("../../Model");
const _ = require("lodash");
const { validateUser: userAlias } = require("../../Model/user.model");
const { validatePermission } = require("../../Model/permissions.model");
const bcrypt = require("bcrypt");
const {
  merchantPermission,
  userPermission,
} = require("../../Controller/extras/Permission");

const FindPermission = require("../../Controller/extras/FindPermission");
const FilterMemberFromRole = require("../../Controller/extras/FilterMemberFromRole");
const { getUser, updateUser } = require("../../Controller/extras/BlockUser");
const UpdatePermission = require("../../Controller/extras/UpdatePermission");
const GetMerchant = require("../../Controller/extras/GetMerchant");

const Roles = db.roles;
const Permissions = db.permissions;
const Users = db.users;
const Op = db.Sequelize.Op;
const UsersDetail = db.usersdetail;

class AdminController {
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

  findMembersRole = async (roleId, res, req) => {
    try {
      let userRole = await Roles.findAll({
        where: { id: roleId },
        raw: true,
      });

      return userRole[0];
    } catch (err) {
      res.send({
        success: false,
        message: err.message || "Something Went Wrong While Getting Roles!",
      });
    }
  };

  validatePermissions = async ({ permission, req, res, msg, userId }) => {
    try {
      if (permission) {
        let filterMember = await FilterMemberFromRole(req, res, userId);
      } else {
        this.handleError(res, msg);
      }
    } catch (err) {
      res.send(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  registerMember = async (value, res) => {
    try {
      let memberRegister = Permissions.create(value);

      return res
        .status(200)
        .send({ success: true, message: "Member Created Successfully!" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  handleError = (res, name) => {
    return res.status(403).send({
      success: false,
      message: `You don't have permission to ${name}.`,
    });
  };

  _updateUser = async ({ req, res, userId, user_, userInfo }) => {
    try {
      let updatedUser = await Users.update(user_, {
        where: { id: userId },
      });

      let updatedUserInfo = await UsersDetail.update(userInfo, {
        where: { userId: userId },
      });
      return res
        .status(200)
        .send({ success: true, message: "Successfully Updated" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: "Something went wrong while updating!",
      });
    }
  };

  createMerchant = async (result, req, res) => {
    if (result.length && result[0].email) {
      res
        .status(401)
        .send({ success: false, message: "Email Already Exist!." });
    } else {
      const user = _.pick(req.body, ["userName", "email", "password"]);
      let permissionDefine;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      Users.create(user)
        .then(async (data) => {
          let userRole = {
            userId: data.dataValues.id,
            roleId: req.body.roleId,
          };

          try {
            let assignRole = await Roles.findAll({
              raw: true,
              where: {
                id: userRole.roleId,
              },
            });
            if (assignRole.length && assignRole[0].roleName == "Merchant") {
              permissionDefine = merchantPermission;
            }

            permissionDefine.userId = userRole.userId;
            permissionDefine.roleId = userRole.roleId;

            this.registerMember(permissionDefine, res);
          } catch (err) {
            return res
              .status(500)
              .send({ success: false, message: "No Role Found!" });
          }
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              err.message || "Some error occurred while creating the Role.",
          });
        });
    }
  };

  createUser = async (result, req, res) => {
    if (result.length && result[0].email) {
      res
        .status(401)
        .send({ success: false, message: "Email Already Exist!." });
    } else {
      const user = _.pick(req.body, ["userName", "email", "password"]);
      let permissionDefine;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      Users.create(user)
        .then(async (data) => {
          let userRole = {
            userId: data.dataValues.id,
            roleId: req.body.roleId,
          };

          try {
            let assignRole = await Roles.findAll({
              raw: true,
              where: {
                id: userRole.roleId,
              },
            });
            if (assignRole.length && assignRole[0].roleName == "User") {
              permissionDefine = userPermission;
            }

            permissionDefine.userId = userRole.userId;
            permissionDefine.roleId = userRole.roleId;

            this.registerMember(permissionDefine, res);
          } catch (err) {
            return res
              .status(500)
              .send({ success: false, message: "No Role Found!" });
          }
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              err.message || "Some error occurred while creating the Role.",
          });
        });
    }
  };

  create = async (req, res) => {
    const { error } = validatePermission(req.body);
    if (error)
      return res.send({ success: false, message: error.details[0].message });

    try {
      let userId = await FindPermission(req.user.id);
      let userRole = await Roles.findAll({
        where: { id: req.body.roleId },
        raw: true,
      });

      if (userRole.length && userRole[0].roleName == "Merchant") {
        if (userId[0].canCreateMerchant) {
          Users.findAll({
            raw: true,
            where: { email: req.body.email },
          })
            .then(async (result) => {
              this.createMerchant(result, req, res);
            })
            .catch((err) => {
              res.status(500).send({
                success: false,
                message:
                  err.message || "Some error occurred while creating the Role.",
              });
            });
        } else {
          this.handleError(res, "Create Merchant");
        }
      } else if (userRole.length && userRole[0].roleName == "User") {
        if (userId.length && userId[0].canCreateUser) {
          Users.findAll({
            raw: true,
            where: { email: req.body.email },
          })
            .then(async (result) => {
              this.createUser(result, req, res);
            })
            .catch((err) => {
              res.status(500).send({
                success: false,
                message:
                  err.message || "Some error occurred while creating the Role.",
              });
            });
        } else {
          this.handleError(res, "Create User");
        }
      } else {
        res
          .status(500)
          .send({ success: false, message: `You don't have permission` });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getMembers = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);

      let roleMember = await this.findMembersRole(req.params.roleId, res, req);

      if (roleMember.roleName == "User") {
        this.validatePermissions({
          permission: getPermission[0].canReadUser,
          req,
          res,
          message: "Get User",
        });
      } else if (roleMember.roleName == "Merchant") {
        if (getPermission[0].canReadMerchant) {
          let merchantMembers = GetMerchant(req, res);
          res.status(200).send({ data: merchantMembers });
        }

        // this.validatePermissions({
        //   permission: getPermission[0].canReadMerchant,
        //   req,
        //   res,
        //   message: "Get Merchant",
        // });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getRoles = async (req, res, next) => {
    try {
      let filterResponse = [];
      let result = await Roles.findAll();
      if (result.length) {
        result.forEach((element) => {
          filterResponse.push(element.dataValues);
        });
        res.send({
          message: "Successfully Get Role!",
          data: filterResponse,
        });
      } else {
        res.status(200).send({ success: true, message: "No Role Found!" });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getSpecificMember = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      let roleMember = await this.findMembersRole(req.params.roleId, res, req);

      if (roleMember.roleName == "User") {
        this.validatePermissions({
          permission: getPermission[0].canReadUser,
          req,
          res,
          message: "Get User",
          userId: req.params.userId,
        });
      } else if (roleMember.roleName == "Merchant") {
        this.validatePermissions({
          permission: getPermission[0].canReadMerchant,
          req,
          res,
          message: "Get Merchant",
          userId: req.params.userId,
        });
      } else {
        res.status(500).send({ success: false, message: "No Data Found!" });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  blockMember = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);

      let roleMember = await this.findMembersRole(req.params.roleId, res, req);

      if (roleMember.roleName == "User") {
        let userResponse = await getUser(req, res, req.params.userId);

        let aa = await updateUser({
          req,
          res,
          userId: userResponse.id,
          status: userResponse.isBlocked ? false : true,
          key: "isBlocked",
        });
      } else if (roleMember.roleName == "Merchant") {
        let userResponse = await getUser(req, res, req.params.userId);

        let aa = await updateUser({
          req,
          res,
          userId: userResponse.id,
          status: userResponse.isBlocked ? false : true,
          key: "isBlocked",
        });
      } else {
        res.status(500).send({
          message: "You don't have permission to block others member",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  deleteMember = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);

      let roleMember = await this.findMembersRole(req.params.roleId, res, req);

      if (roleMember.roleName == "User") {
        let userResponse = await getUser(req, res, req.params.userId);

        let aa = await updateUser({
          req,
          res,
          userId: userResponse.id,
          status: userResponse.isDelete ? false : true,
          key: "isDelete",
        });
      } else if (roleMember.roleName == "Merchant") {
        let userResponse = await getUser(req, res, req.params.userId);

        let aa = await updateUser({
          req,
          res,
          userId: userResponse.id,
          status: userResponse.isDelete ? false : true,
          key: "isDelete",
        });
      } else {
        res.status(500).send({
          success: false,
          message: "You don't have permission to block others member",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  updateMemberPermissions = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      let userPermission = await this.filterMemberFromRole(req.params.userId);
      let roleMember = await this.findMembersRole(req.params.roleId, res, req);
      if (roleMember.roleName == "User") {
        if (getPermission[0].canUpdateUser) {
          let _ = await UpdatePermission({ req, res, userPermission });
        } else {
          this.handleError(res, "Update User");
        }
      } else if (roleMember.roleName == "Merchant") {
        if (getPermission[0].canUpdateMerchant) {
          let _ = await UpdatePermission({ req, res, userPermission });
        } else {
          this.handleError(res, "Update User");
        }
      } else {
        this.handleError(res, "Update User");
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  updateMember = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      let userPermission = await this.filterMemberFromRole(req.params.userId);
      let roleMember = await this.findMembersRole(req.params.roleId, res, req);

      let user_ = {
        userName: req.body.userName,
      };
      let userInfo = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        street: req.body.street,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        phoneNumber: req.body.phoneNumber,
        gender: req.body.gender,
        bio: req.body.bio,
        imagePath: [],
      };

      if (roleMember.roleName == "User") {
        if (getPermission[0].canUpdateUser) {
          let _ = await this._updateUser({
            req,
            res,
            userId: req.params.userId,
            user_,
            userInfo,
          });
        } else {
          this.handleError(res, "Update User");
        }
      } else if (roleMember.roleName == "Merchant") {
        if (getPermission[0].canUpdateMerchant) {
          let _ = await this._updateUser({
            req,
            res,
            userId: req.params.userId,
            user_,
            userInfo,
          });
        } else {
          this.handleError(res, "Update User");
        }
      } else {
        this.handleError(res, "Update User");
      }
    } catch (err) {
      res
        .status(500)
        .send({
          success: false,
          message: err.message || "Something Went Wrong",
        });
    }
  };
}

module.exports = AdminController;
