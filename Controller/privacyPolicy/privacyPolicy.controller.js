const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const limit = require("../extras/DataLimit/index");
const privacyPolicy = db.PrivacyPolicyModel;

class PrivacyPolicyController {
  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canCreatePrivacyPolicy) {
        let schema = _.pick(req.body, ["title", "description"]);

        let create = await privacyPolicy.create(schema);

        if (create) {
          return res.status(200).send({
            success: true,
            message: "Privacy Policy Created Successfuly",
            data: create,
          });
        } else {
          return res.status(500).send({
            success: false,
            message: "Error While Creating Policies",
          });
        }
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permission to perform this action!",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  read = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadPrivacyPolicy) {
        let getAllPolicies = await privacyPolicy.findAll({
          offset:
            parseInt(req.query.page) * limit.limit
              ? parseInt(req.query.page) * limit.limit
              : 0,
          limit: req.query.page ? limit.limit : 1000000,
          where: {
            isActive: true,
          },
        });
        let countData = {
          page: parseInt(req.query.page),
          pages: Math.ceil(getAllPolicies.length / limit.limit),
          totalRecords: getAllPolicies.length,
        };

        return res.status(200).send({
          success: true,
          message: "Successfuly Fetched",
          data: getAllPolicies,
          totalRecords: countData,
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permission to perform this action!",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: true,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  read_app = async (req, res) => {
    try {
      let getAllPolicies = await privacyPolicy.findAll({
        offset:
          parseInt(req.query.page) * limit.limit
            ? parseInt(req.query.page) * limit.limit
            : 0,
        limit: req.query.page ? limit.limit : 1000000,
        where: {
          isActive: true,
        },
      });
      let countData = {
        page: parseInt(req.query.page),
        pages: Math.ceil(getAllPolicies.length / limit.limit),
        totalRecords: getAllPolicies.length,
      };

      return res.status(200).send({
        success: true,
        message: "Successfuly Fetched",
        data: getAllPolicies,
        totalRecords: countData,
      });
    } catch (err) {
      return res.status(500).send({
        success: true,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  update = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canUpdatePrivacyPolicy) {
        let getPolicy = await privacyPolicy.findOne({
          where: { id: req.params.id },
        });
        if (!getPolicy)
          return res
            .status(200)
            .send({
              code: 404,
              success: true,
              message: "Required Policy Not Found",
            });

        let schema = _.pick(req.body, ["title", "description"]);

        let getAllPolicies = await privacyPolicy.update(schema, {
          where: {
            id: req.params.id,
          },
        });

        if (getAllPolicies.length) {
          return res.status(200).send({
            success: true,
            message: "Successfuly Updated",
            data: getAllPolicies,
          });
        }
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permission to perform this action!",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  delete = async (req, res) => {
    let getPermission = await FindPermission(req.user.id);
    if (getPermission && getPermission.canDeletePrivacyPolicy) {
      let getPolicy = await privacyPolicy.findOne({
        where: { id: req.params.id },
      });
      if (!getPolicy)
        return res
          .status(200)
          .send({
            code: 404,
            success: true,
            message: "Required Policy Not Found",
          });

      let deletedPolicy = await privacyPolicy.update(
        {
          isActive: 0,
          isDelete: 1,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );

      if (deletedPolicy) {
        return res.status(200).send({
          success: true,
          message: "Successfuly Deleted",
        });
      } else
        return res.status(501).send({
          success: false,
          message: "An error occure while deleting the Policy.",
        });
    } else {
      return res.status(200).send({
        code: 401,
        success: false,
        message: "You don't have permission to perform this action!",
      });
    }
  };
}

module.exports = PrivacyPolicyController;
