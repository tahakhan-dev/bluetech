const fs = require("fs");
const randomstring = require("crypto-random-string");
const FindPermission = require("../extras/FindPermission");
const db = require("../../Model");
const cloudinary = require("../../config/cloudinary.config");

const _ = require("lodash");

const Video = db.imageData;
const howtouse = db.HowToUse;
const limit = require("../extras/DataLimit/index");

class Howtouse {
  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);

      if (getPermission && !getPermission.canCreateHowToUse)
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permission to perform this action!",
        });

      let videoData = _.pick(req.body, [
        "userId",
        "imageId",
        "typeId",
        "imageUrl",
        "imageType",
      ]);

      let schema = _.pick(req.body, ["title", "description", "isActive"]);
      if (req.file) {
        const path = req.file.path;
        const rndStr = randomstring({ length: 10 });
        const dir = `uploads/howtouse/${rndStr}/thumbnail/`;
        cloudinary
          .uploads(path, dir)
          .then(async (uploadRslt) => {
            if (uploadRslt) {
              fs.unlinkSync(path);
              schema.videoPath = uploadRslt.url;
              let created = await howtouse.create(schema);
              if (created) {
                videoData.userId = req.user.id;
                videoData.imageId = uploadRslt.id;
                videoData.typeId = created.id;
                videoData.imageUrl = uploadRslt.url;
                videoData.imageType = "Howtouse";

                await Video.create(videoData);
                res
                  .status(200)
                  .send({ success: true, message: "Tutorial Created" });
              }
            } else
              res.status(501).send({
                success: false,
                message: "An error occured while uploading the Video.",
              });
          })
          .catch((error) => {
            res.status(501).send({
              success: false,
              message:
                error.message || "An error occured while uploading the Video.",
            });
          });
      } else {
        let created = await howtouse.create(schema);
        if (created)
          res.status(200).send({ success: true, message: "Tutorial Created" });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };

  getById = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);

      if (getPermission && !getPermission.canReadHowToUse)
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permission to perform this action!",
        });

      let schema = await howtouse.findOne({
        raw: true,
        where: { id: req.params.id },
        isActive: true,
        isDeleted: false,
      });

      res.status(200).send({ success: true, data: schema });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  update = async (req, res) => {
    try {
      let tutid = req.params.id;
      let getPermission = await FindPermission(req.user.id);

      if (getPermission && !getPermission.canEditHowToUse)
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permission to perform this action!",
        });

      let getdata = await howtouse.findOne({
        raw: true,
        where: {
          id: tutid,
        },
      });

      if (!getdata)
        return res.status(200).send({ code: 404, Error: "Not Found" });

      let schema = _.pick(req.body, ["title", "description", "isActive"]);

      let video = _.pick(req.body, [
        "userId",
        "imageId",
        "typeId",
        "imageUrl",
        "imageType",
      ]);

      if (req.file) {
        let rndStr;
        let foundVideoData = await Video.findOne({
          raw: true,
          where: { typeId: tutid, imageType: "Howtouse" },
        });
        if (foundVideoData) {
          rndStr = foundVideoData.imageId.slice(17, 27);
        } else {
          rndStr = randomstring({ length: 10 });
        }
        const path = req.file.path;
        const dir = `uploads/howtouse/${rndStr}/thumbnail/`;

        cloudinary
          .uploads(path, dir)
          .then(async (uploadRslt) => {
            if (uploadRslt) {
              fs.unlinkSync(path);

              if (foundVideoData === null) {
                video.userId = req.user.id;
                video.imageId = uploadRslt.id;
                video.typeId = tutid;
                video.imageUrl = uploadRslt.url;
                video.imageType = "Howtouse";

                schema.videoPath = uploadRslt.url;
                await Video.create(video);

                let update = await howtouse.update(schema, {
                  where: {
                    id: tutid,
                  },
                });
                if (update) {
                  res
                    .status(200)
                    .send({ success: true, message: "SuccessFully Updated" });
                }
              } else {
                video.userId = req.user.id;
                video.imageId = uploadRslt.id;
                video.typeId = tutid;
                video.imageUrl = uploadRslt.url;
                video.imageType = "Howtouse";

                schema.videoPath = uploadRslt.url;

                cloudinary
                  .removeVideo(foundVideoData.imageId)
                  .then(async (rmvFile) => {
                    await Video.update(video, {
                      where: { typeId: foundVideoData.typeId },
                    });

                    let update = await howtouse.update(schema, {
                      where: {
                        id: tutid,
                      },
                    });
                    if (update) {
                      res.status(200).send({
                        success: true,
                        message: "SuccessFully Updated",
                      });
                    }
                  })
                  .catch((error) => {
                    res.status(500).send({
                      success: false,
                      message:
                        error.message ||
                        "An error occured while removing the Video.",
                    });
                  });
              }
            } else
              res.status(501).send({
                success: false,
                message: "An error occured while uploading the Video.",
              });
          })
          .catch((error) => {
            res.status(501).send({
              err: {
                success: false,
                message: "An error occured while uploading the Video.",
                err: error,
              },
            });
          });
      } else {
        let update = await howtouse.update(schema, {
          where: {
            id: tutid,
          },
        });
        if (update) {
          res
            .status(200)
            .send({ success: true, message: "SuccessFully Updated" });
        }
      }
    } catch (error) {
      res.status(500).send({
        err: {
          success: false,
          message: "Internal Server Error",
          err: error,
        },
      });
    }
  };

  delete = async (req, res) => {
    let tutid = req.params.id;
    let getPermission = await FindPermission(req.user.id);

    if (getPermission && !getPermission.canDeleteHowToUse)
      return res.status(200).send({
        code: 401,
        success: false,
        message: "You don't have permission to perform this action!",
      });

    let getdata = await howtouse.findOne({
      where: {
        id: tutid,
      },
    });
    if (!getdata)
      return res.status(200).send({ code: 404, Error: "Not Found" });
    let deletedata = await howtouse.update(
      {
        isDeleted: 1,
        isActive: 0,
      },
      {
        where: {
          id: tutid,
        },
      }
    );
    if (deletedata) {
      res.status(200).send({ success: true, message: "SuccessFully Deleted" });
    }
  };

  getAllHowToUseFunc = async (req, res) => {
    try {
      let getAllHowToUse = await howtouse.findAll({
        where: { isActive: true, isDeleted: false },
      });
      let countData = {
        pages: Math.ceil(getAllHowToUse.length / limit.limit),
        totalRecords: getAllHowToUse.length,
      };
      res.status(200).send({ success: true, getAllHowToUse, countData });
    } catch (error) {
      res.status(500).send({ success: false, error: "Internal Server Error" });
    }
  };
}
module.exports = Howtouse;
