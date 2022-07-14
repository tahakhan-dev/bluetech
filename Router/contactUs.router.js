const Contact = require("../Controller/contactUs/contactUs.controller");
const Token = require("../Middleware/token");
var router = require("express").Router();

let Contactus = new Contact();

router.post("/create", Token.isAuthenticated(), Contactus.create);

router.get(
  "/getSpecificContact/:id",
  Token.isAuthenticated(),
  Contactus.getSpecificContact
);

router.get("/getAllContact", Token.isAuthenticated(), Contactus.getAllContact);

router.get("/getAllContactsApp", Contactus.getAllContactsApp);

router.put(
  "/updateContact/:id",
  Token.isAuthenticated(),
  Contactus.updateContact
);

router.delete(
  "/deleteContact/:id",
  Token.isAuthenticated(),
  Contactus.deleteContact
);

module.exports = router;
