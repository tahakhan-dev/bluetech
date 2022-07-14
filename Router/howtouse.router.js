var router = require("express").Router();
const db = require("../Model");
const Token = require("../Middleware/token");

const Users = db.users;

const howtouseController = require("../Controller/howToUse/howtouse.controller");

let howtouse = new howtouseController();

const fileUpload = require("../Controller/extras/FileUpload");
const upload = fileUpload("video");

router.post(
  "/create",
  Token.isAuthenticated(),
  upload.single("tutVideo"),
  howtouse.create
);

router.put(
  "/update/:id",
  Token.isAuthenticated(),
  upload.single("tutVideo"),
  howtouse.update
);
// route for showing all how to use setting without token
router.get("/getAllHowToUse", howtouse.getAllHowToUseFunc);

router.get("/getById/:id", Token.isAuthenticated(), howtouse.getById);

router.delete("/delete/:id", Token.isAuthenticated(), howtouse.delete);

module.exports = router;
