const dbConfig = require("../config/db.config.js");
const { UsersModel } = require("./user.model");
const { ChatModel } = require("./Chat.models");
const { NotificationRouteModel } = require("./NotificationRoute.model");
const { NotificationModel } = require("./Notification.models");
const { AppSettingModel } = require("./AppSetting.model");
const { UsersDetailModel } = require("./userDetail.model");
const { roleModel } = require("./role.model");
const { permissions } = require("./permissions.model");
const { Emailverification } = require("./emailVerification.model");
const { ForgetPassword } = require("./forgetPassword.model");
const { blockUserModel } = require("./blockUser.model");
const { CategoryModel } = require("./category.model");
const { ProductModel } = require("./product.model");
const { SubCategoryModel } = require("./subCategory.model");
const { CampaignModel } = require("./campaign.model");
const { CampaignDetailModel } = require("./campaignDetail.model");
const { MerchantDetails } = require("./merchant.model");
const { VoucherGenModel } = require("./voucherGen.model");
const { VoucherShareModel } = require("./voucherShare.model");
const { ShippingModel } = require("./shippingStatus.model");
const { PromoCode } = require("./promoCode.model");
const { Orders } = require("./orders.model");
const { LikeModel, CampaignLikeModel } = require("./like.model");
const { AppliedPromocode } = require("./appliedPromocode.model");
const { FriendsModel } = require("./friends.model");
const { WishListModel } = require("./wishlist.model");
const { Terms } = require("./termsCondition.model");
const { About } = require("./aboutUs.model");
const { Contact, ContactUsInfo } = require("./contactUs.model");
const { Supportmodel } = require("./support.model");
const { FAQS } = require("./faqs.model");
const { HowToUse } = require("./howToUse.model");
const { AppBannerModel } = require("./appBanner.model");
const { ActionRadiusModel } = require("./actionRadius.model");
const { Percentrate } = require("./percentRate.model");
const { saleTaxModel } = require("./saleTax.model");
const { updatedSalTax } = require("./updatedSalTax.model");
const { BannerTypeModel } = require("./appBannerType.model");
const { Transaction } = require("./transaction.model");
const { TransactionDetail } = require("./transactionDetail.model");
const { ImageData } = require("./imageData.model");
const { exceptionModel } = require("./exception.model");
const { merchantCategoryModel } = require("./merchantCategory.model");
const { Sliderdata } = require("./slider.model");
const { GlobalCounter } = require("./globalCounter.model");
const { PrivacyPolicyModel } = require("./privacyPolicy.model");
const { ContactService } = require("./contactService.model");
const { voucherStatusModel } = require("./voucherStatus.model");
const { deliveryOptionModel } = require("./deliveryOption.model");
const { redeemeVoucherModel } = require("./redeemeVoucher.model");
const {
  voucherMerchantRedeemeModel,
} = require("./voucherMerchantRedeeme.model");
const { addToCartModel } = require("./addToCart.model");
const { deliveryTypeModel } = require("./deliveryType.model");

const Sequelize = require("sequelize");

