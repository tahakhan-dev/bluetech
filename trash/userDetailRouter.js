var router = require("express").Router();
const db = require("../Model");
const Token = require('../Middleware/token');

const Users = db.users;


module.exports = router;
