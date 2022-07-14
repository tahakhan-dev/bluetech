const CampaignController = require("../Controller/campaigns/campaign.controller");
const fileUpload = require("../Controller/extras/FileUpload");
const upload = fileUpload("image");

var router = require("express").Router();
let Token = require("../Middleware/token");
let Campaign = new CampaignController();

router.post(
  "/create",
  Token.isAuthenticated(),
  upload.array("campaignImage"),
  Campaign.create
);

router.put(
  "/update_step_1/:id",
  Token.isAuthenticated(),
  upload.array("campaignImage"),
  Campaign.update_step_1
);

router.put(
  "/update_step_2/:id",
  Token.isAuthenticated(),
  Campaign.update_step_2
);

router.get("/getAllCampaign/:ActionId", Campaign.getAllCampaing);

router.get(
  "/fetchAllCampaign",
  Token.isAuthenticated(),
  Campaign.fetchAllCampaign
);

router.post("/fetchActiveCampaigns", Campaign.fetchActiveCampaigns);

router.get("/campaingget/:id", Campaign.getcampaings);

router.get("/campainggetbymerchantId/:id", Campaign.getcampaingsByMerchantId);

router.get("/activateCampaign/:id",Token.isAuthenticated(), Campaign.activateCampaign);

router.get(
  "/getCampaignByLocation",
  Token.isAuthenticated(),
  Campaign.getCampaignByLocation
);

router.delete(
  "/deleteCampaign/:id",
  Token.isAuthenticated(),
  Campaign.deleteCampaing
);

router.get("/searchCampaign", Campaign.searchCampaign);

router.get("/searchCampaignbyAdmin/:ActionId", Campaign.searchCampaignbyAdmin);

module.exports = router;
