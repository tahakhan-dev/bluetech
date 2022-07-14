const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const limit = require("../extras/DataLimit/index");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const TermsCondition = db.termsCondition;
const Op = db.Sequelize.Op;

class TermsAndCondition {
  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canCreateTermsCondition) {
        const terms = _.pick(req.body, ["title", "terms", "isActive"]);
        let termsCondition = await TermsCondition.create(terms);
        return res.status(200).send({ success: true, termsCondition });
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

  getSpecificTerms = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadTermsCondition) {
        let termsCondition = await TermsCondition.findOne({
          where: {
            id: req.params.id,
            isActive: true,
          },
        });
        if (termsCondition) {
          return res.status(200).send(termsCondition);
        } else {
          return res.status(200).send({
            code: 404,
            success: true,
            message: "Not Found!",
          });
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

  getAllTerms = async (req, res) => {
    try {
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadTermsCondition) {
        let totalcount = await TermsCondition.count({
          where: {
            isActive: true,
          },
        });

        let termsCondition = await TermsCondition.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcount / PageSize),
          totalRecords: totalcount,
        };
        return res.send({
          success: true,
          termsCondition,
          countData,
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

  getAllTermsSearch = async (req, res) => {
    try {
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let searchQuery = req.query.searchQuery;
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadTermsCondition) {
        let totalcount = await TermsCondition.count({
          where: {
            isActive: true,
            [Op.or]: [
              {
                title: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
              {
                terms: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
            ],
          },
        });

        let termsCondition = await TermsCondition.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
            [Op.or]: [
              {
                title: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
              {
                terms: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
            ],
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcount / PageSize),
          totalRecords: totalcount,
        };
        return res.send({
          success: true,
          termsCondition,
          countData,
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

  getAllTermsUsers = async (req, res) => {
    let termsCondition = await TermsCondition.findAll({
      offset:
        parseInt(req.query.page) * limit.limit
          ? parseInt(req.query.page) * limit.limit
          : 0,
      limit: req.query.page ? limit.limit : 1000000,
      where: {
        isActive: true,
      },
    });
    if (!termsCondition.length)
      return res.status(200).send({
        code: 404,
        success: false,
        message: "Terms And Condition Not Found",
      });
    let countData = {
      page: parseInt(req.query.page),
      pages: Math.ceil(termsCondition.length / limit.limit),
      totalRecords: termsCondition.length,
    };
    return res.send({
      success: true,
      termsCondition,
      countData,
    });
  };

  updateTerms = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canEditTermsCondition) {
        const terms = _.pick(req.body, ["title", "terms", "isActive"]);
        let foundTerms = await TermsCondition.findOne({
          where: {
            id: req.params.id,
          },
        });
        if (foundTerms) {
          await TermsCondition.update(terms, {
            where: {
              id: req.params.id,
            },
          });
          return res.status(200).send({
            success: true,
            message: "Successfully updated",
          });
        } else {
          return res.status(200).send({
            code: 404,
            success: true,
            message: "Not found!",
          });
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

  deleteTerms = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canDeleteTermsCondition) {
        let foundTerms = await TermsCondition.findOne({
          where: {
            id: req.params.id,
          },
        });
        if (foundTerms) {
          await TermsCondition.update(
            {
              isActive: false,
            },
            {
              where: {
                id: req.params.id,
              },
            }
          );
          return res.status(200).send({
            success: true,
            message: "Successfully deleted",
          });
        } else {
          return res.status(200).send({
            code: 404,
            success: true,
            message: "Not found!",
          });
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
}
module.exports = TermsAndCondition;
