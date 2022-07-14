const db = require("../Model");
const { validate } = require("../Model/promoCode.model");

const GetPermissions = require("../Controller/extras/FindPermission");

const PromoCode = db.promoCode;
const AppliedPromocode = db.AppliedPromocode;
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
            .send({ success: false, message: "This code Already Exist" });
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

        await PromoCode.create(payload);

        res.send({ success: true, message: "Promocode created successfully" });
      } else {
        return res.status(403).send({
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
      let permissions = await GetPermissions(req.user.id);
      if (permissions && permissions.canReadPromoCode) {
        let p_code = await PromoCode.findAll({
          raw: true,
          where: { isActive: true },
        });

        res.send({ success: true, message: "Get Promocodes", data: p_code });
      } else {
        return res.status(403).send({
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

  applyPromoCode = async (req, res) => {
    try {
      let { code } = req.body;

      let p_code = await PromoCode.findOne({
        raw: true,
        where: { code: code, isActive: true },
      });

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

        if (used_code.length == p_code.limit)
          return res.send({
            success: false,
            message: "This Code Already Used",
          });

        let _ = await AppliedPromocode.create({
          userId: req.user.id,
          promocodeId: p_code.id,
        });

        await PromoCode.update(
          { quantity: p_code.quantity - 1 },
          {
            where: {
              id: p_code.id,
            },
          }
        );

        res.send({
          success: true,
          message: "Promo Code Applied",
          data: p_code,
        });
      } else {
        res
          .status(404)
          .send({ success: false, message: "This code does not exist!" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: err.message || "Something Failed." });
    }
  };
}

module.exports = Promocode;
