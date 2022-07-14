const AdminController = require("../Controller/Admin/AdminController");
const Token = require("../Middleware/token");

var router = require("express").Router();

let Admin = new AdminController();

router.post("/create_user", Token.isAuthenticated(), Admin.create);
router.get("/getMembers/:roleId", Token.isAuthenticated(), Admin.getMembers);
router.get("/getRoles", Token.isAuthenticated(), Admin.getRoles);
router.get(
  "/getSpecificMember/:roleId/:userId",
  Token.isAuthenticated(),
  Admin.getSpecificMember
);
router.put("/updateMember/:roleId/:userId", Token.isAuthenticated(), Admin.updateMember);
router.put(
  "/updateMemberPermissions/:roleId/:userId",
  Token.isAuthenticated(),
  Admin.updateMemberPermissions
);
router.get("/blockMember/:roleId/:userId", Token.isAuthenticated(), Admin.blockMember);
router.delete("/deleteMember/:roleId/:userId", Token.isAuthenticated(), Admin.deleteMember);

module.exports = router;
