const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const { getUser, updateUser } = require("../extras/BlockUser");
const FindMembersRole = require("../extras/FindMemberRole");
const {
  validatePermissionGetAccess,
} = require("../extras/ValidateWithPermissions");
const Users = db.users;
const UsersDetail = db.usersdetail;
const Campaign = db.campaign;
const Merchnatdetails = db.MerchantDetails;
const VoucherGenration = db.VoucherGen;
const products = db.product;

class DeleteSuperAdmin {
  block_ = async ({ req, res }) => {
    try {
      let userResponse = await getUser(req, res, req.params.userId);

      await updateUser({
        req,
        res,
        userId: userResponse.id,
        status: userResponse.isBlocked ? false : true,
        key: "isBlocked",
      });

      return res
        .status(200)
        .send({ success: true, message: "Successfully Blocked!" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  Merchantblock_ = async ({ req, res }) => {
    try {
      let voucherResponse = "";
      let merchantCamp = [];
      let campaignIds;
      let userResponse = await getUser(req, res, req.params.userId);

      if (userResponse != undefined) {
        let merchantResponse = await Merchnatdetails.findOne({
          where: { userId: req.params.userId },
        });

        if (merchantResponse != null && merchantResponse != undefined) {
          campaignIds = await Campaign.findAll({
            where: { merchantId: merchantResponse.id, isActive: 1 },
          });
        } else {
          return res
            .status(200)
            .send({
              success: true,
              data: null,
              message: "This User is not merchant",
            });
        }

        if (campaignIds.length > 0) {
          for (let i = 0; i < campaignIds.length; i++) {
            merchantCamp.push(campaignIds[i]);
            voucherResponse = await VoucherGenration.findAll({
              where: {
                campaignId: campaignIds[i].id,
                isExpired: 0,
                isActive: 1,
              },
            });
          }
        }

        if (voucherResponse.length > 0) {
          res
            .status(400)
            .send({
              success: false,
              message: "User Can't be blocked Its has some Voucher",
            });
        } else {
          await updateUser({
            req,
            res,
            userId: userResponse.id,
            status: userResponse.isBlocked ? false : true,
            key: "isBlocked",
          });

          if (userResponse.isBlocked) {
            await Campaign.update(
              { isActive: 1, isExpired: 0 },
              { where: { merchantId: req.params.userId } }
            );
          } else {
            await Campaign.update(
              { isActive: 0, isExpired: 1 },
              { where: { merchantId: req.params.userId } }
            );
          }

          return res
            .status(200)
            .send({ success: true, message: "Successfully Blocked!" });
        }
      } else {
        return res
          .status(200)
          .send({ success: true, data: null, message: "No user found" });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  delete_ = async ({ req, res }) => {
    try {
      let userResponse = await getUser(req, res, req.params.userId);
      await updateUser({
        req,
        res,
        userId: userResponse.id,
        status: userResponse.isDelete ? false : true,
        key: "isDelete",
      });

      await products.update(
        { isActive: 0 },
        { where: { merchantId: req.params.userId } }
      );

      if (userResponse.emailVerified == 0) {
        await Users.update(
          { userName: "", email: "" },
          { where: { id: req.params.userId } }
        );
        await UsersDetail.update(
          { phoneNumber: "", phoneCountry: "" },
          { where: { userId: req.params.userId } }
        );
      }

      return res
        .status(200)
        .send({ success: true, message: "Successfully Deleted!" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  blockMember = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);

      let roleMember = await FindMembersRole(req.params.roleId, res, req);

      if (roleMember.roleName == "Admin") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canBlockAdmin,
          req,
          res,
          _func: this.block_({ req, res }),
        });
      } else if (roleMember.roleName == "Merchant") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canBlockMerchant,
          req,
          res,
          _func: this.Merchantblock_({ req, res }),
        });
      } else if (roleMember.roleName == "User") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canBlockUser,
          req,
          res,
          _func: this.block_({ req, res }),
        });
      } else {
        res
          .status(401)
          .send({ success: false, message: "You don't have permissions!" });
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

      let roleMember = await FindMembersRole(req.params.roleId, res, req);

      if (roleMember.roleName == "Admin") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canDeleteAdmin,
          req,
          res,
          _func: this.delete_({ req, res }),
        });
      } else if (roleMember.roleName == "Merchant") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canDeleteMerchant,
          req,
          res,
          _func: this.delete_({ req, res }),
        });
      } else if (roleMember.roleName == "User") {
        validatePermissionGetAccess({
          permissionIs: getPermission.canDeleteUser,
          req,
          res,
          _func: this.delete_({ req, res }),
        });
      } else {
        res
          .status(401)
          .send({ success: false, message: "You don't have permissions!" });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };
}

module.exports = DeleteSuperAdmin;
