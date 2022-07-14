const db = require("../Model");
const SuperAdminController = require("../Controller/superAdmin/superAdmin.controller");
const SuperAdminGetController = require("../Controller/superAdmin/getSuperAdmin.controller");
const SuperAdminUpdateController = require("../Controller/superAdmin/updateSuperAdmin.controller");
const SuperAdminDeleteController = require("../Controller/superAdmin/deleteSuperAdmin.controller");

const SuperAdminCreateController = require("../Controller/superAdmin/createSuperAdmin.controller");
const ShippingController = require("../Controller/shipping/shipping.controller");

const Token = require("../Middleware/token");
const fileUpload = require("../Controller/extras/FileUpload");
const upload = fileUpload("image");
const router = require("express").Router();

let SuperAdmin = new SuperAdminController();
let SuperAdminGet = new SuperAdminGetController();
let CreateSuperAdmin = new SuperAdminCreateController();
let Shipping = new ShippingController();
let UpdateController = new SuperAdminUpdateController();
let DeleteController = new SuperAdminDeleteController();

router.post(
  "/create_user",
  Token.isAuthenticated(),
  upload.single("userImage"),
  SuperAdmin.create
);
router.get("/getAllOrderByMarchantid/:ActionId", Token.isAuthenticated(), SuperAdminGet.getAllMerchantOrderDetails);
router.get("/transaction/getByMerchantid", Token.isAuthenticated(), SuperAdminGet.getTransactionsByMerchantid);
router.get("/showRedeemVoucherByMarchantid/:ActionId", Token.isAuthenticated(), SuperAdminGet.showRedeemVoucherByMarchantid);


router.post("/create-superAdmin", CreateSuperAdmin.create);

router.post("/createShipment", Shipping.createShippingStatus);

router.get("/getShipment", Shipping.getShippingStatus);

router.get("/enableChat/:ActionId", SuperAdminGet.enableChat);

router.get("/getSpecificShipment/:id", Shipping.getSpecificShippingStatus);

router.put("/updateShipment/:id", Shipping.updateShippingStatus);

router.delete("/deleteShipment/:id", Shipping.deleteShippingStatus);

router.get(
  "/getMembers/:roleId",
  Token.isAuthenticated(),
  SuperAdminGet.getMembers
);

router.get(
  "/searchGetMembers/:roleId",
  Token.isAuthenticated(),
  SuperAdminGet.searchGetMembers
);

router.post("/editVoucher", Token.isAuthenticated(), SuperAdminGet.editVoucher);

router.get(
  "/showAllVoucher",
  Token.isAuthenticated(),
  SuperAdminGet.showAllVoucher
);

router.get(
  "/showAllVoucherSearch",
  Token.isAuthenticated(),
  SuperAdminGet.showAllVoucherSearch
);

router.get(
  "/showAllVoucherbyMonth",
  Token.isAuthenticated(),
  SuperAdminGet.showAllVoucherbyMonth
);

router.get(
  "/SearchVoucher",
  Token.isAuthenticated(),
  SuperAdminGet.SearchVoucher
);

router.get(
  "/SearchVoucherbyMonth",
  Token.isAuthenticated(),
  SuperAdminGet.SearchVoucherbyMonth
);

router.get(
  "/getVoucherById/:Id",
  Token.isAuthenticated(),
  SuperAdminGet.getVoucherById
);



router.get(
  "/transactionDetailHistory",
  Token.isAuthenticated(),
  SuperAdminGet.transactionDetailHistory
);

router.get(
  "/transactionDetailHistorySearch",
  Token.isAuthenticated(),
  SuperAdminGet.transactionDetailHistorySearch
);

router.get(
  "/transactionDetailHistorySearchbyid",
  Token.isAuthenticated(),
  SuperAdminGet.transactionDetailHistorySearchbytransactioncode
);

router.post(
  "/editTransactionDetailVoucher",
  Token.isAuthenticated(),
  SuperAdminGet.editTransactionDetailVoucher
);

router.delete(
  "/deleteTransactionDetailVoucher/:id",
  Token.isAuthenticated(),
  SuperAdminGet.deleteTransactionDetailVoucher
);

router.get(
  "/getBlockMembers/:roleId",
  Token.isAuthenticated(),
  SuperAdminGet.getBlockMembers
);

router.get(
  "/getVoucherHistory",
  Token.isAuthenticated(),
  SuperAdminGet.getVoucherHistory
);

router.get(
  "/getSpecificMember/:roleId/:userId",
  Token.isAuthenticated(),
  SuperAdminGet.getSpecificMember
);

router.put(
  "/updateMemberPermissions/:roleId/:userId",
  Token.isAuthenticated(),
  UpdateController.updateMemberPermissions
);

router.put(
  "/updateMember/:roleId/:userId",
  Token.isAuthenticated(),
  upload.single("userImage"),
  UpdateController.updateMember
);

router.get(
  "/blockMember/:roleId/:userId",
  Token.isAuthenticated(),
  DeleteController.blockMember
);

router.get(
  "/getAllSettings/:type",
  Token.isAuthenticated(),
  SuperAdminGet.getAllSettings
);

router.get(
  "/getAllSettingsSearch/:type",
  Token.isAuthenticated(),
  SuperAdminGet.getAllSettingsSearch
);

router.delete(
  "/deleteMember/:roleId/:userId",
  Token.isAuthenticated(),
  DeleteController.deleteMember
);

router.get(
  "/showUserVoucherHistoryCampaign/:userId",
  Token.isAuthenticated(),
  SuperAdminGet.showUserVoucherHistoryCampaign
);

router.get(
  "/showUserVoucher/:userId",
  Token.isAuthenticated(),
  SuperAdminGet.showUserVoucher
);

router.get(
  "/showUserVoucherSearch/:userId",
  Token.isAuthenticated(),
  SuperAdminGet.showUserVoucherSearch
);

router.get(
  "/transactionDetailVoucher",
  Token.isAuthenticated(),
  SuperAdminGet.transactionDetailVoucher
);

router.get("/getAllMembers", SuperAdminGet.getAllMembers);

module.exports = router;
