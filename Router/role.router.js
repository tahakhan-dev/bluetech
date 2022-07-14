const RoleController = require("../Controller/roles/roles.controller");

var router = require("express").Router();

let roles = new RoleController();

router.post("/create", roles.create);

router.get("/getRoles", roles.getRoles);

module.exports = router;
