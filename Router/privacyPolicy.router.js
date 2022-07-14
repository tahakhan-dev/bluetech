const PrivacyPolicyController = require("../Controller/privacyPolicy/privacyPolicy.controller");
const Token = require("../Middleware/token");
var router = require("express").Router();
let PrivacyPolicy = new PrivacyPolicyController();

router.post("/create", Token.isAuthenticated(), PrivacyPolicy.create);
router.get("/read", Token.isAuthenticated(), PrivacyPolicy.read);
router.get("/read_App", PrivacyPolicy.read_app);
router.put("/update/:id", Token.isAuthenticated(), PrivacyPolicy.update);
router.delete("/delete/:id", Token.isAuthenticated(), PrivacyPolicy.delete);

module.exports = router;
