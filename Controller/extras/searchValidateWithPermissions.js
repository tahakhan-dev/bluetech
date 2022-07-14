const FindMembersFromRoleSearch = require("./searchFilterMemberFromRole");
module.exports.validatePermissionGetResponsSearch = async function (
  permission,
  req,
  res,
  getblock
) {
  if (permission) {
    await FindMembersFromRoleSearch(req, res, false, getblock);
  } else {
    return res.status(401).send({
      success: false,
      message: "You don't have permissions!",
    });
  }
};
module.exports.validatePermissionGetResponseWithIdSearch = async function (
  permission,
  req,
  res,
  getblock
) {
  if (permission) {
    await FindMembersFromRoleSearch(req, res, req.params.userId, getblock);
  } else {
    return res.status(401).send({
      success: false,
      message: "You don't have permissions!",
    });
  }
};
module.exports.validatePermissionGetAccessSearch = async function ({
  permissionIs,
  req,
  res,
  _func,
}) {
  if (permissionIs) {
    return await _func;
  } else {
    return res.status(401).send({
      success: false,
      message: "You don't have permissions!",
    });
  }
};
