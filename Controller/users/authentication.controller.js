const db = require("../../Model");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const ForgetPasswordEmailSend = require("../extras/ForgetPasswordSend");
const sendVerificationEmail = require("../extras/EmailverificationSend");
const forgetpassword = require("../extras/ForgetPasswordVerification");
const {
  setUserStateToken,
  deleteUserStateToken,
  setTokenkey,

} = require("../../cache/redis.service");
const moment = require("moment");
// const client = require("twilio")(
//   config.get("twilio.Account_SID"),
//   config.get("twilio.Account_TOKEN")
// );

const client = require("twilio")(
  "ACa6a8be4f579169faa23d04c5803892ee",
  "e96202c84d9d2f348e34dcb6ecf85008"
);
moment.fn.fromNow_seconds = function (a) {
  var duration = moment(this).diff(moment(), "seconds");
  return duration;
};
const fs = require("fs");
var privateKEY = fs.readFileSync("config/cert/private.key", "utf8");

const Users = db.users;
const UsersDetail = db.usersdetail;
const permissions = db.permissions;
const forgetpasswordtable = db.ForgetPassword;
const emailverification = db.Emailverification;
const Op = db.Sequelize.Op;

const { getAllimagesByTypeAndTypeId } = require("../extras/getImages");

class Authentication {
  startService = async (req, res, info) => {
    try {
      let result = await client.verify
        // .services(config.get("twilio.serviceId"))
        .services("VAcb7bb8e2dae71706a5ddc85f788070ee")
        .verifications.create({
          to: req.body.phone,
          channel: "sms",
        });
      if (result) {
        return res.status(200).send({
          success: true,
          message: "Verification code sent.",
          sid: result.sid,
          userInfo: info,
        });
      } else
        return res.status(400).send({
          success: false,
          message: "Verification Code not sent",
        });
    } catch (e) {
      res.status(400).send({
        success: false,
        message: e.message,
      });
    }
  };

  checkService = async function (req, res) {
    try {
      if (req.body.userId) {
        client.verify
          .services("VAcb7bb8e2dae71706a5ddc85f788070ee")
          .verificationChecks.create({
            to: req.body.phone,
            code: req.body.code,
          })
          .then(async (dataInfo) => {
            if (dataInfo.valid == true) {
              let users = await Users.findAll({
                raw: true,
                nest: true,
                include: [
                  {
                    model: UsersDetail,
                    where: {
                      phoneNumber: req.body.phone,
                    },
                  },
                ],
              });

              if (users.length) {
                let update = await UsersDetail.update(
                  {
                    phoneNumber: null,
                  },
                  {
                    where: {
                      phoneNumber: req.body.phone,
                    },
                  }
                );
                if (update[0]) {
                  let updateCurrentUserNumber = await UsersDetail.update(
                    {
                      phoneNumber: req.body.phone,
                    },
                    {
                      where: {
                        userId: req.body.userId,
                      },
                    }
                  );
                  if (updateCurrentUserNumber[0]) {
                    res.status(200).send({
                      data: dataInfo,
                      message: "Successfully Verified",
                      success: true,
                      verified: true,
                    });
                  }
                }
              } else {
                let updateCurrentUserNumber = await UsersDetail.update(
                  {
                    phoneNumber: req.body.phone,
                  },
                  {
                    where: {
                      userId: req.body.userId,
                    },
                  }
                );
                if (updateCurrentUserNumber[0]) {
                  await users.update(
                    {
                      otpVerified: true,
                    },
                    {
                      where: {
                        id: req.body.userId,
                      },
                    }
                  );
                  res.status(200).send({
                    message: message,
                    success: true,
                    verified: true,
                  });
                }
              }
            } else {
              res.status(200).send({
                success: false,
                message: "Invalid verification code",
              });
            }
          })
          .catch((err) => {
            res.status(500).send({
              success: false,
              message: err.message,
              logs: err.message,
            });
          });
      }
    } catch (e) {
      res.send({
        success: false,
        message: e.message,
      });
    }
  };

