const db = require("../../Model");
const _ = require("lodash");
const fs = require("fs");
const Product = db.product;
const Category = db.category;
const SubCategory = db.SubCategory;
const Merchant = db.MerchantDetails;
const ImageData = db.imageData;
const Users = db.users;
const slider = db.Sliderdata;
const GetPermissions = require("../extras/FindPermission");
const cloudinary = require("../../config/cloudinary.config");
const randomstring = require("crypto-random-string");
const { getAllimagesByTypeAndTypeId } = require("../extras/getImages");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const { campaignDetail, Sliderdata } = require("../../Model");
const limit = require("../extras/DataLimit");
const { async } = require("crypto-random-string");
const Op = db.Sequelize.Op;

class Products {
  create = async (req, res) => {
    try {
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canCreateProduct) {
        let category = await Category.findOne({
          where: {
            id: req.body.categoryId,
          },
        });
        if (!category)
          return res.status(200).send({
            code: 404,
            success: true,
            message: "This Category Is Not Avaliable",
          });

        let subcateogry = await SubCategory.findOne({
          where: {
            id: req.body.subcategoryId,
          },
        });
        if (!subcateogry)
          return res.status(200).send({
            code: 404,
            success: true,
            message: "This subcateogry Is Not Avaliable",
          });
        let merchant = await Merchant.findOne({
          raw: true,
          where: {
            userId: req.body.merchantId,
          },
        });

        if (!merchant)
          return res.status(200).send({
            code: 404,
            success: true,
            message: "This merchant Is Not Avaliable",
          });

        const product = _.pick(req.body, [
          "name",
          "categoryId",
          "subcategoryId",
          "merchantId",
          "stock",
          "short_title",
          "long_title",
          "short_description",
          "long_description",
          "image",
          "isActive",
        ]);

        if (!req.files.length)
          return res
            .status(402)
            .send({ success: false, message: "Image is required." });
        else {
          let files = req.files;
          let imgArr = [];
          const rndStr = randomstring({ length: 10 });
          const dir = `uploads/products/${rndStr}/thumbnail/`;
          Promise.all(
            files.map((x) => {
              return new Promise((resolve, reject) => {
                cloudinary
                  .uploads(x.path, dir)
                  .then((uploadRslt) => {
                    if (uploadRslt) {
                      imgArr.push({
                        imageType: "Product",
                        imageId: uploadRslt.id,
                        typeId: null,
                        imageUrl: uploadRslt.url,
                        userId: req.user.id,
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
                    reject({
                      code: 501,
                      success: false,
                      message:
                        error.message ||
                        "An error occured while uploading the Image.",
                    });
                  });
              });
            })
          )
            .then(async () => {
              let createdProduct = await Product.create(product);
              if (createdProduct) {
                let counter = 0;
                let sliderArr = [];
                imgArr.map((x) => {
                  x.typeId = createdProduct.id;
                  sliderArr.push({
                    imageType: x.imageType,
                    typeId: createdProduct.id,
                    imageId: x.imageId,
                    imageUrl: x.imageUrl,
                    sliderIndex: counter,
                  });
                  counter++;
                });
                let createdImages = await ImageData.bulkCreate(imgArr);
                let SliderData = await slider.bulkCreate(sliderArr);
                res.status(200).send({
                  success: true,
                  message: "Product Created",
                  createdProduct,
                  Images: createdImages,
                  sliderData: SliderData,
                });
              } else {
                res.status(501).send({
                  success: false,
                  message: "An error occured while creating the product.",
                });
              }
            })
            .catch((error) => {
              res.status(404).send({
                success: false,
                message:
                  error.message || "An error occured while uploading the Image",
              });
            });
        }
      } else {
        res.status(200).send({
          code: 401,
          success: false,
          message: "Access Denied Permissions Not Acceptable !",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Failed.",
      });
    }
  };

  getProduct = async (req, res) => {
    try {
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canReadProduct) {
        let totalcount = await Product.count({
          where: {
            isActive: true,
          },
          include: [
            {
              model: Category,
              where: {
                isActive: true,
                isDelete: false,
              },
            },
            {
              model: SubCategory,
              where: {
                isActive: true,
                isDelete: false,
              },
            },
            {
              model: Users,
              where: {
                isBlocked: 0,
              },
            },
          ],
        });
        let products = await Product.findAll({
          raw: true,
          nest: true,
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
          },
          include: [
            {
              model: Category,
              where: {
                isActive: true,
                isDelete: false,
              },
            },
            {
              model: SubCategory,
              where: {
                isActive: true,
                isDelete: false,
              },
            },
            {
              model: Users,
              where: {
                isBlocked: 0,
              },
              include: [
                {
                  model: Merchant,
                },
              ],
            },
          ],
        });
        Promise.all(
          products.map(async (x) => {
            let product = new Object(x);
            return getAllimagesByTypeAndTypeId("Product", x.id).then((objs) => {
              if (objs) {
                if (objs.getImages.length) {
                  product["imgs"] = objs.getImages;
                  if (objs.getIndexs.length) {
                    product["indexes"] = objs.getIndexs;
                  }
                }
              }
              return product;
            });
          })
        ).then((data) => {
          let countData = {
            page: parseInt(PageNumber),
            pages: Math.ceil(totalcount / PageSize),
            totalRecords: totalcount,
          };
          res.status(200).send({
            success: true,
            data: data,
            countData,
          });
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "Access Denied Permissions Not Acceptable !",
        });
      }
    } catch (err) {
      return res.status(403).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  searchProducts = async (req, res) => {
    try {
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let SearchQuery = req.query.SearchQuery;
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canReadProduct) {
        let totalcount = await Product.count({
          where: {
            isActive: true,
            [Op.or]: [
              {
                name: {
                  [Op.like]: `%${SearchQuery}%`,
                },
              },
              {
                short_title: {
                  [Op.like]: `%${SearchQuery}%`,
                },
              },
              {
                stock: {
                  [Op.like]: `${SearchQuery}`,
                },
              },
            ],
          },
          include: [
            {
              model: Category,
              where: {
                isActive: true,
                isDelete: false,
              },
            },
            {
              model: SubCategory,
              where: {
                isActive: true,
                isDelete: false,
              },
            },
            {
              model: Users,
              where: {
                isBlocked: 0,
              },
            },
          ],
        });
        let products = await Product.findAll({
          raw: true,
          nest: true,
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
            [Op.or]: [
              {
                name: {
                  [Op.like]: `%${SearchQuery}%`,
                },
              },
              {
                short_title: {
                  [Op.like]: `%${SearchQuery}%`,
                },
              },
              {
                stock: {
                  [Op.like]: `${SearchQuery}`,
                },
              },
            ],
          },
          include: [
            {
              model: Category,
              where: {
                isActive: true,
                isDelete: false,
              },
            },
            {
              model: SubCategory,
              where: {
                isActive: true,
                isDelete: false,
              },
            },
            {
              model: Users,
              where: {
                isBlocked: 0,
              },
              include: [
                {
                  model: Merchant,
                },
              ],
            },
          ],
        });
        Promise.all(
          products.map(async (x) => {
            let product = new Object(x);
            return getAllimagesByTypeAndTypeId("Product", x.id).then((objs) => {
              if (objs) {
                if (objs.getImages.length) {
                  product["imgs"] = objs.getImages;
                  if (objs.getIndexs.length) {
                    product["indexes"] = objs.getIndexs;
                  }
                }
              }
              return product;
            });
          })
        ).then((data) => {
          let countData = {
            page: parseInt(PageNumber),
            pages: Math.ceil(totalcount / PageSize),
            totalRecords: totalcount,
          };
          res.status(200).send({
            success: true,
            data: data,
            countData,
          });
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "Access Denied Permissions Not Acceptable !",
        });
      }
    } catch (err) {
      return res.status(403).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };
  getProductById = async (req, res) => {
    try {
      let permissions = await GetPermissions(req.user.id);

      if (permissions.canReadProduct) {
        let permissions = await Product.findAll({
          raw: true,
          where: {
            id: req.params.productId,
          },
        });
        res.status(200).send({
          success: true,
          message: "Successfully Get!",
          data: permissions,
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "Access Denied Permissions Not Acceptable !",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getProductbymerchantId = async (req, res) => {
    try {
      let permissions = await GetPermissions(req.user.id);
      if (permissions.canReadProduct) {
        let products = await Product.findAll({
          raw: true,
          nest: true,
          offset:
            parseInt(req.query.page) * limit.limit
              ? parseInt(req.query.page) * limit.limit
              : 0,
          limit: req.query.page ? limit.limit : 1000000,
          where: { isActive: true, merchantId: req.params.id },
          include: [
            { model: Category, where: { isActive: true, isDelete: false } },
            { model: SubCategory, where: { isActive: true, isDelete: false } },
          ],
        });
        let countData = {
          page: parseInt(req.query.page),
          pages: Math.ceil(products.length / limit.limit),
          totalRecords: products.length,
        };
        res.status(200).send({
          success: true,
          message: "Successfully Get!",
          data: products,
          countData,
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permissions!",
        });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  updateProductById = async (req, res) => {
    try {
      let permissions = await GetPermissions(req.user.id);
      const productId = req.params.productId;
      let productInfo = {
        name: req.body.name,
        categoryId: req.body.categoryId,
        subcategoryId: req.body.subcategoryId,
        merchantId: req.body.merchantId,
        short_description: req.body.short_description,
        stock: req.body.stock,
        long_title: req.body.long_title,
        short_title: req.body.short_title,
        long_description: req.body.long_description,
        imageIds: req.body.imageIds,
        isActive: req.body.isActive,
      };
      if (permissions.canEditProduct) {
        let foundProduct = await Product.findOne({
          raw: true,
          where: {
            id: productId,
          },
        });

        if (!foundProduct)
          res
            .status(200)
            .send({ code: 404, success: true, message: "Not Found." });

        let foundImgData = await ImageData.findAll({
          raw: true,
          where: {
            imageType: "Product",
            typeId: foundProduct.id,
          },
        });

        await slider.findAll({
          raw: true,
          where: {
            imageType: "Product",
            typeId: foundProduct.id,
          },
        });
        let oldData = req.body.productImage;
        let getImageData = foundImgData.map((x) => x.imageId);
        let DeletedProductImg = getImageData.filter(
          (obj) => !oldData.some((obj2, index) => obj == obj2)
        );

        if (req.files.length) {
          if (DeletedProductImg.length) {
            DeletedProductImg.map((x) => {
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
              imageType: "Product",
              typeId: foundProduct.id,
            },
            order: [["sliderIndex", "DESC"]],
          });
          let SliderIndexesIs = getSliderOrderBy.sliderIndex;
          Promise.all(
            req.files.map((x) => {
              return new Promise((resolve, reject) => {
                const rndStr = foundImgData[0].imageId.slice(17, 27);
                const dir = `uploads/products/${rndStr}/thumbnail/`;
                cloudinary
                  .uploads(x.path, dir)
                  .then((uploadRslt) => {
                    if (uploadRslt) {
                      SliderIndexesIs++;
                      imgArr.push({
                        imageType: "Product",
                        imageId: uploadRslt.id,
                        typeId: foundProduct.id,
                        imageUrl: uploadRslt.url,
                        userId: req.user.id,
                      });
                      sliderArr.push({
                        imageType: "Product",
                        imageId: uploadRslt.id,
                        typeId: foundProduct.id,
                        imageUrl: uploadRslt.url,
                        sliderIndex: SliderIndexesIs,
                      });
                      fs.unlinkSync(x.path);
                      resolve();
                    } else {
                      reject({
                        status: 501,
                        message: "An error occured while uploading the Image.",
                      });
                    }
                  })
                  .catch((error) => {
                    reject({
                      status: 501,
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
              let updateProduct = await Product.update(productInfo, {
                where: {
                  id: productId,
                },
              });
              if (updateProduct[0]) {
                oldData.map(async (x, i) => {
                  await slider.update(
                    {
                      sliderIndex: i,
                    },
                    {
                      where: {
                        imageId: x,
                        imageType: "Product",
                        typeId: productId,
                      },
                    }
                  );
                });
                res.status(200).send({
                  success: true,
                  message: "Product Successfully Updated!",
                });
              } else {
                res.status(501).send({
                  success: false,
                  message: "Error while updating the Product.",
                });
              }
            })
            .catch((error) => {
              res.status(501).send({
                success: false,
                message:
                  error.message || "An error occured while updating the Image.",
              });
            });
        } else {
          if (DeletedProductImg.length) {
            DeletedProductImg.map((x) => {
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
          let updateProduct = await Product.update(productInfo, {
            where: {
              id: productId,
            },
          });
          if (updateProduct[0]) {
            oldData.map(async (x, i) => {
              await slider.update(
                {
                  sliderIndex: i,
                },
                {
                  where: {
                    imageId: x,
                    imageType: "Product",
                    typeId: productId,
                  },
                }
              );
            });
            res.status(200).send({
              success: true,
              message: "Product Successfully Updated!",
            });
          }
        }
      } else {
        return res.status(401).send({
          success: false,
          message: "Access Denied Permissions Not Acceptable !",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  deleteProduct = async (req, res) => {
    try {
      let permissions = await GetPermissions(req.user.id);

      if (permissions.canDeleteProduct) {
        let get = await campaignDetail.findOne({
          where: {
            productId: req.params.productId,
          },
        });
        if (get) {
          res.status(200).send({
            code: 405,
            success: false,
            message:
              "You Can Not Delete Product It Is Asscociated To A Campaing",
          });
        } else {
          await Product.update(
            {
              isActive: false,
            },
            {
              where: {
                id: req.params.productId,
              },
            }
          );
          res
            .status(200)
            .send({ success: true, message: "Successfully Deleted!" });
        }
      } else {
        return res.status(401).send({
          success: false,
          message: "Access Denied Permissions Not Acceptable !",
        });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ success: false, message: err || "Something Went Wrong!" });
    }
  };
}

module.exports = Products;
