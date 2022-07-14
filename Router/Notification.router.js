const NotificationController = require("../Controller/Notification/Notification.controller");
let  Notification = new NotificationController();
let Token = require("../Middleware/token");
var router = require("express").Router();
//router.post("/InsrtChat", upload,  Chat.InserChat);
router.get("/GetNotification", Token.isAuthenticated(), Notification.GetNotification);

module.exports = router;