  Auth = async (req, res) => {
    const { error } = validation(req.body);

    if (error)
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });

    Users.findOne({
      raw: true,
      where: {
        email: req.body.email,
        userType: "custom",
      },
    })
      .then(async (result) => {
        if (result == null)
          return res.status(200).send({
            success: false,
            message: "No User Exist,First Register and try again",
          });

        let password = await bcrypt.compare(req.body.password, result.password);

        if (!password)
          return res.status(200).send({
            success: false,
            message: "Invalid Email Or Password!",
          });

        if (result && !result.emailVerified) {
          return res.status(200).send({
            success: false,
            verifiedEmail: false,
            message: "Email Not Verified!",
          });
        }

        if (result) {
          if (result.isBlocked) {
            return res.status(200).send({
              success: false,
              verifiedEmail: true,
              message: "Your Account is Suspended!",
            });
          }
          if (result.isDelete && result.isBlocked) {
            return res.status(200).send({
              verifiedEmail: true,
              success: false,
              message: "Your Account Has Been Deleted or Suspended by admin !",
            });
          }
          if (result.isDelete) {
            return res.status(200).send({
              verifiedEmail: true,
              success: false,
              message: "Your Account Has Been Deleted by admin!",
            });
          }

          try {
            let Token = AuthTokenGen(result);

            setUserStateToken(Token, 48 * 60 * 60)
              .then((success) => {})
              .catch((error) => {
                res.status(200).send({
                  success: false,
                  message: error.message,
                });
              });

            

              setTokenkey(result.id, Token, 48 * 60 * 60)
              .then((success) => {})
              .catch((error) => {
                res.status(200).send({
                  success: false,
                  message: error.message,
                });
              });

              //Add fcmtoken

              

             let userupdate = await Users.update(
                {
                  fcmtoken: req.body.fcmtoken,
                },
                {
                  where: {
                    id: result.id,
                  },
                }
              ) .then((resultupdate) => {
              })

              .catch((err) => {
                res.status(500).send({
                  success: false,
                  message: err.message,
                  
                });
              });

            let members = await Users.findAll({
              raw: true,
              nest: true,
              include: [
                {
                  model: permissions,
                  where: {
                    userId: result.id,
                  },
                },
                {
                  model: UsersDetail,
                  where: {
                    userId: result.id,
                  },
                },
              ],
            });

            Promise.all(
              members.map(async (x) => {
                let user = new Object(x);
                return getAllimagesByTypeAndTypeId("User", x.id).then(
                  (objs) => {
                    if (objs) {
                      if (objs.getImages.length) {
                        user["imgs"] = objs.getImages[0];
                        if (objs.getIndexs.length) {
                          user["indexes"] = objs.getIndexs;
                        }
                      }
                    }
                    return user;
                  }
                );
              })
            ).then((data) => {
              res
                .header("x-auth-token", Token)
                .status(200)
                .send({
                  success: true,
                  data: data && data.length && [data[0]],
                  accessToken: Token,
                });
            });
          } catch (err) {
            return res.status(500).send({
              success: false,
              message: err.message,
            });
          }
        } else {
          res.status(200).send({
            success: false,
            verifiedEmail: true,
            message: "Invalid Email Or Password!",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message: err.message,
        });
      });
  };

  Logout = async (req, res) => {
    deleteUserStateToken(req.auth)
      .then((success) => {
        if (success) {
          res.status(200).send({
            success: true,
            sessionExpired: true,
            message: "Logged out successfully!",
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message: err.message,
        });
      });
      let userupdate = await Users.update(
        {
          fcmtoken: null,
        },
        {
          where: {
            id: req.user.id,
          },
        }
      )
        
  };

  resendEmail = async (req, res) => {
    try {
      const url = req.protocol + "://" + req.get("host");

      let info = await Users.findOne({
        raw: true,
        where: {
          email: req.body.email,
          emailVerified: false,
        },
      });

      let response;

      if (info) {
        response = await emailverification.findAll({
          where: { userId: info.id },
        });
      } else {
        res.send({
          success: false,
          message: "User Not Found or Already Verified!",
        });
      }

      if (response.length > 0) {
        await emailverification.update(
          { isExpired: 1 },
          { where: { userId: info.id, isExpired: 0 } }
        );
      }

      if (info) {
        let result = await sendVerificationEmail(
          url,
          res,
          info.id,
          info.email,
          info.userName
        );

        if (result) {
          res.send({
            success: true,
            message: "Email Verification Link Sent",
          });
        }
      } else {
        res.send({
          success: false,
          message: "Your Account is Already Verified",
        });
      }
    } catch (err) {
      res.status(400).send({
        success: false,
        message: err.message,
      });
    }
  };

  ForgetpasswordEmail = async (req, res) => {
    const email = req.body.email;
    const phoneNumber = req.body.phone;
    if (email) {
      Users.findOne({
        raw: true,
        where: {
          email: email,
          userType: "custom",
        },
      })
        .then((result) => {
          const url = req.protocol + "://" + req.get("host");

          if (result && result.emailVerified == false)
            return res
              .status(200)
              .send({ success: false, message: "This email is not verified!" });

          if (
            (result && result.isBlocked == 1) ||
            (result && result.isDelete == 1)
          ) {
            res.status(200).send({
              success: false,
              message: "This Account is Blocked or Deleted by Admin",
            });
          } else if (result && result.emailVerified == true) {
            ForgetPasswordEmailSend(
              url,
              req,
              res,
              result.id,
              result.email,
              result.userName
            );
          } else if (result && !result.emailVerified) {
            sendVerificationEmail(
              url,
              req,
              res,
              result.id,
              result.email,
              result.userName
            );
          } else {
            res.status(200).send({
              success: false,
              message: "No User exist to this email",
            });
          }
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message: err.message,
          });
        });
    } else if (phoneNumber) {
      try {
        const info = await UsersDetail.findOne({
          where: {
            phoneNumber,
          },
          include: [{ model: Users, where: { userType: "custom" } }],
        });

        if (info && info.user.emailVerified == false) {
          return res
            .status(200)
            .send({ success: false, message: "This email is not verified!" });
        }

        if (info) {
          if (info.user.isBlocked == 1 || info.user.isDelete == 1) {
            res.status(200).send({
              success: false,
              message: "This User is blocked or deleted by admin",
            });
          } else {
            await this.startService(req, res, info);
          }
        } else {
          res.status(200).send({
            success: false,
            message: "No user available from this number",
          });
        }
      } catch (error) {
        res.status(400).send({
          success: false,
          message: error.message,
        });
      }
    } else {
      res.status(400).send({
        success: false,
        message: "Please Enter email or Phone number.",
      });
    }
  };

  Template = (req, res) => {
    const token = req.params.key;

    forgetpassword(token, res)
      .then((res) => res)
      .catch((err) => {});
  };

  ResetPassword = async (req, res) => {
    let token = req.params.token;
    let password = req.body.password;

    const salt = await bcrypt.genSalt(10);
    let passwordhased = await bcrypt.hash(password, salt);

    let resp = await forgetpasswordtable.findOne({
      where: { token: token, isExpired: 1 },
    });
    if (resp) {
      res.status(200).send({
        success: false,
        message: "Password Cannot be update Token is Expired",
      });
    } else {
      let pass = await forgetpasswordtable.findOne({
        raw: true,
        where: {
          token: token,
        },
      });
      if (pass) {
        forgetpasswordtable
          .findOne({
            raw: true,
            where: {
              token: token,
            },
          })
          .then((result) => {
            Users.update(
              {
                password: passwordhased,
              },
              {
                where: {
                  id: result.userId,
                },
              }
            ).then((results) => {
              forgetpasswordtable
                .update(
                  {
                    isExpired: true,
                  },
                  {
                    where: {
                      userId: result.userId,
                    },
                  }
                )
                .then((result) => {});
              res.status(200).send({
                success: true,
                message: "Updated Password",
              });
            });
          });
      } else {
        res.status(200).send({
          success: false,
          message: "Password Cannot be update Token is Expired",
        });
      }
    }
  };

  ResetPasswordFromOtp = async (req, res) => {
    let id = req.params.user_id;
    let password = req.body.password;

    const salt = await bcrypt.genSalt(10);
    let passwordhased = await bcrypt.hash(password, salt);

    Users.findOne({
      raw: true,
      where: {
        id: id,
      },
    }).then((result) => {
      Users.update(
        {
          password: passwordhased,
        },
        {
          where: {
            id: result.id,
          },
        }
      )
        .then((result) => {
          res.status(200).send({
            success: true,
            message: "Password Updated Successfully",
          });
        })

        .catch((err) => {
          res.status(500).send({
            success: false,
            message: err.message,
          });
        });
    });
  };
}

function AuthTokenGen(result) {
  var i = "GIVEES";
  var s = "givees@gmail.com";
  var signOptions = {
    issuer: i,
    subject: s,
    algorithm: "RS256",
  };
  var payload = {
    id: result.id,
  };
  var token = jwt.sign(payload, privateKEY, signOptions);
  // This function is pushing the jwt to a cache Any jwt not in this cache is not
  // usable
  return token;
}

function validation(request) {
  const schema = {
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    fcmtoken: Joi.string().min(100).max(500),
  };

  return Joi.validate(request, schema);
}

module.exports = Authentication;
