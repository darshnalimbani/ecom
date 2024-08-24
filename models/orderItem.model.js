const { DataTypes } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const OrderItem = sequelize.define( "OrderItem",{
      orderId: {
        type: Sequelize.INTEGER,
      },
      productId: {
        type: Sequelize.INTEGER,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    { underscored: true }
  );

  OrderItem.associate = function (models) {
    OrderItem.belongsTo(models.Order, {
      foreignKey: "order_id",
      as: "orders",
    });
    OrderItem.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "products",
    });
  };
  return OrderItem;
};