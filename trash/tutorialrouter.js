const tutorials = require("../Controller/tutorialController");

var router = require("express").Router();

let Tutorial = new tutorials();
const Token = require('../Middleware/token');


router.post("/create",Token.isAuthenticated(), Tutorial.create);

module.exports = router;
