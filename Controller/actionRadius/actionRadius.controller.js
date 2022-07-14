const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const Radius = db.ActionRadius;

class ActionRadius {
  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canCreateActionRadius) {
        let foundActionRadius = await Radius.findAll();
        if (foundActionRadius.length)
          return res.status(200).send({
            success: false,
            message: "Kindly Update the existing miles.",
          });
        const actionRadius = _.pick(req.body, ["miles", "isActive"]);
        let createdRadius = await Radius.create(actionRadius);
        return res.status(200).send({ success: true, createdRadius });
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

  getSpecificRadius = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadActionRadius) {
        let radius = await Radius.findOne({
          where: { id: req.params.id, isActive: true },
        });
        if (radius) {
          return res.status(200).send({ success: true, radius });
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

  updateRadius = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canEditActionRadius) {
        const radius = _.pick(req.body, ["miles", "isActive"]);
        let foundRadius = await Radius.findOne({
          where: { id: req.params.id },
        });
        if (foundRadius) {
          await Radius.update(radius, {
            where: {
              id: req.params.id,
            },
          });
          return res
            .status(200)
            .send({ success: true, message: "Successfully updated" });
        } else {
          return res
            .status(200)
            .send({ code: 404, success: true, message: "Not found!" });
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

  deleteRadius = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canDeleteActionRadius) {
        let foundRadius = await Radius.findOne({
          where: { id: req.params.id },
        });
        if (foundRadius) {
          await Radius.update(
            { isActive: false },
            {
              where: {
                id: req.params.id,
              },
            }
          );
          return res
            .status(200)
            .send({ success: true, message: "Successfully deleted" });
        } else {
          return res
            .status(200)
            .send({ code: 404, success: true, message: "Not found!" });
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
module.exports = ActionRadius;
