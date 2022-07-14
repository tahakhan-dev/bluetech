const Token = require("../Middleware/token");

const LikeController = require("../Controller/like/like.controller");

var router = require("express").Router();

let Like = new LikeController();

router.post("/likemerchant/:id", Token.isAuthenticated(), Like.LikeMerchant);

router.post("/likecampaing/:id", Token.isAuthenticated(), Like.LikeCampaing);
// router.get("/get", Token.isAuthenticated(), Like.get);

module.exports = router;
