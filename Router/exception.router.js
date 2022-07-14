const Exception = require("../Controller/exceptions/index");
var router = require("express").Router();

router.post("/create_exception", Exception.create);

module.exports = router;