const sequelize = new Sequelize("givees_dev", "root", "givees123", {
  host: "34.130.168.220",
  dialect: "mysql",
  operatorsAliases: false,
  pool: {
    max: 100,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = UsersModel(sequelize, Sequelize);
db.appsetting = AppSettingModel(sequelize, Sequelize);
db.friends = FriendsModel(sequelize, Sequelize);
db.transaction = Transaction(sequelize, Sequelize);
db.roles = roleModel(sequelize, Sequelize);
db.permissions = permissions(sequelize, Sequelize);
db.usersdetail = UsersDetailModel(sequelize, Sequelize);
db.promoCode = PromoCode(sequelize, Sequelize);
db.Emailverification = Emailverification(sequelize, Sequelize);
db.ForgetPassword = ForgetPassword(sequelize, Sequelize);
db.blockUserModel = blockUserModel(sequelize, Sequelize);
db.category = CategoryModel(sequelize, Sequelize);
db.product = ProductModel(sequelize, Sequelize);
db.AppliedPromocode = AppliedPromocode(sequelize, Sequelize);
db.SubCategory = SubCategoryModel(sequelize, Sequelize);
db.campaign = CampaignModel(sequelize, Sequelize);
db.campaignDetail = CampaignDetailModel(sequelize, Sequelize);
db.MerchantDetails = MerchantDetails(sequelize, Sequelize);
db.VoucherGen = VoucherGenModel(sequelize, Sequelize);
db.VoucherShareModel = VoucherShareModel(sequelize, Sequelize);
db.ShippingModel = ShippingModel(sequelize, Sequelize);
db.orders = Orders(sequelize, Sequelize);
db.LikeModel = LikeModel(sequelize, Sequelize);
db.transactionDetail = TransactionDetail(sequelize, Sequelize);
db.contactUsInfo = ContactUsInfo(sequelize, Sequelize);
db.VoucherShare = VoucherShareModel(sequelize, Sequelize);
db.VoucherShareReciever = VoucherShareModel(sequelize, Sequelize);
db.WishListModel = WishListModel(sequelize, Sequelize);
db.termsCondition = Terms(sequelize, Sequelize);
db.aboutUs = About(sequelize, Sequelize);
db.contactUs = Contact(sequelize, Sequelize);
db.Supportmodel = Supportmodel(sequelize, Sequelize);
db.Faqs = FAQS(sequelize, Sequelize);
db.HowToUse = HowToUse(sequelize, Sequelize);
db.BannerTypeModel = BannerTypeModel(sequelize, Sequelize);
db.AppBannerModel = AppBannerModel(sequelize, Sequelize);
db.ActionRadius = ActionRadiusModel(sequelize, Sequelize);
db.PercentRate = Percentrate(sequelize, Sequelize);
db.saleTaxModel = saleTaxModel(sequelize, Sequelize);
db.updatedSalTax = updatedSalTax(sequelize, Sequelize);
db.imageData = ImageData(sequelize, Sequelize);
db.exceptionModel = exceptionModel(sequelize, Sequelize);
db.merchantCategoryModel = merchantCategoryModel(sequelize, Sequelize);
db.Sliderdata = Sliderdata(sequelize, Sequelize);
db.GlobalCounter = GlobalCounter(sequelize, Sequelize);
db.PrivacyPolicyModel = PrivacyPolicyModel(sequelize, Sequelize);
db.ContactService = ContactService(sequelize, Sequelize);
db.campaignLikes = CampaignLikeModel(sequelize, Sequelize);
db.deliveryOption = deliveryOptionModel(sequelize, Sequelize);
db.voucherStatus = voucherStatusModel(sequelize, Sequelize);
db.voucherMerchantRedeeme = voucherMerchantRedeemeModel(sequelize, Sequelize);
db.redeemeVoucher = redeemeVoucherModel(sequelize, Sequelize);
db.addToCart = addToCartModel(sequelize, Sequelize);
db.deliveryType = deliveryTypeModel(sequelize, Sequelize);
db.VoucherGeneration = VoucherGenModel(sequelize, Sequelize);
db.VoucherShareModels = VoucherShareModel(sequelize, Sequelize);

db.users.hasMany(db.permissions);
db.users.hasMany(db.usersdetail);
db.users.hasOne(db.usersdetail, { foreignKey: "userId", as: "userDetailsF" });
db.users.hasMany(db.MerchantDetails);
db.chats = ChatModel(sequelize, Sequelize);
db.notificationroute = NotificationRouteModel(sequelize, Sequelize);
db.notification = NotificationModel(sequelize, Sequelize);
db.users.hasMany(db.orders, { foreignKey: "userId" });
db.orders.belongsTo(db.users);
db.VoucherGen.hasMany(db.orders, { foreignKey: "voucherId" });
db.orders.belongsTo(db.VoucherGen, { foreignKey: "voucherId" });
db.VoucherGen.hasMany(db.redeemeVoucher, {
  foreignKey: "voucherId",
  as: "RedeemeVo",
});
db.redeemeVoucher.belongsTo(db.VoucherGen, {
  foreignKey: "voucherId",
  as: "RedeemeVo",
});
db.campaign.hasMany(db.orders, { foreignKey: "campaignId" });
db.orders.belongsTo(db.campaign, { foreignKey: "campaignId" });
db.redeemeVoucher.hasMany(db.orders, { foreignKey: "redeemeVoucherId" });
db.orders.belongsTo(db.redeemeVoucher, { foreignKey: "redeemeVoucherId" });
db.redeemeVoucher.hasMany(db.voucherMerchantRedeeme, {
  foreignKey: "redeemeVoucherId",
});
db.voucherMerchantRedeeme.belongsTo(db.redeemeVoucher, {
  foreignKey: "redeemeVoucherId",
});
db.deliveryOption.hasMany(db.voucherMerchantRedeeme, {
  foreignKey: "redeemeDevOpId",
});
db.voucherMerchantRedeeme.belongsTo(db.deliveryOption, {
  foreignKey: "redeemeDevOpId",
});
db.deliveryType.hasOne(db.redeemeVoucher, { foreignKey: "redeemeDevTypeId" });
db.redeemeVoucher.belongsTo(db.deliveryType, {
  foreignKey: "redeemeDevTypeId",
});
db.voucherStatus.hasMany(db.voucherMerchantRedeeme, { foreignKey: "statusId" });
db.voucherMerchantRedeeme.belongsTo(db.voucherStatus, {
  foreignKey: "statusId",
});
db.users.hasMany(db.orders, { foreignKey: "merchantId", as: "Merchant" });
db.orders.belongsTo(db.users, { foreignKey: "merchantId", as: "Merchant" });
db.campaign.hasMany(db.redeemeVoucher, { foreignKey: "campaignId" });
db.redeemeVoucher.belongsTo(db.campaign, { foreignKey: "campaignId" });
db.users.hasMany(db.merchantCategoryModel);
db.merchantCategoryModel.belongsTo(db.users);
db.users.hasMany(db.transaction);
db.transaction.belongsTo(db.users);
db.transaction.hasMany(db.transactionDetail);
db.transactionDetail.belongsTo(db.transaction);
db.campaign.hasOne(db.transactionDetail, { foreignKey: "campaignId" });
db.transactionDetail.belongsTo(db.campaign, { foreignKey: "campaignId" });

db.transactionDetail.hasMany(db.VoucherGen, {
  foreignKey: "transactionDetailId",
});
db.VoucherGen.belongsTo(db.transactionDetail, {
  foreignKey: "transactionDetailId",
});
db.users.hasMany(db.chats, { foreignKey: "receiverId", as: "receiving" });
db.chats.belongsTo(db.users, { foreignKey: "receiverId", as: "receiving" });
db.users.hasMany(db.chats, { foreignKey: "senderId", as: "sending" });
db.chats.belongsTo(db.users, { foreignKey: "senderId", as: "sending" });
db.users.hasMany(db.notification, {
  foreignKey: "receiverId",
  as: "receiveby",
});
db.notification.belongsTo(db.users, {
  foreignKey: "receiverId",
  as: "receiveby",
});
db.users.hasMany(db.notification, { foreignKey: "senderId", as: "sendby" });
db.notification.belongsTo(db.users, { foreignKey: "senderId", as: "sendby" });
db.notificationroute.hasMany(db.notification, { foreignKey: "RouteId" });
db.notification.belongsTo(db.notificationroute, { foreignKey: "RouteId" });
db.friends.hasMany(db.chats, { foreignKey: "Friendsid", as: "Friends" });
db.chats.belongsTo(db.friends, { foreignKey: "Friendsid", as: "Friends" });
db.users.hasMany(db.friends, { foreignKey: "receiverId", as: "receiver" });
db.friends.belongsTo(db.users, { foreignKey: "receiverId" });
db.users.hasMany(db.friends, { foreignKey: "senderId", as: "sender" });
db.friends.belongsTo(db.users, { foreignKey: "senderId" });
db.MerchantDetails.hasMany(db.merchantCategoryModel, {
  foreignKey: "merchantDetailId",
});
db.merchantCategoryModel.belongsTo(db.MerchantDetails, {
  foreignKey: "merchantDetailId",
});
db.users.hasMany(db.voucherMerchantRedeeme, {
  foreignKey: "userId",
});
db.voucherMerchantRedeeme.belongsTo(db.users, {
  foreignKey: "userId",
});
db.category.hasMany(db.merchantCategoryModel);
db.merchantCategoryModel.belongsTo(db.category);
db.redeemeVoucher.belongsTo(db.users, { foreignKey: "userId" });
db.redeemeVoucher.belongsTo(db.VoucherGen, { foreignKey: "voucherId" });
db.redeemeVoucher.belongsTo(db.voucherStatus, { foreignKey: "statusId" });
db.redeemeVoucher.belongsTo(db.deliveryOption, {
  foreignKey: "redeemeDevOpId",
});
db.users.hasMany(db.permissions);
db.users.hasMany(db.usersdetail);
db.users.hasMany(db.MerchantDetails);
db.BannerTypeModel.hasMany(db.AppBannerModel, { foreignKey: "bannerType" });
db.AppBannerModel.belongsTo(db.BannerTypeModel, { foreignKey: "bannerType" });
db.users.hasOne(db.MerchantDetails);
db.MerchantDetails.belongsTo(db.users);
db.users.hasOne(db.usersdetail);
db.usersdetail.belongsTo(db.users);
db.category.hasMany(db.SubCategory);
db.SubCategory.belongsTo(db.category);
db.users.hasMany(db.campaign, { foreignKey: "merchantId" });
db.campaign.belongsTo(db.users, { foreignKey: "merchantId" });
db.campaign.hasMany(db.VoucherGen);
db.VoucherGen.belongsTo(db.campaign, { foreignKey: "campaignId" });
db.product.hasOne(db.VoucherGen, { foreignKey: "productId" });
db.VoucherGen.belongsTo(db.product, { foreignKey: "productId" });
db.VoucherGen.belongsTo(db.users, { foreignKey: "userId" });
db.category.hasMany(db.product);
db.SubCategory.hasMany(db.product);
db.product.belongsTo(db.category, { foreignKey: "categoryId" });
db.product.belongsTo(db.SubCategory, { foreignKey: "categoryId" });
db.VoucherGen.hasMany(db.VoucherShare);
db.VoucherShare.belongsTo(db.VoucherGen);
db.ShippingModel.hasMany(db.campaign, { foreignKey: "shippingStatus" });
db.campaign.belongsTo(db.ShippingModel, { foreignKey: "shippingStatus" });
db.campaign.hasMany(db.campaignDetail, { foreignKey: "campaignId" });
db.campaignDetail.belongsTo(db.campaign, { foreignKey: "campaignId" });
db.users.hasMany(db.campaign, { foreignKey: "merchantId" });
db.campaign.belongsTo(db.users, { foreignKey: "merchantId" });
db.product.hasMany(db.campaignDetail);
db.campaignDetail.belongsTo(db.product);
db.campaign.hasMany(db.WishListModel);
db.WishListModel.belongsTo(db.campaign);
db.campaign.hasMany(db.VoucherShare);
db.VoucherShare.belongsTo(db.campaign);
db.users.hasMany(db.VoucherShare, { foreignKey: "senderId" });
db.VoucherShare.belongsTo(db.users, { foreignKey: "senderId" });
db.users.hasMany(db.VoucherShare, { foreignKey: "senderId", as: "Receiver" });
db.VoucherShare.belongsTo(db.users, {
  foreignKey: "receiverId",
  as: "Receiver",
});
db.VoucherGen.hasMany(db.VoucherShare, {
  foreignKey: "referenceId",
  as: "vouchShare",
});
db.VoucherShare.belongsTo(db.VoucherGen, {
  foreignKey: "referenceId",
  as: "vouchShare",
});
db.VoucherShare.belongsTo(db.voucherStatus, { foreignKey: "statusId" });
db.VoucherShare.belongsTo(db.product, { foreignKey: "productId" });
db.VoucherShareReciever.belongsTo(db.campaign, { foreignKey: "campaignId" });
db.VoucherShareReciever.belongsTo(db.voucherStatus, { foreignKey: "statusId" });
db.orders.belongsTo(db.voucherStatus, { foreignKey: "statusId" });
db.VoucherShareReciever.belongsTo(db.product, { foreignKey: "productId" });
db.VoucherShareReciever.belongsTo(db.users, { foreignKey: "receiverId" });
db.ShippingModel.hasMany(db.campaign, { foreignKey: "shippingStatus" });
db.campaign.belongsTo(db.ShippingModel, { foreignKey: "shippingStatus" });
db.campaign.hasMany(db.campaignDetail, { foreignKey: "campaignId" });
db.campaignDetail.belongsTo(db.campaign, { foreignKey: "campaignId" });
db.users.hasMany(db.campaign, { foreignKey: "merchantId" });
db.campaign.belongsTo(db.users, { foreignKey: "merchantId" });
db.product.hasMany(db.campaignDetail);
db.campaignDetail.belongsTo(db.product);
db.usersdetail.hasMany(db.blockUserModel, { foreignKey: "blockerId" });
db.blockUserModel.belongsTo(db.usersdetail, { foreignKey: "blockerId" });
db.usersdetail.hasMany(db.blockUserModel, {
  foreignKey: "blockedId",
  as: "blocked",
});
db.blockUserModel.belongsTo(db.usersdetail, {
  foreignKey: "blockedId",
  as: "blocked",
});
db.users.hasMany(db.blockUserModel, {
  foreignKey: "blockedId",
  as: "BlockUsersDetail",
});
db.blockUserModel.belongsTo(db.users, {
  foreignKey: "blockedId",
  as: "BlockUsersDetail",
});
db.permissions.hasMany(db.blockUserModel, { foreignKey: "blockerId" });
db.blockUserModel.belongsTo(db.permissions, { foreignKey: "blockerId" });
db.users.hasMany(db.product, { foreignKey: "merchantId" });
db.product.belongsTo(db.users, { foreignKey: "merchantId" });
db.users.hasMany(db.LikeModel, { foreignKey: "likedId", as: "Likes" });
db.LikeModel.belongsTo(db.users, { foreignKey: "likedId", as: "Likes" });
db.users.hasMany(db.campaignLikes, { foreignKey: "likedId" });
db.campaignLikes.belongsTo(db.users, { foreignKey: "likedId" });
db.users.hasMany(db.campaignLikes, { foreignKey: "likedId" });
db.campaignLikes.belongsTo(db.users, { foreignKey: "likedId" });
db.users.hasMany(db.campaignLikes, { foreignKey: "userId" });
db.campaignLikes.belongsTo(db.users, { foreignKey: "userId" });
db.campaign.hasMany(db.campaignLikes, { foreignKey: "likedId" });
db.campaignLikes.belongsTo(db.campaign, { foreignKey: "likedId" });
db.SubCategory.hasMany(db.product);
db.product.belongsTo(db.SubCategory);
db.campaign.hasMany(db.AppBannerModel, { foreignKey: "campaingId" });
db.AppBannerModel.belongsTo(db.campaign, { foreignKey: "campaingId" });
db.users.hasMany(db.LikeModel, { foreignKey: "userId" });
db.LikeModel.belongsTo(db.users, { foreignKey: "userId" });
db.users.hasMany(db.WishListModel, { foreignKey: "userId" });
db.WishListModel.belongsTo(db.users, { foreignKey: "userId" });
db.campaign.hasMany(db.campaignDetail, { foreignKey: "campaignId" });
db.campaignDetail.belongsTo(db.campaign, { foreignKey: "campaignId" });
db.users.hasMany(db.imageData, { foreignKey: "userId" });
db.imageData.belongsTo(db.users, { foreignKey: "userId" });
module.exports = db;
