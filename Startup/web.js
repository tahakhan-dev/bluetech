"use strict";
var express = require("express");
var path = require("path");
const { isAuthenticated } = require("../Middleware/token");
var app = express();
const config = require("config");
app.get("/health", function (req, res) {
  if (process.env.NODE_ENV) {
    console.info(process.env.NODE_ENV, "loaded");
  }
  console.info("EMAIL:", config.get("Email_env"));
  console.info("DATABASE:", require("../config/db.config"));
  res.send("ok");
});

app.get("/logs", isAuthenticated(), function (req, res) {
  res.sendFile(path.join(ROOTPATH, "UncaughtError.log"));
});

app.get("/resources-images/:fileName", function (req, res) {
  let filename = req.params.fileName.replace(/\//g, ".");
  res.sendFile(path.join(ROOTPATH, "Views/resources/images", filename));
});

app.get("/*", function (req, res) {
  res.render(path.join(ROOTPATH, "Views/error/404.ejs"));
});
module.exports = app;
