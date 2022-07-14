const db = require("../../Model");

const Permissions = db.permissions;
const Users = db.users;
const UsersDetail = db.usersdetail;
const MerchantDetails = db.MerchantDetails;

module.exports = async function (req, res) {
  try {
    let merchants = await Users.findAll({
      raw: true,
      nest: true,
      include: [
        {
          model: Permissions,
          where: {
            roleId: req.params.roleId,
            userId: req.params.userId,
          },
        },
        {
          model: UsersDetail,
          where: {
            userId: req.params.userId,
          },
        },
        {
          model: MerchantDetails,
          where: {
            userId: req.params.userId,
          },
        },
      ],
    });
    return merchants;
  } catch (err) {
    return err;
  }
};
