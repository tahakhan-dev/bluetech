const config = require("config");

const stripe = require("stripe")("sk_test_6igcQIhxkTVN9Zi6EfZs6fdU");
const fetch = require("node-fetch");

class PaymentInfo {
  calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
  };

  createStripePayment = async (req, res) => {
    const { items } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: this.calculateOrderAmount(items),
      currency: "usd",
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  };

  stripeCharge = async (req, res) => {
    let { amount, currency, cardToken } = req.body;

    const card = {
      amount: amount,
      currency: currency,
      source: cardToken,
      description: "wwwwwwwwwwwwwwwn",
    };
    return fetch("https://api.stripe.com/v1/charges", {
      headers: {
        // Use the correct MIME type for your server
        Accept: "application/json",
        // Use the correct Content Type to send data to Stripe
        "Content-Type": "application/x-www-form-urlencoded",
        // Use the Stripe publishable key as Bearer
        Authorization: `Bearer sk_test_6igcQIhxkTVN9Zi6EfZs6fdU`,
      },
      // Use a proper HTTP method
      method: "post",
      // Format the credit card data to a string of key-value pairs
      // divided by &
      body: Object.keys(card)
        .map((key) => key + "=" + card[key])
        .join("&"),
    })
      .then((response) => response.json())
      .then((data) => {})
      .catch((error) => {});
  };
}

module.exports = PaymentInfo;
