const db = require("../../Model");
const _ = require("lodash");
const Shipping = db.ShippingModel;

class Shippings {
  createShippingStatus = async (req, res) => {
    let data = _.pick(req.body, ["ShippingName", "curbsite"]);
    let createshipping = await Shipping.create(data);
    res.status(200).send({ success: true, createshipping });
  };

  getShippingStatus = async (req, res) => {
    try {
      let getallshipping = await Shipping.findAll();
      if (getallshipping)
        return res.status(200).send({ success: true, getallshipping });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message });
    }
  };

  getSpecificShippingStatus = async (req, res) => {
    try {
      let foundShipping = await Shipping.findOne({
        where: { id: req.params.id },
      });
      if (foundShipping) {
        return res.status(200).send({ success: true, foundShipping });
      } else {
        return res
          .status(200)
          .send({ code: 404, success: true, message: "Not Found!" });
      }
    } catch (err) {
      return res
        .status(500)
        .send({
          success: false,
          message: err.message || "Something Went Wrong",
        });
    }
  };

  updateShippingStatus = async (req, res) => {
    try {
      const updateId = req.params.id;
      const shipBody = _.pick(req.body, ["ShippingName", "curbsite"]);
      let foundShipping = await Shipping.findOne({ where: { id: updateId } });
      if (foundShipping) {
        await Shipping.update(shipBody, {
          where: {
            id: updateId,
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
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message });
    }
  };

  deleteShippingStatus = async (req, res) => {
    try {
      const deleteShipping = await Shipping.destroy({
        where: {
          id: req.params.id,
        },
      });
      if (deleteShipping) {
        return res
          .status(200)
          .send({ success: true, message: "Shipping Successfully Deleted!" });
      } else {
        return res
          .status(200)
          .send({ code: 404, success: true, message: "Not Found!" });
      }
    } catch (err) {
      return res
        .status(500)
        .send({
          success: false,
          message: err.message || "Something Went Wrong",
        });
    }
  };
}

module.exports = Shippings;
