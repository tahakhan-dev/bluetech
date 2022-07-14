const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const limit = require("../extras/DataLimit/index");
const Contact = db.contactUs;

class ContactUs {
  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canCreateContactUs) {
        const contact = _.pick(req.body, ["title", "desc", "isActive"]);
        let contactUs = await Contact.create(contact);
        return res.status(200).send({
          success: true,
          data: contactUs,
        });
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

  getSpecificContact = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadContactUs) {
        let contactUs = await Contact.findOne({
          where: { id: req.params.id, isActive: true },
        });
        if (contactUs) {
          return res.status(200).send({
            success: true,
            data: contactUs,
          });
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
      return res
        .status(500)
        .send({
          success: false,
          message: err.message || "Something Went Wrong",
        });
    }
  };

  getAllContact = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadContactUs) {
        let contactUs = await Contact.findAll({
          offset:
            parseInt(req.query.page) * limit.limit
              ? parseInt(req.query.page) * limit.limit
              : 0,
          limit: req.query.page ? limit.limit : 1000000,
          where: { isActive: true },
        });
        let countData = {
          page: parseInt(req.query.page),
          pages: Math.ceil(contactUs.length / limit.limit),
          totalRecords: contactUs.length,
        };
        return res.status(200).send({ success: true, contactUs, countData });
      }
      return res.status(200).send({
        code: 401,
        success: false,
        message: "You don't have permission to perform this action!",
      });
    } catch (err) {
      return res
        .status(500)
        .send({
          success: false,
          message: err.message || "Something Went Wrong",
        });
    }
  };

  getAllContactsApp = async (req, res) => {
    let getAllContacts = await Contact.findAll({
      offset:
        parseInt(req.query.page) * limit.limit
          ? parseInt(req.query.page) * limit.limit
          : 0,
      limit: req.query.page ? limit.limit : 1000000,
      where: {
        isActive: true,
      },
    });
    if (!getAllContacts.length)
      return res.status(200).send({
        code: 404,
        success: true,
        message: "Contactus Not Found",
      });
    let countData = {
      page: parseInt(req.query.page),
      pages: Math.ceil(getAllContacts.length / limit.limit),
      totalRecords: getAllContacts.length,
    };
    return res.status(200).send({
      success: true,
      getAllContacts,
      countData,
    });
  };

  updateContact = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canEditContactUs) {
        const contact = _.pick(req.body, ["title", "desc", "isActive"]);
        let foundContact = await Contact.findOne({
          where: { id: req.params.id },
        });
        if (foundContact) {
          let contactUs = await Contact.update(contact, {
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
      return res
        .status(500)
        .send({
          success: false,
          message: err.message || "Something Went Wrong",
        });
    }
  };

  deleteContact = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canDeleteContactUs) {
        let foundContact = await Contact.findOne({
          where: { id: req.params.id },
        });
        if (foundContact) {
          let contacttUs = await Contact.update(
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
      return res
        .status(500)
        .send({
          success: false,
          message: err.message || "Something Went Wrong",
        });
    }
  };
}
module.exports = ContactUs;
