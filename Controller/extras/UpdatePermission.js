const db = require("../../Model");

const Permissions = db.permissions;
const {
  getUserToken,
  deleteUserStateToken,
  getUserStateToken,
} = require("../../cache/redis.service");
module.exports = async ({ req, res }) => {
  try {
    let payload = {
      canSeeActivities: req.body.canSeeActivities,
      canChatToMerchant: req.body.canChatToMerchant,
      canBlockCampion: req.body.canBlockCampion,
      canSeeCampion: req.body.canSeeCampion,
      canCreateProduct: req.body.canCreateProduct,
      canCreateCampion: req.body.canCreateCampion,
      canUpdateOwnAccount: req.body.canUpdateOwnAccount,
      canDeleteOwnAccount: req.body.canDeleteOwnAccount,
      canReadOwnAccount: req.body.canReadOwnAccount,
      canDeleteUser: req.body.canDeleteUser,
      canUpdateUser: req.body.canUpdateUser,
      canDeleteMerchant: req.body.canDeleteMerchant,
      canBlockMerchant: req.body.canBlockMerchant,
      canUpdateMerchant: req.body.canUpdateMerchant,
      canReadMerchant: req.body.canReadMerchant,
      canCreateMerchant: req.body.canCreateMerchant,
      canBlockAdmin: req.body.canBlockAdmin,
      canUpdateAdmin: req.body.canUpdateAdmin,
      canDeleteAdmin: req.body.canDeleteAdmin,
      canReadAdmin: req.body.canReadAdmin,
      canCreateAdmin: req.body.canCreateAdmin,
      canCreateUser: req.body.canCreateUser,
      canBlockUser: req.body.canBlockUser,
      canReadUser: req.body.canReadUser,
      canReadProduct: req.body.canReadProduct,
      canEditProduct: req.body.canEditProduct,
      canDeleteProduct: req.body.canDeleteProduct,
      canReadCategory: req.body.canReadCategory,
      canEditCategory: req.body.canEditCategory,
      canDeleteCategory: req.body.canDeleteCategory,
      canReadPromoCode: req.body.canReadPromoCode,
      canCreatePromoCode: req.body.canCreatePromoCode,
      canEditPromoCode: req.body.canEditPromoCode,
      canDeletePromoCode: req.body.canDeletePromoCode,
      canBlockPromoCode: req.body.canBlockPromoCode,
      canBlockCategory: req.body.canBlockCategory,
      canBlockProduct: req.body.canBlockProduct,
      canReadVoucherHistory: req.body.canReadVoucherHistory,
      canEditVoucherHistory: req.body.canEditVoucherHistory,
      canBlockVoucherHistory: req.body.canBlockVoucherHistory,
      canDeleteVoucherHistory: req.body.canDeleteVoucherHistory,
      canCreateVoucherHistory: req.body.canCreateVoucherHistory,

      canReadSubCategory: req.body.canReadSubCategory,
      canEditSubCategory: req.body.canEditSubCategory,
      canBlockSubCategory: req.body.canBlockSubCategory,
      canDeleteSubCategory: req.body.canDeleteSubCategory,
      canCreateSubCategory: req.body.canCreateSubCategory,
      canReadPaymentDetail: req.body.canReadPaymentDetail,
      canEditPaymentDetail: req.body.canEditPaymentDetail,
      canBlockPaymentDetail: req.body.canBlockPaymentDetail,
      canDeletePaymentDetail: req.body.canDeletePaymentDetail,
      canCreatePaymentDetail: req.body.canCreatePaymentDetail,

      canEditCampion: req.body.canEditCampion,
      canReadTransactionDetail: req.body.canReadTransactionDetail,
      canEditTransactionDetail: req.body.canEditTransactionDetail,
      canBlockTransactionDetail: req.body.canBlockTransactionDetail,
      canDeleteTransactionDetail: req.body.canDeleteTransactionDetail,
      canCreateTransactionDetail: req.body.canCreateTransactionDetail,

      canReadSupport: req.body.canReadSupport,
      canEditSupport: req.body.canEditSupport,
      canBlockSupport: req.body.canBlockSupport,
      canDeleteSupport: req.body.canDeleteSupport,
      canCreateSupport: req.body.canCreateSupport,

      canReadTermsCondition: req.body.canReadTermsCondition,
      canEditTermsCondition: req.body.canEditTermsCondition,
      canBlockTermsCondition: req.body.canBlockTermsCondition,
      canDeleteTermsCondition: req.body.canDeleteTermsCondition,
      canCreateTermsCondition: req.body.canCreateTermsCondition,

      canReadActivityLog: req.body.canReadActivityLog,
      canEditActivityLog: req.body.canEditActivityLog,
      canBlockActivityLog: req.body.canBlockActivityLog,
      canDeleteActivityLog: req.body.canDeleteActivityLog,
      canCreateActivityLog: req.body.canCreateActivityLog,
      canReadAboutUs: req.body.canReadAboutUs,
      canEditAboutUs: req.body.canEditAboutUs,
      canBlockAboutUs: req.body.canBlockAboutUs,
      canDeleteAboutUs: req.body.canDeleteAboutUs,
      canCreateAboutUs: req.body.canCreateAboutUs,
      canReadActionRadius: req.body.canReadActionRadius,
      canEditActionRadius: req.body.canEditActionRadius,
      canBlockActionRadius: req.body.canBlockActionRadius,
      canDeleteActionRadius: req.body.canDeleteActionRadius,
      canCreateActionRadius: req.body.canCreateActionRadius,

      canReadFaqs: req.body.canReadFaqs,
      canEditFaqs: req.body.canEditFaqs,
      canBlockFaqs: req.body.canBlockFaqs,
      canDeleteFaqs: req.body.canDeleteFaqs,
      canCreateFaqs: req.body.canCreateFaqs,

      canReadSalesTax: req.body.canReadSalesTax,
      canEditSalesTax: req.body.canEditSalesTax,
      canBlockSalesTax: req.body.canBlockSalesTax,
      canDeleteSalesTax: req.body.canDeleteSalesTax,
      canCreateSalesTax: req.body.canCreateSalesTax,
      canReadPercentRate: req.body.canReadPercentRate,
      canEditPercentRate: req.body.canEditPercentRate,
      canBlockPercentRate: req.body.canBlockPercentRate,
      canDeletePercentRate: req.body.canDeletePercentRate,
      canCreatePercentRate: req.body.canCreatePercentRate,
      canReadAdditionalFees: req.body.canReadAdditionalFees,
      canEditAdditionalFees: req.body.canEditAdditionalFees,
      canBlockAdditionalFees: req.body.canBlockAdditionalFees,
      canDeleteAdditionalFees: req.body.canCreateAdditionalFees,
      canCreateAdditionalFees: req.body.canCreateAdditionalFees,

      canReadAppBanners: req.body.canReadAppBanners,
      canEditAppBanners: req.body.canEditAppBanners,
      canBlockAppBanners: req.body.canBlockAppBanners,
      canDeleteAppBanners: req.body.canDeleteAppBanners,
      canCreateAppBanners: req.body.canCreateAppBanners,

      canReadHowToUse: req.body.canReadHowToUse,
      canEditHowToUse: req.body.canEditHowToUse,
      canBlockHowToUse: req.body.canBlockHowToUse,
      canDeleteHowToUse: req.body.canDeleteHowToUse,
      canCreateHowToUse: req.body.canCreateHowToUse,
      canCreateCategory: req.body.canCreateCategory,
      canDeleteCampion: req.body.canDeleteCampion,
      canReadRedemptions: req.body.canReadRedemptions,
      canUpdateRedemptions: req.body.canUpdateRedemptions,
      canDeleteRedemptions: req.body.canDeleteRedemptions,
      //
      canReadSale: req.body.canReadSale,
      canUpdateSale: req.body.canUpdateSale,
      canDeleteSale: req.body.canDeleteSale,
      //
      canCreateCounter: req.body.canCreateCounter,
      canReadCounter: req.body.canReadCounter,
      canUpdateCounter: req.body.canUpdateCounter,
      //
      canCreatePrivacyPolicy: req.body.canCreatePrivacyPolicy,
      canReadPrivacyPolicy: req.body.canReadPrivacyPolicy,
      canUpdatePrivacyPolicy: req.body.canUpdatePrivacyPolicy,
      canDeletePrivacyPolicy: req.body.canDeletePrivacyPolicy,
    };

    await Permissions.update(payload, {
      where: {
        userId: req.params.userId,
        roleId: req.params.roleId,
      },
    });
    let authtoken = await getUserToken(req.params.userId);
    let tokenauth = JSON.parse(authtoken);
    
     await deleteUserStateToken(tokenauth);
     await deleteUserStateToken(req.params.userId);
    return res.status(200).send({
      success: true,
      message: "Successfully Updated",
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message || "Something Went Wrong While Getting Roles!",
    });
  }
};
