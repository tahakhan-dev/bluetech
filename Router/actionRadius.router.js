const ActionRadius = require("../Controller/actionRadius/actionRadius.controller");
const Token = require("../Middleware/token");
var router = require("express").Router();

let Action = new ActionRadius();

router.post("/create", Token.isAuthenticated(), Action.create);

router.get(
  "/getSpecificRadius/:id",
  Token.isAuthenticated(),
  Action.getSpecificRadius
);

router.put("/updateRadius/:id", Token.isAuthenticated(), Action.updateRadius);

router.delete(
  "/deleteRadius/:id",
  Token.isAuthenticated(),
  Action.deleteRadius
);

module.exports = router;
