"use strict";

var express = require("express");
var Token = require("../Middleware/token");
var controller = require("./cache.controller");
var router = express.Router();

router.get("/get-redis-keys", Token.isAuthenticated(), controller.getRedisKeys);

router.post("/get-redis-key", Token.isAuthenticated(), controller.getRedisKey);

router.post(
  "/delete-redis-key",
  Token.isAuthenticated(),
  controller.deleteRedisKey
);

router.post(
  "/delete-redis-keys",
  Token.isAuthenticated(),
  controller.deleteRedisKeys
);

module.exports = router;
