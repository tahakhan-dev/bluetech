const Token = require("../Middleware/token");

const SupportController = require("../Controller/support/support.controller");

var router = require("express").Router();

let support = new SupportController();

router.post("/question", Token.isAuthenticated(), support.create);

module.exports = router;
