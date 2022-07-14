const TermsCondition = require("../Controller/termsCondition/termCondition.controller");
const Token = require("../Middleware/token");
var router = require("express").Router();

let Terms = new TermsCondition();

router.post("/create", Token.isAuthenticated(), Terms.create);

router.get(
  "/getSpecificTerms/:id",
  Token.isAuthenticated(),
  Terms.getSpecificTerms
);

router.get("/getAllTerms", Token.isAuthenticated(), Terms.getAllTerms);

router.get("/getAllTermsSearch", Token.isAuthenticated(), Terms.getAllTermsSearch);

router.get("/getAllTerms_App", Terms.getAllTermsUsers);

router.put("/updateTerms/:id", Token.isAuthenticated(), Terms.updateTerms);

router.delete("/deleteTerms/:id", Token.isAuthenticated(), Terms.deleteTerms);

module.exports = router;
