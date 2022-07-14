const CategoryController = require("../Controller/category/category.controller");

const router = require("express").Router();

const Category = new CategoryController();
const Token = require("../Middleware/token");

router.post("/create", Token.isAuthenticated(), Category.create);

router.get(
  "/getCategories/:categoryType",
  Token.isAuthenticated(),
  Category.getCategories
);

router.get(
  "/searchGetCategories/:categoryType",
  Token.isAuthenticated(),
  Category.searchGetCategories
);

router.put(
  "/updateCategory/:categoryId",
  Token.isAuthenticated(),
  Category.update
);

router.get(
  "/getCategoryById/:categoryId",
  Token.isAuthenticated(),
  Category.getCategoryById
);

router.delete(
  "/deleteCategory/:categoryId",
  Token.isAuthenticated(),
  Category.deleteCategory
);

module.exports = router;
