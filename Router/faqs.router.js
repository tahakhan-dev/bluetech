const FAQS = require("../Controller/fAQs/faq.controller");

const router = require("express").Router();

const Faqs = new FAQS();
const Token = require("../Middleware/token");

router.post("/create", Token.isAuthenticated(), Faqs.create);

router.put("/updateFaqs/:id", Token.isAuthenticated(), Faqs.updateFaqs);

router.get(
  "/getSpecificFaqs/:id",
  Token.isAuthenticated(),
  Faqs.getSpecificFaqs
);

router.get("/getAllFaqs_App", Faqs.getAllFaqsApp);

router.delete("/deleteFaqs/:id", Token.isAuthenticated(), Faqs.deleteFaqs);

module.exports = router;
