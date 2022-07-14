const db = require("../../Model");
const _ = require("lodash");
const Category = db.category;
const product = db.product;
const campaingDetails = db.campaignDetail;

const GetPermission = require("../extras/FindPermission");
const { validate } = require("../../Model/category.model");
const limit = require("../extras/DataLimit");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const Op = db.Sequelize.Op;
class Categories {
  VerifyCampaingByCategory = async (catid) => {
    try {
      let getProduct = await product.findOne({
        where: {
          categoryId: catid,
        },
        include: [
          {
            model: campaingDetails,
          },
        ],
      });
      return getProduct;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  VerifyCampaingByProduct = async (productId) => {
    try {
      let getProduct = await product.findOne({
        where: {
          categoryId: catid,
        },
        include: [
          {
            model: campaingDetails,
          },
        ],
      });
      return getProduct;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  create = async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error)
        return res
          .status(400)
          .send({ success: false, message: error.details[0].message });

      const permissions = await GetPermission(req.user.id);
      if (permissions.canCreateCategory) {
        const category = _.pick(req.body, [
          "name",
          "description",
          "isActive",
        ]);

        let _category = await Category.findOne({
          raw: true,
          where: {
            name: req.body.name,
          },
        });

        if (_category) {
          res.status(200).send({
            code: 429,
            success: false,
            message: "Already Exist!",
          });
        } else {
          Category.create(category)
            .then((data) => {
              res.status(200).send({ success: true, data });
            })
            .catch((err) => {
              res.status(501).send({
                success: false,
                message:
                  err.message ||
                  "Some error occurred while creating the category.",
              });
            });
        }
      } else {
        return res.status(401).send({
          success: false,
          message: "Access Denied Permissions Not Acceptable !",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  update = async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error)
        return res
          .status(400)
          .send({ success: false, message: error.details[0].message });

      const permissions = await GetPermission(req.user.id);

      if (permissions && permissions.canEditCategory) {
        const category = _.pick(req.body, [
          "name",
          "description",
          "isActive",
        ]);

        let foundCategory = await Category.findOne({
          raw: true,
          where: {
            id: req.params.categoryId,
          },
        });

        if (!foundCategory)
          res.status(200).send({
            code: 404,
            success: false,
            message: "Not Found.",
          });

        if (category.isActive == false) {
          let getData = await this.VerifyCampaingByCategory(
            req.params.categoryId
          );
          if (getData != null && getData.campaignDetails.length) {
            res.status(200).send({
              code: 409,
              success: false,
              message:
                "You Cant block Category Because It Is Associated To A Product Which Is Assigned To A Campaign",
            });
          } else {
            Category.update(category, {
              where: {
                id: req.params.categoryId,
              },
            })
              .then((data) => {
                res.status(200).send({
                  success: true,
                  message: "Successfully Updated!",
                });
              })
              .catch((err) => {
                res.status(501).send({
                  success: false,
                  message:
                    err.message ||
                    "Some error occurred while creating the category.",
                });
              });
          }
        } else {
          Category.update(category, {
            where: {
              id: req.params.categoryId,
            },
          })
            .then((data) => {
              res.status(200).send({
                success: true,
                message: "Successfully Updated!",
              });
            })
            .catch((err) => {
              res.status(501).send({
                success: false,
                message:
                  err.message ||
                  "Some error occurred while creating the category.",
              });
            });
        }
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have Permissions!",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getCategories = async (req, res) => {
    try {
      let permissions = await GetPermission(req.user.id);
      let categoryType = parseInt(req.params.categoryType);
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let categories;
      let totalcount = await Category.count({
        where: {
          isActive: categoryType ? true : false,
          isDelete: false,
        },
      });

      if (permissions && permissions.canReadCategory) {
        if(PageNumber === undefined && PageSize === undefined){
           categories = await Category.findAll({
            raw: true,
            where: {
              isActive: categoryType ? true : false,
              isDelete: false,
            },
          });
        }
        else{ 
           categories = await Category.findAll({
          raw: true,
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: categoryType ? true : false,
            isDelete: false,
          },
        });

      }
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcount / PageSize),
          totalRecords: totalcount,
        };
        res.status(200).send({
          success: true,
          message: "Successfully Get!",
          data: categories,
          countData,
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permissions!",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  searchGetCategories = async (req, res) => {
    try {
      let permissions = await GetPermission(req.user.id);
      let categoryType = parseInt(req.params.categoryType);
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let searchQuery = req.query.searchQuery;

      let totalcount = await Category.count({
        where: {
          isActive: categoryType ? true : false,
          isDelete: false,
          name: {
            [Op.like]: `%${searchQuery}%`,
          },
        },
      });

      if (permissions && permissions.canReadCategory) {
        let categories = await Category.findAll({
          raw: true,
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: categoryType ? true : false,
            isDelete: false,
            name: {
              [Op.like]: `%${searchQuery}%`,
            },
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcount / PageSize),
          totalRecords: totalcount,
        };
        res.status(200).send({
          success: true,
          message: "Successfully Get!",
          data: categories,
          countData,
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permissions!",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getCategoryById = async (req, res) => {
    try {
      let permissions = await GetPermission(req.user.id);

      if (permissions && permissions.canReadCategory) {
        let categories = await Category.findAll({
          raw: true,
          where: {
            id: req.params.categoryId,
          },
        });
        res.status(200).send({
          success: true,
          message: "Successfully Get!",
          data: categories,
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permissions!",
        });
      }
    } catch (err) {
      return res.status(403).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  deleteCategory = async (req, res) => {
    try {
      let permissions = await GetPermission(req.user.id);

      if (permissions && permissions.canDeleteCategory) {
        let cat = {
          isDelete: true,
          isActive: false,
        };

        let getProductByCategory = await product.findOne({
          where: { categoryId: req.params.categoryId },
        });

        if (getProductByCategory) {
          res.status(200).send({
            success: false,
            message:
              "This Category Is Associated To A product You Cannot Delete At This Moment",
          });
        } else {
          let categories = await Category.update(cat, {
            where: {
              id: req.params.categoryId,
            },
          });
          res.status(200).send({
            success: true,
            message: "Category Deleted Successfully!",
          });
        }
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permissions!",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };
}

module.exports = Categories;
