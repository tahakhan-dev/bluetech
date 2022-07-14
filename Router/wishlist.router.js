const WishlistController = require("../Controller/wishlist/wishlist.controller");
const Token = require("../Middleware/token");

var router = require("express").Router();

let Wishlist = new WishlistController();

router.post("/create/:campaingid", Token.isAuthenticated(), Wishlist.create);

router.get("/getwishlist", Token.isAuthenticated(), Wishlist.getWishlist);

router.get(
  "/getCampaignWishList",
  Token.isAuthenticated(),
  Wishlist.getCampaignWishList
);

router.get(
  "/getMerchantWishList",
  Token.isAuthenticated(),
  Wishlist.getMerchantWishList
);

router.get(
  "/getFriendCampaignWishList/:id",
  Token.isAuthenticated(),
  Wishlist.getFriendCampaignWishList
);

router.get(
  "/getFriendMerchantWishList/:id",
  Token.isAuthenticated(),
  Wishlist.getFriendMerchantWishList
);

router.delete(
  "/deletewishlist/:campaingid",
  Token.isAuthenticated(),
  Wishlist.destroyFromWishlist
);

module.exports = router;
