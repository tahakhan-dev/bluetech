const db = require("../../Model");

const {
  validatePermissionGetResponse,
  validatePermissionGetResponseWithId,
} = require("../extras/ValidateWithPermissions");
const {
  validatePermissionGetResponsSearch,
  validatePermissionGetResponseWithIdSearch,
} = require("../extras/searchValidateWithPermissions");
const FindPermission = require("../extras/FindPermission");

const findMembersRole = require("../extras/FindMemberRole");
const limit = require("../extras/DataLimit/index");
const { ArraySlicePagination } = require("../extras/pagination/pagination");
const { request } = require("express");
const { redeemeVoucher } = require("../../Model");
const Permissions = db.permissions;
const Terms = db.termsCondition;
const About = db.aboutUs;
const Howtouse = db.HowToUse;
const FAQS = db.Faqs;
const Actionradius = db.ActionRadius;
const Voucher = db.VoucherGen;
const Campaign = db.campaign;
const Product = db.product;
const Users = db.users;
const Orders = db.orders;
const SubCategory = db.SubCategory;
const Category = db.category;
const UserDetails = db.usersdetail;
const Transaction = db.transaction;
const TransactionDetail = db.transactionDetail;
const VoucherShare = db.VoucherShare;
const VoucherMerchantRedeeme = db.voucherMerchantRedeeme;
const RedeemeVoucher = db.redeemeVoucher;
const DeliveryOption = db.deliveryOption;
const VoucherStatus = db.voucherStatus;
const DeliveryType = db.deliveryType;
const MerchantDetails = db.MerchantDetails;
const campaignDetail = db.campaignDetail;
const Op = db.Sequelize.Op;

