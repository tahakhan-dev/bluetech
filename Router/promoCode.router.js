const db = require("../Model");
const Promocode = require("../Controller/promoCode/promoCode.controller");

var router = require("express").Router();

let Promocodes = new Promocode();

const Token = require("../Middleware/token");

router.post("/create", Token.isAuthenticated(), Promocodes.create);

router.post("/apply", Token.isAuthenticated(), Promocodes.applyPromoCode);

router.post(
  "/removePromocode",
  Token.isAuthenticated(),
  Promocodes.removePromocode
);

router.get("/getPromocodes", Token.isAuthenticated(), Promocodes.getPromocodes);

router.get("/getPromocodesSearch", Token.isAuthenticated(), Promocodes.getPromocodesSearch);

router.put(
  "/updatePromocode/:id",
  Token.isAuthenticated(),
  Promocodes.updatePromocode
);

router.get(
  "/getSpecificPromocode/:id",
  Token.isAuthenticated(),
  Promocodes.getSpecificPromocode
);

router.delete(
  "/deletePromocode/:id",
  Token.isAuthenticated(),
  Promocodes.deletePromocode
);

module.exports = router;
