const db = require("../../Model");
const Users = db.users;

const getUser = async function (req, res, userId) {
  try {
    let usersPermission = await Users.findAll({
      raw: true,
      where: { id: userId, isDelete: 0 },
    });

    return usersPermission[0];
  } catch (err) {
    return err;
  }
};

const updateUser = async function ({ req, res, userId, status, key }) {
  try {
    await Users.update({ [key]: status }, { where: { id: userId } });
  } catch (err) {
    return res
      .status(500)
      .send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
  }
};

module.exports.getUser = getUser;
module.exports.updateUser = updateUser;
