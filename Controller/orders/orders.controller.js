const db = require("../../Model");
const _ = require("lodash");

const { users } = require("../../Model");
const { ArraySlicePagination } = require("../extras/pagination/pagination");

const Orders = db.orders;
const VoucherGen = db.VoucherGen;
const Campaign = db.campaign;
const CampaignDetail = db.campaignDetail;
const SubCategory = db.SubCategory;
const Category = db.category;
const Product = db.product;
const Permissions = db.permissions;
const RedeemeVoucher = db.redeemeVoucher;
const VoucherMerchantRedeeme = db.voucherMerchantRedeeme;
const DeliveryOptions = db.deliveryOption;
const DeliveryType = db.deliveryType;
const VoucherStatus = db.voucherStatus;
const User = db.users;
const UserDetail = db.usersdetail;
const ImageData = db.imageData;
const Op = db.Sequelize.Op;
class Order {
  create = async (req, res) => {
    try {
      const orderObj = _.pick(req.body, [
        "userId",
        "voucherId",
        "shippingAddress",
        "shippingNumber",
        "status",
        "voucherStatus",
        "extraDetail",
      ]);

      orderObj.userId = req.user.id;

      let userVoucher = await VoucherGen.findOne({
        raw: true,
        nest: true,
        where: {
          userId: req.user.id,
          id: orderObj.voucherId,
          isActive: true,
        },
        include: [
          {
            model: db.campaign,
          },
        ],
      });

      if (!userVoucher)
        return res
          .status(200)
          .send({ success: true, message: "Voucher does not exist!" });

      orderObj.campId = userVoucher.campaign.id;
      orderObj.merchantId = userVoucher.campaign.merchantId;

      let orderInfo = await Orders.create(orderObj);
      await VoucherGen.update(
        { isActive: false, updatedAt: Date.now() },
        {
          where: {
            id: orderObj.voucherId,
          },
        }
      );

      if (orderInfo)
        return res
          .status(200)
          .send({ success: true, message: "Order Created!" });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getAll = async (req, res) => {
    try {
      const { id } = req.user;
      let StatId = req.query.statusId;
      let PageSize = req.query.pageSize;
      let ActionId = req.params.ActionId;
      let PageNumber = req.query.pageNumber;
      let countData,
        allOrders,
        whereDiff,
        whereUp,
        wherediff2,
        dev1,
        dev2,
        where1,
        where2;

      // 1) show all
      // 2) show approved
      // 3) show declined

      whereDiff = {
        merchantId: id,
        [Op.or]: [{ statusId: 2 }, { statusId: 5 }],
        // statusId: 5,
      };

      whereUp = {
        merchantId: id,
        statusId: 3,
      };

      wherediff2 = {
        merchantId: id,
      };

      dev1 = {
        redeemeDevOpId: 1,
      };

      dev2 = {
        redeemeDevOpId: 2,
      };

      where1 = ActionId == 1 ? wherediff2 : ActionId == 2 ? whereDiff : whereUp;

      where2 = StatId != undefined ? (StatId == 1 ? dev1 : dev2) : "";

      let totalcount = await Orders.count({
        where: where1,
        include: [
          { model: users },
          {
            model: Campaign,
            include: [
              {
                model: CampaignDetail,
                include: [
                  {
                    model: Product,
                    include: [{ model: SubCategory }, { model: Category }],
                  },
                ],
              },
            ],
          },
          {
            model: VoucherGen,
          },
          {
            model: RedeemeVoucher,
            where: where2,
            include: [
              {
                model: VoucherMerchantRedeeme,
                include: [
                  {
                    model: DeliveryOptions,
                  },
                  {
                    model: VoucherStatus,
                  },
                ],
              },
              {
                model: DeliveryType,
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });

      allOrders = await Orders.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: where1,
        include: [
          { model: users },
          {
            model: Campaign,
            include: [
              {
                model: CampaignDetail,
                include: [
                  {
                    model: Product,
                    include: [{ model: SubCategory }, { model: Category }],
                  },
                ],
              },
            ],
          },
          {
            model: VoucherGen,
          },
          {
            model: RedeemeVoucher,
            where: where2,
            include: [
              {
                model: VoucherMerchantRedeeme,
                include: [
                  {
                    model: DeliveryOptions,
                  },
                  {
                    model: VoucherStatus,
                  },
                ],
              },
              {
                model: DeliveryType,
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };
      return res.status(200).send({
        success: true,
        data: allOrders,
        countData,
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getAllAdminSearch = async (req, res) => {
    try {
      let StatId = req.query.statusId;
      let PageSize = req.query.pageSize;
      let ActionId = req.params.ActionId;
      let MerchantId = req.params.merchantId;
      let PageNumber = req.query.pageNumber;
      let searchQuery = req.query.searchQuery;
      let countData,
        allOrders,
        whereDiff,
        whereUp,
        wherediff2,
        dev1,
        dev2,
        where1,
        where2;

      // 1) show all
      // 2) show approved
      // 3) show declined

      whereDiff = {
        merchantId: MerchantId,
        [Op.or]: [{ statusId: 2 }, { statusId: 5 }],
        // statusId: 5,
      };

      whereUp = {
        merchantId: MerchantId,
        statusId: 3,
      };

      wherediff2 = {
        merchantId: MerchantId,
      };

      dev1 = {
        redeemeDevOpId: 1,
      };

      dev2 = {
        redeemeDevOpId: 2,
      };

      where1 = ActionId == 1 ? wherediff2 : ActionId == 2 ? whereDiff : whereUp;

      where2 = StatId != undefined ? (StatId == 1 ? dev1 : dev2) : "";

      let totalcount = await Orders.count({
        where: where1,
        include: [
          {
            model: User,
            where: {
              [Op.or]: [
                {
                  userName: {
                    [Op.like]: `%${searchQuery}%`,
                  },
                },
                {
                  email: {
                    [Op.like]: `%${searchQuery}%`,
                  },
                },
              ],
            },
          },
          {
            model: Campaign,
            include: [
              {
                model: CampaignDetail,
                include: [
                  {
                    model: Product,
                    include: [{ model: SubCategory }, { model: Category }],
                  },
                ],
              },
            ],
          },
          {
            model: VoucherGen,
          },
          {
            model: RedeemeVoucher,
            where: where2,
            include: [
              {
                model: VoucherMerchantRedeeme,
                include: [
                  {
                    model: DeliveryOptions,
                  },
                  {
                    model: VoucherStatus,
                  },
                ],
              },
              {
                model: DeliveryType,
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });

      allOrders = await Orders.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: where1,
        include: [
          {
            model: User,
            where: {
              [Op.or]: [
                {
                  userName: {
                    [Op.like]: `%${searchQuery}%`,
                  },
                },
                {
                  email: {
                    [Op.like]: `%${searchQuery}%`,
                  },
                },
              ],
            },
          },
          {
            model: Campaign,
            include: [
              {
                model: CampaignDetail,
                include: [
                  {
                    model: Product,
                    include: [{ model: SubCategory }, { model: Category }],
                  },
                ],
              },
            ],
          },
          {
            model: VoucherGen,
          },
          {
            model: RedeemeVoucher,
            where: where2,
            include: [
              {
                model: VoucherMerchantRedeeme,
                include: [
                  {
                    model: DeliveryOptions,
                  },
                  {
                    model: VoucherStatus,
                  },
                ],
              },
              {
                model: DeliveryType,
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };
      return res.status(200).send({
        success: true,
        data: allOrders,
        countData,
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getAllSearch = async (req, res) => {
    try {
      const { id } = req.user;
      let StatId = req.query.statusId;
      let PageSize = req.query.pageSize;
      let ActionId = req.params.ActionId;
      let PageNumber = req.query.pageNumber;
      let searchQuery = req.query.searchQuery;
      let countData,
        allOrders,
        whereDiff,
        whereUp,
        wherediff2,
        dev1,
        dev2,
        where1,
        where2;

      // 1) show all
      // 2) show approved
      // 3) show declined

      whereDiff = {
        merchantId: id,
        [Op.or]: [{ statusId: 2 }, { statusId: 5 }],
        // statusId: 5,
      };

      whereUp = {
        merchantId: id,
        statusId: 3,
      };

      wherediff2 = {
        merchantId: id,
      };

      dev1 = {
        redeemeDevOpId: 1,
      };

      dev2 = {
        redeemeDevOpId: 2,
      };

      where1 = ActionId == 1 ? wherediff2 : ActionId == 2 ? whereDiff : whereUp;

      where2 = StatId != undefined ? (StatId == 1 ? dev1 : dev2) : "";

      let totalcount = await Orders.count({
        where: where1,
        include: [
          {
            model: User,
            where: {
              [Op.or]: [
                {
                  userName: {
                    [Op.like]: `%${searchQuery}%`,
                  },
                },
                {
                  email: {
                    [Op.like]: `%${searchQuery}%`,
                  },
                },
              ],
            },
          },
          {
            model: Campaign,
            include: [
              {
                model: CampaignDetail,
                include: [
                  {
                    model: Product,
                    include: [{ model: SubCategory }, { model: Category }],
                  },
                ],
              },
            ],
          },
          {
            model: VoucherGen,
          },
          {
            model: RedeemeVoucher,
            where: where2,
            include: [
              {
                model: VoucherMerchantRedeeme,
                include: [
                  {
                    model: DeliveryOptions,
                  },
                  {
                    model: VoucherStatus,
                  },
                ],
              },
              {
                model: DeliveryType,
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });

      allOrders = await Orders.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: where1,
        include: [
          {
            model: User,
            where: {
              [Op.or]: [
                {
                  userName: {
                    [Op.like]: `%${searchQuery}%`,
                  },
                },
                {
                  email: {
                    [Op.like]: `%${searchQuery}%`,
                  },
                },
              ],
            },
          },
          {
            model: Campaign,
            include: [
              {
                model: CampaignDetail,
                include: [
                  {
                    model: Product,
                    include: [{ model: SubCategory }, { model: Category }],
                  },
                ],
              },
            ],
          },
          {
            model: VoucherGen,
          },
          {
            model: RedeemeVoucher,
            where: where2,
            include: [
              {
                model: VoucherMerchantRedeeme,
                include: [
                  {
                    model: DeliveryOptions,
                  },
                  {
                    model: VoucherStatus,
                  },
                ],
              },
              {
                model: DeliveryType,
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };
      return res.status(200).send({
        success: true,
        data: allOrders,
        countData,
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  updateStatus = async (req, res) => {
    try {
      const orderId = req.params.id;

      let updateOrders = await Orders.update(
        { statusId: 5, updatedAt: Date.now() },
        {
          where: {
            id: parseInt(orderId),
          },
        }
      );

      if (updateOrders[0] == 1) {
        return res.status(200).send({ success: true, data: "Order Updated!" });
      } else {
        return res.status(404).send({
          success: false,
          data: "Something went wrong try another time!",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getDeliveredOrder = async (req, res) => {
    try {
      const { id } = req.user;
      let countData, allOrders;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;

      let totalcount = await Orders.count({ where: { statusId: 5 } });
      allOrders = await Orders.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: { statusId: 5 },
        include: [
          { model: users },
          {
            model: Campaign,
            include: [
              {
                model: CampaignDetail,
                include: [
                  {
                    model: Product,
                    include: [{ model: SubCategory }, { model: Category }],
                  },
                ],
              },
            ],
          },
          {
            model: VoucherGen,
          },
          {
            model: RedeemeVoucher,
            include: [
              {
                model: VoucherMerchantRedeeme,
              },
              {
                model: DeliveryOptions,
              },
              {
                model: VoucherStatus,
              },
            ],
          },
        ],
      });
      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };
      return allOrders.length > 0
        ? res.status(200).send({
            success: true,
            data: allOrders,
            countData,
            message: "get All Delivered Orders",
          })
        : res.status(200).send({
            success: true,
            data: [],
            message: "get All Delivered Orders",
          });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getCustomerOder = async (req, res) => {
    let userId, customerOders, query, countData;
    userId = req.user.id;
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;

    try {
      let IsUser = await db.users.findOne({
        where: { id: userId, isBlocked: 0, isDelete: 0 },
        include: [
          {
            model: Permissions,
            where: { roleId: 4 },
          },
        ],
      });
      if (!IsUser)
        return res
          .status(404)
          .send({ success: false, data: [], message: "No User Found" });

      query = `select ord.id as ORDER_ID,ord.OrderId,u.id as userId, ud.firstName as UserFirstName,ud.lastName as UserLastName,us.id as merchantId,mud.firstName as merchantFirstName,mud.lastName as MerchantLastName,md.storeName as MerchantStoreName,ord.statusId as orderStatusId,vss.status as orderStatus,
               md.webSiteUrl as MerchantWebsiteUrl, md.merchantCode,shp.ShippingName,camp.id as CampaignId, camp.name as CampaignName, camp.campaignCode,camp.description as campaignDescription,camp.Discount as CampaignDiscount,camp.campaignLongName,vmr.redeemeDevOpId as deliveryOptionId,dop.deliveryName as deliveryOptionName,
               camp.likes as campaignLikes,camp.campaingAmount,camp.campaignStartsAt,camp.campaignExpiresAt,camp.voucherExpiresAt,camp.shippingStatus,camp.curbSideFlag,camp.counter as CampaignCounter,campD.productQty,campD.avaliablityStock,p.id as ProductId,p.name as ProductName,
               p.stock as ProductStock,p.short_title as ProductShortTitle,p.short_description as ProductShortDescription,c.name as Categoryname,c.description as CategoryDescription,c.weight as CategoryWeight,s.name as SubCategoryName,
               s.description as SubCategoryDescription,imgcampai.CampaignImageId,imgcampai.CampaignImageUrl,imgPro.ProductImageId,imgPro.ProductImageUrl,vmr.deliveryTime
      
               from orders As ord
               inner join users as u on u.id = ord.userId
               inner join merchantDetails as md on md.userId = ord.merchantId
               inner join campaigns as camp on camp.id = ord.campaignId
               inner join voucherStatuses as vss on vss.id = ord.statusId
               left join usersdetails as ud on ud.userId = u.id
               left join users as us on us.id = ord.merchantId
               left join usersdetails as mud on mud.userId = us.id
               left join campaignDetails as campD on campD.campaignId = camp.id
               left join shippings as shp on shp.id = camp.shippingStatus
               left join products as p on p.id = campD.productId
               left join categories as c on c.id = p.categoryId
               left join subcategories as s on s.id = p.subcategoryId
               left join voucherMerchantRedeemes as vmr on vmr.redeemeVoucherId = ord.redeemeVoucherId
               left join deliveryOptions as dop on dop.id = vmr.redeemeDevOpId
               left join(
               select imgc.typeId,JSON_ARRAYAGG(imgc.imageId) as CampaignImageId,JSON_ARRAYAGG(imgc.imageUrl) as CampaignImageUrl
               from imagedata imgc
               where imgc.imageType = 'Campaign'
               GROUP BY imgc.typeId
               ) imgcampai on imgcampai.typeId = camp.id 
               left join(
               select imgcP.typeId,JSON_ARRAYAGG(imgcP.imageId) as ProductImageId,JSON_ARRAYAGG(imgcP.imageUrl) as ProductImageUrl
               from imagedata imgcP
               where imgcP.imageType = 'Product'
               GROUP BY imgcP.typeId
               ) imgPro on imgPro.typeId = camp.id 
               where ord.userId = ${userId} and ord.statusId != 5  and vmr.redeemeDevOpId=1
               LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      customerOders = await db.sequelize.query(query);

      let query1 = `select COUNT(ord.id) as count from orders As ord
      left join voucherMerchantRedeemes as vmr on vmr.redeemeVoucherId = ord.redeemeVoucherId
      where ord.userId = ${userId} and ord.statusId != 5  and vmr.redeemeDevOpId=1 `;

      let totalcount = await db.sequelize.query(query1);

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount[0][0].count / PageSize),
        totalRecords: totalcount[0][0].count,
      };

      if (customerOders[0].length > 0) {
        res.status(200).send({
          success: true,
          data: customerOders[0],
          countData,
          message: "Customer Orders Found",
        });
      } else {
        res.status(200).send({
          success: true,
          data: [],
          message: "No Orders Found",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getPendingCustomerOder = async (req, res) => {
    let userId, pendingOrders, countData;
    userId = req.user.id;
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;

    try {
      let IsUser = await db.users.findOne({
        where: { id: userId, isBlocked: 0, isDelete: 0 },
        include: [
          {
            model: Permissions,
            where: { roleId: 4 },
          },
        ],
      });
      if (!IsUser)
        return res
          .status(404)
          .send({ success: false, data: [], message: "No User Found" });

      let totalcount = await VoucherMerchantRedeeme.count({
        where: {
          userId: userId,
          statusId: 1,
        },
      });
      pendingOrders = await VoucherMerchantRedeeme.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: {
          userId: userId,
          statusId: 1,
        },
        include: [
          {
            model: User,
            include: [
              {
                model: UserDetail,
              },
            ],
          },
          {
            model: VoucherStatus,
          },
          {
            model: RedeemeVoucher,
            include: [
              {
                model: VoucherGen,
                include: [
                  {
                    model: Product,
                    include: [
                      {
                        model: ImageData,
                        association: db.campaign.hasMany(db.imageData, {
                          foreignKey: "typeId",
                        }),
                        where: {
                          imageType: "Product",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                model: DeliveryOptions,
              },
              {
                model: DeliveryType,
              },
              {
                model: VoucherStatus,
              },
            ],
          },
          {
            model: DeliveryOptions,
          },
        ],
      });
      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };
      res.status(200).send({
        success: true,
        data: pendingOrders,
        countData,
        message: "Pending Vouchers",
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getCustomerOderHistory = async (req, res) => {
    let userId,
      Statusid,
      customerOders,
      query,
      query1,
      countData,
      customerOrderCount,
      querycount1,
      querycount;
    userId = req.user.id;
    Statusid = parseInt(req.query.Statusid);
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let paginations = ArraySlicePagination(PageNumber, PageSize);
    //statusid = 2 => Approved
    //statusid = 5 => Delivered
    //statusid = 3 => Declined
    //statusid = 1 => Pending

    try {
      let IsUser = await db.users.findOne({
        where: { id: userId, isBlocked: 0, isDelete: 0 },
        include: [
          {
            model: Permissions,
            where: { roleId: 4 },
          },
        ],
      });
      if (!IsUser)
        return res
          .status(404)
          .send({ success: false, data: [], message: "No User Found" });

      query = `select rv.*, vg.voucherCode, ord.id as ORDER_ID,ord.OrderId,u.id as userId, ud.firstName as UserFirstName,ud.lastName as UserLastName,us.id as merchantId,mud.firstName as merchantFirstName,mud.lastName as MerchantLastName,md.storeName as MerchantStoreName,ord.statusId as orderStatusId,vss.status as orderStatus,
               md.webSiteUrl as MerchantWebsiteUrl, md.merchantCode,shp.ShippingName,camp.id as CampaignId, camp.name as CampaignName, camp.campaignCode,camp.description as campaignDescription,camp.Discount as CampaignDiscount,camp.campaignLongName,vmr.redeemeDevOpId as deliveryOptionId,dop.deliveryName as deliveryOptionName,
               camp.likes as campaignLikes,camp.campaingAmount,camp.campaignStartsAt,camp.campaignExpiresAt,camp.voucherExpiresAt,camp.shippingStatus,camp.curbSideFlag,camp.counter as CampaignCounter,campD.productQty,campD.avaliablityStock,p.id as ProductId,p.name as ProductName,
               p.stock as ProductStock,p.short_title as ProductShortTitle,p.short_description as ProductShortDescription,c.name as Categoryname,c.description as CategoryDescription,c.weight as CategoryWeight,s.name as SubCategoryName,
               s.description as SubCategoryDescription,imgcampai.CampaignImageId,imgcampai.CampaignImageUrl,imgPro.ProductImageId,imgPro.ProductImageUrl,vmr.deliveryTime
      
               from orders As ord
               inner join users as u on u.id = ord.userId
               inner join merchantDetails as md on md.userId = ord.merchantId
               inner join campaigns as camp on camp.id = ord.campaignId
               inner join voucherStatuses as vss on vss.id = ord.statusId
               left join usersdetails as ud on ud.userId = u.id
               left join users as us on us.id = ord.merchantId
               left join usersdetails as mud on mud.userId = us.id
               left join campaignDetails as campD on campD.campaignId = camp.id
               left join shippings as shp on shp.id = camp.shippingStatus
               left join products as p on p.id = campD.productId
               left join categories as c on c.id = p.categoryId
               left join subcategories as s on s.id = p.subcategoryId
               left join voucherMerchantRedeemes as vmr on vmr.redeemeVoucherId = ord.redeemeVoucherId
               left JOIN redeemeVouchers AS rv ON rv.id = vmr.redeemeVoucherId
               left JOIN vouchergens as vg ON vg.id = rv.voucherId
               left join deliveryOptions as dop on dop.id = vmr.redeemeDevOpId
               left join(
               select imgc.typeId,JSON_ARRAYAGG(imgc.imageId) as CampaignImageId,JSON_ARRAYAGG(imgc.imageUrl) as CampaignImageUrl
               from imagedata imgc
               where imgc.imageType = 'Campaign'
               GROUP BY imgc.typeId
               ) imgcampai on imgcampai.typeId = camp.id 
               left join(
               select imgcP.typeId,JSON_ARRAYAGG(imgcP.imageId) as ProductImageId,JSON_ARRAYAGG(imgcP.imageUrl) as ProductImageUrl
               from imagedata imgcP
               where imgcP.imageType = 'Product'
               GROUP BY imgcP.typeId
               ) imgPro on imgPro.typeId = camp.id 
               where ord.userId = ${userId} and ord.statusId = ${Statusid} and vmr.redeemeDevOpId=1
               LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      querycount = `select COUNT(ord.id) as count from orders As ord
                left join voucherMerchantRedeemes as vmr on vmr.redeemeVoucherId = ord.redeemeVoucherId
                where ord.userId = ${userId} and ord.statusId = ${Statusid} and vmr.redeemeDevOpId=1`;

      query1 = `select rv.*, vg.voucherCode, vmr.id, u.id as userId, ud.firstName as UserFirstName,ud.lastName as UserLastName,us.id as merchantId,mud.firstName as merchantFirstName,mud.lastName as MerchantLastName,md.storeName as MerchantStoreName,vmr.statusId as orderStatusId,vss.status as orderStatus,
               md.webSiteUrl as MerchantWebsiteUrl, md.merchantCode,shp.ShippingName,camp.id as CampaignId, camp.name as CampaignName, camp.campaignCode,camp.description as campaignDescription,camp.Discount as CampaignDiscount,camp.campaignLongName,vmr.redeemeDevOpId as deliveryOptionId,dop.deliveryName as deliveryOptionName,
               camp.likes as campaignLikes,camp.campaingAmount,camp.campaignStartsAt,camp.campaignExpiresAt,camp.voucherExpiresAt,camp.shippingStatus,camp.curbSideFlag,camp.counter as CampaignCounter,campD.productQty,campD.avaliablityStock,p.id as ProductId,p.name as ProductName,
               p.stock as ProductStock,p.short_title as ProductShortTitle,p.short_description as ProductShortDescription,c.name as Categoryname,c.description as CategoryDescription,c.weight as CategoryWeight,s.name as SubCategoryName,
               s.description as SubCategoryDescription,imgcampai.CampaignImageId,imgcampai.CampaignImageUrl,imgPro.ProductImageId,imgPro.ProductImageUrl,vmr.deliveryTime
      
               from voucherMerchantRedeemes As vmr
               inner join users as u on u.id = vmr.userId
               inner join merchantDetails as md on md.userId = vmr.merchantId
               INNER JOIN redeemeVouchers AS rv ON rv.id = vmr.redeemeVoucherId
               INNER JOIN vouchergens as vg ON vg.id = rv.voucherId
               inner join campaigns as camp on camp.id = rv.campaignId
               inner join voucherStatuses as vss on vss.id = vmr.statusId
               left join usersdetails as ud on ud.userId = u.id
               left join users as us on us.id = vmr.merchantId
               left join usersdetails as mud on mud.userId = us.id
               left join campaignDetails as campD on campD.campaignId = camp.id
               left join shippings as shp on shp.id = camp.shippingStatus
               left join products as p on p.id = campD.productId
               left join categories as c on c.id = p.categoryId
               left join subcategories as s on s.id = p.subcategoryId
               left join deliveryOptions as dop on dop.id = vmr.redeemeDevOpId
               left join(
               select imgc.typeId,JSON_ARRAYAGG(imgc.imageId) as CampaignImageId,JSON_ARRAYAGG(imgc.imageUrl) as CampaignImageUrl
               from imagedata imgc
               where imgc.imageType = 'Campaign'
               GROUP BY imgc.typeId
               ) imgcampai on imgcampai.typeId = camp.id 
               left join(
               select imgcP.typeId,JSON_ARRAYAGG(imgcP.imageId) as ProductImageId,JSON_ARRAYAGG(imgcP.imageUrl) as ProductImageUrl
               from imagedata imgcP
               where imgcP.imageType = 'Product'
               GROUP BY imgcP.typeId
               ) imgPro on imgPro.typeId = camp.id 
               where vmr.userId = ${userId} and vmr.statusId = 1 and vmr.redeemeDevOpId = 1 
              ORDER BY vmr.id DESC
              LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;

      querycount1 = `select COUNT(ord.id) as count from orders As ord
              left join voucherMerchantRedeemes as vmr on vmr.redeemeVoucherId = ord.redeemeVoucherId
              where ord.userId = ${userId} and vmr.statusId = 1 and vmr.redeemeDevOpId=1`;

      if (Statusid === 1) {
        customerOders = await db.sequelize.query(query1);
        customerOrderCount = await db.sequelize.query(querycount1);
      } else {
        customerOders = await db.sequelize.query(query);
        customerOrderCount = await db.sequelize.query(querycount);
      }

      countData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(customerOrderCount[0][0].count / PageSize),
        totalRecords: customerOrderCount[0][0].count,
      };

      if (customerOders[0].length > 0) {
        res.status(200).send({
          success: true,
          data: customerOders[0],
          countData,
          message: "Customer Orders Found",
        });
      } else {
        res.status(200).send({
          success: true,
          data: [],
          message: "No Orders Found",
        });
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };
}
module.exports = Order;
