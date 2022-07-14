const About = require("../Controller//aboutUs/aboutUs.controller");
const Token = require("../Middleware/token");
var router = require("express").Router();

let Aboutus = new About();

router.post("/create", Token.isAuthenticated(), Aboutus.create);

router.get(
  "/getSpecificAbout/:id",
  Token.isAuthenticated(),
  Aboutus.getSpecificAbout
);

router.get("/getAllAbout", Token.isAuthenticated(), Aboutus.getAllAbout);

router.get("/getAllAboutSearch", Token.isAuthenticated(), Aboutus.getAllAboutSearch);

router.get("/getAllAboutsApp", Aboutus.getAllAboutsApp);

router.put("/updateAbout/:id", Token.isAuthenticated(), Aboutus.updateAbout);

router.delete("/deleteAbout/:id", Token.isAuthenticated(), Aboutus.deleteAbout);

module.exports = router;
