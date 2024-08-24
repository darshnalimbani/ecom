// cart.route.js

const express = require("express");
const router = express.Router();
const validate = require("../middleware/validations");
const { addToCart, checkout } = require("../controllers/cart.controller");
const authenticate = require("../middleware/authenticate");

// Add to Cart
router.post("/add-to-cart", authenticate, addToCart);

// Checkout
router.post("/checkout", validate.checkout,authenticate, checkout);

module.exports = router;