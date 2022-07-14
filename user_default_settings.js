const db = require("./Model");
const bcrypt = require("bcrypt");
const {
  superAdminPermission,
  merchantPermission,
  userPermission,
} = require("./Controller/extras/Permission");

// const Chat = db.chat
// const ChatUser = db.chatUsers
// const Message = db.messages

exports.default_settings = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let shipping;
      let appBanner;
      let role;
      let permissionDefine,
        isChat,
        devType,
        permissionDefine1,
        permissionDefine2,
        permissionDefine3,
        permissionDefine4,
        permissionDefine5,
        permissionDefine6;
      let voucherStatues;
      let devOption;

      shipping = await db.ShippingModel.findOne({
        where: { ShippingName: "delivery" },
      });
      if (!shipping) {
        await db.ShippingModel.create({
          ShippingName: "delivery",
          curbsite: false,
        });
      }

      shipping = await db.ShippingModel.findOne({
        where: { ShippingName: "delivery/pickup" },
      });
      isChat = await db.appsetting.findOne({
        where: { id: 1 },
      });
      if (!isChat) {
        await db.appsetting.create({
          Name: "Chat",
          IsActive: 0,
          SoftDelete: 0,
        });
      }

      shipping = await db.ShippingModel.findOne({
        where: { ShippingName: "pickup" },
      });
      if (!shipping) {
        await db.ShippingModel.create({
          ShippingName: "pickup",
          curbsite: true,
        });
      }

      appBanner = await db.BannerTypeModel.findOne({
        where: { bannerType: "NotClickable" },
      });
      if (!appBanner) {
        await db.BannerTypeModel.create({
          bannerType: "NotClickable",
        });
      }

      appBanner = await db.BannerTypeModel.findOne({
        where: { bannerType: "ClickableByUrl" },
      });
      if (!appBanner) {
        await db.BannerTypeModel.create({
          bannerType: "ClickableByUrl",
        });
      }

      appBanner = await db.BannerTypeModel.findOne({
        where: { bannerType: "ClickableByCampaign" },
      });
      if (!appBanner) {
        await db.BannerTypeModel.create({
          bannerType: "ClickableByCampaign",
        });
      }

      role = await db.roles.findOne({
        where: { roleName: "Super Admin" },
      });
      if (!role) {
        await db.roles.create({
          roleName: "Super Admin",
        });
      }

      role = await db.roles.findOne({
        where: { roleName: "Admin" },
      });
      if (!role) {
        await db.roles.create({
          roleName: "Admin",
        });
      }

      role = await db.roles.findOne({
        where: { roleName: "Merchant" },
      });
      if (!role) {
        await db.roles.create({
          roleName: "Merchant",
        });
      }

      role = await db.roles.findOne({
        where: { roleName: "User" },
      });
      if (!role) {
        await db.roles.create({
          roleName: "User",
        });
      }

      voucherStatues = await db.voucherStatus.findOne({
        where: { status: "Pending" },
      });

      if (!voucherStatues) {
        await db.voucherStatus.create({
          status: "Pending",
        });
      }

      voucherStatues = await db.voucherStatus.findOne({
        where: { status: "Approved" },
      });

      if (!voucherStatues) {
        await db.voucherStatus.create({
          status: "Approved",
        });
      }

      voucherStatues = await db.voucherStatus.findOne({
        where: { status: "Declined" },
      });

      if (!voucherStatues) {
        await db.voucherStatus.create({
          status: "Declined",
        });
      }

      voucherStatues = await db.voucherStatus.findOne({
        where: { status: "Processing" },
      });

      if (!voucherStatues) {
        await db.voucherStatus.create({
          status: "Processing",
        });
      }

      voucherStatues = await db.voucherStatus.findOne({
        where: { status: "Delivered" },
      });

      if (!voucherStatues) {
        await db.voucherStatus.create({
          status: "Delivered",
        });
      }

      devType = await db.deliveryType.findOne({
        where: { deliveryTypeName: "Delivery" },
      });

      if (!devType) {
        await db.deliveryType.create({
          deliveryTypeName: "Delivery",
        });
      }

      devType = await db.deliveryType.findOne({
        where: { deliveryTypeName: "Curb Delivery" },
      });

      if (!devType) {
        await db.deliveryType.create({
          deliveryTypeName: "Curb Delivery",
        });
      }

      devType = await db.deliveryType.findOne({
        where: { deliveryTypeName: "Pickup" },
      });

      if (!devType) {
        await db.deliveryType.create({
          deliveryTypeName: "Pickup",
        });
      }

      devOption = await db.deliveryOption.findOne({
        where: { deliveryName: "Local Free Delivery Or Curb Side" },
      });

      if (!devOption) {
        await db.deliveryOption.create({
          deliveryName: "Local Free Delivery Or Curb Side",
        });
      }

      devOption = await db.deliveryOption.findOne({
        where: { deliveryName: "Pick Up" },
      });

      if (!devOption) {
        await db.deliveryOption.create({
          deliveryName: "Pick Up",
        });
      }

      permissionDefine = superAdminPermission;
      permissionDefine1 = userPermission;
      permissionDefine2 = userPermission;
      permissionDefine3 = userPermission;
      permissionDefine4 = userPermission;
      permissionDefine5 = merchantPermission;
      permissionDefine6 = merchantPermission;

      let details = {
        firstName: "Givees",
        lastName: "Givees",
        userId: null,
      };
      let details1 = {
        firstName: "Atif",
        lastName: "Khan",
        userId: null,
      };
      let details2 = {
        firstName: "Omer",
        lastName: "Khan",
        userId: null,
      };
      let details3 = {
        firstName: "Asma",
        lastName: "Givees",
        userId: null,
      };
      let details4 = {
        firstName: "Usher",
        lastName: "Khan",
        userId: null,
      };
      let details5 = {
        firstName: "Ikram",
        lastName: "Khan",
        userId: null,
      };
      let details6 = {
        firstName: "Ali",
        lastName: "Khan",
        userId: null,
      };

      const user = {
        userName: "givees",
        email: "superadmin@givees.com",
        password: "password",
        emailVerified: 1,
      };
      const user1 = {
        userName: "Atif007",
        email: "atif@givees.com",
        password: "Password@1",
        emailVerified: 1,
      };
      const user2 = {
        userName: "Omer007",
        email: "Omer@givees.com",
        password: "Password@1",
        emailVerified: 1,
      };
      const user3 = {
        userName: "Asma007",
        email: "Asma@givees.com",
        password: "Password@1",
        emailVerified: 1,
      };
      const user4 = {
        userName: "Usher007",
        email: "Usher@givees.com",
        password: "Password@1",
        emailVerified: 1,
      };
      const user5 = {
        userName: "Ikram007",
        email: "Ikram@givees.com",
        password: "Password@1",
        emailVerified: 1,
      };
      const user6 = {
        userName: "Ali007",
        email: "Ali@givees.com",
        password: "Password@1",
        emailVerified: 1,
      };
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      user1.password = await bcrypt.hash(user1.password, salt);
      user2.password = await bcrypt.hash(user2.password, salt);
      user3.password = await bcrypt.hash(user3.password, salt);
      user4.password = await bcrypt.hash(user4.password, salt);
      user5.password = await bcrypt.hash(user5.password, salt);
      user6.password = await bcrypt.hash(user6.password, salt);

      let foundUser = await db.users.findOne({
        where: { email: "superadmin@givees.com" },
      });
      let foundUser1 = await db.users.findOne({
        where: { email: "atif@givees.com" },
      });
      let foundUser2 = await db.users.findOne({
        where: { email: "Omer@givees.com" },
      });
      let foundUser3 = await db.users.findOne({
        where: { email: "Asma@givees.com" },
      });
      let foundUser4 = await db.users.findOne({
        where: { email: "Usher@givees.com" },
      });
      let foundUser5 = await db.users.findOne({
        where: { email: "Ikram@givees.com" },
      });
      let foundUser6 = await db.users.findOne({
        where: { email: "Ali@givees.com" },
      });
      if (!foundUser) {
        let userResponse = await db.users.create(user);
        const newUserId = userResponse.dataValues.id;
        details.userId = newUserId;
        permissionDefine.userId = newUserId;
        permissionDefine.roleId = 1;
        let foundDetails = await db.usersdetail.findOne({
          where: { firstName: "Givees", userId: newUserId },
        });
        if (!foundDetails) {
          await db.usersdetail.create(details);

          let foundPermissions = await db.permissions.findAll();
          if (foundPermissions.length == 0) {
            await db.permissions.create(permissionDefine);
          }
        }

        resolve();
      } else {
        reject();
      }
      if (!foundUser1) {
        let userResponse = await db.users.create(user1);
        const newUserId = userResponse.dataValues.id;
        details1.userId = newUserId;
        permissionDefine1.userId = newUserId;
        permissionDefine1.roleId = 4;
        let foundDetails1 = await db.usersdetail.findOne({
          where: { firstName: "Atif", userId: newUserId },
        });
        if (!foundDetails1) {
          await db.usersdetail.create(details1);
          await db.permissions.create(permissionDefine1);
        }
        resolve();
      } else {
        reject();
      }
      if (!foundUser2) {
        let userResponse = await db.users.create(user2);
        const newUserId = userResponse.dataValues.id;
        details2.userId = newUserId;
        permissionDefine2.userId = newUserId;
        permissionDefine2.roleId = 4;
        let foundDetails = await db.usersdetail.findOne({
          where: { firstName: "Omer", userId: newUserId },
        });
        if (!foundDetails) {
          await db.usersdetail.create(details2);
          await db.permissions.create(permissionDefine2);
        }
        resolve();
      } else {
        reject();
      }
      if (!foundUser3) {
        let userResponse = await db.users.create(user3);
        const newUserId = userResponse.dataValues.id;
        details3.userId = newUserId;
        permissionDefine3.userId = newUserId;
        permissionDefine3.roleId = 4;
        let foundDetails = await db.usersdetail.findOne({
          where: { firstName: "Asma", userId: newUserId },
        });
        if (!foundDetails) {
          await db.usersdetail.create(details3);
          await db.permissions.create(permissionDefine3);
        }
        resolve();
      } else {
        reject();
      }
      if (!foundUser4) {
        let userResponse = await db.users.create(user4);
        const newUserId = userResponse.dataValues.id;
        details4.userId = newUserId;
        permissionDefine4.userId = newUserId;
        permissionDefine4.roleId = 4;
        let foundDetails = await db.usersdetail.findOne({
          where: { firstName: "Usher", userId: newUserId },
        });
        if (!foundDetails) {
          await db.usersdetail.create(details4);
          await db.permissions.create(permissionDefine4);
        }
        resolve();
      } else {
        reject();
      }
      if (!foundUser5) {
        let userResponse = await db.users.create(user5);
        const newUserId = userResponse.dataValues.id;
        details5.userId = newUserId;
        permissionDefine5.userId = newUserId;
        permissionDefine5.roleId = 3;
        let foundDetails = await db.usersdetail.findOne({
          where: { firstName: "Ikram", userId: newUserId },
        });
        if (!foundDetails) {
          await db.usersdetail.create(details5);
          await db.permissions.create(permissionDefine5);
        }
        resolve();
      } else {
        reject();
      }
      if (!foundUser6) {
        let userResponse = await db.users.create(user6);
        const newUserId = userResponse.dataValues.id;
        details6.userId = newUserId;
        permissionDefine6.userId = newUserId;
        permissionDefine6.roleId = 3;
        let foundDetails = await db.usersdetail.findOne({
          where: { firstName: "Ali", userId: newUserId },
        });
        if (!foundDetails) {
          await db.usersdetail.create(details6);
          await db.permissions.create(permissionDefine6);
        }
        resolve();
      } else {
        reject();
      }

      let Category = await db.category.findOne({
        where: { name: "Organic Category" },
      });

      if (!Category) {
        await db.category.create({
          name: "Organic Category",
          description: "nothing new just old one",
          weight: 123,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      let Category2 = await db.category.findOne({
        where: { name: "InOrganic Category" },
      });

      if (!Category2) {
        await db.category.create({
          name: "InOrganic Category",
          description: "nothing new just old one",
          weight: 123,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      let cat1 = await db.category.findOne({
        where: { name: "Organic Category" },
      });

      let SubCategory = await db.SubCategory.findOne({
        where: { name: "Hair Products" },
      });

      if (!SubCategory) {
        await db.SubCategory.create({
          categoryId: cat1.id,
          name: "Hair Products",
          description: "new products available",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      let cat2 = await db.category.findOne({
        where: { name: "InOrganic Category" },
      });

      let SubCategory2 = await db.SubCategory.findOne({
        where: { name: "Shoes Products" },
      });

      if (!SubCategory2) {
        await db.SubCategory.create({
          categoryId: cat2.id,
          name: "Shoes Products",
          description: "new products available",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      let usersMer = await db.users.findOne({
        where: { email: "Ikram@givees.com" },
      });

      if (usersMer) {
        let mer = await db.MerchantDetails.findOne({
          where: { userId: usersMer.id },
        });
        if (!mer) {
          await db.MerchantDetails.create({
            userId: usersMer.id,
            bussinessName: "Orgainc",
            storeName: "Everglow store",
            webSiteUrl: "https://everglowstore.com",
            merchantCode: "abc123",
            likes: 0,
            receiveNotification: 1,
            lat: "24.873880804406987",
            lng: "67.05696344375612",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          let merde = await db.MerchantDetails.findOne({
            where: { userId: usersMer.id },
          });

          if (merde) {
            await db.merchantCategoryModel.create({
              merchantDetailId: merde.id,
              userId: merde.userId,
              categoryId: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        }
      }

      let usersMer1 = await db.users.findOne({
        where: { email: "Ali@givees.com" },
      });

      if (usersMer1) {
        let mer1 = await db.MerchantDetails.findOne({
          where: { userId: usersMer1.id },
        });
        if (!mer1) {
          await db.MerchantDetails.create({
            userId: usersMer1.id,
            bussinessName: "Sports",
            storeName: "Heaven store",
            webSiteUrl: "https://heavenstore.com",
            merchantCode: "xyz123",
            likes: 0,
            receiveNotification: 1,
            lat: "24.873880804406987",
            lng: "67.05696344375612",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          let merde1 = await db.MerchantDetails.findOne({
            where: { userId: usersMer1.id },
          });

          if (merde1) {
            await db.merchantCategoryModel.create({
              merchantDetailId: merde1.id,
              userId: merde1.userId,
              categoryId: 2,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};
