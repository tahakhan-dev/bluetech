const db = require("../../Model");
const _ = require("lodash");
const user = db.users;
const supportEmailsend = require("../extras/SupportEmail");

class Support {
  create = async (req, res) => {
    try {
      let users = await user.findOne({
        where: {
          id: req.user.id,
        },
      });
      if (users) {
        let question = req.body.question;
        supportEmailsend(res, users.id, users.email, users.userName, question);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  };
}
module.exports = Support;
