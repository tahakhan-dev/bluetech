const db = require("../../Model");
const bannerType = db.BannerTypeModel;

class AppBannerType {
  create = async (req, res) => {
    try {
      let create = await bannerType.create({ bannerType: req.body.bannerType });
      if (create) {
        res.status(200).send({
          success: true,
          message: "Succesfully Created",
          data: create,
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        err: "Internal Server Error",
        message: error.message,
      });
    }
  };

  getAll = async (req, res) => {
    try {
      let getall = await bannerType.findAll();
      if (getall) {
        res
          .status(200)
          .send({ success: true, message: "Succesfully Get", data: getall });
      } else {
        res
          .status(200)
          .send({ code: 404, success: false, message: "Data Not Found" });
      }
    } catch (error) {
      res
        .status(500)
        .send({ err: "Internal Server Error", message: error.message });
    }
  };
}

module.exports = AppBannerType;
