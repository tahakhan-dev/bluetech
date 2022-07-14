const moment = require("moment");
const { v4: uuid } = require("uuid");
const db = require("../../Model");
const forgetPassword = db.ForgetPassword;
const emailModule = require("../../Mail/Nodemailer");
const winston = require("winston");
const scheduler = require("node-schedule");
const config = require("config");

const { renderResetPassword } = require("../extras/RenderFiles");

module.exports = function (url, req, res, id, email, name) {
  let start_time = moment().format("h:mm a");

  let endingformate = moment(start_time, "h:mm a");
  let end_time = endingformate.add(1, "hour").format("h:mm a");

  let UUID = uuid();

  let forgetPasswordobj = {
    userId: id,
    token: UUID,
    start_time: start_time,
    end_time: end_time,
  };

  forgetPassword
    .create(forgetPasswordobj)
    .then((result) =>
      res
        .status(200)
        .send({ success: true, message: "Forget Password email sent" })
    );

  const mailOptions = {
    // from: config.get("Email_env.email"),
    from: "giveesapp@gmail.com",
    to: email,
    subject: "Password Reset",
    html: renderResetPassword(
      "Reset Password Email",
      name,
      // `${config.get("origin")}/api/auth/dynamic_gen_token_key/template/${UUID}`,
      `https://webapp.givees.net/api/auth/dynamic_gen_token_key/template/${UUID}`,
      "We cannot simply send you your old password. A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions.",
      "Reset Password"
    ),
  };
  emailModule
    .sendMail(mailOptions)
    .then(function (response) {
      scheduler.scheduleJob("59 * * * *", async () => {
        forgetPassword
          .update({ isExpired: true }, { where: { token: UUID } })
          .then((result) => {})
          .catch((err) => winston.error(err));
      });
    })
    .catch(function (error) {
      winston.error(error);
    });
};