class GetSuperAdmin {
  getMembers = async (req, res) => {
    let permissions = await FindPermission(req.user.id);
    let findroles = await findMembersRole(req.params.roleId, req, res);
    try {
      if (findroles.roleName == "User") {
        validatePermissionGetResponse(permissions.canReadUser, req, res, false);
      } else if (findroles.roleName == "Merchant") {
        validatePermissionGetResponse(true, req, res, false);
      } else if (findroles.roleName == "Admin") {
        validatePermissionGetResponse(
          permissions.canReadAdmin,
          req,
          res,
          false
        );
      } else {
        res.status(401).send({ success: false, message: "Forbidden Access" });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  searchGetMembers = async (req, res) => {
    let permissions = await FindPermission(req.user.id);
    let findroles = await findMembersRole(req.params.roleId, req, res);
    try {
      if (findroles.roleName == "User") {
        validatePermissionGetResponsSearch(
          permissions.canReadUser,
          req,
          res,
          false
        );
      } else if (findroles.roleName == "Merchant") {
        validatePermissionGetResponsSearch(true, req, res, false);
      } else if (findroles.roleName == "Admin") {
        validatePermissionGetResponsSearch(
          permissions.canReadAdmin,
          req,
          res,
          false
        );
      } else {
        res.status(401).send({ success: false, message: "Forbidden Access" });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };
  enableChat = async (req, res) => {
    try {
      let permissions = await FindPermission(req.user.id);
    } catch (e) {}
  };

  getAllMembers = async (req, res) => {
    try {
      let pag = await Users.findAll({
        offset:
          parseInt(req.query.page) * limit.limit
            ? parseInt(req.query.page) * limit.limit
            : 0,
        limit: req.query.page ? limit.limit : 1000000,
      });
      let countData = {
        page: parseInt(req.query.page),
        pages: Math.ceil(pag.length / limit.limit),
        totalRecords: pag.length,
      };
      res.status(200).send({ success: true, data: pag, countData });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getBlockMembers = async (req, res) => {
    let permissions = await FindPermission(req.user.id);
    let findroles = await findMembersRole(req.params.roleId, req, res);
    try {
      if (findroles.roleName == "User") {
        validatePermissionGetResponse(permissions.canReadUser, req, res, true);
      } else if (findroles.roleName == "Merchant") {
        validatePermissionGetResponse(
          permissions.canReadMerchant,
          req,
          res,
          true
        );
      } else if (findroles.roleName == "Admin") {
        validatePermissionGetResponse(permissions.canReadAdmin, req, res, true);
      } else {
        res.status(401).send({ success: false, message: "Forbidden Access" });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getVoucherHistory = async (req, res) => {
    let permissions = await FindPermission(req.user.id);
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let paginations = ArraySlicePagination(PageNumber, PageSize);

    if (permissions.roleId != 1)
      return res.status(404).send({
        success: false,
        message: "You are not authenticated to this route",
      });

    let totalcount = await Voucher.count({
      where: {
        isActive: 1,
        pending: 0,
      },
    });

    let Vouchers = await Voucher.findAll({
      offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
      limit: parseInt(PageSize),
      where: {
        isActive: 1,
        pending: 0,
      },
      include: [
        {
          model: Campaign,
        },
        {
          model: Product,
        },
        {
          model: Users,
        },
      ],
    });

    let VoucherData = {
      page: parseInt(PageNumber),
      pages: Math.ceil(totalcount / PageSize),
      totalRecords: totalcount,
    };
    res.status(200).send({
      success: true,
      data: Vouchers,
      VoucherData,
    });
  };

  editVoucher = async (req, res) => {
    try {
      let { ExpiryDate, isExpires, voucherId, Active } = req.body;
      let obj;

      obj = {
        expiresAt: ExpiryDate,
        isExpired: isExpires,
        isActive: Active,
      };

      let permissions = await FindPermission(req.user.id);

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let updateVoucher = await Voucher.update(obj, {
        where: {
          id: parseInt(voucherId),
          isActive: 1,
          pending: 0,
        },
      });

      if (updateVoucher[0] == 1) {
        res.status(200).send({ success: true, message: "Voucher Updated!" });
      } else {
        res.status(404).send({
          success: false,
          message: "There is Some error in updating voucher",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  showAllVoucher = async (req, res) => {
    try {
      let UserId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let permissions = await FindPermission(UserId);

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Voucher.count();

      let AllVoucherResponse = await Voucher.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        include: [
          {
            model: Product,
          },
          {
            model: Campaign,
          },
          {
            model: redeemeVoucher,
            as: "RedeemeVo",
            include: [
              {
                model: VoucherMerchantRedeeme,
              },
              {
                model: Orders,
                include: [
                  {
                    model: VoucherStatus,
                  },
                ],
              },
              {
                model: DeliveryOption,
              },
              {
                model: VoucherStatus,
              },
              {
                model: db.deliveryType,
              },
            ],
          },
          {
            model: Users,
          },
          {
            model: VoucherShare,
            include: [
              {
                model: db.users,
              },
              {
                model: db.users,
                as: "Receiver",
              },
            ],
          },
          {
            model: TransactionDetail,
            include: [
              {
                model: Transaction,
              },
            ],
          },
        ],
      });

      let VoucherData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      AllVoucherResponse.length > 0
        ? res.status(200).send({
            success: true,
            data: AllVoucherResponse,
            VoucherData,
            message: "Voucher found",
          })
        : res
            .status(200)
            .send({ success: true, data: [], message: "No Voucher Found" });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  showAllVoucherSearch = async (req, res) => {
    try {
      let UserId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let SearchQuery = req.query.SearchQuery;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let permissions = await FindPermission(UserId);

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Voucher.count({
        where: {
          voucherCode: {
            [Op.like]: `%${SearchQuery}%`,
          },
        },
      });

      let AllVoucherResponse = await Voucher.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: {
          voucherCode: {
            [Op.like]: `%${SearchQuery}%`,
          },
        },
        include: [
          {
            model: Product,
          },
          {
            model: Campaign,
          },
          {
            model: redeemeVoucher,
            as: "RedeemeVo",
            include: [
              {
                model: VoucherMerchantRedeeme,
              },
              {
                model: Orders,
                include: [
                  {
                    model: VoucherStatus,
                  },
                ],
              },
              {
                model: DeliveryOption,
              },
              {
                model: VoucherStatus,
              },
              {
                model: db.deliveryType,
              },
            ],
          },
          {
            model: Users,
          },
          {
            model: VoucherShare,
            include: [
              {
                model: db.users,
              },
              {
                model: db.users,
                as: "Receiver",
              },
            ],
          },
          {
            model: TransactionDetail,
            include: [
              {
                model: Transaction,
              },
            ],
          },
        ],
      });

      let VoucherData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      AllVoucherResponse.length > 0
        ? res.status(200).send({
            success: true,
            data: AllVoucherResponse,
            VoucherData,
            message: "Voucher found",
          })
        : res
            .status(200)
            .send({ success: true, data: [], message: "No Voucher Found" });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  showAllVoucherbyMonth = async (req, res) => {
    try {
      let UserId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let dateQuery = req.query.Date;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let permissions = await FindPermission(UserId);

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Voucher.count({
        where: {
          voucherCreateDate: {
            [Op.like]: `${dateQuery}%`,
          },
        },
      });

      let AllVoucherResponse = await Voucher.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: {
          voucherCreateDate: {
            [Op.like]: `${dateQuery}%`,
          },
        },
        include: [
          {
            model: Product,
          },
          {
            model: Campaign,
          },
          {
            model: Users,
          },
          {
            model: TransactionDetail,
            include: [
              {
                model: Transaction,
              },
            ],
          },
        ],
      });

      let VoucherData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      AllVoucherResponse.length > 0
        ? res.status(200).send({
            success: true,
            data: AllVoucherResponse,
            VoucherData,
            message: "Voucher found",
          })
        : res
            .status(200)
            .send({ success: true, data: [], message: "No Voucher Found" });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  SearchVoucher = async (req, res) => {
    try {
      let UserId = req.user.id;
      let PageSize = req.query.pageSize;
      let PageNumber = req.query.pageNumber;
      let SearchQuery = req.query.searchQuery;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let permissions = await FindPermission(UserId);

      function hasNumber(myString) {
        return !isNaN(parseFloat(myString)) && isFinite(myString);
      }

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Voucher.count({
        where: {
          [Op.or]: [
            {
              voucherCode: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? "" : SearchQuery + "%",
              },
            },
            {
              id: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? parseInt(SearchQuery) : "",
              },
            },
          ],
        },
      });

      let AllVoucherResponse = await Voucher.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: {
          [Op.or]: [
            {
              voucherCode: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? "" : SearchQuery + "%",
              },
            },
            {
              id: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? parseInt(SearchQuery) : "",
              },
            },
          ],
        },
        include: [
          {
            model: Product,
          },
          {
            model: Campaign,
          },
          {
            model: Users,
          },
          {
            model: TransactionDetail,
            include: [
              {
                model: Transaction,
              },
            ],
          },
        ],
      });

      let VoucherData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      AllVoucherResponse.length > 0
        ? res.status(200).send({
            success: true,
            data: AllVoucherResponse,
            VoucherData,
            message: "Voucher found",
          })
        : res.status(200).send({
            success: true,
            data: [],
            VoucherData,
            message: "No Voucher Found",
          });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  SearchVoucherbyMonth = async (req, res) => {
    try {
      let UserId = req.user.id;
      let PageSize = req.query.pageSize;
      let PageNumber = req.query.pageNumber;
      let SearchQuery = req.query.searchQuery;
      let dateQuery = req.query.Date;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let permissions = await FindPermission(UserId);

      function hasNumber(myString) {
        return !isNaN(parseFloat(myString)) && isFinite(myString);
      }

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Voucher.count({
        where: {
          voucherCreateDate: {
            [Op.like]: `${dateQuery}%`,
          },
          [Op.or]: [
            {
              voucherCode: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? "" : SearchQuery + "%",
              },
            },
            {
              id: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? parseInt(SearchQuery) : "",
              },
            },
          ],
        },
      });

      let AllVoucherResponse = await Voucher.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: {
          voucherCreateDate: {
            [Op.like]: `${dateQuery}%`,
          },
          [Op.or]: [
            {
              voucherCode: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? "" : SearchQuery + "%",
              },
            },
            {
              id: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? parseInt(SearchQuery) : "",
              },
            },
          ],
        },
        include: [
          {
            model: Product,
          },
          {
            model: Campaign,
          },
          {
            model: Users,
          },
          {
            model: TransactionDetail,
            include: [
              {
                model: Transaction,
              },
            ],
          },
        ],
      });

      let VoucherData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      AllVoucherResponse.length > 0
        ? res.status(200).send({
            success: true,
            data: AllVoucherResponse,
            VoucherData,
            message: "Voucher found",
          })
        : res.status(200).send({
            success: true,
            data: [],
            VoucherData,
            message: "No Voucher Found",
          });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getVoucherById = async (req, res) => {
    try {
      let UserId = req.user.id;
      let VoucherId = req.params.Id;
      let permissions = await FindPermission(UserId);

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let VoucherResponse = await Voucher.findOne({
        where: {
          id: VoucherId,
        },
        include: [
          {
            model: VoucherShare,
            as: "vouchShare",
            include: [
              {
                model: Users,
                as: "Receiver",
              },
            ],
          },
          {
            model: RedeemeVoucher,
            as: "RedeemeVo",
            include: [
              {
                model: Campaign,
                include: [
                  {
                    model: Users,
                    include: [
                      {
                        model: MerchantDetails,
                      },
                    ],
                  },
                  {
                    model: campaignDetail,
                  },
                ],
              },
              {
                model: DeliveryOption,
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
            model: TransactionDetail,
            include: [
              {
                model: Transaction,
              },
            ],
          },
        ],
      });

      VoucherResponse
        ? res.status(200).send({
            success: true,
            data: VoucherResponse,
            message: "Voucher found",
          })
        : res
            .status(200)
            .send({ success: true, data: [], message: "No Voucher Found" });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  transactionDetailHistory = async (req, res) => {
    try {
      let UserId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let permissions = await FindPermission(UserId);

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Transaction.count();

      let transactionResp = await Transaction.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        include: [
          {
            model: TransactionDetail,
            include: [
              {
                model: Campaign,
                include: [
                  {
                    model: db.campaignDetail,
                    include: [
                      {
                        model: db.product,
                      },
                    ],
                  },
                  {
                    model: Users,
                  },
                ],
              },
            ],
          },
          {
            model: Users,
          },
        ],
      });
      let transactioDataCount = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      res.status(200).send({
        success: true,
        data: transactionResp,
        transactioDataCount,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  transactionDetailHistorySearch = async (req, res) => {
    try {
      let UserId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let searchQuery = req.query.searchQuery;
      let paginations = ArraySlicePagination(PageNumber, PageSize);
      let permissions = await FindPermission(UserId);

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Transaction.count({
        include: [
          {
            model: TransactionDetail,
            include: [
              {
                model: Campaign,
                include: [
                  {
                    model: db.campaignDetail,
                    include: [
                      {
                        model: db.product,
                      },
                    ],
                  },
                  {
                    model: Users,
                  },
                ],
              },
            ],
          },
          {
            model: Users,
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
        ],
      });

      let transactionResp = await Transaction.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        include: [
          {
            model: TransactionDetail,
            include: [
              {
                model: Campaign,
                include: [
                  {
                    model: db.campaignDetail,
                    include: [
                      {
                        model: db.product,
                      },
                    ],
                  },
                  {
                    model: Users,
                  },
                ],
              },
            ],
          },
          {
            model: Users,
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
        ],
      });
      let transactioDataCount = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      res.status(200).send({
        success: true,
        data: transactionResp,
        transactioDataCount,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  transactionDetailVoucher = async (req, res) => {
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;
    let paginations = ArraySlicePagination(PageNumber, PageSize);

    let voucherQueryRange = req.query.voucherRange.split("-")[0];
    let voucherQueryRange1 = req.query.voucherRange.split("-")[1];

    let totalCount = await Voucher.count({
      where: {
        id: {
          [Op.between]: [
            parseInt(voucherQueryRange),
            parseInt(voucherQueryRange1),
          ],
        },
      },
    });
    let userVoucher = await Voucher.findAll({
      offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
      limit: parseInt(PageSize),
      where: {
        id: {
          [Op.between]: [
            parseInt(voucherQueryRange),
            parseInt(voucherQueryRange1),
          ],
        },
      },
      include: [
        {
          model: VoucherShare,
          as: "vouchShare",
          include: [
            {
              model: VoucherStatus,
            },
            {
              model: Users,
              as: "Receiver",
              include: [
                {
                  model: UserDetails,
                },
              ],
            },
          ],
        },
        {
          model: RedeemeVoucher,
          as: "RedeemeVo",
          include: [
            {
              model: DeliveryOption,
            },
            {
              model: VoucherStatus,
            },
            {
              model: db.deliveryType,
            },
          ],
        },
        {
          model: Campaign,
          include: [
            {
              model: db.campaignDetail,
            },
            {
              model: Users,
            },
          ],
        },
        {
          model: Product,
        },
      ],
    });

    let voucherDetailCount = {
      page: parseInt(PageNumber),
      pages: Math.ceil(totalCount / PageSize),
      totalRecords: totalCount,
    };

    userVoucher.length == 0 || userVoucher == undefined
      ? res.status(404).send({
          success: false,
          data: [],
          voucherDetailCount,
          message: "No Voucher Found",
        })
      : res.status(200).send({
          success: true,
          data: userVoucher,
          voucherDetailCount,
          message: "use voucher history detail",
        });
  };

  editTransactionDetailVoucher = async (req, res) => {
    try {
      let { transactionId, netAmount, discount, paymentType, transactionCode } =
        req.body;
      let UserId = req.user.id;
      let permissions = await FindPermission(UserId);

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let transactionUpdate = await Transaction.update(
        {
          netAmount: netAmount,
          discount: discount,
          paymentType: paymentType,
          transactionCode: transactionCode,
        },
        {
          where: {
            id: transactionId,
          },
        }
      );
      transactionUpdate[0] == 1
        ? res
            .status(200)
            .send({ success: true, message: "transaction Updated" })
        : res.status(404).send({
            success: false,
            message:
              "No transaction is to be found please try to update valid transaction",
          });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  deleteTransactionDetailVoucher = async (req, res) => {
    try {
      let UserId = req.user.id;
      let transactionID = req.params.id;
      let permissions = await FindPermission(UserId);

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let query = `SET FOREIGN_KEY_CHECKS = 0`;

      await db.sequelize.query(query);

      let deleteTransactionDetail = await TransactionDetail.destroy({
        where: {
          transactionId: parseInt(transactionID),
        },
      });

      if (deleteTransactionDetail == 2) {
        let deleteTransaction = await Transaction.destroy({
          where: {
            id: parseInt(transactionID),
          },
        });
        if (deleteTransaction == 1) {
          let query = `SET FOREIGN_KEY_CHECKS = 1`;
          await db.sequelize.query(query);
          return res
            .status(200)
            .send({ success: true, message: "transaction deleted" });
        } else {
          return res.status(404).send({
            success: false,
            message: "there is some error in deleting ",
          });
        }
      } else {
        return res.status(404).send({
          success: false,
          message: "There is some error in deleting transaction",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getSpecificMember = async (req, res) => {
    let permissions = await FindPermission(req.user.id);
    let memberRole = await findMembersRole(req.params.roleId, res, req);
    try {
      if (memberRole.roleName == "Super Admin") {
        validatePermissionGetResponseWithId(
          permissions.canCreateAdmin, // permissions.canCreateAdmin,
          req,
          res,
          false
        );
      } else if (memberRole.roleName == "Merchant") {
        let permissionIs = null;
        if (req.params.userId == req.user.id) {
          permissionIs = permissions.canReadOwnAccount;
        } else {
          permissionIs = permissions.canReadMerchant;
        }
        validatePermissionGetResponseWithId(permissionIs, req, res, false);
      } else if (memberRole.roleName == "Admin") {
        let permissionIs = null;
        if (req.params.userId == req.user.id) {
          permissionIs = permissions.canReadOwnAccount;
        } else {
          permissionIs = permissions.canReadAdmin;
        }
        validatePermissionGetResponseWithId(permissionIs, req, res, false);
      } else if (memberRole.roleName == "User") {
        validatePermissionGetResponseWithId(
          true, //permissions.canReadUser,
          req,
          res,
          false
        );
      } else {
        res.status(401).send({ success: false, message: "Forbidden Access" });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getAllSettings = async (req, res) => {
    try {
      let type = req.params.type;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      if (type && type == "howtouse") {
        let totalcountHow = await Howtouse.count({
          where: { isActive: true, isDeleted: false },
        });
        let getAllHowToUse = await Howtouse.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: { isActive: true, isDeleted: false },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountHow / PageSize),
          totalRecords: totalcountHow,
        };
        res.status(200).send({ success: true, getAllHowToUse, countData });
      } else if (type && type == "terms") {
        let totalcountTerm = await Terms.count({
          where: { isActive: true, isDeleted: false },
        });
        let getAllTerms = await Terms.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: { isActive: true },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountTerm / PageSize),
          totalRecords: totalcountTerm,
        };
        res.status(200).send({ success: true, getAllTerms, countData });
      } else if (type && type == "faqs") {
        let totalcountFaq = await FAQS.count({
          where: { isActive: true },
        });
        let getAllFaqs = await FAQS.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: { isActive: true },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountFaq / PageSize),
          totalRecords: totalcountFaq,
        };
        res.status(200).send({ success: true, getAllFaqs, countData });
      } else if (type && type == "about") {
        let totalcountabout = await About.count({
          where: { isActive: true },
        });
        let getAllAbout = await About.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: { isActive: true },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountabout / PageSize),
          totalRecords: totalcountabout,
        };
        res.status(200).send({ success: true, getAllAbout, countData });
      } else if (type && type == "radius") {
        let totalcountradius = await Actionradius.count({
          where: { isActive: true },
        });
        let getAllActionRadius = await Actionradius.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: { isActive: true },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountradius / PageSize),
          totalRecords: totalcountradius,
        };
        res.status(200).send({ success: true, getAllActionRadius, countData });
      } else {
        res
          .status(200)
          .send({ code: 404, success: true, message: "Not Found" });
      }
    } catch (error) {
      res.status(500).send({ success: false, error: "Internal Server Error" });
    }
  };

  getAllSettingsSearch = async (req, res) => {
    try {
      let type = req.params.type;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let searchQuery = req.query.searchQuery;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      if (type && type == "howtouse") {
        let totalcountHow = await Howtouse.count({
          where: {
            isActive: true,
            isDeleted: false,
            title: {
              [Op.like]: `%${searchQuery}%`,
            },
          },
        });
        let getAllHowToUse = await Howtouse.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
            isDeleted: false,
            title: {
              [Op.like]: `%${searchQuery}%`,
            },
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountHow / PageSize),
          totalRecords: totalcountHow,
        };
        res.status(200).send({ success: true, getAllHowToUse, countData });
      } else if (type && type == "terms") {
        let totalcountTerm = await Terms.count({
          where: {
            isActive: true,
            isDeleted: false,
            [Op.or]: [
              {
                title: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
              {
                terms: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
            ],
          },
        });
        let getAllTerms = await Terms.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
            [Op.or]: [
              {
                title: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
              {
                terms: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
            ],
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountTerm / PageSize),
          totalRecords: totalcountTerm,
        };
        res.status(200).send({ success: true, getAllTerms, countData });
      } else if (type && type == "faqs") {
        let totalcountFaq = await FAQS.count({
          where: {
            isActive: true,
            [Op.or]: [
              {
                question: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
              {
                answer: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
            ],
          },
        });
        let getAllFaqs = await FAQS.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
            [Op.or]: [
              {
                question: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
              {
                answer: {
                  [Op.like]: `%${searchQuery}%`,
                },
              },
            ],
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountFaq / PageSize),
          totalRecords: totalcountFaq,
        };
        res.status(200).send({ success: true, getAllFaqs, countData });
      } else if (type && type == "about") {
        let totalcountabout = await About.count({
          where: {
            isActive: true,
            about: {
              [Op.like]: `%${searchQuery}%`,
            },
          },
        });
        let getAllAbout = await About.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
            about: {
              [Op.like]: `%${searchQuery}%`,
            },
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountabout / PageSize),
          totalRecords: totalcountabout,
        };
        res.status(200).send({ success: true, getAllAbout, countData });
      } else if (type && type == "radius") {
        let totalcountradius = await Actionradius.count({
          where: {
            isActive: true,
            miles: {
              [Op.like]: `%${searchQuery}%`,
            },
          },
        });
        let getAllActionRadius = await Actionradius.findAll({
          offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
          limit: parseInt(PageSize),
          where: {
            isActive: true,
            miles: {
              [Op.like]: `%${searchQuery}%`,
            },
          },
        });
        let countData = {
          page: parseInt(PageNumber),
          pages: Math.ceil(totalcountradius / PageSize),
          totalRecords: totalcountradius,
        };
        res.status(200).send({ success: true, getAllActionRadius, countData });
      } else {
        res
          .status(200)
          .send({ code: 404, success: true, message: "Not Found" });
      }
    } catch (error) {
      res.status(500).send({ success: false, error: "Internal Server Error" });
    }
  };

  showUserVoucherHistoryCampaign = async (req, res) => {
    let userId = req.params.userId;
    let camp = [];
    let response = [];
    let permissions = await FindPermission(req.user.id);
    if (permissions.roleId != 1)
      return res.status(404).send({
        success: false,
        message: "You are not authenticated to this route",
      });

    let userVoucher = await Voucher.findAll({
      attributes: ["campaignId"],
      group: ["campaignId"],
      where: {
        userId: userId,
      },
      order: ["campaignId"],
    });

    userVoucher.forEach((res) => {
      camp.push(res.campaignId);
    });

    for (const element of camp) {
      let campRes = await Campaign.findOne({
        where: { id: element },
        include: [
          {
            model: db.campaignDetail,
            include: [
              {
                model: Product,
              },
            ],
          },
          {
            model: Users,
          },
        ],
      });
      response.push(campRes);
    }

    response.length == 0 || response == undefined
      ? res.status(404).send({
          success: false,
          data: [],
          message: "No Voucher Found",
        })
      : res.status(200).send({
          success: true,
          data: response,
          message: "use Campaign history detail",
        });
  };

  showUserVoucher = async (req, res) => {
    try {
      let userId = req.params.userId;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      let permissions = await FindPermission(req.user.id);
      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Voucher.count({
        where: {
          userId: userId,
        },
      });

      let userVoucher = await Voucher.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: {
          userId: userId,
        },
        include: [
          {
            model: Product,
          },
          {
            model: VoucherShare,
            as: "vouchShare",
            include: [
              {
                model: VoucherStatus,
              },
              {
                model: Users,
                as: "Receiver",
                include: [
                  {
                    model: UserDetails,
                  },
                ],
              },
            ],
          },
          {
            model: RedeemeVoucher,
            as: "RedeemeVo",
            include: [
              {
                model: DeliveryOption,
              },
              {
                model: VoucherStatus,
              },
              {
                model: db.deliveryType,
              },
              {
                model: VoucherMerchantRedeeme,
              },
              {
                model: Orders,
                include: [
                  {
                    model: VoucherStatus,
                  },
                ],
              },
            ],
          },
        ],
      });

      let VoucherCountData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      userVoucher.length == 0 || userVoucher == undefined
        ? res.status(404).send({
            success: false,
            data: [],
            count: VoucherCountData,
            message: "No Voucher Found",
          })
        : res.status(200).send({
            success: true,
            data: userVoucher,
            count: VoucherCountData,
            message: "Voucher Detail",
          });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  showUserVoucherSearch = async (req, res) => {
    try {
      let userId = req.params.userId;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let SearchQuery = req.query.searchQuery;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      let permissions = await FindPermission(req.user.id);
      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Voucher.count({
        where: {
          userId: userId,
          voucherCode: {
            [Op.like]: `${SearchQuery}%`,
          },
        },
      });

      let userVoucher = await Voucher.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: {
          userId: userId,
          voucherCode: {
            [Op.like]: `${SearchQuery}%`,
          },
        },
        include: [
          {
            model: Product,
          },
          {
            model: VoucherShare,
            as: "vouchShare",
            include: [
              {
                model: VoucherStatus,
              },
              {
                model: Users,
                as: "Receiver",
                include: [
                  {
                    model: UserDetails,
                  },
                ],
              },
            ],
          },
          {
            model: RedeemeVoucher,
            as: "RedeemeVo",
            include: [
              {
                model: DeliveryOption,
              },
              {
                model: VoucherStatus,
              },
              {
                model: db.deliveryType,
              },
              {
                model: VoucherMerchantRedeeme,
              },
              {
                model: Orders,
                include: [
                  {
                    model: VoucherStatus,
                  },
                ],
              },
            ],
          },
        ],
      });

      let VoucherCountData = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      userVoucher.length == 0 || userVoucher == undefined
        ? res.status(404).send({
            success: false,
            data: [],
            count: VoucherCountData,
            message: "No Voucher Found",
          })
        : res.status(200).send({
            success: true,
            data: userVoucher,
            count: VoucherCountData,
            message: "Voucher Detail",
          });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  transactionDetailHistorySearchbytransactioncode = async (req, res) => {
    try {
      let UserId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let permissions = await FindPermission(UserId);
      let SearchQuery = req.query.searchQuery;

      function hasNumber(myString) {
        return !isNaN(parseFloat(myString)) && isFinite(myString);
      }

      if (permissions.roleId != 1)
        return res.status(404).send({
          success: false,
          message: "You are not authenticated to this route",
        });

      let totalcount = await Transaction.count();

      let transactionResp = await Transaction.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: {
          [Op.or]: [
            {
              transactionCode: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? "" : SearchQuery + "%",
              },
            },
            {
              userId: {
                [Op.like]:
                  hasNumber(SearchQuery) == true ? parseInt(SearchQuery) : "",
              },
            },
          ],
        },
        include: [
          {
            model: TransactionDetail,
            include: [
              {
                model: Campaign,
                include: [
                  {
                    model: db.campaignDetail,
                    include: [
                      {
                        model: db.product,
                      },
                    ],
                  },
                  {
                    model: Users,
                  },
                ],
              },
            ],
          },
          {
            model: Users,
          },
        ],
        order: [["id", "DESC"]],
      });

      let transactioDataCount = {
        page: parseInt(PageNumber),
        pages: Math.ceil(totalcount / PageSize),
        totalRecords: totalcount,
      };

      res.status(200).send({
        success: true,
        data: transactionResp,
        transactioDataCount,
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong!",
      });
    }
  };

  getAllMerchantOrderDetails = async (req, res) => {
    try {
      let id = req.query.marchantid;
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
      let totalcount = await Orders.count({ where: where1 });
      allOrders = await Orders.findAll({
        offset: (parseInt(PageNumber) - 1) * parseInt(PageSize),
        limit: parseInt(PageSize),
        where: where1,
        include: [
          { model: Users },
          {
            model: Campaign,
            include: [
              {
                model: campaignDetail,
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
            model: Voucher,
          },
          {
            model: RedeemeVoucher,
            where: where2,
            include: [
              {
                model: VoucherMerchantRedeeme,
                include: [
                  {
                    model: DeliveryOption,
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
            order: [["redeemeDevOpId", "ASC"]],
          },
        ],
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

  getTransactionsByMerchantid = async (req, res) => {
    try {
      let getmerchantId = req.query.marchantid;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      let getCampaings = await Campaign.findAll({
        attributes: ["id"],
        raw: true,
        where: {
          merchantId: getmerchantId,
        },
      });
      if (getCampaings.length) {
        let counter = 0;
        let campaingsarray = [];
        getCampaings.forEach(async (val, index, array) => {
          campaingsarray.push(val.id);
          counter++;
          if (counter === array.length) {
            let getTransactionDetails = await TransactionDetail.findAll({
              raw: true,
              nest: true,
              where: {
                campaignId: campaingsarray,
              },
              include: [
                {
                  model: Transaction,
                  include: [{ model: Users }],
                },
              ],
            });
            let countData = {
              page: parseInt(PageNumber),
              pages: Math.ceil(getTransactionDetails.length / PageSize),
              totalRecords: getTransactionDetails.length,
            };
            res.status(200).send({
              success: true,
              data: getTransactionDetails.slice(
                paginations.Start,
                paginations.End
              ),
              countData,
            });
          }
        });
      } else {
        res.status(200).send({
          success: true,
          data: [],
          message: "NO Sales found",
        });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  showRedeemVoucherByMarchantid = async (req, res) => {
    let query, result, userPerm, countVoucher;
    let { ActionId } = req.params;
    let merchantId = req.query.marchantid;
    let PageNumber = req.query.pageNumber;
    let PageSize = req.query.pageSize;

    userPerm = await Permissions.findOne({
      where: {
        userId: merchantId,
        roleId: 3,
      },
    });

    if (!userPerm) {
      return res.status(404).send({ success: false, message: "No user Found" });
    }

    if (userPerm && userPerm.roleId != 3) {
      return res
        .status(404)
        .send({ success: false, message: "You Don't Have Permission" });
    }

    ActionId =
      ActionId == 1
        ? { Active: 1, statusId: 1 }
        : ActionId == 2
        ? { Active: 0, statusId: 2 }
        : { Active: 0, statusId: 3 };
    // ActionId 1--> show Pending
    // ActionId 2--> show Approved
    // ActionId 3--> show Declined
    try {
      
      query = `Select vm.id,u.userName,uud.firstName as userFirstName,uud.lastName as userLastName ,uud.phoneNumber as userPhoneNumber,vg.voucherCode,rv.name,rv.phonenumber,rv.address,rv.city,rv.province,rv.postalcode,rv.emailId,rv.instruction, vs.status,do.deliveryName,dt.deliveryTypeName as deliveryType,md.bussinessName as MerchantBussinessName
        ,md.storeName as MerchantStoreName,p.name as productName,p.stock as ProductStock,c.name as ProductcategoryName,s.name as ProductsubcategoryName,cp.name as CampaignName,cp.campaignCode,cp.Discount as CampaignDiscount,
        cp.campaignStartsAt,cp.campaignExpiresAt,cp.campaingAmount, vm.createdAt
        from voucherMerchantRedeemes AS vm
        inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
        left join vouchergens as vg on vg.id = rv.voucherId
        left join voucherStatuses as vs on vs.id = vm.statusId
        left join merchantDetails as md on md.userId = vm.merchantId
        left join users as u on u.id = rv.userId
        left join usersdetails as uud on uud.userId = u.id
        left join products as p on p.id = vg.productId
        left join categories as c on c.id = p.categoryId
        left join subcategories as s on s.id = p.subcategoryId
        left join campaigns as cp on cp.id = vg.campaignId
        left join deliveryOptions as do on do.id = rv.redeemeDevOpId
        left join deliveryTypes as dt on dt.id = rv.redeemeDevTypeId
        where vm.merchantId = ${merchantId} and vm.statusId = 1 and vm.isActive = 1 and do.id = ${
        req.params.ActionId
      }
        LIMIT ${parseInt(PageSize)} OFFSET ${
        (parseInt(PageNumber) - 1) * parseInt(PageSize)
      }`;
      
      let querycount = `select COUNT(vm.id) as count from voucherMerchantRedeemes AS vm
        inner join redeemeVouchers AS rv on rv.id = vm.redeemeVoucherId
        left join deliveryOptions as do on do.id = rv.redeemeDevOpId
        where vm.merchantId = ${merchantId} and vm.statusId = 1 and vm.isActive = 1 and do.id = ${req.params.ActionId}`;
        
        
      result = await db.sequelize.query(query);
      let resultCount = await db.sequelize.query(querycount);

      countVoucher = {
        page: parseInt(PageNumber),
        pages: Math.ceil(resultCount[0][0].count / PageSize),
        totalRecords: resultCount[0][0].count,
      };

      result[0].length > 0
        ? res.status(200).send({
            success: true,
            data: result[0],
            countVoucher,
            message: "Redeeme Voucher Found",
          })
        : res.status(200).send({
            success: true,
            data: [],
            message: "NO redeeme voucher found",
          });
    } catch (e) {
      res
        .status(400)
        .send({ success: false, error: e, message: "There is some error" });
    }
  };
}
module.exports = GetSuperAdmin;
