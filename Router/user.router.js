const UserController = require("../Controller/users/user.controller");
const BlockUserController = require("../Controller/users/blockUser.controller");
const UserDetailController = require("../Controller/users/userDetail.controller");
const MerchnatController = require("../Controller/users/merchants.controller");
let Token = require("../Middleware/token");
let isAnonymousUser = require("../Middleware/anonymousService");
const fileUpload = require("../Controller/extras/FileUpload");
const upload = fileUpload("image");

let Userdetails = new UserDetailController();
const BlockUser = new BlockUserController();
let Users = new UserController();
let Merchant = new MerchnatController();

var router = require("express").Router();

/*************** USER ***************/
router.post("/create", upload.single("userImage"), Users.create);

router.post("/social", Users.social);
router.post("/checkUser", Users.checkCurrentUser);

router.get(
  "/getCustomerById/:userId",
  Token.isAuthenticated(),
  Users.getCustomerById
);

router.get(
  "/getCurrentUserInfo",
  Token.isAuthenticated(),
  Users.getCurrentUser
);

router.get("/getAllCustomer", Token.isAuthenticated(), Users.getAllCustomer);

router.get(
  "/getCustomerFriendsById/:customerId",
  Token.isAuthenticated(),
  Users.getCustomerFriendsById
);

router.post(
  "/searchByUserName",
  Token.isAuthenticated(),
  Users.searchByUserName
);

router.get("/verifyEmail/:token", Users.verifyEmail);

router.get("/getMerchantByCode/:code", Users.getMerchantByCode);

/*************** BLOCKUSER ***************/
router.post("/blockUser/create/:id", Token.isAuthenticated(), BlockUser.create);

router.get(
  "/blockUser/getBlockedUsers",
  Token.isAuthenticated(),
  BlockUser.getBlockedUsers
);

router.post(
  "/blockUser/UnblockUser",
  Token.isAuthenticated(),
  BlockUser.UnblockUser
);

/*************** USER_DETAIL ***************/
router.post(
  "/user_detail/create",
  Token.isAuthenticated(),
  upload.single("userImage"),
  Userdetails.create
);

router.get(
  "/user_detail/getUserDetail/:id",
  Token.isAuthenticated(),
  Userdetails.getUserDetail
);

router.put(
  "/user_detail/update/:id",
  Token.isAuthenticated(),
  upload.single("userImage"),
  Userdetails.update
);

/*************** GET_MERCHANT ***************/
router.get("/get_merchants", Merchant.getMerchants);

router.get("/searchBygetMerchants", Merchant.searchBygetMerchants);

router.get("/get_merchantsV1", Merchant.get_merchantsV1);

router.get("/searchMerchant/:searchQuery", Merchant.searchMerchant);

router.get(
  "/get_merchants_code",
  Token.isAuthenticated(),
  Merchant.getMerchantsCode
);

router.get(
  "/getActivityMerchant",
  isAnonymousUser.isAnonymousUser(),
  Merchant.getActivityMerchant
);

module.exports = router;
