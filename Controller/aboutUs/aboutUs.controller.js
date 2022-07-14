const db = require("../../Model");
const _ = require("lodash");
const FindPermission = require("../extras/FindPermission");
const limit = require("../extras/DataLimit/index");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const About = db.aboutUs;
const Op = db.Sequelize.Op;

class AboutUs {
  create = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canCreateAboutUs) {
        const about = _.pick(req.body, ["about", "isActive"]);
        let aboutUs = await About.create(about);
        return res.status(200).send({
          success: true,
          data: aboutUs,
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

  getSpecificAbout = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadAboutUs) {
        let aboutUs = await About.findOne({
          where: { id: req.params.id, isActive: true },
        });
        if (aboutUs) {
          return res.status(200).send({
            success: true,
            data: aboutUs,
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

  getAllAbout = async (req, res) => {
    try {
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canReadAboutUs) {
        let totalcount = await About.count({
          where: { isActive: true },
        });

        let aboutUs = await About.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: { isActive: true },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcount / PageSize),
          totalRecords: totalcount,
        };
        return res.status(200).send({ success: true, aboutUs, countData });
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

  getAllAboutSearch = async (req, res) => {
    try {
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let getPermission = await FindPermission(req.user.id);
      let searchQuery = req.query.searchQuery;
      if (getPermission && getPermission.canReadAboutUs) {
        let totalcount = await About.count({
          where: {
            isActive: true,
            about: {
              [Op.like]: `%${searchQuery}%`,
            },
          },
        });

        let aboutUs = await About.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
            about: {
              [Op.like]: `%${searchQuery}%`,
            },
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcount / PageSize),
          totalRecords: totalcount,
        };
        return res.status(200).send({ success: true, aboutUs, countData });
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

  getAllAboutsApp = async (req, res) => {
    let getAllAbouts = await About.findAll({
      offset:
        parseInt(req.query.page) * limit.limit
          ? parseInt(req.query.page) * limit.limit
          : 0,
      limit: req.query.page ? limit.limit : 1000000,
      where: {
        isActive: true,
      },
    });
    if (!getAllAbouts.length)
      return res.status(404).send({
        code: 404,
        success: false,
        data: [],
        message: "Abouts Not Found",
      });
    let countData = {
      page: parseInt(req.query.page),
      pages: Math.ceil(getAllAbouts.length / limit.limit),
      totalRecords: getAllAbouts.length,
    };
    return res.status(200).send({
      success: true,
      getAllAbouts,
      countData,
    });
  };

  updateAbout = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canEditAboutUs) {
        const about = _.pick(req.body, ["about", "isActive"]);
        let foundAbout = await About.findOne({ where: { id: req.params.id } });
        if (foundAbout) {
          let aboutUs = await About.update(about, {
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

  deleteAbout = async (req, res) => {
    try {
      let getPermission = await FindPermission(req.user.id);
      if (getPermission && getPermission.canDeleteAboutUs) {
        let foundAbout = await About.findOne({ where: { id: req.params.id } });
        if (foundAbout) {
          let aboutUs = await About.update(
            { isActive: false },
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
}
module.exports = AboutUs;
