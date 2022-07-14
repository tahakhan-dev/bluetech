const AuthController = require("../Controller/users/authentication.controller");
const Token = require("../Middleware/token");
var router = require("express").Router();

let Auth = new AuthController();

router.post("/login", Auth.Auth);

router.post("/logout", Token.isValid(), Auth.Logout);

router.post("/resendEmail", Auth.resendEmail);

router.post("/ForgetPassword", Auth.ForgetpasswordEmail);

// Template Generator
router.get("/dynamic_gen_token_key/template/:key", Auth.Template);

// Template Generator
router.post("/reset/:token", Auth.ResetPassword);

router.post("/reset_password_otp/:user_id", Auth.ResetPasswordFromOtp);

router.post("/OTPVerification", Auth.checkService);

module.exports = router;
