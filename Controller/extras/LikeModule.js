const db = require("../../Model");
const Like = db.LikeModel;
const Merchant = db.MerchantDetails;
const Campaign = db.campaign;
exports.LikeMerchant = async (req, res) => {
  try {
    let merchant = await Merchant.findOne({
      where: {
        userId: req.params.id,
      },
    });
    if (!merchant)
      return res
        .status(200)
        .send({ code: 404, success: false, message: "Merchant Not Found! " });

    let Likes = await Like.findOne({
      where: {
        likeType: "Merchant",
        userId: req.user.id,
        likedId: req.params.id,
      },
    });

    if (Likes) {
      if (Likes.status) {
        let like = await Like.update(
          {
            status: false,
          },
          {
            where: {
              userId: req.user.id,
              likedId: req.params.id,
              likeType: "Merchant",
            },
          }
        );

        if (like) {
          let previousLikes = merchant.likes;
          await Merchant.update(
            {
              likes: previousLikes - 1,
            },
            {
              where: {
                userId: req.params.id,
              },
            }
          );

          await Like.destroy({
            where: {
              userId: req.user.id,
              likedId: req.params.id,
            },
          });

          res
            .status(200)
            .send({ success: true, message: "Merchant DisLiked !" });
        }
      } else {
        let like = await Like.update(
          {
            status: true,
          },
          {
            where: {
              userId: req.user.id,
              likedId: req.params.id,
              likeType: "Merchant",
            },
          }
        );

        if (like) {
          let previousLikes = merchant.likes;
          await Merchant.update(
            {
              likes: previousLikes + 1,
            },
            {
              where: {
                userId: req.params.id,
              },
            }
          );
          res.status(200).send({ success: true, message: "Merchant Liked !" });
        }
      }
    } else {
      let schema = {
        userId: req.user.id,
        likeType: "Merchant",
        likedId: req.params.id,
        status: true,
      };
      let like = await Like.create(schema);

      if (like) {
        let previousLikes = merchant.likes;
        await Merchant.update(
          {
            likes: previousLikes + 1,
          },
          {
            where: {
              userId: req.params.id,
            },
          }
        );
        res.status(200).send({ success: true, message: "Merchant Liked !" });
      } else {
        res
          .status(500)
          .send({ success: false, message: "SomeThing Went Wrong !" });
      }
    }
  } catch (error) {}
};

exports.LikeCampaing = async (req, res) => {
  try {
    let campaign = await Campaign.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!campaign)
      return res
        .status(200)
        .send({ code: 404, success: true, message: "Campaign Not Found! " });

    let Likes = await db.campaignLikes.findOne({
      where: {
        likeType: "Campaign",
        userId: req.user.id,
        likedId: req.params.id,
      },
    });

    if (Likes) {
      let like = await db.campaignLikes.destroy({
        where: {
          userId: req.user.id,
          likedId: req.params.id,
        },
      });

      if (like) {
        let previousLikes = campaign.likes;

        await Campaign.update(
          {
            likes: previousLikes - 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        await Campaign.update(
          {
            likes: previousLikes - 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );
        res.status(200).send({ success: true, message: "Campaign DisLiked !" });
      } else {
        let like = await Like.update(
          {
            status: true,
          },
          {
            where: {
              userId: req.user.id,
              likedId: req.params.id,
              likeType: "Campaign",
            },
          }
        );

        if (like) {
          let previousLikes = campaign.likes;
          await Campaign.update(
            {
              likes: previousLikes + 1,
            },
            {
              where: {
                id: req.params.id,
              },
            }
          );
          res.status(200).send({ success: true, message: "Campaign Liked !" });
        }
      }
    } else {
      let schema = {
        userId: req.user.id,
        likeType: "Campaign",
        likedId: req.params.id,
        status: true,
      };

      let like = await db.campaignLikes.create(schema);
      if (like) {
        let previousLikes = campaign.likes;
        await Campaign.update(
          {
            likes: previousLikes + 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );
        res.status(200).send({ success: true, message: "Campaign Liked !" });
      } else {
        res
          .status(500)
          .send({ success: false, message: "SomeThing Went Wrong !" });
      }
    }
  } catch (error) {
    res.status(500).send({ success: false, Error: error });
  }
};
