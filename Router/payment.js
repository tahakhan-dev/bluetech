const Token = require("../Middleware/token");

const PaymentController = require("../Controller/payment/stripe");

var router = require("express").Router();

let Payment = new PaymentController();

router.post(
  "/create-payment-intent",
  Token.isAuthenticated(),
  Payment.createStripePayment
);

router.post("/stripe-charge", Token.isAuthenticated(), Payment.stripeCharge);

module.exports = router;
