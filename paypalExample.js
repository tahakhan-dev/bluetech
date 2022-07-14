const express = require("express");
const paypal = require("paypal-rest-sdk");

const app = express.Router();

const axios = require("axios");
const qs = require("qs");

app.get("/get_token", (req, res) => {
  axios
    .post(
      `https://api-m.sandbox.paypal.com/v1/oauth2/token`,
      qs.stringify({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              "AY0GIMq4_c_6UVx-J0k6AI1Za6k_hbJF3A997Uxh2y6stZILGoYBEwbMwYWMAdrZ3hc3M7U21ssZJMZa" +
                ":" +
                "EAlxjNDzX2DYGgFkm2sdA8nV6jVTsUeFnbcu8-2e5l6WoHPv0dBIuvPyxvkuHounQvdaFKUwgJGY5AyA"
            ).toString("base64"),
        },
      }
    )
    .then((response) => {
      res.send({ success: true, data: response.data });
    })
    .catch((err) => {
      res.send({ message: err, success: false });
    });
});

app.post("/pay", (req, res) => {
  //   const { amount, description, camppaignName } = req.body;

  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://webapp.givees.net/api/success",
      cancel_url: "https://webapp.givees.net/api/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "camppaignName",
              sku: "001",
              price: "25.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "25.00",
        },
        description: "hee",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/cancel", (req, res) => res.send("Cancelled"));

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "25.00",
          //   req.params.amount,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        res.send({
          message: error.response || "Something Went Wrong",
          success: false,
        });

        throw error;
      } else {
        res.send({ message: "Success", success: true });
      }
    }
  );
});

module.exports = app;
