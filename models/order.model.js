const { DataTypes } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "Pending",
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      underscored: true,
    }
  );

  Order.associate = function (models) {
    Order.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    Order.hasMany(models.OrderItem, {
      foreignKey: "order_id",
      as: "order",
      constraints: false,
      onDelete: "CASCADE",
    });
  };
  return Order;
};
