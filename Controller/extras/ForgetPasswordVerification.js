const db = require("../../Model");
const ForgetPassword = db.ForgetPassword;
const path = require("path");
const winston = require("winston");

module.exports = async function (token, res) {
  ForgetPassword.findOne({
    where: {
      token: token,
    },
  })
    .then((result) => {
      if (result) {
        if (result.isExpired == false) {
          return res.sendFile(
            path.join(__dirname, "../../public/ForgetPassword.html")
          );
        } else {
          ForgetPassword.destroy({ where: { userId: result.userId } })
            .then((response) => winston.info(response))
            .catch((err) => winston.error(err));

          return res.sendFile(
            path.join(__dirname, "../../public/TokenExpired.html")
          );
        }
      } else {
        return res.sendFile(
          path.join(__dirname, "../../public/TokenExpired.html")
        );
      }
    })
    .catch((err) => winston.error(err));
};
