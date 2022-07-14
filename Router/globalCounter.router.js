const globalCounterController = require("../Controller/globalCounter/index");
let Token = require("../Middleware/token");

let globalCounterControllers = new globalCounterController();

var router = require("express").Router();

/*************** USER ***************/
router.post(
  "/create",
  Token.isAuthenticated(),
  globalCounterControllers.create
);
router.get(
  "/read",
  // Token.isAuthenticated(),
  globalCounterControllers.getAllTerms
);
router.put(
  "/update/:id",
  Token.isAuthenticated(),
  globalCounterControllers.updateTerms
);

module.exports = router;
