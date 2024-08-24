const { Op, fn, col, literal } = require("sequelize");

const {
  sequelize,
  Sequelize,
  Order,
  Cart,
  OrderItem,
  Product,
  User,
} = require("../models");

exports.placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  const userId = req.user.id;

  try {
    // Find the last checkout order
    const order = await Order.findOne({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      transaction,
    });
    if (!order) {
      return res.status(400).json({ message: "No checkout found" });
    }

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
      transaction,
    });

    if (!cartItems || cartItems.length == 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Add items to order_items and update stock
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

      // Decrement product stock
      await Product.update(
        { stock: Sequelize.literal(`stock - ${item.quantity}`) },
        { where: { id: item.product_id }, transaction }
      );
    }

    // Clear the cart
    await Cart.destroy({ where: { userId }, transaction });
    await transaction.commit();

    return res.status(201).json({
      type: "success",
      message: "Order placed successfully",
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
        message: "Orders fetched successfully",
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
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getSecondHighestOrderValue = async (req, res) => {
  try {
    // Subquery to get the maximum total_amount
    const maxTotalAmount = await Order.max('total_amount');

    if (maxTotalAmount === null) {
      return res.status(404).json({ message: 'No orders found' });
    }

    // Find the maximum total_amount less than the overall maximum
    const secondHighestOrderValue = await Order.max('total_amount', {
      where: {
        total_amount: { [Op.lt]: maxTotalAmount },
      },
    });

    if (secondHighestOrderValue === null) {
      return res.status(404).json({ message: 'No second highest order value found' });
    }

    res.status(200).json({
      type: 'success',
      data: { second_highest_order_value: secondHighestOrderValue },
    });
  } catch (err) {
    console.error('Error fetching second highest order value:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMonthlyOrdersAnalysis = async (req, res) => {
  try {
    const monthlyAnalysis = await Order.findAll({
      attributes: [
        [
          fn("EXTRACT", literal("MONTH FROM order_date")),
          "month",
        ],
        [fn("COUNT", col("id")), "total_orders"],
        [fn("SUM", col("total_amount")), "total_revenue"],
      ],
      where: (
        fn("EXTRACT", literal("YEAR FROM order_date")),
        2024
      ),
      group: ["month"],
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

// exports.getUserOrderSummary = async (req, res) => {
//   try {
//     const userSummary = await User.findAll({
//       attributes: [
//         "id AS user_id",
//         "username",
//         [fn("COUNT", col("orders.id")), "total_orders"],
//         [
//           fn("SUM", col("order_items.quantity")),
//           "total_products",
//         ],
//         [
//           fn("SUM", col("orders.total_amount")),
//           "total_order_value",
//         ],
//       ],
//       include: [
//         {
//           model: Order,
//           as: "orders",
//           include: [
//             {
//               model: OrderItem,
//               as: "order",
//             },
//           ],
//         },
//       ],
//       group: ["User.id", "User.username"],
//     });

//     res.status(200).json({
//       type: "success",
//       data: userSummary,
//     });
//   } catch (err) {
//     console.error("Error fetching user-wise ordering summary:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.getLowSalesProducts = async (req, res) => {
//   try {
//     const lowSalesProducts = await Product.findAll({
//       attributes: [
//         // "id AS product_id",
//         "name",
//         [
//           fn(
//             "COALESCE",
//             fn("SUM", col("order_items.quantity")),
//             0
//           ),
//           "total_quantity_sold",
//         ],
//       ],
//       include: [
//         {
//           model: OrderItem,
//           as: "products",
//           include: [
//             {
//               model: Order,
//               as: "orders",
//               where: {
//                 order_date: {
//                   [Op.between]: ["2023-10-01", "2023-12-31"],
//                 },
//               },
//             },
//           ],
//         },
//       ],
//       group: ["Product.id"],
//       having: (
//         fn(
//           "COALESCE",
//           fn("SUM", col("order_items.quantity")),
//           0
//         ),
//         "<",
//         3
//       ),
//     });

//     res.status(200).json({
//       type: "success",
//       data: lowSalesProducts,
//     });
//   } catch (err) {
//     console.error("Error fetching low sales products:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };