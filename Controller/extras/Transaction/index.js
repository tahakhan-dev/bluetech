const stripe = require("stripe")("sk_test_6igcQIhxkTVN9Zi6EfZs6fdU");
const axios = require("axios").default;

exports.TransactionPayPal = async (Token) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://api.sandbox.paypal.com/v2/payments/captures/${Token}`, {
        auth: {
          username:
            "AQW8BxltqEgirRxOPPJMnQoZld3hIx0nTAbRMOqpnkqwWtFFzajTmpCayZyFsoVjqv6YQ0f2rvfJGH" +
            "iT",
          password:
            "EC3zdEZYpABISqHecFh98BXtcLoy1dHKscgJd9hurNxOOSp5D_dw6cxhEXtf7hqFtSRNgarXoiQlz5" +
            "RU",
        },
      })
      .then((res) => {
        if (res.data) {
          resolve(res.data);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.TransactionStripe = async (token) => {
  try {
    const transaction = await stripe.paymentIntents.retrieve(token);

    if (transaction) {
      return transaction;
    }
  } catch (err) {
    return {
      success: false,
      message: err.message || "Something Went Wrong",
    };
  }
};
