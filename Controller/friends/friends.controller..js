const db = require("../../Model");
const _ = require("lodash");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { ArraySlicePagination } = require("../extras/pagination/pagination");

const Op = db.Sequelize.Op;
const friends = db.friends;
const users = db.users;
const userdetail = db.usersdetail;
const UsersDetail = db.usersdetail;
const Blockuser = db.blockUserModel;
const ImageData = db.imageData;
const Permissions = db.permissions;
const Roles = db.roles;
const Users = db.users;
const Block = db.blockUserModel;
const Friends = db.friends;
const Notification = db.notification;
const Notificationroute = db.notificationroute;
const fcm = require("../../FCMNotification/fcmnotificatins");

var privateKEY = fs.readFileSync("config/cert/private.chat.key", "utf8");
class Friend {
  makeFriend = async (req, res) => {
    try {
      let sender = req.params.senderId;
      let currentUserId = req.user.id;

      if (parseInt(sender) == currentUserId)
        return res
          .status(404)
          .send({ success: false, message: "You Can't make friend yourself" });

      let _res2 = await friends.findOne({
        where: {
          isPending: false,
          isFriend: true,
          [Op.or]: [
            {
              senderId: {
                [Op.eq]: sender,
              },
              receiverId: {
                [Op.eq]: currentUserId,
              },
            },
            {
              senderId: {
                [Op.eq]: currentUserId,
              },
              receiverId: {
                [Op.eq]: sender,
              },
            },
          ],
        },
      });

      if (_res2)
        return res
          .status(404)
          .send({ success: false, message: "Alreday Friend!" });

      let _res1 = await friends.findOne({
        where: {
          isPending: true,
          isFriend: false,
          [Op.or]: [
            {
              senderId: {
                [Op.eq]: sender,
              },
              receiverId: {
                [Op.eq]: currentUserId,
              },
            },
            {
              senderId: {
                [Op.eq]: currentUserId,
              },
              receiverId: {
                [Op.eq]: sender,
              },
            },
          ],
        },
      });

      if (!_res1)
        return res
          .status(404)
          .send({ success: false, message: "No Fiends Found" });

      await friends.update(
        { isPending: 0, isFriend: 1 },
        { where: { id: _res1.id } }
      );

      let Deviceid = await Users.findOne({
        where: {
          id: sender,
        },
      });
      let currentuser = await Users.findOne({
        where: {
          id: currentUserId,
        },
      });
      let Discp = `Friend Request Has Been Accepted by `;
      //Notification work
      var message = {
        to: Deviceid.fcmtoken,
        notification: {
          title: "givees",
          body: `${Discp} ${currentuser.userName}`,
        },
      };
      fcm.send(message, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: currentUserId,
            receiverId: sender,
            Body: Discp,
            Title: "Accept ",
            RouteId: 2,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: currentUserId,
            receiverId: sender,
            Body: Discp,
            Title: "Accept",
            RouteId: 2,
            IsAction: 0,
            IsCount: 1,
          });
        }
      });

      var ourmessage = {
        to: currentuser.fcmtoken,
        notification: {
          title: "givees",
          body: `You have accepted friend request from ${Deviceid.userName}`,
        },
      };
      fcm.send(ourmessage, async function (err, response) {
        if (err) {
          await Notification.create({
            senderId: sender,
            receiverId: currentUserId,
            Body: Discp,
            Title: "Accept ",
            RouteId: 22,
            IsAction: 0,
            IsCount: 1,
          });
        } else {
          await Notification.create({
            senderId: sender,
            receiverId: currentUserId,
            Body: Discp,
            Title: "Accept",
            RouteId: 22,
            IsAction: 0,
            IsCount: 1,
          });
        }
      });


      let updatenotification = await Notification.update(
        {
          IsAction: 0,
        },
        {
          where: {
            receiverId: currentUserId,
            IsAction: 1,
            RouteId: 1,
          },
        }
      );

      res
        .status(200)
        .send({ success: true, data: _res1, message: "Request Accepted" });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  getPendingRequest = async (req, res) => {
    try {
      const payloadId = req.user.id;

      let _res = await friends.findAll({
        raw: true,
        where: {
          isPending: true,
          receiverId: payloadId,
        },
      });

      if (_res.length) {
        let request = [];
        let counter = 0;
        _res.forEach(async (val, index, array) => {
          if (val.receiverId == req.user.id) {
            request.push(val.senderId);
          }
          counter++;
          if (array.length == counter) {
            let getuser = await users.findAll({
              include: [
                {
                  model: userdetail,
                  where: {
                    userId: request,
                  },
                },
              ],
            });
            if (getuser) {
              res.status(200).send({
                success: true,
                message: "Request Send By Users",
                data: getuser,
                requestCount: request.length,
              });
            }
          }
        });
      } else {
        res
          .status(200)
          .send({ code: 404, success: true, message: "No Requests Found" });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  cancelFriendRequest = async (req, res) => {
    try {
      const sender = req.params.senderId;
      const curentuser = req.user.id;
      const actionid = req.params.actionid;
     // actionid = 1  // Declined friend request from receiver
     // actionid = 2  // Cancel friend request from Sender
      if (sender == curentuser)
        return res
          .status(400)
          .send({ success: false, err: "Something went wrong !" });

      let getrequest = await friends.findOne({
        where: {
          isPending: true,
          isFriend: false,
          [Op.or]: [
            {
              senderId: {
                [Op.eq]: sender,
              },
              receiverId: {
                [Op.eq]: curentuser,
              },
            },
            {
              senderId: {
                [Op.eq]: curentuser,
              },
              receiverId: {
                [Op.eq]: sender,
              },
            },
          ],
        },
      });

      if (!getrequest)
        return res
          .status(200)
          .send({ success: true, message: "Can't Cancel This Request" });

      let destroyRequest = await friends.destroy({
        where: {
          id: getrequest.id,
        },
      });

      let Deviceid = await Users.findOne({
        where: {
          id: sender,
        },
      });
      //curentuser
      let currentuserdata = await Users.findOne({
        where: {
          id: curentuser,
        },
      });
      let Discp = `Friend Request Has Been Rejected by`;
      //Notification work
      

      if(actionid == 1){
        let Discp = `Friend Request Has Been Rejected by`;
      //Notification work
        var message = {
          to: Deviceid.fcmtoken,
          notification: {
            title: "givees",
            body: ` ${currentuserdata.userName} has declined your friend request`,
          },
        };
        fcm.send(message, async function (err, response) {
          if (err) {
            await Notification.create({
              senderId: curentuser,
              receiverId: sender,
              Body: Discp,
              Title: "Reject Friend Request",
              RouteId: 6,
              IsAction: 0,
              IsCount: 1,
            });
          } else {
            await Notification.create({
              senderId: curentuser,
              receiverId: sender,
              Body: Discp,
              Title: "Reject Friend Request",
              RouteId: 6,
              IsAction: 0,
              IsCount: 1,
            });
          }
        });
        
  
        //own notify work
  
        var ourmessage = {
          to: currentuserdata.fcmtoken,
          notification: {
            title: "givees",
            body: `you have declined friend request from  ${Deviceid.userName}`,
          },
        };
        fcm.send(ourmessage, async function (err, response) {
          if (err) {
            await Notification.create({
              senderId: sender,
              receiverId: curentuser,
              Body: `you have declined friend request from  ${Deviceid.userName}`,
              Title: "Cancel Request",
              RouteId: 23,
              IsAction: 0,
              IsCount: 1,
            });
          } else {
            await Notification.create({
              senderId: sender,
              receiverId: curentuser,
              Body: `you have declined friend request from  ${Deviceid.userName}`,
              Title: "Cancel Request",
              RouteId: 23,
              IsAction: 0,
              IsCount: 1,
            });
          }
        });
      }
      let updatenotification = await Notification.update(
        {
          IsAction: 0,
        },
        {
          where: {
            IsAction: 1,
            RouteId: 1,
            [Op.or]: [
              {
                senderId: {
                  [Op.eq]: curentuser,
                },
                receiverId: {
                  [Op.eq]: sender,
                },
              },
              {
                senderId: {
                  [Op.eq]: sender,
                },
                receiverId: {
                  [Op.eq]: curentuser,
                },
              },
            ],
          },
        }
      );
      // else{
      //   let Discp = `Friend Request Has Been cancelled by`;
      // //Notification work
      //   var message = {
      //     to: Deviceid.fcmtoken,
      //     notification: {
      //       title: "givees",
      //       body: ` ${Discp} ${currentuserdata.userName}`,
      //     },
      //   };
      //   fcm.send(message, async function (err, response) {
      //     if (err) {
      //       await Notification.create({
      //         senderId: curentuser,
      //         receiverId: sender,
      //         Body: Discp,
      //         Title: "Reject Friend Request",
      //         RouteId: 6,
      //         IsAction: 0,
      //         IsCount: 1,
      //       });
      //     } else {
      //       await Notification.create({
      //         senderId: curentuser,
      //         receiverId: sender,
      //         Body: Discp,
      //         Title: "Reject Friend Request",
      //         RouteId: 6,
      //         IsAction: 0,
      //         IsCount: 1,
      //       });
      //     }
      //   });
      //   let updatenotification = await Notification.update(
      //     {
      //       IsAction: 0,
      //     },
      //     {
      //       where: {
      //         IsAction: 1,
      //         RouteId: 1,
      //         [Op.or]: [
      //           {
      //             senderId: {
      //               [Op.eq]: curentuser,
      //             },
      //             receiverId: {
      //               [Op.eq]: sender,
      //             },
      //           },
      //           {
      //             senderId: {
      //               [Op.eq]: sender,
      //             },
      //             receiverId: {
      //               [Op.eq]: curentuser,
      //             },
      //           },
      //         ],
      //       },
      //     }
      //   );
  
      //   //own notify work
  
      //   var ourmessage = {
      //     to: currentuserdata.fcmtoken,
      //     notification: {
      //       title: "givees",
      //       body: `you have cancelled friend request of  ${Deviceid.userName}`,
      //     },
      //   };
      //   fcm.send(ourmessage, async function (err, response) {
      //     if (err) {
      //       await Notification.create({
      //         senderId: sender,
      //         receiverId: curentuser,
      //         Body: `you have cancelled friend request of  ${Deviceid.userName}`,
      //         Title: "Cancel Request",
      //         RouteId: 23,
      //         IsAction: 0,
      //         IsCount: 1,
      //       });
      //     } else {
      //       await Notification.create({
      //         senderId: sender,
      //         receiverId: curentuser,
      //         Body: `you have declined friend request from  ${Deviceid.userName}`,
      //         Title: "Cancel Request",
      //         RouteId: 23,
      //         IsAction: 0,
      //         IsCount: 1,
      //       });
      //     }
      //   });

      //   let updatenotification = await Notification.update(
      //     {
      //       IsAction: 0,
      //     },
      //     {
      //       where: {
      //         IsAction: 1,
      //         RouteId: 1,
      //         [Op.or]: [
      //           {
      //             senderId: {
      //               [Op.eq]: curentuser,
      //             },
      //             receiverId: {
      //               [Op.eq]: sender,
      //             },
      //           },
      //           {
      //             senderId: {
      //               [Op.eq]: sender,
      //             },
      //             receiverId: {
      //               [Op.eq]: curentuser,
      //             },
      //           },
      //         ],
      //       },
      //     }
      //   );
      // }
      

      if (destroyRequest) {
        res.status(200).send({
          success: true,
          data: "You have Canceled this friend request!",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getAllMyFriends = async (req, res) => {
    try {
      const payloadId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let ActionId = parseInt(req.params.ActionId);
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      // 1 -->	Pending
      // 2 -->	Show All Friends
      // 3 -->	Show Block Friends

      if (ActionId > 0 && ActionId < 5) {
        switch (ActionId) {
          case 1:
            let recieverarr = [];
            let senderArray = [];
            let _res = await friends.findAll({
              raw: true,
              where: {
                isPending: true,
                isFriend: false,
                [Op.or]: [
                  {
                    senderId: {
                      [Op.eq]: payloadId,
                    },
                  },
                  {
                    receiverId: {
                      [Op.eq]: payloadId,
                    },
                  },
                ],
              },
            });

            _res.forEach((res) => {
              if (res.senderId == req.user.id) {
                recieverarr.push(res.receiverId);
              } else {
                senderArray.push(res.senderId);
              }
            });

            if (!_res.length)
              return res
                .status(404)
                .send({ success: false, message: "No Pending Friends Yet !" });

            let _friends = [];
            let counter = 0;
            _res.forEach(async (val, index, array) => {
              if (val.senderId == req.user.id) {
                _friends.push(val.receiverId);
              } else {
                _friends.push(val.senderId);
              }
              counter++;
              if (counter == array.length) {
                let getuser = await users.findAll({
                  where: { isBlocked: false, isDelete: false },
                  include: [
                    {
                      model: userdetail,
                      where: {
                        userId: _friends,
                      },
                    },
                    {
                      model: ImageData,
                    },
                  ],
                  attributes: ["id", "userName", "email", "isBlocked"],
                });
                getuser.forEach((x) => {
                  x.dataValues["usersdetails"] = x.dataValues.usersdetails[0];
                });

                getuser.map((x, i, arr) => {
                  recieverarr.forEach((res) => {
                    if (res == x.id) {
                      x.dataValues["Status"] = "SenederRequest";
                    }
                  });
                  senderArray.forEach((res) => {
                    if (res == x.id) {
                      x.dataValues["Status"] = "RecieverRequest";
                    }
                  });
                });

                let countData = {
                  page: parseInt(PageNumber),
                  pages: Math.ceil(getuser.length / PageSize),
                  totalRecords: getuser.length,
                };
                if (getuser.length) {
                  res.status(200).send({
                    success: true,
                    data: getuser.slice(paginations.Start, paginations.End),
                    countData,
                    FriendsCount: _friends.length,
                  });
                } else {
                  res.status(200).send({
                    success: false,
                    message: "No Pending Friends yet !",
                  });
                }
              }
            });
            break;
          case 2:
            let _res1 = await friends.findAll({
              raw: true,
              where: {
                isPending: false,
                isFriend: true,
                [Op.or]: [
                  {
                    senderId: {
                      [Op.eq]: payloadId,
                    },
                  },
                  {
                    receiverId: {
                      [Op.eq]: payloadId,
                    },
                  },
                ],
              },
            });

            if (!_res1.length)
              return res
                .status(404)
                .send({ success: false, message: "No Friends Yet !" });

            let _friends1 = [];
            let counter1 = 0;
            _res1.forEach(async (val, index, array) => {
              if (val.senderId == req.user.id) {
                _friends1.push(val.receiverId);
              } else {
                _friends1.push(val.senderId);
              }
              counter1++;
              if (counter1 == array.length) {
                let getuser1 = await users.findAll({
                  where: { isBlocked: false, isDelete: false },
                  include: [
                    {
                      model: userdetail,
                      where: {
                        userId: _friends1,
                      },
                    },
                    {
                      model: ImageData,
                    },
                  ],
                  attributes: ["id", "userName", "email", "isBlocked"],
                });
                getuser1.forEach((x) => {
                  x.dataValues["usersdetails"] = x.dataValues.usersdetails[0];
                });
                let countData = {
                  page: parseInt(PageNumber),
                  pages: Math.ceil(getuser1.length / PageSize),
                  totalRecords: getuser1.length,
                };
                if (getuser1.length) {
                  res.status(200).send({
                    success: true,
                    data: getuser1.slice(paginations.Start, paginations.End),
                    countData,
                    FriendsCount: _friends1.length,
                  });
                } else {
                  res
                    .status(200)
                    .send({ success: false, message: "No Friends yet !" });
                }
              }
            });
            break;
          case 3:
            let _res2 = await Blockuser.findAll({
              where: {
                blockerId: payloadId,
              },
              include: [
                {
                  model: users,
                  as: "BlockUsersDetail",
                  include: [
                    {
                      model: ImageData,
                    },
                    {
                      model: userdetail,
                      as: "userDetailsF",
                    },
                  ],
                },
              ],
            });

            if (!_res2.length)
              return res
                .status(404)
                .send({ success: false, message: "No Block Friends Yet !" });

            let countData = {
              page: parseInt(PageNumber),
              pages: Math.ceil(_res2.length / PageSize),
              totalRecords: _res2.length,
            };

            res.status(200).send({
              success: true,
              data: _res2.slice(paginations.Start, paginations.End),
              countData,
            });
            break;
          case 4:
            let friendArr = [];
            let UsersResp = await users.findAll({
              where: {
                id: { [Op.ne]: payloadId },
                emailVerified: 1,
                isBlocked: 0,
                isDelete: 0,
              },
              include: [
                {
                  model: userdetail,
                  where: {
                    public_profile: 1,
                  },
                },
                {
                  model: ImageData,
                },
                {
                  model: Permissions,
                  where: {
                    roleId: 4,
                  },
                },
              ],
            });

            let friendResp = await friends.findAll({
              raw: true,
              where: {
                isPending: false,
                isFriend: true,
                [Op.or]: [
                  {
                    senderId: {
                      [Op.eq]: payloadId,
                    },
                  },
                  {
                    receiverId: {
                      [Op.eq]: payloadId,
                    },
                  },
                ],
              },
            });

            friendResp.forEach((res) => {
              if (res.senderId == payloadId) {
                friendArr.push(res.receiverId);
              } else {
                friendArr.push(res.senderId);
              }
            });

            for (let value of friendArr) {
              let UsersResp2 = await users.findOne({
                where: {
                  id: value,
                },
                include: [
                  {
                    model: userdetail,
                  },
                  {
                    model: ImageData,
                  },
                ],
              });
              if (UsersResp2) {
                UsersResp.push(UsersResp2);
              }
            }

            let countData1 = {
              page: parseInt(PageNumber),
              pages: Math.ceil(UsersResp.length / PageSize),
              totalRecords: UsersResp.length,
            };

            res.status(200).send({
              success: true,
              data: UsersResp.slice(paginations.Start, paginations.End),
              countData1,
            });
            break;
        }
      } else {
        return res
          .status(500)
          .send({ Success: false, message: "something went wrong" });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getAllMyFriendsSearch = async (req, res) => {
    try {
      const payloadId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let SearchQuery = req.params.searchQuery;
      let ActionId = parseInt(req.params.ActionId);
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let countData;
      // 1 -->	Pending
      // 2 -->	Show All Friends
      // 3 -->	Show Block Friends
      // 4 -->	Show All User but not Private

      if (ActionId > 0 && ActionId < 5) {
        switch (ActionId) {
          case 1:
            let recieverarr = [];
            let senderArray = [];
            let _res = await friends.findAll({
              raw: true,
              where: {
                isPending: true,
                isFriend: false,
                [Op.or]: [
                  {
                    senderId: {
                      [Op.eq]: payloadId,
                    },
                  },
                  {
                    receiverId: {
                      [Op.eq]: payloadId,
                    },
                  },
                ],
              },
            });

            _res.forEach((res) => {
              if (res.senderId == req.user.id) {
                recieverarr.push(res.receiverId);
              } else {
                senderArray.push(res.senderId);
              }
            });

            if (!_res.length)
              return res.status(200).send({ success: true, data: [] });

            let _friends = [];
            let counter = 0;
            _res.forEach(async (val, index, array) => {
              if (val.senderId == req.user.id) {
                _friends.push(val.receiverId);
              } else {
                _friends.push(val.senderId);
              }
              counter++;
              if (counter == array.length) {
                let getuser = await users.findAll({
                  where: {
                    isBlocked: false,
                    isDelete: false,
                    id: _friends,
                    [Op.or]: [{ userName: { [Op.like]: SearchQuery + "%" } }],
                  },
                  include: [
                    {
                      model: userdetail,
                      where: {
                        userId: _friends,
                        // [Op.or]: [
                        //   {
                        //     firstName: {
                        //       [Op.like]: SearchQuery + "%",
                        //     },
                        //   },
                        //   {
                        //     lastName: {
                        //       [Op.like]: SearchQuery + "%",
                        //     },
                        //   },
                        //   {
                        //     phoneNumber: {
                        //       [Op.like]: SearchQuery + "%",
                        //     },
                        //   },
                        // ],
                      },
                    },
                    {
                      model: ImageData,
                    },
                  ],
                  attributes: ["id", "userName", "email", "isBlocked"],
                });
                getuser.forEach((x) => {
                  x.dataValues["usersdetails"] = x.dataValues.usersdetails[0];
                });

                getuser.map((x, i, arr) => {
                  recieverarr.forEach((res) => {
                    if (res == x.id) {
                      x.dataValues["Status"] = "SenederRequest";
                    }
                  });
                  senderArray.forEach((res) => {
                    if (res == x.id) {
                      x.dataValues["Status"] = "RecieverRequest";
                    }
                  });
                });

                countData = {
                  page: parseInt(PageNumber),
                  pages: Math.ceil(getuser.length / PageSize),
                  totalRecords: getuser.length,
                };
                if (getuser.length) {
                  res.status(200).send({
                    success: true,
                    data: getuser.slice(paginations.Start, paginations.End),
                    countData,
                    FriendsCount: _friends.length,
                  });
                } else {
                  res.status(200).send({ success: true, data: [] });
                }
              }
            });
            break;
          case 2:
            let _res1 = await friends.findAll({
              raw: true,
              where: {
                isPending: false,
                isFriend: true,
                [Op.or]: [
                  {
                    senderId: {
                      [Op.eq]: payloadId,
                    },
                  },
                  {
                    receiverId: {
                      [Op.eq]: payloadId,
                    },
                  },
                ],
              },
            });

            if (!_res1.length)
              return res.status(200).send({ success: true, data: [] });

            let _friends1 = [];
            let counter1 = 0;
            _res1.forEach(async (val, index, array) => {
              if (val.senderId == req.user.id) {
                _friends1.push(val.receiverId);
              } else {
                _friends1.push(val.senderId);
              }
              counter1++;
              if (counter1 == array.length) {
                let getuser1 = await users.findAll({
                  where: {
                    isBlocked: false,
                    isDelete: false,
                    id: _friends1,
                    [Op.or]: [{ userName: { [Op.like]: SearchQuery + "%" } }],
                  },
                  include: [
                    {
                      model: userdetail,
                      where: {
                        userId: _friends1,
                        // [Op.or]: [
                        //   {
                        //     firstName: {
                        //       [Op.like]: SearchQuery + "%",
                        //     },
                        //   },
                        //   {
                        //     lastName: {
                        //       [Op.like]: SearchQuery + "%",
                        //     },
                        //   },
                        //   {
                        //     phoneNumber: {
                        //       [Op.like]: SearchQuery + "%",
                        //     },
                        //   },
                        // ],
                      },
                    },
                    {
                      model: ImageData,
                    },
                  ],
                  attributes: ["id", "userName", "email", "isBlocked"],
                });
                getuser1.forEach((x) => {
                  x.dataValues["usersdetails"] = x.dataValues.usersdetails[0];
                });
                countData = {
                  page: parseInt(PageNumber),
                  pages: Math.ceil(getuser1.length / PageSize),
                  totalRecords: getuser1.length,
                };
                if (getuser1.length) {
                  res.status(200).send({
                    success: true,
                    data: getuser1.slice(paginations.Start, paginations.End),
                    countData,
                    FriendsCount: _friends1.length,
                  });
                } else {
                  res.status(200).send({ success: true, data: [] });
                }
              }
            });
            break;
          case 3:
            let _res2 = await Blockuser.findAll({
              where: {
                blockerId: payloadId,
              },
              include: [
                {
                  model: users,
                  as: "BlockUsersDetail",
                  where: {
                    [Op.or]: [{ userName: { [Op.like]: SearchQuery + "%" } }],
                  },
                  include: [
                    {
                      model: ImageData,
                    },
                    {
                      model: userdetail,
                      as: "userDetailsF",
                      //where: {
                      // [Op.or]: [
                      //   {
                      //     firstName: {
                      //       [Op.like]: SearchQuery + "%",
                      //     },
                      //   },
                      //   {
                      //     lastName: {
                      //       [Op.like]: SearchQuery + "%",
                      //     },
                      //   },
                      //   {
                      //     phoneNumber: {
                      //       [Op.like]: SearchQuery + "%",
                      //     },
                      //   },
                      // ],
                      //},
                    },
                  ],
                },
              ],
            });

            if (!_res2.length)
              return res.status(200).send({
                success: true,
                data: [],
                message: "No Block Friends Yet !",
              });

            countData = {
              page: parseInt(PageNumber),
              pages: Math.ceil(_res2.length / PageSize),
              totalRecords: _res2.length,
            };

            res.status(200).send({
              success: true,
              data: _res2.slice(paginations.Start, paginations.End),
              countData,
            });
            break;
          case 4:
            let friendArr = [];
            let UsersResp = await users.findAll({
              where: {
                id: { [Op.ne]: payloadId },
                emailVerified: 1,
                isBlocked: 0,
                isDelete: 0,
                userName: { [Op.like]: SearchQuery + "%" },
              },
              include: [
                {
                  model: userdetail,
                  where: {
                    public_profile: 1,
                  },
                },
                {
                  model: ImageData,
                  // required: false,
                  // association: db.users.hasMany(db.imageData, {
                  //   foreignKey: "userId",
                  // }),
                  // where: {
                  //   imageType: 'User',
                  // },
                },
                {
                  model: Permissions,
                  where: {
                    roleId: 4,
                  },
                },
              ],
            });

            let friendResp = await friends.findAll({
              raw: true,
              where: {
                isPending: false,
                isFriend: true,
                [Op.or]: [
                  {
                    senderId: {
                      [Op.eq]: payloadId,
                    },
                  },
                  {
                    receiverId: {
                      [Op.eq]: payloadId,
                    },
                  },
                ],
              },
            });

            friendResp.forEach((res) => {
              if (res.senderId == payloadId) {
                friendArr.push(res.receiverId);
              } else {
                friendArr.push(res.senderId);
              }
            });

            // for (let value of friendArr) {
            //   let UsersResp2 = await users.findOne({
            //     where: {
            //       id: value,
            //       userName: { [Op.like]: SearchQuery + "%", },
            //     },
            //     include: [
            //       {
            //         model: userdetail,
            //         where: {
            //           // [Op.or]: [
            //           //   {
            //           //     firstName: {
            //           //       [Op.like]: SearchQuery + "%",
            //           //     },
            //           //   },
            //           //   {
            //           //     lastName: {
            //           //       [Op.like]: SearchQuery + "%",
            //           //     },
            //           //   },
            //           //   {
            //           //     phoneNumber: {
            //           //       [Op.like]: SearchQuery + "%",
            //           //     },
            //           //   },
            //           // ],
            //         },
            //       },
            //       {
            //         model: ImageData,
            //       },
            //     ],
            //   });
            //   // if (UsersResp2) {
            //   //   UsersResp.push(UsersResp2);
            //   // }
            // }

            countData = {
              page: parseInt(PageNumber),
              pages: Math.ceil(UsersResp.length / PageSize),
              totalRecords: UsersResp.length,
            };

            res.status(200).send({
              success: true,
              data: UsersResp.slice(paginations.Start, paginations.End),
              countData,
            });
            break;
        }
      } else {
        return res
          .status(500)
          .send({ Success: false, message: "something went wrong" });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getAllMyFriendscount = async (req, res) => {
    try {
      const payloadId = req.user.id;

      let _res = await friends.count({
              raw: true,
              where: {
                isPending: true,
                isFriend: false,
                [Op.or]: [
                  {
                    senderId: {
                      [Op.eq]: payloadId,
                    },
                  },
                  {
                    receiverId: {
                      [Op.eq]: payloadId,
                    },
                  },
                ],
              },
            });

      let _res1 = await friends.count({
              raw: true,
              where: {
                isPending: false,
                isFriend: true,
                [Op.or]: [
                  {
                    senderId: {
                      [Op.eq]: payloadId,
                    },
                  },
                  {
                    receiverId: {
                      [Op.eq]: payloadId,
                    },
                  },
                ],
              },
            });
      let _res2 = await Blockuser.count({
              where: {
                blockerId: payloadId,
              },
             
            });



            res.status(200).send({
              success: true,
              PendingFriends: _res,
              Friends: _res1,
              BlockFriends: _res2

            });

           

        

            
           
        }
      
     catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  unfriendMyFriend = async (req, res) => {
    try {
      let friendId = req.params.friendId;
      let currentUserId = req.user.id;

      if (friendId == currentUserId)
        return res
          .status(400)
          .send({ success: false, err: "You Can't Unfriend yourSelf !" });

      let query = `Select * from friends where isPending = false AND isFriend = true AND senderId = ${friendId} 
        AND receiverId = ${currentUserId} OR isPending = false AND isFriend = true AND senderId = ${currentUserId} AND receiverId = ${friendId}`;

      let FriendsModel = await db.sequelize.query(query);
      let getrequest = FriendsModel[0][0];

      if (!getrequest)
        return res
          .status(400)
          .send({ success: false, err: "Something went wrong or not found!" });

      let unfriend = await friends.destroy({
        where: {
          id: getrequest.id,
        },
      });

      if (unfriend) {
        //Notification work
        let Deviceid = await Users.findOne({
          where: {
            id: friendId,
          },
        });
        let currentuser = await Users.findOne({
          where: {
            id: currentUserId,
          },
        });

        var message = {
          to: req.user.fcmtoken,
          notification: {
            title: "givees",
            body: `you Unfriend ${currentuser.userName} `,
          },
        };
        fcm.send(message, async function (err, response) {
          if (err) {
            await Notification.create({
              senderId: friendId,
              receiverId: currentUserId,
              Body: `You Unfriend `,
              Title: "unFriend",
              RouteId: 9,
              IsAction: 0,
              IsCount: 1,
            });
          } else {
            await Notification.create({
              senderId: friendId,
              receiverId: currentUserId,
              Body: `You Unfriend `,
              Title: "unFriend",
              RouteId: 9,
              IsAction: 0,
              IsCount: 1,
            });
          }
        });
        res.status(200).send({ success: true, data: "Successfully Unfriend!" });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  sendFriendRequest = async (req, res) => {
    try {
      let reciver = req.params.reciverId;
      let currentUserId = req.user.id;

      if (parseInt(reciver) == currentUserId)
        return res.status(404).send({
          success: false,
          message: "You Can't Send Request to YourSelf",
        });

      let schema = {
        senderId: currentUserId,
        receiverId: reciver,
      };

      let foundUser = await users.findOne({
        where: {
          id: reciver,
        },
      });

      if (!foundUser)
        return res.status(404).send({
          success: false,
          message: "User not found.",
        });

      let query = `Select * from friends where senderId = ${currentUserId} 
        AND receiverId = ${reciver} OR senderId = ${reciver} AND receiverId = ${currentUserId}`;

      let FriendModel = await db.sequelize.query(query);
      let getrequest = FriendModel[0][0];

      if (getrequest) {
        if (getrequest.isFriend === 1) {
          return res
            .status(404)
            .send({ success: false, message: "Already Friends" });
        } else {
          return res
            .status(200)
            .send({ success: true, message: "Already Requested" });
        }
      }

      let send = await friends.create(schema);

      if (send) {
        let Deviceid = await Users.findOne({
          where: {
            id: reciver,
          },
        });
        let currentuser = await Users.findOne({
          where: {
            id: currentUserId,
          },
        });
        let Discp = `Sent a Friend Request`;
        //Notification work
        var message = {
          to: Deviceid.fcmtoken,
          notification: {
            title: "givees",
            body: ` ${currentuser.userName} ${Discp}`,
          },
        };
        fcm.send(message, async function (err, response) {
          if (err) {
            await Notification.create({
              senderId: currentUserId,
              receiverId: reciver,
              Body: Discp,
              Title: "Request",
              RouteId: 1,
              IsAction: 1,
              IsCount: 1,
            });
          } else {
            await Notification.create({
              senderId: currentUserId,
              receiverId: reciver,
              Body: Discp,
              Title: "Request",
              RouteId: 1,
              IsAction: 1,
              IsCount: 1,
            });
          }
        });


        //own notify
        var ourmessage = {
          to: currentuser.fcmtoken,
          notification: {
            title: "givees",
            body: `You have sent a friend request to ${Deviceid.userName}`,
          },
        };
        fcm.send(ourmessage, async function (err, response) {
          if (err) {
            await Notification.create({
              senderId: reciver,
              receiverId: currentUserId,
              Body: Discp,
              Title: "Send Request",
              RouteId: 21,
              IsAction: 0,
              IsCount: 1,
            });
          } else {
            await Notification.create({
              senderId: reciver,
              receiverId: currentUserId,
              Body: Discp,
              Title: "Send Request",
              RouteId: 21,
              IsAction: 0,
              IsCount: 1,
            });
          }
        });
        return res
          .status(200)
          .send({ success: true, message: "Request Has Been Send" });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  friendAuth = async (req, res) => {
    try {
      const payloadId = req.user.id;
      const { receiverId } = req.params;

      let query = `Select * from friends where senderId = ${payloadId} 
      AND receiverId = ${receiverId} OR senderId = ${receiverId} AND receiverId = ${payloadId}`;

      let FriendModel = await db.sequelize.query(query);
      let getrequest = FriendModel[0][0];

      let userObj = await db.users.findOne({
        raw: true,
        nest: true,
        attributes: ["userName", "email"],
        where: {
          id: payloadId,
        },
      });

      let authObj = {
        friend: getrequest ? true : false,
        my_data: userObj,
        f_id: receiverId,
        support: false,
      };

      var i = "GIVEES";
      var s = "givees@gmail.com";
      var signOptions = {
        issuer: i,
        subject: s,
        algorithm: "RS256",
      };

      const token = jwt.sign(authObj, privateKEY, signOptions);

      return res.status(200).send({ success: true, data: authObj, token });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  searchFriends = async (req, res) => {
    try {
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let SearchQuery = req.params.searchQuery;
      let userID = req.user.id;
      let userArray = [];
      let resData = [];
      let blockerIds = [];
      let friendSenderIds = [];
      let friendRecieverIds = [];
      let blockerResp = [];
      let userRole,
        blockResult,
        blockerResponse,
        users,
        blocker,
        results,
        countData,
        filterUsers,
        friendSenderData,
        friendRecieverData,
        cusData,
        valData;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      userArray.push(userID);

      userRole = await Roles.findOne({
        raw: true,
        where: {
          roleName: "User",
        },
      });

      users = await Users.findAll({
        raw: false,
        nest: true,
        where: {
          emailVerified: 1,
          isBlocked: false,
          isDelete: false,
          userName: { [Op.like]: SearchQuery + "%" },
        },

        include: [
          {
            model: db.friends,
            as: "receiver",
          },
          {
            model: db.friends,
            as: "sender",
          },
          {
            model: Permissions,
            where: {
              roleId: userRole.id,
            },
          },
          {
            model: UsersDetail,
            // where: {
            //   [Op.or]: [
            //     {
            //       firstName: {
            //         [Op.like]: SearchQuery + "%",
            //       },
            //     },
            //     {
            //       lastName: {
            //         [Op.like]: SearchQuery + "%",
            //       },
            //     },
            //     {
            //       phoneNumber: {
            //         [Op.like]: SearchQuery + "%",
            //       },
            //     },
            //   ],
            // },
          },
          {
            model: ImageData,
          },
        ],
      });

      blocker = await Block.findAll({ where: { blockedId: req.user.id } });

      blocker.forEach((res) => {
        blockerIds.push(res.blockerId);
      });

      blockerResponse = await Block.findAll({
        where: { blockerId: req.user.id },
      });

      blockerResponse.forEach((res) => {
        blockerResp.push(res.blockedId);
      });

      blockResult = users.filter((val) => !blockerResp.includes(val.id));

      results = blockResult.filter((val) => !blockerIds.includes(val.id));

      filterUsers = results.filter((item) => {
        if (item.id != req.user.id) {
          return item;
        }
      });

      friendSenderData = await Friends.findAll({
        where: { senderId: req.user.id, isPending: 0, isFriend: 1 },
      });

      friendSenderData.forEach((res) => {
        friendSenderIds.push(res.receiverId);
      });

      friendRecieverData = await Friends.findAll({
        where: { receiverId: req.user.id, isPending: 0, isFriend: 1 },
      });

      friendRecieverData.forEach((res) => {
        friendRecieverIds.push(res.senderId);
      });

      cusData = filterUsers.filter((val) => !friendSenderIds.includes(val.id));

      resData = cusData.filter((val) => !friendRecieverIds.includes(val.id));

      valData = resData.filter((val) => !userArray.includes(val.id));

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(valData.length / PageSize),
        totalRecords: valData.length,
      };

      return res.status(200).send({
        success: true,
        data: valData.slice(paginations.Start, paginations.End),
        countData,
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };


}
module.exports = Friend;
