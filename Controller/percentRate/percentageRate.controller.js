const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const limit = require("../extras/DataLimit/index");
const Percentrate = db.PercentRate;

class PercentageRate {
  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canCreatePercentRate) {
        const percentRate = _.pick(req.body, ["percentRate", "isActive"]);
        let createdPercent = await Percentrate.create(percentRate);
        return res.status(200).send({ success: true, createdPercent });
      }
      return res.status(200).send({
        code: 401,
        success: false,
        message: "You don't have permission to perform this action!",
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getSpecificPercent = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadPercentRate) {
        let foundPercent = await Percentrate.findOne({
          where: { id: req.params.id, isActive: true },
        });
        if (foundPercent) {
          return res.status(200).send({ success: true, foundPercent });
        } else {
          return res
            .status(200)
            .send({ code: 404, success: true, message: "Not Found!" });
        }
      }
      return res.status(200).send({
        code: 401,
        success: false,
        message: "You don't have permission to perform this action!",
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getAllPercent = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadAboutUs) {
        let allPercent = await Percentrate.findAll({
          offset:
            parseInt(req.query.page) * limit.limit
              ? parseInt(req.query.page) * limit.limit
              : 0,
          limit: req.query.page ? limit.limit : 1000000,
          where: { isActive: true },
        });
        let countData = {
          page: parseInt(req.query.page),
          pages: Math.ceil(allPercent.length / limit.limit),
          totalRecords: allPercent.length,
        };
        return res.status(200).send({ success: true, allPercent, countData });
      }
      return res.status(200).send({
        code: 401,
        success: false,
        message: "You don't have permission to perform this action!",
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  updatePercent = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canEditPercentRate) {
        const percentRate = _.pick(req.body, ["percentRate", "isActive"]);
        let foundPercent = await Percentrate.findOne({
          where: { id: req.params.id },
        });
        if (foundPercent) {
          await Percentrate.update(percentRate, {
            where: {
              id: req.params.id,
            },
          });
          return res
            .status(200)
            .send({ success: true, message: "Successfully updated" });
        } else {
          return res.status(200).send({ code: 404, message: "Not found!" });
        }
      }
      return res.status(200).send({
        code: 401,
        success: false,
        message: "You don't have permission to perform this action!",
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  deletePercent = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canDeletePercentRate) {
        const foundPercent = await Percentrate.findOne({
          where: {
            id: req.params.id,
          },
        });
        if (foundPercent) {
          await Percentrate.update(
            { isActive: false },
            { where: { id: req.params.id } }
          );
          return res
            .status(200)
            .send({ success: true, message: "Radius Successfully Deleted!" });
        } else {
          return res
            .status(200)
            .send({ code: 404, success: false, message: "Not Found!" });
        }
      }
      return res.status(200).send({
        code: 401,
        success: false,
        message: "You don't have permission to perform this action!",
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };
}
module.exports = PercentageRate;
