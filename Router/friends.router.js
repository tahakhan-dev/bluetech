const Token = require("../Middleware/token");

const FriendController = require("../Controller//friends/friends.controller.");

var router = require("express").Router();

let Friend = new FriendController();

router.post(
  "/makeFriend/:senderId",
  Token.isAuthenticated(),
  Friend.makeFriend
);

router.post(
  "/sendFriendRequest/:reciverId",
  Token.isAuthenticated(),
  Friend.sendFriendRequest
);

router.get(
  "/searchFriends/:searchQuery",
  Token.isAuthenticated(),
  Friend.searchFriends
);

router.get(
  "/getPendingRequest",
  Token.isAuthenticated(),
  Friend.getPendingRequest
);

router.delete(
  "/cancelFriendRequest/:senderId/:actionid",
  Token.isAuthenticated(),
  Friend.cancelFriendRequest
);

router.get(
  "/getAllMyFriends/:ActionId",
  Token.isAuthenticated(),
  Friend.getAllMyFriends
);

router.get(
  "/getAllMyFriendsSearch/:ActionId/:searchQuery",
  Token.isAuthenticated(),
  Friend.getAllMyFriendsSearch
);

router.get(
  "/getAllMyFriendscount",
  Token.isAuthenticated(),
  Friend.getAllMyFriendscount
);

router.get(
  "/friendAuth/:receiverId",
  Token.isAuthenticated(),
  Friend.friendAuth
);

router.delete(
  "/unfriendMyFriend/:friendId",
  Token.isAuthenticated(),
  Friend.unfriendMyFriend
);

module.exports = router;
