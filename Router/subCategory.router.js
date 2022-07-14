const fileUpload = require("../Controller/extras/FileUpload");
const upload = fileUpload("image");
const SubCategoryController = require("../Controller/category/subCategory.controller");

const router = require("express").Router();

const subCategory = new SubCategoryController();
const Token = require("../Middleware/token");

router.post(
  "/create",
  Token.isAuthenticated(),
  subCategory.create
);

router.get("/get/:categoryType", Token.isAuthenticated(), subCategory.get);

router.get(
  "/getAllSubCategory/:categoryType",
  Token.isAuthenticated(),
  subCategory.getAllSubCategory
);

router.get(
  "/getAllSubCategorySearch/:categoryType",
  Token.isAuthenticated(),
  subCategory.getAllSubCategorySearch
);

router.get(
  "/getAllSubCategoryByMerchant/:merchantId",
  Token.isAuthenticated(),
  subCategory.getAllSubCategoryByMerchant
);

router.get("/getById/:id", Token.isAuthenticated(), subCategory.getById);

router.put(
  "/updateSubCategory/:subCategoryId",
  Token.isAuthenticated(),
  upload.single("image"),
  subCategory.updateSubCategory
);

router.delete(
  "/deleteSubCategory/:subCategoryId",
  Token.isAuthenticated(),
  subCategory.deleteSubCategory
);

module.exports = router;
