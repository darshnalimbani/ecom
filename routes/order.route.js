// order.route.js

const express = require("express");
const router = express.Router();
const { placeOrder, getOrder, getAllOrders, getSecondHighestOrderValue, getMonthlyOrdersAnalysis, getLowSalesProducts, getUserOrderSummary } = require("../controllers/order.controller");
const authenticate = require("../middleware/authenticate");

// Place Order
router.post("/place-order", authenticate, placeOrder);

// Get Orders
router.get("/getAllOrders", authenticate, getAllOrders);
router.get("/get-orders", authenticate, getOrder);

//queries result
router.get("/second-highest-value", getSecondHighestOrderValue);
router.get("/monthly-analysis", getMonthlyOrdersAnalysis);
// router.get("/user-summary", getUserOrderSummary);
// router.get("/low-sales", getLowSalesProducts);

module.exports = router;