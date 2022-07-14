const moment = require("moment");
const { v4: uuid } = require("uuid");
const db = require("../../Model");
const emailverification = db.Emailverification;
const emailModule = require("../../Mail/Nodemailer");
const scheduler = require("node-schedule");
const config = require("config");

const { renderResetPassword } = require("../extras/RenderFiles/index");

module.exports = async function (req, res, id, email, name) {
  let start_time = moment().format("h:mm a");

  let endingformate = moment(start_time, "h:mm a");
  let end_time = endingformate.add(1, "hour").format("h:mm a");

  let UUID = uuid();

  let emailverificationobj = {
    userId: id,
    token: UUID,
    start_time: start_time,
    end_time: end_time,
  };

  let emailsend;
  try {
    emailsend = await emailverification.create(emailverificationobj);
  } catch (err) {
    return false;
  }

  const mailOptions = {
    from: "giveesapp@gmail.com",
    to: email,
    subject: "Email Verification",
    html: renderResetPassword(
      "Thanks For Registration Please Verify Email",
      name,
      // `${config.get("origin")}/api/user/verifyEmail/${UUID}`,
      `https://webapp.givees.net/api/user/verifyEmail/${UUID}`,
      "Please Verify Email",
      "Verify Email"
    ),
  };

  let sendEmail = await emailModule.sendMail(mailOptions);

  if (sendEmail) {
    return true;
  } else {
  }

  if (sendEmail) {
    scheduler.scheduleJob("1 * * * *", async () => {
      try {
        await emailverification.update(
          { isExpired: true },
          { where: { token: UUID } }
        );
      } catch (error) {}
    });
  } else {
  }
};
