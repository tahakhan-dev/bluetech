const Token = require("../Middleware/token");

const OrdersController = require("../Controller/orders/orders.controller");
const TransactionController = require("../Controller/transaction");

var router = require("express").Router();

let Order = new OrdersController();
let Transaction = new TransactionController();

router.post("/create", Token.isAuthenticated(), Order.create);
router.get("/getAll/:ActionId", Token.isAuthenticated(), Order.getAll);
router.get("/getAllSearch/:ActionId", Token.isAuthenticated(), Order.getAllSearch);
router.get("/getAllAdminSearch/:ActionId/:merchantId", Token.isAuthenticated(), Order.getAllAdminSearch);
router.get("/getCustomerOder", Token.isAuthenticated(), Order.getCustomerOder);
router.get("/getPendingCustomerOder", Token.isAuthenticated(), Order.getPendingCustomerOder);
router.get("/updateOrder/:id", Token.isAuthenticated(), Order.updateStatus);
router.get(
  "/getDeliveredOrder",
  Token.isAuthenticated(),
  Order.getDeliveredOrder
);

router.post("/transaction/create", Transaction.create);
router.get(
  "/transaction/getByMerchant",
  Token.isAuthenticated(),
  Transaction.getTransactionsByMerchant
);

router.get(
  "/transaction/getByUser",
  Token.isAuthenticated(),
  Transaction.getTransactionsByUser
);

router.get(
  "/transactionSearch/getByMerchant",
  Token.isAuthenticated(),
  Transaction.getTransactionsByMerchantSearch
);

router.get(
  "/transactionSearchAdmin/getByMerchant/:merchantId",
  Token.isAuthenticated(),
  Transaction.transactionSearchAdmin
);

router.get("/getCustomerOderHistory", Token.isAuthenticated(), Order.getCustomerOderHistory);

module.exports = router;
