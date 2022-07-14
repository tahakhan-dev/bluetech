"use strict";
const jwt = require("jsonwebtoken");
var compose = require("composable-middleware");
const db = require("../Model");
const fs = require("fs");
var publicKEY = fs.readFileSync("config/cert/public.key", "utf8");
const moment = require("moment");
var {
  getUserStateToken,
  setUserStateToken,
  deleteUserStateToken,
} = require("../cache/redis.service");

const Users = db.users;

function isAuthenticated() {
  return (
    compose()
      // Attach user to request
      .use(async function (req, res, next) {
        const token = req.header("x-auth-token");
        if (!token)
          return res.status(401).send({
            success: false,
            message: "Forbidden Access Denied. No Token Found",
          });

        try {
          var i = "GIVEES";
          var s = "givees@gmail.com";
          var verifyOptions = {
            issuer: i,
            subject: s,
            algorithm: ["RS256"],
          };
          let JWTSPLIT = token.split(".");
          var decodedJWTHeader = JSON.parse(
            Buffer.from(JWTSPLIT[0], "base64").toString()
          );
          if (decodedJWTHeader.alg != "RS256") {
            res.status(401).send({
              success: false,
              sessionExpired: true,
              message: "Access Denied. Compromised Authorized Token.",
              code: 401,
            });
            return;
          }
          var decoded = jwt.verify(token, publicKEY, verifyOptions);
          req.user = decoded;
          req.auth = token;

          let blockU = await Users.findOne({
            where: { id: req.user.id },
          });

          if (!blockU)
            return res.status(401).send({
              success: false,
              sessionExpired: true,
              message: "No User Found",
            });

          if (blockU.isBlocked || blockU.isDelete) {
            res.status(401).send({
              success: false,
              sessionExpired: true,
              isBlocked: true,
              message: "You Have been blocked",
            });
          } else {
            next();
          }
        } catch (error) {
          res
            .status(401)
            .send({ message: error.message || "Token is not valid!" });
        }
      })
      .use(function (req, res, next) {
        // This middleware will verify if the jwt is not compromised after user logged out
        getUserStateToken(req.auth).then(async (data) => {

          if (data == null) {
            await deleteUserStateToken(req.auth);
            res.status(401).send({
              success: false,
              sessionExpired: true,
              message: "Access Denied. Compromised Authorized Token.",
              code: 401,
            });
            return;
          } else {
            setUserStateToken(req.auth, 48 * 60 * 60)
              .then((success) => {})
              .catch((error) => res.json(error));
            next();
          }
        });
      })
  );
}

function isValid() {
  return (
    compose()
      // Attach user to request
      .use(function (req, res, next) {
        tokenCheck(req, res)
          .then(() => {
            next();
          })
          .catch((e) => res.status(e.code).send(e));
      })
  );
}

async function tokenCheck(req, res) {
  return new Promise((resolve, reject) => {
    const token = req.header("x-auth-token");
    if (!token)
      reject({
        success: false,
        code: 401,
        message: "Forbidden Access Denied",
      });

    try {
      var i = "GIVEES";
      var s = "givees@gmail.com";
      var verifyOptions = {
        issuer: i,
        subject: s,
        algorithm: ["RS256"],
      };
      let JWTSPLIT = token.split(".");
      var decodedJWTHeader = JSON.parse(
        Buffer.from(JWTSPLIT[0], "base64").toString()
      );
      if (decodedJWTHeader.alg != "RS256") {
        reject({
          success: false,
          sessionExpired: true,
          message: "Access Denied. Compromised Authorization Session.",
          code: 401,
        });
        return;
      }
      var decoded = jwt.verify(token, publicKEY, verifyOptions);

      req.user = decoded;
      req.auth = token;
      resolve(req.user);
    } catch (error) {
      reject({
        success: false,
        code: 401,
        message: error.message || "Session is not valid!",
      });
    }
  });
}

exports.isAuthenticated = isAuthenticated;
exports.isValid = isValid;
exports.tokenCheck = tokenCheck;
