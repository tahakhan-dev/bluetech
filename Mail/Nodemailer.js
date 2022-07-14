const nodemailer = require("nodemailer");
const config = require("config");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    // user: config.get("Email_env.email"),
    // pass: config.get("Email_env.password"),
    user: "giveesapp@gmail.com",
    pass: "hboyoaefpllucylm",
  },
  //   tls:{
  //     rejectUnauthorized:false
  // }
});

module.exports.sendMail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};
