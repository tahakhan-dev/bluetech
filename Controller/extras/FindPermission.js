const db = require("../../Model");

const Permissions = db.permissions;

module.exports = async function (userId) {
  try {
    let adminPermission = await Permissions.findOne({
      raw: true,
      where: { userId: userId },
    });

    return adminPermission;
  } catch (err) {
    return err;
  }
};
