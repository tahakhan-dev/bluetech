const db = require("../../Model");
const saletax = db.saleTaxModel;
const GetPermissions = require("../extras/FindPermission");
const limit = require("../extras/DataLimit/index");

class SaleTax {
  create = async (req, res) => {
    try {
      let getpermissions = await GetPermissions(req.user.id);
      if (getpermissions && getpermissions.canCreateSalesTax) {
        let getall = await saletax.findAll();
        if (getall.length) {
          return res.status(200).send({
            success: true,
            message: "Already Exists Wishing To Update Try Update EndPoint",
          });
        }

        let createsaletax = await saletax.create({ saletax: req.body.saletax });
        if (createsaletax) {
          res.status(200).send({ success: true, message: "SaleTax Created" });
        }
      } else {
        return res
          .status(403)
          .send({ success: false, message: "Forbidden Access" });
      }
    } catch (error) {
      res.status(500).send({ success: false, err: error.message });
    }
  };

  getSaleTax = async (req, res) => {
    try {
      let getSaleTax = await saletax.findAll({
        offset:
          parseInt(req.query.page) * limit.limit
            ? parseInt(req.query.page) * limit.limit
            : 0,
        limit: req.query.page ? limit.limit : 1000000,
      });
      let countData = {
        page: parseInt(req.query.page),
        pages: Math.ceil(getSaleTax.length / limit.limit),
        totalRecords: getSaleTax.length,
      };
      res.status(200).send({ success: true, data: getSaleTax, countData });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  getSaleTaxById = async (req, res) => {
    try {
      let getpermissions = await GetPermissions(req.user.id);
      let { saleTaxId } = req.params;

      if (getpermissions && getpermissions.canReadSalesTax) {
        let createsaletax = await saletax.findOne({
          raw: true,
          where: {
            id: saleTaxId,
          },
        });
        res.status(200).send({ success: true, data: createsaletax });
      } else {
        return res.status(202).send({
          code: 401,
          success: false,
          message: "You don't have permissions!",
        });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  updateSaleTaxById = async (req, res) => {
    try {
      let getpermissions = await GetPermissions(req.user.id);
      let { saleTaxId } = req.body;

      if (getpermissions && getpermissions.canEditSalesTax) {
        await saletax.update(
          { saletax: req.body.saletax },
          {
            where: {
              id: saleTaxId,
            },
          }
        );

        res
          .status(200)
          .send({ success: true, message: "Successfully Sale Tax Updated!" });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permissions!",
        });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };
}

module.exports = SaleTax;
