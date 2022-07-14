const db = require("../../Model");
const updatedSaleTax = db.updatedSalTax;
const merchantDetails = db.MerchantDetails;
const saleTax = db.saleTaxModel;
const GetPermissions = require("../extras/FindPermission");

class SaleTaxMerchant {
  create = async (req, res) => {
    try {
      let getpermissions = await GetPermissions(req.user.id);
      if (getpermissions && getpermissions.canCreateSalesTax) {
        let getdetails = await merchantDetails.findOne({
          where: {
            userId: req.body.merchantId,
          },
        });

        if (!getdetails)
          return res.status(404).send({ success: false, Message: "Not Found" });

        let getdata = await updatedSaleTax.findOne({
          where: {
            userId: req.body.merchantId,
            isDeleted: 0,
          },
        });

        if (getdata) return res.status(404).send({ err: "Already Exists" });

        let schema = {
          userId: req.body.merchantId,
          saleTax: req.body.saleTax,
        };
        let Updatesaletex = await updatedSaleTax.create(schema);
        if (Updatesaletex) {
          res.status(200).send({ success: true, Message: "Sale Tax Updated" });
        }
      } else {
        return res
          .status(403)
          .send({ success: false, message: "Forbidden Access" });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  getTax = async (req, res) => {
    try {
      let getpermissions = await GetPermissions(req.user.id);
      if (getpermissions && getpermissions.canReadSalesTax) {
        let merchantid = req.params.id;

        let merchantdetails = await merchantDetails.findOne({
          where: {
            userId: merchantid,
          },
        });

        if (merchantdetails) {
          let getdata = await updatedSaleTax.findOne({
            where: {
              userId: merchantid,
              isDeleted: 0,
            },
          });
          if (getdata) {
            res.send({ data: getdata, merchantdetails });
          } else {
            let gettax = await saleTax.findOne({
              where: {
                id: 1,
              },
            });
            if (gettax) {
              res.send({ data: gettax, merchantdetails });
            } else {
              res.status(404).send({ err: "Not Found" });
            }
          }
        } else {
          res.status(404).send({ err: "Not Found" });
        }
      } else {
        return res
          .status(403)
          .send({ success: false, message: "You don't have permissions!" });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  update = async (req, res) => {
    try {
      let getpermissions = await GetPermissions(req.user.id);
      if (getpermissions && getpermissions.canEditSalesTax) {
        let merchantid = req.params.id;
        let merchantdetails = await merchantDetails.findOne({
          where: {
            userId: merchantid,
          },
        });

        if (merchantdetails) {
          let getdata = await updatedSaleTax.findOne({
            where: {
              userId: merchantid,
              isDeleted: 0,
            },
          });

          if (!getdata) return res.status(404).send({ err: "Not Found" });

          let schema = {
            saleTax: req.body.saleTax,
          };
          let update = await updatedSaleTax.update(schema, {
            where: {
              userId: merchantid,
            },
          });

          if (update) {
            res.send({ success: true, Message: "Updated Successfully" });
          }
        } else {
          res.status(404).send({ err: "Not Found" });
        }
      } else {
        return res
          .status(403)
          .send({ success: false, message: "You don't have permissions!" });
      }
    } catch (error) {
      res.status(500).send({ success: true, message: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      let getpermissions = await GetPermissions(req.user.id);
      if (getpermissions && getpermissions.canDeleteSalesTax) {
        let merchantid = req.params.id;
        let merchantdetails = await merchantDetails.findOne({
          where: {
            userId: merchantid,
          },
        });

        if (merchantdetails) {
          let getdata = await updatedSaleTax.findOne({
            where: {
              userId: merchantid,
              isDeleted: 0,
            },
          });

          if (!getdata)
            return res
              .status(404)
              .send({ err: "Not Found or Already Deleted" });

          let schema = {
            isDeleted: true,
          };
          let update = await updatedSaleTax.update(schema, {
            where: {
              userId: merchantid,
            },
          });

          if (update) {
            res
              .status(200)
              .send({ success: true, Message: "Successfully Deleted" });
          }
        } else {
          res.status(404).send({ success: false, message: "Not Found" });
        }
      } else {
        return res
          .status(403)
          .send({ success: false, message: "You don't have permissions!" });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };
}

module.exports = SaleTaxMerchant;
