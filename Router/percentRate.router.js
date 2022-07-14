const PercentRate = require("../Controller/percentRate/percentageRate.controller");
const Token = require("../Middleware/token");
var router = require("express").Router();

let Percent = new PercentRate();

router.post("/create", Token.isAuthenticated(), Percent.create);

router.get(
  "/getSpecificPercent/:id",
  Token.isAuthenticated(),
  Percent.getSpecificPercent
);

router.get("/getAllPercent", Token.isAuthenticated(), Percent.getAllPercent);

router.put(
  "/updatePercent/:id",
  Token.isAuthenticated(),
  Percent.updatePercent
);

router.delete(
  "/deletePercent/:id",
  Token.isAuthenticated(),
  Percent.deletePercent
);

module.exports = router;
