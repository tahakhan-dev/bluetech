const ContactService = require("../Controller/contactService/contactService.controller");
const Token = require("../Middleware/token");
var router = require("express").Router();

let Contact = new ContactService();

router.post("/create", Token.isAuthenticated(), Contact.create);

router.post("/createContactUsInfo", Contact.createContactUsInfo);

router.get(
  "/getSpecificService/:id",
  Token.isAuthenticated(),
  Contact.getSpecificService
);

router.get("/getAllServicesApp", Contact.getAllServicesApp);

router.get("/getAllServices", Token.isAuthenticated(), Contact.getAllServices);

router.put(
  "/updateService/:id",
  Token.isAuthenticated(),
  Contact.updateService
);

router.delete(
  "/deleteService/:id",
  Token.isAuthenticated(),
  Contact.deleteService
);

module.exports = router;
