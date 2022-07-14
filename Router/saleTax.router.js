var router = require("express").Router();

const SaleTaxController = require("../Controller/saleTax/saleTax.controller");
const UpdatedSaleTaxController = require("../Controller/saleTax/saleTaxMerchant.controller");

let UpdatedSaleTax = new UpdatedSaleTaxController();
let saletax = new SaleTaxController();
let Token = require("../Middleware/token");

router.post("/create", Token.isAuthenticated(), saletax.create);

router.get("/getSaleTax", saletax.getSaleTax);

router.get(
  "/getSaleTaxById/:saleTaxId",
  Token.isAuthenticated(),
  saletax.getSaleTaxById
);

router.put(
  "/updateSaleTaxById",
  Token.isAuthenticated(),
  saletax.updateSaleTaxById
);

/*************** UPDATED SALES TAX ***************/
router.post("/updated/create", Token.isAuthenticated(), UpdatedSaleTax.create);

router.get(
  "/updated/gettax/:id",
  Token.isAuthenticated(),
  UpdatedSaleTax.getTax
);

router.put(
  "/updated/update/:id",
  Token.isAuthenticated(),
  UpdatedSaleTax.update
);

router.delete(
  "/updated/delete/:id",
  Token.isAuthenticated(),
  UpdatedSaleTax.delete
);

module.exports = router;
