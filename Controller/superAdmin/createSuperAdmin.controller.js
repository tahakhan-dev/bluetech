const db = require("../../Model");
const _ = require("lodash");

const bcrypt = require("bcrypt");
const {
  adminPermission,
  merchantPermission,
  superAdminPermission,
  userPermission,
} = require("../extras/Permission");
const valideRole = require("../extras/validateWithRole");
const FindMembersRole = require("../extras/FindMemberRole");
const Permissions = db.permissions;
const Users = db.users;
const UsersDetail = db.usersdetail;

class CreateSuperAdmin {
  registerMember = async (value, res) => {
    try {
      Permissions.create(value);
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
          email: req.body.email,
        },
      });

      if (result && result.email) {
        res
          .status(409)
          .send({ success: false, message: "Email Already Exist!." });
      } else {
        const user = _.pick(req.body, ["userName", "email", "password"]);
        let merchantExtradetails = _.pick(req.body, [
          "bussinessName",
          "storeName",
          "webSiteUrl",
          "categoryId",
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
          "phoneNumber",
          "about",
          "gender",
          "bio",
        ]);
        let resp = await UsersDetail.findOne({
          where: { phoneNumber: details.phoneNumber },
        });
        if (resp)
          return res
            .status(200)
            .send({ success: false, message: "This Number Is Already Exists" });
        if (user) user.emailVerified = 1;
        user.userType = "custom";
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        let userResponse = await Users.create(user);
        details.userId = userResponse.dataValues.id;
        merchantExtradetails.userId = userResponse.dataValues.id;
        permissionDefine.userId = userResponse.dataValues.id;
        permissionDefine.roleId = req.body.roleId;

        await UsersDetail.create(details);

        this.registerMember(permissionDefine, res);
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Some error occurred while creating the Role.",
      });
    }
  };

  create = async (req, res) => {
    try {
      this.createMember({ req, res });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };
}

module.exports = CreateSuperAdmin;
