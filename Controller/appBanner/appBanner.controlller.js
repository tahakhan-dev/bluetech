const db = require("../../Model");
const _ = require("lodash");
const Joi = require("joi");
const fs = require("fs");
const randomstring = require("crypto-random-string");
const Appbanner = db.AppBannerModel;
const appbannertype = db.BannerTypeModel;
const Campaing = db.campaign;

const GetPermissions = require("../extras/FindPermission");
const {
  updateImages,
  updateBanner,
  updateCampBanner,
} = require("../extras/AppBannerUpload");
const cloudinary = require("../../config/cloudinary.config");
const limit = require("../extras/DataLimit/index");

class AppBanner {
  updateBannerOrder = async (req, res) => {
    let permissions = await GetPermissions(req.user.id);
    if (permissions && permissions.canEditAppBanners) {
      try {
        let getall = await Appbanner.findAll({
          raw: true,
          nest: true,
          where: {
            isDeleted: 0,
          },
          attributes: ["id"],
        });

        if (!getall.length) {
          res.status(200).send({
            code: 404,
            success: true,
            message: "Data Not Found",
          });
        }

        let counter = 0;
        getall.map((elem, index, b) => {
          let elemId = elem.id;
          req.body.order.map(async (elems, i, a) => {
            if (index == i) {
              let schema = {
                campaingId: elems.campaingId,
                url: elems.url,
                bannerType: elems.bannerType,
                percentage: elems.percentage,
                imageId: elems.imageId,
                imageUrl: elems.imageUrl,
                isDeleted: elems.isDeleted,
              };
              await Appbanner.update(schema, {
                where: {
                  id: elemId,
                },
              });
            }
          });
          counter++;

          if (counter == getall.length) {
            res.status(200).send({
              success: true,
              message: "Updated Order",
            });
          }
        });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    } else {
      res.status(200).send({
        code: 401,
        success: false,
        message: "Don't Have Permissions",
      });
    }
  };

  create = async (req, res) => {
    let permissions = await GetPermissions(req.user.id);
    if (permissions && permissions.canCreateAppBanners) {
      try {
        let type = await appbannertype.findOne({
          raw: true,
          where: {
            id: req.body.appBannerType,
          },
        });

        if (!type)
          return res.status(200).send({
            success: true,
            message: "Invalid type.",
          });

        let schema = {
          campaingId: req.body.campaingId || null,
          url: req.body.url || null,
          bannerType: req.body.appBannerType,
          percentage: req.body.percentage || null,
        };
        if (req.file) {
          const path = req.file.path;
          const rndStr = randomstring({
            length: 10,
          });
          let dir = `uploads/appbanner/${rndStr}/thumbnail/`;
          cloudinary
            .uploads(path, dir)
            .then(async (uploadRslt) => {
              if (uploadRslt) {
                fs.unlinkSync(path);

                schema.imageId = uploadRslt.id;
                schema.imageUrl = uploadRslt.url;

                returnValidationWithBannerCreation(type, req, schema, res);
              } else {
                return res.status(200).send({
                  code: 501,
                  success: false,
                  message:
                    error.message ||
                    "An error occured while uploading the Image.",
                });
              }
            })
            .catch((error) => {
              return res.status(200).send({
                code: 501,
                success: false,
                message:
                  error.message ||
                  "An error occured while uploading the Image.",
              });
            });
        } else {
          return res.status(200).send({
            code: 501,
            success: false,
            message: "Banner Image Is Required",
          });
        }
      } catch (error) {
        res.status(500).send({
          success: false,
          err: "Internal Server Error",
          message: error.message,
        });
      }
    } else {
      res.status(200).send({
        code: 401,
        success: false,
        message: "Don't Have Permissions",
      });
    }
  };

  getAll = async (req, res) => {
    let permissions = await GetPermissions(req.user.id);
    if (permissions && permissions.canReadAppBanners) {
      try {
        let getall = await Appbanner.findAll({
          raw: true,
          nest: true,
          offset:
            parseInt(req.query.page) * limit.limit
              ? parseInt(req.query.page) * limit.limit
              : 0,
          limit: req.query.page ? limit.limit : 1000000,
          where: {
            isDeleted: 0,
          },
          include: [
            {
              model: appbannertype,
            },
          ],
        });
        if (!getall)
          return res.status(200).send({
            code: 404,
            success: true,
            message: "No Item Found",
          });
        let countData = {
          page: parseInt(req.query.page),
          pages: Math.ceil(getall.length / limit.limit),
          totalRecords: getall.length,
        };
        res.status(200).send({
          success: true,
          data: getall,
          countData,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    } else {
      res.status(200).send({
        code: 401,
        success: false,
        message: "Don't Have Permissions",
      });
    }
  };

  getById = async (req, res) => {
    let permissions = await GetPermissions(req.user.id);
    if (permissions && permissions.canReadAppBanners) {
      try {
        let getdata = await Appbanner.findOne({
          raw: true,
          nest: true,
          where: {
            id: req.params.id,
            isDeleted: 0,
          },
          include: [
            {
              model: appbannertype,
            },
            {
              model: Campaing,
            },
          ],
        });
        if (!getdata) {
          return res.status(200).send({
            code: 404,
            success: true,
            message: "Not Found",
          });
        }

        res.status(200).send({
          success: true,
          data: getdata,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    } else {
      res.status(200).send({
        code: 401,
        success: false,
        message: "Don't Have Permissions",
      });
    }
  };

  update = async (req, res) => {
    let permissions = await GetPermissions(req.user.id);
    if (permissions && permissions.canEditAppBanners) {
      try {
        let bannerid = req.params.id;
        let getdata = await Appbanner.findOne({
          where: {
            id: bannerid,
          },
        });

        if (!getdata)
          return res.status(200).send({
            code: 404,
            success: true,
            Error: "Not Found",
          });

        if (req.body.appBannerType) {
          let type = await appbannertype.findOne({
            raw: true,
            where: {
              id: req.body.appBannerType,
            },
          });
          if (type) {
            if (type.bannerType == "NotClickable") {
              let { error } = NotClickableUpdate(req.body);
              if (error)
                return res.status(200).send({
                  success: false,
                  message: error.details[0].message,
                });
              let schema = {
                campaingId: null,
                url: null,
                bannerType: req.body.appBannerType || getdata.bannerType,
              };

              if (req.file) {
                await updateImages(req, res, bannerid, schema, getdata);
              } else {
                await updateBanner(req, res, bannerid, schema);
              }
            } else if (type.bannerType == "ClickableByUrl") {
              let { error } = ClickableByUrlUpdate(req.body);
              if (error)
                return res.status(200).send({
                  success: false,
                  message: error.details[0].message,
                });

              let schema = {
                campaingId: null,
                url: req.body.url || getdata.url,
                bannerType: req.body.appBannerType || getdata.bannerType,
              };

              if (req.file) {
                await updateImages(req, res, bannerid, schema, getdata);
              } else {
                await updateBanner(req, res, bannerid, schema);
              }
            } else {
              let { error } = ClickableByCampaingUpdate(req.body);
              if (error)
                return res.status(200).send({
                  success: false,
                  message: error.details[0].message,
                });

              let schema = {
                campaingId: req.body.campaingId || getdata.campaingId,
                url: null,
                bannerType: req.body.appBannerType || getdata.bannerType,
                percentage: req.body.percentage,
              };

              let campaing = await Campaing.findOne({
                where: {
                  id: req.body.campaingId,
                },
              });

              if (!campaing)
                res.status(200).send({
                  code: 404,
                  success: true,
                  message: "Campaing Not Found",
                });

              if (req.file) {
                await updateImages(req, res, bannerid, schema, getdata);
              } else {
                await updateCampBanner(req, res, bannerid, schema);
              }
            }
          }
        }
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    } else {
      res.status(200).send({
        code: 401,
        success: false,
        message: "Don't Have Permissions",
      });
    }
  };

  delete = async (req, res) => {
    try {
      let bannerid = req.params.id;
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canDeleteAppBanners) {
        let getdata = await Appbanner.findOne({
          where: {
            id: bannerid,
          },
        });

        if (!getdata)
          return res.status(200).send({
            code: 404,
            success: true,
            Error: "Not Found Or Already Deleted",
          });

        let update = await Appbanner.update(
          {
            isDeleted: 1,
          },
          {
            where: {
              id: bannerid,
            },
          }
        );
        if (update) {
          res.status(200).send({
            success: true,
            message: "AppBanners Deleted",
          });
        }
      } else {
        res.status(200).send({
          code: 401,
          success: false,
          message: "Don't Have Permissions",
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };
}

module.exports = AppBanner;

function NotClickable(request) {
  const schema = {
    appBannerType: Joi.number().required(),
  };
  return Joi.validate(request, schema);
}

function ClickableByUrl(request) {
  const schema = {
    appBannerType: Joi.number().required(),
    url: Joi.string().required(),
  };
  return Joi.validate(request, schema);
}

function ClickableByCampaing(request) {
  const schema = {
    appBannerType: Joi.number().required(),
    campaingId: Joi.number().required(),
    percentage: Joi.string(),
  };
  return Joi.validate(request, schema);
}

function NotClickableUpdate(request) {
  const schema = {
    appBannerType: Joi.number(),
  };
  return Joi.validate(request, schema);
}

function ClickableByUrlUpdate(request) {
  const schema = {
    appBannerType: Joi.number(),
    url: Joi.string().required(),
  };
  return Joi.validate(request, schema);
}

function ClickableByCampaingUpdate(request) {
  const schema = {
    appBannerType: Joi.number(),
    campaingId: Joi.number().required(),
    percentage: Joi.string(),
  };
  return Joi.validate(request, schema);
}
async function returnValidationWithBannerCreation(request, req, data, res) {
  let func = {};
  switch (request.bannerType) {
    case "NotClickable":
      func = {
        error: NotClickable(req.body),
      };
      if (func.error.error != null) {
        res.status(200).send({
          success: false,
          message: func.error.error.details[0].message,
        });
      } else {
        let createbanner = await Appbanner.create(data);
        if (createbanner) {
          res.status(201).send({
            success: true,
            message: "Banner Created",
          });
        }
      }
      break;
    case "ClickableByUrl":
      func = {
        error: ClickableByUrl(req.body),
      };
      if (func.error.error != null) {
        res.status(200).send({
          success: false,
          message: func.error.error.details[0].message,
        });
      } else {
        let createbanner = await Appbanner.create(data);
        if (createbanner) {
          res.status(201).send({
            success: true,
            message: "Banner Created",
          });
        }
      }
      break;
    case "ClickableByCampaign":
      func = {
        error: ClickableByCampaing(req.body),
      };
      if (func.error.error != null) {
        res.status(500).send({
          success: false,
          message: func.error.error.details[0].message,
        });
      } else {
        let campaing = await Campaing.findOne({
          where: {
            id: req.body.campaingId,
          },
        });
        if (!campaing)
          res.status(200).send({
            code: 404,
            success: true,
            message: "Campaing Not Found",
          });
        let createbanner = await Appbanner.create(data);
        if (createbanner) {
          res.status(201).send({
            message: "Banner Created",
          });
        }
      }
      break;
    default:
      res.status(200).send({
        code: 404,
        success: true,
        message: "Not Found",
      });
      break;
  }
}
