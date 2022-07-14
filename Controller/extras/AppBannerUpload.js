const db = require("../../Model");
const fs = require("fs");
const Appbanner = db.AppBannerModel;
const Campaing = db.campaign;
const cloudinary = require("../../config/cloudinary.config");

const updateImages = async function (req, res, bannerid, schema, getdata) {
  try {
    let rndStr;
    rndStr = getdata.dataValues.imageId.slice(18, 28);
    const path = req.file.path;
    const dir = `uploads/appbanner/${rndStr}/thumbnail/`;

    cloudinary
      .uploads(path, dir)
      .then(async (uploadRslt) => {
        if (uploadRslt) {
          cloudinary
            .remove(getdata.dataValues.imageId)
            .then(async (rmvFile) => {
              fs.unlinkSync(path);

              schema.imageId = uploadRslt.id;
              schema.imageUrl = uploadRslt.url;
              let update = await Appbanner.update(schema, {
                where: {
                  id: bannerid,
                },
              });
              if (update[0]) {
                res
                  .status(200)
                  .send({ success: true, message: "SuccessFully Updated" });
              } else
                res.status(200).send({
                  success: false,
                  message: "An error occured while Updating the Appbanner.",
                });
            })
            .catch((error) => {
              res.status(500).send({
                success: false,
                message:
                  error.message || "An error occured while removing the Image.",
              });
            });
        } else
          res.status(200).send({
            success: false,
            message: "An error occured while uploading the Image.",
          });
      })
      .catch((error) => {
        res.status(500).send({
          err: {
            success: false,
            message: "An error occured while uploading the Image.",
            err: error.message,
          },
        });
      });
  } catch (error) {
    res.status(500).send({
      success: false,
      err: error.message,
    });
  }
};

const updateBanner = async function (req, res, bannerid, schema) {
  try {
    let update = await Appbanner.update(schema, {
      where: {
        id: bannerid,
      },
    });
    if (update[0]) {
      res
        .status(200)
        .send({ success: true, message: "App Banner Updated Success" });
    } else
      res
        .status(200)
        .send({
          success: false,
          message: "Error while updating the Appbanner.",
        });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const updateCampBanner = async function (req, res, bannerid, schema) {
  try {
    let campaing = await Campaing.findOne({
      where: {
        id: req.body.campaingId,
      },
    });

    if (!campaing)
      res.status(200).send({ success: true, message: "Campaing Not Found" });

    let update = await Appbanner.update(schema, {
      where: {
        id: bannerid,
      },
    });
    if (update[0]) {
      res
        .status(200)
        .send({ success: true, message: "App Banner Updated Success" });
    } else
      res
        .status(200)
        .send({
          success: false,
          message: "Error while updating the Appbanner.",
        });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

module.exports.updateImages = updateImages;
module.exports.updateBanner = updateBanner;
module.exports.updateCampBanner = updateCampBanner;
