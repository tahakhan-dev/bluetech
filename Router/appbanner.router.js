var router = require("express").Router();
const Token = require("../Middleware/token");

const AppBannerTypeController = require("../Controller/appBanner/appBannerType.controller");

let appbannertype = new AppBannerTypeController();

const AppBannerController = require("../Controller/appBanner/appBanner.controlller");

let appbanner = new AppBannerController();

const fileUpload = require("../Controller/extras/FileUpload");
const upload = fileUpload("image");

router.post(
  "/create",
  Token.isAuthenticated(),
  upload.single("bannerImage"),
  appbanner.create
);

router.put(
  "/update/:id",
  Token.isAuthenticated(),
  upload.single("bannerImage"),
  appbanner.update
);

router.put(
  "/updateOrder",
  Token.isAuthenticated(),
  appbanner.updateBannerOrder
);

router.get("/getall", Token.isAuthenticated(), appbanner.getAll);

router.get("/getbyid/:id", Token.isAuthenticated(), appbanner.getById);

router.delete("/delete/:id", Token.isAuthenticated(), appbanner.delete);

/*************** BANNER TYPES ***************/
router.post("/type/create", appbannertype.create);

router.get("/type/getall", appbannertype.getAll);

module.exports = router;
