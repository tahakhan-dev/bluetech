const AddToCart = require("../Controller/addToCart/addToCart.controlller");
const Token = require("../Middleware/token");
var router = require("express").Router();

let addToCart = new AddToCart();

router.post("/create", Token.isAuthenticated(), addToCart.create);

// router.get("/getSpecificAbout/:id", Token.isAuthenticated(), Aboutus.getSpecificAbout);

// router.get("/getAllAbout", Token.isAuthenticated(), Aboutus.getAllAbout);

// router.get("/getAllAboutsApp", Aboutus.getAllAboutsApp);

// router.put("/updateAbout/:id", Token.isAuthenticated(), Aboutus.updateAbout);

// router.delete("/deleteAbout/:id", Token.isAuthenticated(), Aboutus.deleteAbout);

module.exports = router;
