const { validationResult } = require("express-validator");
const { Product, Cart, Order } = require("../models");

exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const cartItem = await Cart.findOne({ where: { userId, productId } });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      await Cart.create({ userId, productId, quantity });
    }
    const cartData = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
      attributes: ["id", "productId","quantity"],
    });
    return res.status(200).json({ message: "Product added to cart", data: cartData });
  } catch (err) {
    console.log("er", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.checkout = async (req, res) => {
  const userId = req.user.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  try {
    const { address, phone_number, payment_method } = req.body;
    const existOrder = await Order.findOne({
      where: { userId, status: "Placed" },
    });

    if (existOrder) {
      return res
        .status(400)
        .json({ message: "Already checked-out, now you can place the order." });
    }
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const total_amount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
    
    // Create a new order
    const newOrder = await Order.create({
      userId,
      totalAmount: total_amount,
      status:"Placed",
      address,
      phone_number,
      payment_method,
    });
    
    return res.status(200).json({
      type: "success",
      message: "Checkout successful",
      data: { order_id: newOrder.id, total_amount },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};