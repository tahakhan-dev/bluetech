const db = require("../../Model");
const { validate } = require("../../Model/promoCode.model");
const moment = require("moment");
const GetPermissions = require("../extras/FindPermission");
const PromoCode = db.promoCode;
const AppliedPromocode = db.AppliedPromocode;
const limit = require("../extras/DataLimit/index");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const Op = db.Sequelize.Op;
class Promocode {
  create = async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error)
        return res
          .status(400)
          .send({ success: false, message: error.details[0].message });

      let permissions = await GetPermissions(req.user.id);

      if (permissions && permissions.canCreatePromoCode) {
        let p_code = await PromoCode.findOne({
          raw: true,
          where: { code: req.body.code, isActive: true },
        });

        if (p_code)
          return res
            .status(409)
            .send({ success: true, message: "This code Already Exist" });
        let {
          code,
          discount,
          expireAt,
          limit,
          isActive,
          quantity,
          discountType,
        } = req.body;

        let payload = {
          code,
          discount,
          expireAt,
          limit,
          isActive,
          quantity,
          discountType,
        };

        if (discountType == "amount" || discountType == "percent") {
          await PromoCode.create(payload);
          res
            .status(200)
            .send({ success: true, message: "Promocode Created Successfully" });
        } else {
          return res.status(200).send({
            code: 404,
            success: false,
            message: "There is Some error",
          });
        }
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permisssions to create Promocode!",
        });
      }
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: err.message || "Something Failed." });
    }
  };

  getPromocodes = async (req, res) => {
    try {
      let PageSize = req.query.pageSize;
      let PageNumber = req.query.pageNumber;
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canReadPromoCode) {
        let totalcount = await PromoCode.count();
        let p_code = await PromoCode.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          raw: true,
          // where: {
          //   isActive: true,
          //   expireAt: {
          //     [Op.gte]: moment(Date.now()).format("YYYY-MM-DD"),
          //   },
          // },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcount / PageSize),
          totalRecords: totalcount,
        };
        res.status(200).send({
          success: true,
          message: "Get Promocodes",
          data: p_code,
          countData,
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permisssions to create Promocode!",
        });
      }
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: err.message || "Something Failed." });
    }
  };

  getPromocodesSearch = async (req, res) => {
    try {
      let PageSize = req.query.pageSize;
      let PageNumber = req.query.pageNumber;
      let SearchQuery = req.query.searchQuery;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canReadPromoCode) {
        let totalcount = await PromoCode.count({
          where: {
            // isActive: true,
            code: {
              [Op.like]: `%${SearchQuery}%`,
            },
            // expireAt: {
            //   [Op.gte]: moment(Date.now()).format("YYYY-MM-DD"),
            // },
          },
        });
        let p_code = await PromoCode.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          raw: true,
          where: {
            // isActive: true,
            code: {
              [Op.like]: `%${SearchQuery}%`,
            },
            // expireAt: {
            //   [Op.gte]: moment(Date.now()).format("YYYY-MM-DD"),
            // },
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcount / PageSize),
          totalRecords: totalcount,
        };
        res.status(200).send({
          success: true,
          message: "Get Promocodes",
          data: p_code,
          countData,
        });
      } else {
        return res.status(200).send({
          code: 401,
          success: false,
          message: "You don't have permisssions to create Promocode!",
        });
      }
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: err.message || "Something Failed." });
    }
  };

  getSpecificPromocode = async (req, res) => {
    try {
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canReadPromoCode) {
        let foundPromocode = await PromoCode.findOne({
          where: { id: req.params.id, isActive: true },
        });
        if (foundPromocode) {
          return res.status(200).send({ success: true, foundPromocode });
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

  updatePromocode = async (req, res) => {
    try {
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canEditPromoCode) {
        let {
          code,
          discount,
          expireAt,
          limit,
          isActive,
          quantity,
          discountType,
        } = req.body;
        let payload = {
          code,
          discount,
          expireAt,
          limit,
          isActive,
          quantity,
          discountType,
        };
        let foundPromocode = await PromoCode.findOne({
          where: { id: req.params.id },
        });
        if (foundPromocode) {
          await PromoCode.update(payload, {
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

  deletePromocode = async (req, res) => {
    try {
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canDeletePercentRate) {
        const foundPromocode = await PromoCode.findOne({
          where: {
            id: req.params.id,
          },
        });
        if (foundPromocode) {
          await PromoCode.update(
            { isActive: false },
            { where: { id: req.params.id } }
          );
          return res.status(200).send({
            success: true,
            message: "Promocode Successfully Deleted!",
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

  applyPromoCode = async (req, res) => {
    try {
      let { code, amount } = req.body;

      let p_code = await PromoCode.findOne({
        raw: true,
        where: {
          code: code,
          isActive: true,
          expireAt: {
            [Op.gte]: moment(Date.now()).format("YYYY-MM-DD"),
          },
        },
      });

      if (p_code) {
        let p_codes = await AppliedPromocode.findOne({
          where: {
            promocodeId: p_code.id,
            userId: req.user.id,
          },
        });

        if (p_codes)
          return res.status(404).send({
            success: true,
            message: "You Already Applied This promo Code!!",
            p_codes,
          });
      }

      if (
        p_code &&
        p_code?.discountType == "amount" &&
        parseInt(p_code.discount) > amount
      ) {
        return res.send({
          success: false,
          message: "Discount can not be Greater than Net Amount",
        });
      }

      if (p_code && !p_code.quantity) {
        await PromoCode.update(
          { isActive: false },
          {
            where: {
              id: p_code.id,
            },
          }
        );
      }
      if (p_code && p_code.quantity) {
        let used_code = await AppliedPromocode.findAll({
          raw: true,
          where: { userId: req.user.id, promocodeId: p_code.id },
        });

        if (used_code.length == p_code.limit) {
          return res
            .status(200)
            .send({ success: false, message: "This Code Already Used!" });
        }

        await AppliedPromocode.create({
          promocodeId: p_code.id,
          userId: req.user.id,
        });

        let Pquantity = p_code.quantity - 1;

        await PromoCode.update(
          { quantity: Pquantity },
          {
            where: {
              code: code,
              isActive: true,
            },
          }
        );
        res
          .status(200)
          .send({ success: true, message: "Promo Code Applied", data: p_code });
      } else {
        res.status(200).send({
          success: false,
          message: "This code does not exist!",
        });
      }
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: err.message || "Something Failed." });
    }
  };
  removePromocode = async (req, res) => {
    try {
      let { promoCode } = req.body;

      if (!promoCode) {
        return res.status(202).send({ message: "no promo" });
      }

      let promocodeId = await PromoCode.findOne({
        where: {
          code: promoCode,
        },
      });

      if (promocodeId) {
        await AppliedPromocode.destroy({
          where: {
            promoCodeId: promocodeId.id,
            userId: req.user.id,
          },
        });

        let promocode = await PromoCode.findOne({
          where: {
            code: promoCode,
          },
        });

        await PromoCode.update(
          {
            quantity: promocode.quantity + 1,
          },
          {
            where: {
              id: promocode.id,
            },
          }
        );

        res
          .status(200)
          .send({ success: true, message: "Promocode Has been removed" });
      } else {
        res.status(201).send({ success: true });
      }
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: err.message || "Something Failed." });
    }
  };
}

module.exports = Promocode;
