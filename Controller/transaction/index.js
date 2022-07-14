const _ = require("lodash");
const randomstring = require("crypto-random-string");

const db = require("../../Model");
const { transaction, users, campaign } = require("../../Model");
const { ArraySlicePagination } = require("../extras/pagination/pagination");

const Transaction = db.transaction;
const TransactionDetails = db.transactionDetail;
const campaings = db.campaign;
const Op = db.Sequelize.Op;

class TransactionController {
  create = async (req, res) => {
    try {
      // PAYLOAD
      const transactionPayload = _.pick(req.body, [
        "userId",
        "netAmount",
        "discount",
        "camId",
        "paymentType",
        "paymentId",
        "transactionCode",
      ]);
      //   ASSIGN RANDOM CODE TO PAYLOAD
      transactionPayload.transactionCode = randomstring({
        length: 10,
        type: "distinguishable",
      });

      let p_code = await db.promoCode.findOne({
        raw: true,
        where: { code: req.body.promoCode, isActive: true },
      });

      let _ = await db.AppliedPromocode.create({
        userId: req.user.id,
        promocodeId: p_code.id,
      });

      await db.promoCode.update(
        { quantity: p_code.quantity - 1 },
        {
          where: {
            id: p_code.id,
          },
        }
      );

      let transaction = await Transaction.create(transactionPayload);

      return res.status(200).send({ success: true, transaction });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Something Went Wrong",
      });
    }
  };

  getTransactionsByMerchant = async (req, res) => {
    try {
      let getmerchantId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      let getCampaings = await campaings.findAll({
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
            let getTransactionDetails = await TransactionDetails.findAll({
              raw: true,
              nest: true,
              where: {
                campaignId: campaingsarray,
              },
              include: [
                {
                  model: db.transaction,
                  include: [{ model: db.users,  }],
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
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  getTransactionsByUser = async (req, res) => {
    try {
      let userId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      function paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice(
          (page_number - 1) * page_size,
          page_number * page_size
        );
      }

      let getusertransaction = await Transaction.findAll({
       
        include: [
          {
            model: TransactionDetails,
            
            include: [
              {
                model: campaings,
                
                 include: [
                  {
                    model: db.imageData,
                    required: false,
                    association: db.campaign.hasMany(db.imageData, {
                      foreignKey: "typeId",
                    }),
                    where: {
                      imageType: "Campaign",
                    },
                  },
                  {
                    model: db.users,
                    include: [
                      {
                        model: db.imageData,
                        // required: false,
                        // where: {
                        //   imageType: "User",
                        // },
                      },
                      {
                        model: db.usersdetail,
                      },
                      {
                        model: db.MerchantDetails,
                      },
                    
                    ],
                  },

                  {
                    model: db.campaignDetail,
                    include: [
                      {
                        model: db.product,
                        include: [
                          {
                            model: db.imageData,
                            association: db.product.hasMany(db.imageData, {
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
                 ],
              },
              
            ],
          },
          {
            model: db.users,
            include: [
              {
                model: db.imageData,
                where: {
                  imageType: "User",
                },
              },
            ],
          },
        ],


        where: {
          userId: userId,
        },
        order: [["id", "DESC"]],
      });

      

    
            let countData = {
              page: parseInt(PageNumber),
              pages: Math.ceil(getusertransaction.length / PageSize),
              totalRecords: getusertransaction.length,
              };
            res.status(200).send({
              success: true,
              data: paginate(getusertransaction, PageSize, PageNumber),
              countData
            });
         
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  getTransactionsByMerchantSearch = async (req, res) => {
    try {
      let getmerchantId = req.user.id;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let searchQuery = req.query.searchQuery;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      let getCampaings = await campaings.findAll({
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
            let getTransactionDetails = await TransactionDetails.findAll({
              raw: true,
              nest: true,
              where: {
                campaignId: campaingsarray,
              },
              include: [
                {
                  model: transaction,
                  include: [
                    {
                      model: users,
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
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };

  transactionSearchAdmin = async (req, res) => {
    try {
      let { merchantId } = req.params;
      let PageNumber = req.query.pageNumber;
      let PageSize = req.query.pageSize;
      let searchQuery = req.query.searchQuery;
      let paginations = ArraySlicePagination(PageNumber, PageSize);

      let getCampaings = await campaings.findAll({
        attributes: ["id"],
        raw: true,
        where: {
          merchantId: merchantId,
        },
      });
      if (getCampaings.length > 0) {
        let counter = 0;
        let campaingsarray = [];
        getCampaings.forEach(async (val, index, array) => {
          campaingsarray.push(val.id);
          counter++;
          if (counter === array.length) {
            let getTransactionDetails = await TransactionDetails.findAll({
              
              include: [
                {
                  model: transaction,
                  required: true,
                   include: [
                     {
                       model: users,
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
                },
              ],
              where: {
                campaignId: campaingsarray,
              },
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
      }else{
        res.status(200).send({
          success: true,
          data: [],
          message:'No data found',
        });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };
}
module.exports = TransactionController;
