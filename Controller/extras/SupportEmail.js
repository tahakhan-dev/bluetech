const db = require("../../Model");
const support = db.Supportmodel;
const emailModule = require("../../Mail/Nodemailer");
const config = require("config");
module.exports = async function (res, id, email, name, question) {
  let supportschema = {
    userId: id,
    email: email,
    number: null,
    question: question,
  };

  let createed = await support.create(supportschema);
  if (createed) {
    const mailOptions = {
      // from: config.get("Email_env.email"),
      // to: config.get("Email_env.email"),
      from: "giveesapp@gmail.com",
      to: "giveesapp@gmail.com",
      subject: "Client Question For Support",
      html: ` <h1>Question Alert !!</h1>
        <br/>
        <h2> From, ${name} </h2>
        <p>Question: "${question}"</p>
        <p>replyTo: "${email}"</p> `,
    };

    let sendemail = await emailModule.sendMail(mailOptions);
    if (sendemail) {
      res.status(200).send({
        success: true,
        message:
          "Your Question Has Been Delivered check Your Email For The Response Within 24 h" +
          "ours",
      });
    }
  }
};
