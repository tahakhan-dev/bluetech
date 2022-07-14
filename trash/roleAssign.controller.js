const db = require("../Model");
const _ = require("lodash");
const { validate } = require("../Model/RoleAssign.model");

const Role = db.roleAssigned;
const Op = db.Sequelize.Op;

class RoleController {
  create = async (req, res) => {
    const { error } = validate(req.body);

    if (error)
      return res.send({ success: false, message: error.details[0].message });

    Role.findAll({
      where: {
        userId: req.body.userId,
        roleId: req.body.roleId,
      },
    })
      .then(async (result) => {})
      .catch((err) => {
        res.status(500).send({
          success: false,
          message:
            err.message || "Some error occurred while creating the Role.",
        });
      });
  };
}

module.exports = RoleController;
