const db = require("../Model");
const Tutorial = db.tutorials;
const Op = db.Sequelize.Op;

class TutorialController {
  create = (req, res) => {
    if (!req.body.title) {
      res
        .status(400)
        .send({ success: false, message: "Content can not be empty!" });
      return;
    }

    // // Create a Tutorial
    const tutorial = {
      title: req.body.title,
      description: req.body.description,
      published: req.body.published ? req.body.published : false,
    };

    // Save Tutorial in the database
    Tutorial.create(tutorial)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res
          .status(500)
          .send({
            success: false,
            message:
              err.message || "Some error occurred while creating the Tutorial.",
          });
      });
  };
}

module.exports = TutorialController;
