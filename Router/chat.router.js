const ChatController = require("../Controller/Chat/Chat.controller.js");
let  Chat = new ChatController();
let Token = require("../Middleware/token");
const fileUpload = require("../Controller/extras/Savemultiplefiles.js");
const upload = fileUpload.array('docs',12);
var router = require("express").Router();

router.put("/ChatPermission",Token.isAuthenticated(), Chat.EnableChat);
router.get("/ChatPermissionisEnable", Token.isAuthenticated(), Chat.GetChatPermission);
router.get("/testing", Chat.Testing);

module.exports = router;