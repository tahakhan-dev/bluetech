const VoucherGenerate = require("../Controller/voucher/voucherGenerate.controller");
const VoucherSharing = require("../Controller/voucher/voucherSharing.controller");
const VoucherGetController = require("../Controller/voucher/voucher.controller");
const VoucherRedeeme = require("../Controller/voucher/voucherRedeeme.controller");
const Token = require("../Middleware/token");

var router = require("express").Router();

let Vouchers = new VoucherGenerate();
let VouchersSharing = new VoucherSharing();
let VoucherGet = new VoucherGetController();
let VoucherRed = new VoucherRedeeme();

router.post("/create", Token.isAuthenticated(), Vouchers.create);

router.get("/paypal", Vouchers.checkPaypal);

router.get("/verify", Vouchers.verify);

/*************** USER ***************/
router.post(
  "/shareVoucher",
  Token.isAuthenticated(),
  VouchersSharing.shareVoucher
);

router.post(
  "/shareVoucherpubliclink",
  Token.isAuthenticated(),
  VouchersSharing.SendShareVoucherinPublicLink
);

router.get(
  "/getVoucherHistoryByCode/:voucherCode",
  Token.isAuthenticated(),
  VouchersSharing.getVoucherHistoryByCode
);

router.get(
  "/getPendingVouchers",
  Token.isAuthenticated(),
  VoucherGet.getPendingVouchers
);

router.get(
  "/receiveVouchers/:voucherCode",
  Token.isAuthenticated(),
  VoucherGet.receiveVouchers
);

router.get(
  "/cancelVouchers/:voucherCode",
  Token.isAuthenticated(),
  VoucherGet.cancelVouchers
);

router.get(
  "/cancelVouchersByOwner/:voucherId",
  Token.isAuthenticated(),
  VoucherGet.cancelVouchersByOwner
);

router.get(
  "/userVoucherData",
  Token.isAuthenticated(),
  VoucherGet.userVoucherData
);

router.get("/campAndAppbanners", VoucherGet.campAndAppbanners);

router.get("/campAndAppbannersV1", VoucherGet.campAndAppbannersV1);

router.post(
  "/getOutOfStockCampaign",
  Token.isAuthenticated(),
  VoucherGet.getOutOfStockCampaign
);

router.get(
  "/SearchbycampAndAppbannersV1",
  VoucherGet.SearchbycampAndAppbannersV1
);

router.get("/AppbannersV1", VoucherGet.AppbannersV1);

router.get(
  "/currentUserVouchers",
  Token.isAuthenticated(),
  VoucherGet.currentUserVouchers
);
router.get(
  "/currentUserVouchersByCompaign",
  Token.isAuthenticated(),
  VoucherGet.currentUserVouchersByCompaign
);

router.get(
  "/getUserVoucherByCampaign",
  Token.isAuthenticated(),
  VoucherGet.getUserVoucherByCampaign
);

router.get(
  "/currentUserVouchersByProduct",
  Token.isAuthenticated(),
  VoucherGet.currentUserVouchersByProduct
);

router.get(
  "/getUserVoucherByProduct",
  Token.isAuthenticated(),
  VoucherGet.getUserVoucherByProduct
);

router.get(
  "/currentUserVouchersBySearchCode/:ActionId",
  Token.isAuthenticated(),
  VoucherGet.currentUserVouchersSearchbycode
);

router.get(
  "/Activities",
  Token.isAuthenticated(),
  VoucherGet.userVoucherActivity
);

router.get(
  "/getVoucherByCode/:voucherCode",
  Token.isAuthenticated(),
  VoucherGet.getVoucherByCode
);

/*************** Voucher Reedeme routes ***************/

router.get(
  "/verifyMerchantCode/:merchantCode/:campaignId",
  Token.isAuthenticated(),
  VoucherGet.verifyMerchantCode
);

router.post(
  "/redeemeVoucherCheck",
  Token.isAuthenticated(),
  VoucherRed.checkVoucher
);

router.post(
  "/redeemeVoucher",
  Token.isAuthenticated(),
  VoucherRed.redeemeVoucher
);

router.post(
  "/merchantReedem",
  Token.isAuthenticated(),
  VoucherRed.merchantReedem
);

router.get(
  "/showRedeemVoucher/:ActionId",
  Token.isAuthenticated(),
  VoucherRed.showRedeemVoucher
);

router.get(
  "/showRedeemVoucherSearch/:ActionId",
  Token.isAuthenticated(),
  VoucherRed.showRedeemVoucherSearch
);

router.get(
  "/showRedeemVoucherSearchAdmin/:ActionId/:merchantId",
  Token.isAuthenticated(),
  VoucherRed.showRedeemVoucherSearchAdmin
);

router.get(
  "/userRedeemVoucherStatus/:ActionId",
  Token.isAuthenticated(),
  VoucherRed.userRedeemVoucherStatus
);

router.get(
  "/ActivityLog/:campaignId/:ActionId",
  Token.isAuthenticated(),
  VoucherRed.ActivityLog
);

router.get(
  "/ActivityLogHistory/:ActionId",
  Token.isAuthenticated(),
  VoucherRed.FullActivityLogHistory
);

router.get(
  "/DetailedinActivityLogHistory/:VoucherId/:ActionId",
  Token.isAuthenticated(),
  VoucherRed.DetailedinActivityLogHistory
);

module.exports = router;
