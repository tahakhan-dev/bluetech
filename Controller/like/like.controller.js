const { LikeCampaing, LikeMerchant } = require("../extras/LikeModule");
class Like {
  LikeMerchant = async (req, res) => {
    LikeMerchant(req, res);
  };

  LikeCampaing = async (req, res) => {
    LikeCampaing(req, res);
  };
}
module.exports = Like;
