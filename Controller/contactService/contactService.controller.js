const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const ContactService = db.ContactService;

class ContactServiceController {
  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canCreateContactService) {
        const contact = _.pick(req.body, ["title", "isActive"]);
        let service = await ContactService.create(contact);
        return res.status(200).send({
          success: true,
          data: service,
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

  getSpecificService = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadContactService) {
        let foundService = await ContactService.findOne({
          where: { id: req.params.id, isActive: true },
        });
        if (foundService) {
          return res.status(200).send({
            success: true,
            data: foundService,
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
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getAllServicesApp = async (req, res) => {
    try {
      let getAllServices = await ContactService.findAll({
        where: {
          isActive: true,
        },
      });
      if (!getAllServices.length)
        return res.status(404).send({
          success: false,
          message: "Not Found",
        });
      return res.status(200).send({
        success: true,
        getAllServices,
      });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  };

  getAllServices = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadContactService) {
        let getAllServices = await ContactService.findAll({
          where: {
            isActive: true,
          },
        });
        return res.status(200).send({
          success: true,
          getAllServices,
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
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  updateService = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canEditContactUs) {
        const contact = _.pick(req.body, ["title", "isActive", "isDelete"]);
        let foundService = await ContactService.findOne({
          where: { id: req.params.id },
        });
        if (foundService) {
          let contactUs = await ContactService.update(contact, {
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

  deleteService = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canDeleteContactService) {
        let foundService = await ContactService.findOne({
          where: { id: req.params.id },
        });
        if (foundService) {
          let contacttUs = await ContactService.update(
            { isActive: false, isDelete: true },
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

  createContactUsInfo = async (req, res) => {
    try {
      const contactInfo = _.pick(req.body, [
        "message",
        "question",
        "service",
        "email",
      ]);

      let service = await db.contactUsInfo.create(contactInfo);
      return res.status(200).send({
        success: true,
        data: service,
        message: "Created Successfully",
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };
}
module.exports = ContactServiceController;
