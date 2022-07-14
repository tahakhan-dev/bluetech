const winston = require("winston");
const db = require("../../Model");
const path = require("path");

const emailverification = db.Emailverification;
const users = db.users;

module.exports = async function (token, res) {
  emailverification
    .findOne({
      raw: true,
      where: {
        token: token,
      },
    })
    .then((result) => {
      if (result == null) {
        return res.render(path.join(ROOTPATH, "Views/error/404.ejs"));
      }
      if (result) {
        if (result.isExpired == false) {
          emailverification
            .update({ isExpired: true }, { where: { token: token } })
            .then((response) =>
              res.sendFile(path.join(ROOTPATH, "public/verifyEmail.html"))
            )
            .catch((err) => winston.error(err));

          users
            .update({ emailVerified: true }, { where: { id: result.userId } })
            .then((response) =>
              res.sendFile(path.join(ROOTPATH, "public/verifyEmail.html"))
            )
            .catch((err) => winston.error(err));

          emailverification
            .destroy({ where: { id: result.id } })
            .then((response) =>
              res.sendFile(path.join(ROOTPATH, "public/verifyEmail.html"))
            )
            .catch((err) => winston.error(err));
        } else {
          emailverification
            .destroy({ where: { id: result.id } })
            .then((response) =>
              res.sendFile(path.join(ROOTPATH, "public/verifyEmail.html"))
            )
            .catch((err) => winston.error(err));
        }
      }
    })
    .catch((err) => winston.error(err));
};
