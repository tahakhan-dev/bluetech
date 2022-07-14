"use strict";
var compose = require("composable-middleware");
const db = require("../Model");
const { tokenCheck } = require("./token");

const Users = db.users;

function isAnonymousUser() {
  return compose().use(function (req, res, next) {
    const token = req.header("x-auth-token");
    if (!token) {
      next();
    } else {
      tokenCheck(req, res)
        .then(async (resp) => {
          let usersResp = await Users.findOne({
            where: { id: resp.id },
          });
          if (usersResp != null) {
            if (usersResp.isBlocked || usersResp.isDelete) {
              res
                .status(401)
                .send({
                  success: false,
                  sessionExpired: true,
                  isBlocked: true,
                  message: "You Have been blocked or deleted by Admin",
                });
            } else {
              next();
            }
          } else {
            res
              .status(401)
              .send({
                success: false,
                sessionExpired: true,
                message: "No user exists!",
              });
          }
        })
        .catch((e) => res.status(e.code).send(e));
    }
  });
}

exports.isAnonymousUser = isAnonymousUser;
