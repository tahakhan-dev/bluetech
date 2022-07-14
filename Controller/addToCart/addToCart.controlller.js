const db = require("../../Model");
const _ = require("lodash");
const Joi = require("joi");
const fs = require("fs");

const GetPermissions = require("../extras/FindPermission");
const {
  updateImages,
  updateBanner,
  updateCampBanner,
} = require("../extras/AppBannerUpload");
const cloudinary = require("../../config/cloudinary.config");
const { getAllimagesByTypeAndTypeId } = require("../extras/getImages");
const limit = require("../extras/DataLimit/index");

class AddToCart {
  create = async (req, res) => {
    try {
      res.status(200).send({ success: true });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };
}

module.exports = AddToCart;
