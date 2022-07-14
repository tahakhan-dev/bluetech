"use strict";
const db = require("../../../Model");
const { getAllimagesByTypeAndTypeId } = require("../../extras/getImages");

const moment = require("moment");
const Op = db.Sequelize.Op;
const Campaign = db.campaign;
const products = db.product;
const CampaignDetail = db.campaignDetail;
const users = db.users;
const merchantDetail = db.MerchantDetails;
const shippingmodel = db.ShippingModel;
const ImageData = db.imageData;
const Product = db.product;
const slider = db.Sliderdata;
const voucherGen = db.VoucherGen;
const { StartingCheck, ExpireyCheck } = require("../CampaignFeatures");
const cloudinary = require("../../../config/cloudinary.config");
const { ArraySlicePagination } = require("../pagination/pagination");
const fs = require("fs");
const limit = require("../DataLimit");

async function getAllCampaingsfilter(req, getid) {
  try {
    let camp = null;
    if (getid) {
      camp = await Campaign.findAll({
        where: {
          id: getid,
        },
      });
    } else {
      camp = await Campaign.findAll();
    }
    let campaingsarray = [];
    let Startcampaingsarray = [];
    let count = 0;
    camp.forEach(async (val, index, array) => {
      let startcondition = StartingCheck(val.campaignStartsAt);
      let condition = ExpireyCheck(val.campaignExpiresAt);
      if (startcondition) {
        Startcampaingsarray.push(val.id);
      }
      if (!condition) {
        campaingsarray.push(val.id);
      }
      count++;
      if (count == array.length) {
        await Campaign.update(
          {
            isExpired: false,
            isActive: true,
          },
          {
            where: {
              id: Startcampaingsarray,
            },
          }
        );
        await Campaign.update(
          {
            isExpired: true,
            isActive: false,
          },
          {
            where: {
              id: campaingsarray,
            },
          }
        );
      }
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getAllCampaing(req, res) {
  try {
    let ActionId = req.params.ActionId;
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let camp;
    let whereDiff = {
      isActive: true,
      isExpired: false,
    };

    let whereDiff1 = {
      isActive: false,
      isExpired: true,
    };

    let where =
      parseInt(ActionId) == 1 || parseInt(ActionId) == 3
        ? whereDiff
        : whereDiff1;

    let totalcount = await Campaign.count({
      where,
    });
    if (parseInt(ActionId) == 3) {
      camp = await Campaign.findAll({
        raw: false,
        nest: true,
        where,
        include: [
          {
            model: users,
            where: {
              isBlocked: 0,
              isDelete: 0,
            },
            include: [
              {
                model: Product,
                where: { isActive: true },
                include: [
                  {
                    model: ImageData,
                    association: db.campaign.hasMany(db.imageData, {
                      foreignKey: "typeId",
                    }),
                    where: {
                      imageType: "Product",
                    },
                  },
                ],
              },
              {
                model: merchantDetail,
              },
            ],
          },
          {
            model: shippingmodel,
          },
          {
            model: CampaignDetail,
            include: [
              {
                model: products,
              },
            ],
          },
          {
            model: db.campaignLikes,
          },
        ],
      });
    } else {
      camp = await Campaign.findAll({
        raw: false,
        nest: true,
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where,
        include: [
          {
            model: users,
            where: {
              isBlocked: 0,
              isDelete: 0,
            },
            include: [
              {
                model: Product,
                where: { isActive: true },
                include: [
                  {
                    model: ImageData,
                    association: db.campaign.hasMany(db.imageData, {
                      foreignKey: "typeId",
                    }),
                    where: {
                      imageType: "Product",
                    },
                  },
                ],
              },
              {
                model: merchantDetail,
              },
            ],
          },
          {
            model: shippingmodel,
          },
          {
            model: CampaignDetail,
            include: [
              {
                model: products,
              },
            ],
          },
          {
            model: db.campaignLikes,
          },
        ],
      });
    }
    camp = camp.filter(
      (element) =>
        element?.dataValues?.campaignDetails[0]?.dataValues?.product?.isActive
    );
    let data = await Promise.all(
      camp.map(async (x) => {
        let Campaign = new Object(x);
        return getAllimagesByTypeAndTypeId("Campaign", x.id).then((objs) => {
          if (objs) {
            if (objs.getImages.length) {
              Campaign["imgs"] = objs.getImages;
              if (objs.getIndexs.length) {
                Campaign["indexes"] = objs.getIndexs;
              }
            }
          }
          return Campaign;
        });
      })
    );
    return await { data: data, count: totalcount };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getAllCampaingSearch(req, res) {
  try {
    let ActionId = req.params.ActionId;
    let SearchQuery = req.query.SearchQuery;
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;

    let whereDiff = {
      isActive: true,
      isExpired: false,
      [Op.or]: [
        {
          campaignCode: {
            [Op.like]: `%${SearchQuery}%`,
          },
        },
        {
          name: {
            [Op.like]: `%${SearchQuery}%`,
          },
        },
        {
          description: {
            [Op.like]: `%${SearchQuery}%`,
          },
        },
        {
          campaingAmount: {
            [Op.like]: `%${SearchQuery}%`,
          },
        },
      ],
    };

    let whereDiff1 = {
      isActive: false,
      isExpired: true,
      [Op.or]: [
        {
          campaignCode: {
            [Op.like]: `%${SearchQuery}%`,
          },
        },
        {
          name: {
            [Op.like]: `%${SearchQuery}%`,
          },
        },
        {
          description: {
            [Op.like]: `%${SearchQuery}%`,
          },
        },
        {
          campaingAmount: {
            [Op.like]: `${SearchQuery}`,
          },
        },
      ],
    };

    let where =
      parseInt(ActionId) == 1 || parseInt(ActionId) == 3
        ? whereDiff
        : whereDiff1;
    let totalcount = await Campaign.count({
      where,
    });
    let camp = await Campaign.findAll({
      raw: false,
      nest: true,
      offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
      limit: parseInt(PageSize),
      where,
      include: [
        {
          model: users,
          where: {
            isBlocked: 0,
            isDelete: 0,
          },
          include: [
            {
              model: merchantDetail,
            },
          ],
        },
        {
          model: shippingmodel,
        },
        {
          model: CampaignDetail,
          include: [
            {
              model: products,
            },
          ],
        },
        {
          model: db.campaignLikes,
        },
      ],
    });
    camp = camp.filter(
      (element) =>
        element?.dataValues?.campaignDetails[0]?.dataValues?.product?.isActive
    );
    let data = await Promise.all(
      camp.map(async (x) => {
        let Campaign = new Object(x);
        return getAllimagesByTypeAndTypeId("Campaign", x.id).then((objs) => {
          if (objs) {
            if (objs.getImages.length) {
              Campaign["imgs"] = objs.getImages;
              if (objs.getIndexs.length) {
                Campaign["indexes"] = objs.getIndexs;
              }
            }
          }
          return Campaign;
        });
      })
    );
    return await { data: data, count: totalcount };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getCampaing(req, camid) {
  try {
    await getAllCampaingsfilter(req, camid);
    let camp = await Campaign.findOne({
      where: {
        id: camid,
      },
      include: [
        {
          model: users,
          include: [
            {
              model: merchantDetail,
            },
          ],
        },
        {
          model: shippingmodel,
        },
        {
          model: CampaignDetail,
          include: [
            {
              model: products,
            },
          ],
        },
      ],
    });

    let data = getAllimagesByTypeAndTypeId("Campaign", camp.id).then((objs) => {
      let Campaign = new Object(camp);
      if (objs) {
        if (objs.getImages.length) {
          Campaign["dataValues"]["imgs"] = objs.getImages;
          if (objs.getIndexs.length) {
            Campaign["dataValues"]["indexes"] = objs.getIndexs;
          }
        }
      }
      return Campaign;
    });
    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getCampaingByMerchantId(req, merchantid) {
  try {
    // merchantid
    let camp = await users.findAll({
      offset:
        parseInt(req.query.page) * limit.limit
          ? parseInt(req.query.page) * limit.limit
          : 0,
      limit: req.query.page ? limit.limit : 1000000,
      where: {
        id: merchantid,
      },
      include: [
        {
          model: merchantDetail,
        },
        {
          model: Campaign,
          where: {
            isExpired: false,
          },
          include: [
            {
              model: shippingmodel,
            },
            {
              model: CampaignDetail,
              include: [
                {
                  model: products,
                },
              ],
            },
          ],
        },
      ],
    });

    return camp;
  } catch (error) {
    return error;
  }
}

async function searchCampaignByMerchantUserName(merchantUserName) {
  try {
    // merchantid
    const camp = await Campaign.findAll({
      nest: true,
      where: {
        isActive: true,
        isExpired: false,
        campaignStartsAt: {
          [Op.lte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
        campaignExpiresAt: {
          [Op.gte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
      },
      include: [
        {
          model: CampaignDetail,
        },

        {
          model: db.users,
          where: {
            isBlocked: 0,
            isDelete: 0,
            userName: {
              [Op.like]: "%" + merchantUserName + "%",
            },
          },

          include: [
            {
              model: db.usersdetail,
            },
            {
              model: db.MerchantDetails,
            },
            {
              model: db.LikeModel,
              as: "Likes",
              include: [
                {
                  model: db.users,
                  where: {
                    isBlocked: 0,
                    isDelete: 0,
                  },
                },
              ],
            },
            {
              model: Product,
              where: { isActive: true },
            },
          ],
        },

        {
          model: db.campaignLikes,
          include: [
            {
              model: db.users,
              where: {
                isBlocked: 0,
                isDelete: 0,
              },
            },
          ],
        },
        {
          model: ImageData,
          association: db.campaign.hasMany(db.imageData, {
            foreignKey: "typeId",
          }),
          where: {
            imageType: "Campaign",
          },
        },
      ],
    });
    return camp;
  } catch (error) {
    return error;
  }
}

async function searchCampaignByProductName(productName) {
  try {
    const foundProducts = await Campaign.findAll({
      nest: true,
      where: {
        isActive: true,
        isExpired: false,
        campaignStartsAt: {
          [Op.lte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
        campaignExpiresAt: {
          [Op.gte]: moment(Date.now())
            .tz("Asia/Karachi")
            .format("YYYY-MM-DDTHH:mm:ss"),
        },
      },
      include: [
        {
          model: CampaignDetail,
        },

        {
          model: db.users,
          where: {
            isBlocked: 0,
            isDelete: 0,
          },

          include: [
            {
              model: db.usersdetail,
            },
            {
              model: db.MerchantDetails,
            },
            {
              model: db.LikeModel,
              as: "Likes",
              include: [
                {
                  model: db.users,
                  where: {
                    isBlocked: 0,
                    isDelete: 0,
                  },
                },
              ],
            },
            {
              model: Product,
              where: {
                isActive: true,
                name: {
                  [Op.like]: "%" + productName + "%",
                },
              },
            },
          ],
        },

        {
          model: db.campaignLikes,
          include: [
            {
              model: db.users,
              where: {
                isBlocked: 0,
                isDelete: 0,
              },
            },
          ],
        },
        {
          model: ImageData,
          association: db.campaign.hasMany(db.imageData, {
            foreignKey: "typeId",
          }),
          where: {
            imageType: "Campaign",
          },
        },
      ],
    });

    return foundProducts;
  } catch (error) {
    return error;
  }
}

exports.create = function (campaigndata, req, res, imgArr, sliderArr) {
  try {
    Campaign.create(campaigndata)
      .then(async (data) => {
        let productVal = JSON.parse(req.body.products);
        productVal.forEach((vals, index, array) => {
          products
            .findOne({
              where: {
                id: vals.productid,
              },
            })
            .then(async (result) => {
              let details = {
                campaignId: data.id,
                campaignCode: data.campaignCode,
                productId: vals.productid,
                productName: result.name,
                productQty: vals.qty,
                avaliablityStock: vals.avaliablityStock,
                lat: campaigndata.lat,
                lng: campaigndata.lng,
              };

              try {
                let campaingdetail = await CampaignDetail.create(details);
                let stockdeduction = result.stock - vals.avaliablityStock;
                await products.update(
                  {
                    stock: stockdeduction,
                  },
                  {
                    where: {
                      id: vals.productid,
                    },
                  }
                );

                if (campaingdetail) {
                  imgArr.map((x) => (x.typeId = data.id));
                  sliderArr.map((x) => (x.typeId = data.id));
                  let createdImages = await ImageData.bulkCreate(imgArr);
                  let createdSlider = await slider.bulkCreate(sliderArr);
                  res.status(200).send({
                    success: true,
                    message: "created campaing",
                    Images: createdImages,
                    slider: createdSlider,
                  });
                }
              } catch (error) {}
            })
            .catch((err) => {});
        });
      })
      .catch((err) => {
        res.status(501).send({
          success: false,
          message:
            err.message || "Some error occurred while creating the campaign.",
        });
      });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Something Went Wrong",
    });
  }
};

exports.update_step_1 = async function (campaigndata, campaingId, req, res) {
  try {
    let foundImgData = await ImageData.findAll({
      raw: true,
      where: {
        imageType: "Campaign",
        typeId: campaingId,
      },
    });

    console.log("=================foundImgData======================");
    console.log(foundImgData);
    console.log("=================foundImgData======================");

    let oldData = req.body.campaignImage;
    let getImageData = foundImgData.map((x) => x.imageId);

    console.log("================getImageData oldData===================");
    console.log(getImageData);
    console.log(oldData);
    console.log("================oldData getImageData==================");

    let DeletedCampaignImg = getImageData.filter(
      (obj) => !oldData.some((obj2, index) => obj == obj2)
    );

    console.log(
      "================req.files.length DeletedCampaignImg================="
    );
    console.log(DeletedCampaignImg);
    console.log(req.files.length);
    console.log(
      "================ req.files.length DeletedCampaignImg================="
    );

    if (req.files.length) {
      if (DeletedCampaignImg.length) {
        DeletedCampaignImg.map((x) => {
          cloudinary
            .remove(x)
            .then(async (rmvFile) => {
              if (rmvFile) {
                await ImageData.destroy({
                  where: {
                    imageId: x,
                  },
                });
                await slider.destroy({
                  where: {
                    imageId: x,
                  },
                });
              } else {
                return res.status(200).send({
                  code: 501,
                  success: false,
                  message: "An error occured while updating the Product.",
                });
              }
            })
            .catch((error) => {
              return res.status(501).send({
                success: false,
                message:
                  error.message ||
                  "An error occured while updating the Product.",
              });
            });
        });
      }
      let imgArr = [];
      let sliderArr = [];
      let getSliderOrderBy = await slider.findOne({
        raw: true,
        where: {
          imageType: "Campaign",
          typeId: campaingId,
        },
        order: [["sliderIndex", "DESC"]],
      });
      console.log("================getSliderOrderBy==================");
      console.log(getSliderOrderBy);
      console.log("================getSliderOrderBy==================");
      let SliderIndexesIs = getSliderOrderBy.sliderIndex;
      Promise.all(
        req.files.map((x) => {
          return new Promise((resolve, reject) => {
            const rndStr = foundImgData[0].imageId.slice(18, 28);
            const dir = `uploads/campaigns/${rndStr}/thumbnail/`;
            cloudinary
              .uploads(x.path, dir)
              .then((uploadRslt) => {
                if (uploadRslt) {
                  SliderIndexesIs++;
                  imgArr.push({
                    imageType: "Campaign",
                    imageId: uploadRslt.id,
                    typeId: campaingId,
                    imageUrl: uploadRslt.url,
                    userId: req.user.id,
                  });
                  sliderArr.push({
                    imageType: "Campaign",
                    imageId: uploadRslt.id,
                    typeId: campaingId,
                    imageUrl: uploadRslt.url,
                    sliderIndex: SliderIndexesIs,
                  });
                  fs.unlinkSync(x.path);
                  resolve();
                } else {
                  reject({
                    code: 501,
                    success: false,
                    message: "An error occured while uploading the Image.",
                  });
                }
              })
              .catch((error) => {
                console.log(error, "===============error===========");
                reject({
                  status: 501,
                  success: false,
                  message:
                    error.message ||
                    "An error occured while uploading the Image.",
                });
              });
          });
        })
      )
        .then(async (x) => {
          await ImageData.bulkCreate(imgArr);
          await slider.bulkCreate(sliderArr);
          let updatedCampaign = await Campaign.update(campaigndata, {
            where: {
              id: campaingId,
            },
          });
          console.log("===============updatedCampaign=====================");
          console.log(updatedCampaign);
          console.log("===============updatedCampaign=====================");
          if (updatedCampaign[0]) {
            oldData.map(async (x, i) => {
              await slider.update(
                {
                  sliderIndex: i,
                },
                {
                  where: {
                    imageId: x,
                    imageType: "Campaign",
                    typeId: campaingId,
                  },
                }
              );
            });
            if (campaigndata.voucherExpiresAt) {
              try {
                await voucherGen.update(
                  { expiresAt: campaigndata.voucherExpiresAt },
                  {
                    where: { campaignId: req.params.id },
                  }
                );
              } catch (e) {}
            }
            res.status(200).send({
              success: true,
              message: "Campaign Successfully Updated!",
            });
          } else {
            res.status(501).send({
              success: false,
              message: "Error while updating the Campaign.",
            });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(501).send({
            success: false,
            message:
              error.message || "An error occured while updating the Image.",
          });
        });
    } else {
      console.log("===========DeletedCampaignImg============");
      console.log(DeletedCampaignImg);
      console.log("===========DeletedCampaignImg============");
      if (DeletedCampaignImg.length) {
        DeletedCampaignImg.map((x) => {
          cloudinary
            .remove(x)
            .then(async (rmvFile) => {
              if (rmvFile) {
                await ImageData.destroy({
                  where: {
                    imageId: x,
                  },
                });
                await slider.destroy({
                  where: {
                    imageId: x,
                  },
                });
              } else {
                return res.status(501).send({
                  success: false,
                  message: "An error occured while updating the Campaign.",
                });
              }
            })
            .catch((error) => {
              console.log("=====error-=---343------------");
              console.log(errorm);
              console.log("=====error-=---343------------");
              return res.status(501).send({
                success: false,
                message:
                  error.message ||
                  "An error occured while updating the Campaign.",
              });
            });
        });
      }
      let update = await Campaign.update(campaigndata, {
        where: {
          id: campaingId,
        },
      });

      console.log("===========update===============");
      console.log(update);
      console.log("===========update===============");

      if (update[0]) {
        try {
          oldData.map(async (x, i) => {
            foundImgData.filter((data) => data.imageId == x);
            await slider.update(
              {
                sliderIndex: i,
              },
              {
                where: {
                  imageId: x,
                  imageType: "Campaign",
                  typeId: campaingId,
                },
              }
            );
          });
          res
            .status(200)
            .send({ success: true, message: "Successfully Updated" });
        } catch (error) {
          console.log("--------errr-r---------");
          console.log(error);
          console.log("--------errr-r---------");
        }
      }
    }
  } catch (error) {
    console.log(error, "======err0rr334");
    return res.status(500).send({
      success: false,
      message: error.message || "Something Went Wrong!!!!",
    });
  }
};

exports.update_step_2 = async function (campdata, req, res) {
  try {
    let campproduct = campdata;
    let data = await CampaignDetail.findAll({
      raw: true,
      where: {
        campaignId: req.params.id,
      },
    });
    data.forEach(async (campaingdata) => {
      campproduct.forEach(async (element) => {
        if (element.productid == campaingdata.productId) {
          let productdata = await products.findOne({
            raw: true,
            where: {
              id: element.productid,
            },
          });
          let details = {
            campaignId: campaingdata.campaignId,
            campaignCode: campaingdata.campaignCode,
            productId: element.productid,
            productPrice: productdata.price,
            productName: productdata.name,
            productQty: element.qty,
            avaliablityStock: element.avaliablityStock,
          };
          let updatecampaing = await CampaignDetail.update(details, {
            where: {
              id: campaingdata.id,
            },
          });
          if (updatecampaing) {
            let updatestock = productdata.stock - element.addstock;
            await products.update(
              {
                stock: updatestock,
              },
              {
                where: {
                  id: element.productid,
                },
              }
            );
            return res
              .status(200)
              .send({ success: true, message: "Campaing Products Updated" });
          }
        }
      });
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};
exports.getCampaing = getCampaing;
exports.getAllCampaing = getAllCampaing;
exports.getAllCampaingSearch = getAllCampaingSearch;
exports.getCampaingByMerchantId = getCampaingByMerchantId;
exports.searchCampaignByMerchantUserName = searchCampaignByMerchantUserName;
exports.searchCampaignByProductName = searchCampaignByProductName;
