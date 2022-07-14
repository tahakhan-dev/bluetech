"use strict";
var express = require("express");
var app = express();

// init Routing
app.use("/user", require("../Router/user.router"));

app.use("/auth", require("../Router/auth.router"));
app.use("/role", require("../Router/role.router"));

app.use("/superAdmin", require("../Router/superAdmin.router"));

app.use("/category", require("../Router/category.router"));
app.use("/subcategory", require("../Router/subCategory.router"));

app.use("/product", require("../Router/product.router"));
app.use("/campaign", require("../Router/campaign.router"));
app.use("/voucher", require("../Router/voucher.router"));
app.use("/promocode", require("../Router/promoCode.router"));

app.use("/order", require("../Router/orders.router"));
app.use("/like", require("../Router/like.router"));
app.use("/friends", require("../Router/friends.router"));
app.use("/wislist", require("../Router/wishlist.router"));

app.use("/terms", require("../Router/termsCondition.router"));
app.use("/about", require("../Router/aboutUs.router"));
app.use("/contact", require("../Router/contactUs.router"));
app.use("/contactService", require("../Router/contactService.router"));
app.use("/support", require("../Router/support.router"));
app.use("/faqs", require("../Router/faqs.router"));

app.use("/howtouse", require("../Router/howtouse.router"));
app.use("/appbanners", require("../Router/appbanner.router"));

app.use("/actionradius", require("../Router/actionRadius.router"));
app.use("/percentrate", require("../Router/percentRate.router"));
app.use("/saletax", require("../Router/saleTax.router"));
app.use("/exception", require("../Router/exception.router"));
app.use("/globalCounter", require("../Router/globalCounter.router"));
app.use("/addToCart", require("../Router/globalCounter.router"));

app.use("/privacypolicy", require("../Router/privacyPolicy.router"));
app.use("/payment", require("../Router/payment"));
app.use("/chat", require("../Router/chat.router"));
app.use("/Notification", require("../Router/Notification.router"));
app.use("/", require("../paypalExample"));

module.exports = app;
