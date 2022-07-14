const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const globalCounter = db.GlobalCounter;
const Campaign = db.campaign;

class globalCounterController {
  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canCreateCounter) {
        const terms = _.pick(req.body, ["counter"]);
        let GlobalCounter = await globalCounter.create(terms);
        return res.status(200).send({ success: true, GlobalCounter });
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

  getAllTerms = async (req, res) => {
    try {
      //let getPermission = await FindPermission(req.user.id);
      //if (getPermission && getPermission.canReadCounter) {
        let GlobalCounter = await globalCounter.findAll();
        //return res.send({ GlobalCounter });
        return res.status(200).send({
        
        success: true,
        GlobalCounter,
      });
      //}
      // return res.status(200).send({
      //   code: 401,
      //   success: false,
      //   message: "You don't have permission to perform this action!",
      // });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  updateTerms = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canUpdateCounter) {
        const terms = _.pick(req.body, ["counter"]);
        let foundTerms = await globalCounter.findOne({
          where: { id: req.params.id },
        });
        if (foundTerms) {
          await globalCounter.update(terms, {
            where: {
              id: req.params.id,
            },
          });
          await Campaign.update(
            { counter: req.body.counter },
            { where: { isActive: 1 } }
          );
          return res
            .status(200)
            .send({ success: true, message: "Successfully updated" });
        } else {
          return res
            .status(200)
            .send({ code: 404, success: false, message: "Not found!" });
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
module.exports = globalCounterController;
