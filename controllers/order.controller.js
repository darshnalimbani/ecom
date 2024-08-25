const { Op, fn, col, literal, where } = require("sequelize");

const {
  sequelize,
  Sequelize,
  Order,
  Cart,
  OrderItem,
  Product,
  User,
} = require("../models");

exports.placeOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  const userId = req.user.id;

  try {
    // Find the last checkout order
    const order = await Order.findOne({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      transaction,
    });
    if (!order || order.status !== "Placed") {
      return res.status(400).json({ message: "You need to checkout first." });
    }

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
      transaction,
    });

    if (!cartItems || cartItems.length == 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    let totalAmount = 0;
    let totalQuantity = 0;
    const orderedProducts = [];
    // Add items to order_items
    for (const item of cartItems) {
      await OrderItem.create(
        {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.price,
        },
        { transaction }
      );

      // Decrement the stock
      await Product.update(
        { stock: Sequelize.literal(`stock - ${item.quantity}`) },
        { where: { id: item.product_id }, transaction }
      );
      await Order.update(
        { status: "Completed" },
        {
          where: { user_id: userId, status: "Placed" },
          order: [["created_at", "DESC"]],
          transaction,
        }
      );
      // totals
      totalAmount += item.quantity * item.product.price;
      totalQuantity += item.quantity;

      // Add product details to the summary
      orderedProducts.push({
        product_id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        total: item.quantity * item.product.price,
      });
    }
    // Clear the cart
    await Cart.destroy({ where: { userId }, transaction });
    await transaction.commit();

    return res.status(201).json({
      type: "success",
      message: "Order placed successfully...",
      order: {
        order_id: order.id,
        total_amount: totalAmount,
        total_quantity: totalQuantity,
        products: orderedProducts,
      },
    });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.getOrder = async (req, res) => {
  const user_id = req.user.id;
  try {
    const orders = await Order.findOne({
      where: { user_id },
      include: [
        {
          model: OrderItem,
          as: "order",
          attributes: ["id", "quantity"],
          order: [["id", "DESC"]],
          include: [
            {
              model: Product,
              as: "products",
              attributes: ["name", "price"],
            },
          ],
        },
      ],
      attributes: ["id", "userId", "totalAmount", "orderDate"],
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    return res
      .status(200)
      .json({
        type: "success",
        message: "Orders fetched successfully...",
        data: orders,
      });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
exports.getAllOrders = async (req, res) => {
  const user_id = req.user.id;
  try {
    const orders = await Order.findAll({
      where: { user_id },
      include: [
        {
          model: OrderItem,
          as: "order",
          attributes: ["id", "quantity"],
          order: [["created_at", "DESC"]],
          include: [
            {
              model: Product,
              as: "products",
              attributes: ["name", "price"],
            },
          ],
        },
      ],
      attributes: ["id", "userId", "totalAmount", "orderDate"],
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    return res.status(200).json({
      type: "success",
      message: "Orders fetched successfully...",
      data: orders,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getSecondHighestOrderValue = async (req, res, next) => {
  try {
    const maxTotalAmount = await Order.max("total_amount");
    if (maxTotalAmount === null) {
      return res.status(404).json({ message: "No orders found" });
    }

    const secondHighestOrderValue = await Order.findOne({
      where: {
        total_amount: { [Op.lt]: maxTotalAmount },
      },
      order: [["total_amount", "DESC"]],
    });

    if (!secondHighestOrderValue) {
      return res
        .status(404)
        .json({ message: "No second highest order value found" });
    }

    // Fetch order details
    const orderItems = await OrderItem.findAll({
      where: { order_id: secondHighestOrderValue.id },
      include: [{ model: Product, as: "products" }],
    });
    const orderDetails = {
      order_id: secondHighestOrderValue.id,
      total_amount: secondHighestOrderValue.totalAmount,
      created_at: secondHighestOrderValue.created_at,
      products: orderItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
    };

    return res.status(200).json({
      type: "success",
      data: { second_highest_order: orderDetails },
    });
  } catch (err) {
    console.error("Error fetching second highest order value:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMonthlyOrdersAnalysis = async (req, res) => {
  try {
    const monthlyAnalysis = await Order.findAll({
      attributes: [
        [fn("TO_CHAR", literal("order_date, 'Month'")), "month_name"],
        [fn("EXTRACT", literal("MONTH FROM order_date")), "month"],
        [fn("COUNT", col("id")), "total_orders"],
        [fn("COALESCE", fn("SUM", col("total_amount")), 0), "total_revenue"],
      ],
      where: Sequelize.where(
        fn("EXTRACT", literal("YEAR FROM order_date")),
        2023
      ),
      group: ["month_name", "month"],
      order: [["month", "ASC"]],
    });

    res.status(200).json({
      type: "success",
      data: monthlyAnalysis,
    });
  } catch (err) {
    console.error("Error fetching monthly orders analysis:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};