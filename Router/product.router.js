const db = require("../Model");
const ProductController = require("../Controller/products/products.controller");

var router = require("express").Router();

let Product = new ProductController();

const Token = require("../Middleware/token");
const fileUpload = require("../Controller/extras/FileUpload");
const upload = fileUpload("image");

router.post(
  "/create",
  Token.isAuthenticated(),
  upload.array("productImage"),
  Product.create
);

router.get("/getProducts", Token.isAuthenticated(), Product.getProduct);

router.get("/searchProducts", Token.isAuthenticated(), Product.searchProducts);

router.get(
  "/getProductbymerchantId/:id",
  Token.isAuthenticated(),
  Product.getProductbymerchantId
);

router.get(
  "/getProductById/:productId",
  Token.isAuthenticated(),
  Product.getProductById
);

router.put(
  "/updateProduct/:productId",
  Token.isAuthenticated(),
  upload.array("productImage"),
  Product.updateProductById
);

router.delete(
  "/deleteProduct/:productId",
  Token.isAuthenticated(),
  Product.deleteProduct
);

module.exports = router;
