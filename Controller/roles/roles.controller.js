const db = require("../../Model");
const _ = require("lodash");
const { validate } = require("../../Model/role.model");
const Role = db.roles;

class Roles {
  create = async (req, res) => {
    const { error } = validate(req.body);

    if (error) return res.send(error.details[0].message);

    Role.findAll({
      where: {
        roleName: req.body.roleName,
      },
    })
      .then(async (result) => {
        if (result.length && result[0].dataValues.roleName) {
          res
            .status(401)
            .send({ success: false, message: "Role Already Exist!." });
        } else {
          const role = _.pick(req.body, ["roleName"]);
          Role.create(role)
            .then((data) => {
              res.send(data);
            })
            .catch((err) => {
              res.status(500).send({
                success: false,
                message:
                  err.message || "Some error occurred while creating the Role.",
              });
            });
        }
      })
      .catch((err) => {
        res.status(500).send({
          success: false,
          message:
            err.message || "Some error occurred while creating the Role.",
        });
      });
  };

  getRoles = async (req, res, next) => {
    try {
      let result = await Role.findAll();
      if (result.length) {
        res.send({
          success: true,
          message: "Successfully Get Role!",
          data: result,
        });
      } else {
        res.status(200).send({ success: false, message: "No Role Found!" });
      }
    } catch (error) {
      res
        .status(500)
        .send({ success: false, message: error || "Something Went Wrong!" });
    }
  };
}

module.exports = Roles;
