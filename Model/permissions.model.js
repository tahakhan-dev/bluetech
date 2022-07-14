const Joi = require("joi");

function permissions(sequelize, Sequelize) {
  const permission = sequelize.define("permissions", {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    roleId: {
      type: Sequelize.INTEGER,
      references: {
        model: "roles",
        key: "id",
      },
    },
    canCreateAdmin: {
      type: Sequelize.BOOLEAN,
    },
    canReadAdmin: {
      type: Sequelize.BOOLEAN,
    },
    canUpdateAdmin: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteAdmin: {
      type: Sequelize.BOOLEAN,
    },
    canBlockAdmin: {
      type: Sequelize.BOOLEAN,
    },
    canCreateMerchant: {
      type: Sequelize.BOOLEAN,
    },
    canReadMerchant: {
      type: Sequelize.BOOLEAN,
    },
    canBlockMerchant: {
      type: Sequelize.BOOLEAN,
    },
    //
    canUpdateMerchant: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteMerchant: {
      type: Sequelize.BOOLEAN,
    },
    canCreateUser: {
      type: Sequelize.BOOLEAN,
    },
    canBlockUser: {
      type: Sequelize.BOOLEAN,
    },
    canReadUser: {
      type: Sequelize.BOOLEAN,
    },
    //
    canUpdateUser: {
      type: Sequelize.BOOLEAN,
    },

    canDeleteUser: {
      type: Sequelize.BOOLEAN,
    },

    canReadOwnAccount: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteOwnAccount: {
      type: Sequelize.BOOLEAN,
    },
    canUpdateOwnAccount: {
      type: Sequelize.BOOLEAN,
    },
    canCreateCampion: {
      type: Sequelize.BOOLEAN,
    },
    canCreateProduct: {
      type: Sequelize.BOOLEAN,
    },
    canSeeCampion: {
      type: Sequelize.BOOLEAN,
    },
    canBlockCampion: {
      type: Sequelize.BOOLEAN,
    },
    canChatToMerchant: {
      type: Sequelize.BOOLEAN,
    },
    canSeeActivities: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteProduct: {
      type: Sequelize.BOOLEAN,
    },
    canEditProduct: {
      type: Sequelize.BOOLEAN,
    },
    canReadProduct: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteCategory: {
      type: Sequelize.BOOLEAN,
    },
    canReadCategory: {
      type: Sequelize.BOOLEAN,
    },
    canEditCategory: {
      type: Sequelize.BOOLEAN,
    },
    canReadPromoCode: {
      type: Sequelize.BOOLEAN,
    },
    canCreatePromoCode: {
      type: Sequelize.BOOLEAN,
    },
    canEditPromoCode: {
      type: Sequelize.BOOLEAN,
    },
    canDeletePromoCode: {
      type: Sequelize.BOOLEAN,
    },

    //
    canBlockPromoCode: {
      type: Sequelize.BOOLEAN,
    },
    canBlockCategory: {
      type: Sequelize.BOOLEAN,
    },
    canBlockProduct: {
      type: Sequelize.BOOLEAN,
    },
    canReadVoucherHistory: {
      type: Sequelize.BOOLEAN,
    },
    canEditVoucherHistory: {
      type: Sequelize.BOOLEAN,
    },
    canBlockVoucherHistory: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteVoucherHistory: {
      type: Sequelize.BOOLEAN,
    },
    canCreateVoucherHistory: {
      type: Sequelize.BOOLEAN,
    },
    canCreateCategory: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteCampion: {
      type: Sequelize.BOOLEAN,
    },
    //
    canReadSubCategory: {
      type: Sequelize.BOOLEAN,
    },
    canEditSubCategory: {
      type: Sequelize.BOOLEAN,
    },
    canBlockSubCategory: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteSubCategory: {
      type: Sequelize.BOOLEAN,
    },
    canCreateSubCategory: {
      type: Sequelize.BOOLEAN,
    },
    //
    canReadPaymentDetail: {
      type: Sequelize.BOOLEAN,
    },
    canEditPaymentDetail: {
      type: Sequelize.BOOLEAN,
    },
    canBlockPaymentDetail: {
      type: Sequelize.BOOLEAN,
    },
    canDeletePaymentDetail: {
      type: Sequelize.BOOLEAN,
    },
    canCreatePaymentDetail: {
      type: Sequelize.BOOLEAN,
    },

    //
    canEditCampion: {
      type: Sequelize.BOOLEAN,
    },
    //
    canReadTransactionDetail: {
      type: Sequelize.BOOLEAN,
    },
    canEditTransactionDetail: {
      type: Sequelize.BOOLEAN,
    },
    canBlockTransactionDetail: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteTransactionDetail: {
      type: Sequelize.BOOLEAN,
    },
    canCreateTransactionDetail: {
      type: Sequelize.BOOLEAN,
    },

    //
    canReadSupport: {
      type: Sequelize.BOOLEAN,
    },
    canEditSupport: {
      type: Sequelize.BOOLEAN,
    },
    canBlockSupport: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteSupport: {
      type: Sequelize.BOOLEAN,
    },
    canCreateSupport: {
      type: Sequelize.BOOLEAN,
    },

    //
    canReadTermsCondition: {
      type: Sequelize.BOOLEAN,
    },
    canEditTermsCondition: {
      type: Sequelize.BOOLEAN,
    },
    canBlockTermsCondition: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteTermsCondition: {
      type: Sequelize.BOOLEAN,
    },
    canCreateTermsCondition: {
      type: Sequelize.BOOLEAN,
    },

    //
    canReadActivityLog: {
      type: Sequelize.BOOLEAN,
    },
    canEditActivityLog: {
      type: Sequelize.BOOLEAN,
    },
    canBlockActivityLog: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteActivityLog: {
      type: Sequelize.BOOLEAN,
    },
    canCreateActivityLog: {
      type: Sequelize.BOOLEAN,
    },
    //
    canReadAboutUs: {
      type: Sequelize.BOOLEAN,
    },
    canEditAboutUs: {
      type: Sequelize.BOOLEAN,
    },
    canBlockAboutUs: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteAboutUs: {
      type: Sequelize.BOOLEAN,
    },
    canCreateAboutUs: {
      type: Sequelize.BOOLEAN,
    },
    //
    canReadContactUs: {
      type: Sequelize.BOOLEAN,
    },
    canEditContactUs: {
      type: Sequelize.BOOLEAN,
    },
    canBlockContactUs: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteContactUs: {
      type: Sequelize.BOOLEAN,
    },
    canCreateContactUs: {
      type: Sequelize.BOOLEAN,
    },
    //
    canReadActionRadius: {
      type: Sequelize.BOOLEAN,
    },
    canEditActionRadius: {
      type: Sequelize.BOOLEAN,
    },
    canBlockActionRadius: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteActionRadius: {
      type: Sequelize.BOOLEAN,
    },
    canCreateActionRadius: {
      type: Sequelize.BOOLEAN,
    },

    //
    canReadFaqs: {
      type: Sequelize.BOOLEAN,
    },
    canEditFaqs: {
      type: Sequelize.BOOLEAN,
    },
    canBlockFaqs: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteFaqs: {
      type: Sequelize.BOOLEAN,
    },
    canCreateFaqs: {
      type: Sequelize.BOOLEAN,
    },

    //
    canReadSalesTax: {
      type: Sequelize.BOOLEAN,
    },
    canEditSalesTax: {
      type: Sequelize.BOOLEAN,
    },
    canBlockSalesTax: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteSalesTax: {
      type: Sequelize.BOOLEAN,
    },
    canCreateSalesTax: {
      type: Sequelize.BOOLEAN,
    },
    //
    canReadPercentRate: {
      type: Sequelize.BOOLEAN,
    },
    canEditPercentRate: {
      type: Sequelize.BOOLEAN,
    },
    canBlockPercentRate: {
      type: Sequelize.BOOLEAN,
    },
    canDeletePercentRate: {
      type: Sequelize.BOOLEAN,
    },
    canCreatePercentRate: {
      type: Sequelize.BOOLEAN,
    },
    // /
    canReadAdditionalFees: {
      type: Sequelize.BOOLEAN,
    },
    canEditAdditionalFees: {
      type: Sequelize.BOOLEAN,
    },
    canBlockAdditionalFees: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteAdditionalFees: {
      type: Sequelize.BOOLEAN,
    },
    canCreateAdditionalFees: {
      type: Sequelize.BOOLEAN,
    },
    // /

    canReadAppBanners: {
      type: Sequelize.BOOLEAN,
    },
    canEditAppBanners: {
      type: Sequelize.BOOLEAN,
    },
    canBlockAppBanners: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteAppBanners: {
      type: Sequelize.BOOLEAN,
    },
    canCreateAppBanners: {
      type: Sequelize.BOOLEAN,
    },
    // /

    canReadHowToUse: {
      type: Sequelize.BOOLEAN,
    },
    canEditHowToUse: {
      type: Sequelize.BOOLEAN,
    },
    canBlockHowToUse: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteHowToUse: {
      type: Sequelize.BOOLEAN,
    },
    canCreateHowToUse: {
      type: Sequelize.BOOLEAN,
    },

    canReadRedemptions: {
      type: Sequelize.BOOLEAN,
    },
    canUpdateRedemptions: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteRedemptions: {
      type: Sequelize.BOOLEAN,
    },
    canReadSale: {
      type: Sequelize.BOOLEAN,
    },
    canUpdateSale: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteSale: {
      type: Sequelize.BOOLEAN,
    },
    canCreateCounter: {
      type: Sequelize.BOOLEAN,
    },
    canReadCounter: {
      type: Sequelize.BOOLEAN,
    },
    canUpdateCounter: {
      type: Sequelize.BOOLEAN,
    },
    canCreatePrivacyPolicy: {
      type: Sequelize.BOOLEAN,
    },
    canReadPrivacyPolicy: {
      type: Sequelize.BOOLEAN,
    },
    canUpdatePrivacyPolicy: {
      type: Sequelize.BOOLEAN,
    },
    canDeletePrivacyPolicy: {
      type: Sequelize.BOOLEAN,
    },
    canCreateContactService: {
      type: Sequelize.BOOLEAN,
    },
    canDeleteContactService: {
      type: Sequelize.BOOLEAN,
    },
    canEditContactService: {
      type: Sequelize.BOOLEAN,
    },
    canReadContactService: {
      type: Sequelize.BOOLEAN,
    },
    canCreateQuestion: {
      type: Sequelize.BOOLEAN,
    },
  });

  return permission;
}
exports.permissions = permissions;

function validatePermission(User) {
  const schema = {
    userName: Joi.string().required().min(8).max(255),
    email: Joi.string().required().min(10).max(255).email(),
    password: Joi.string().required().min(6).max(255),
    roleId: Joi.number().required(),
  };
  return Joi.validate(User, schema);
}
exports.validatePermission = validatePermission;
