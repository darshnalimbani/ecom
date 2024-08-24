const { DataTypes } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    { underscored: true , timestamps: false}
  );
  Product.associate = function (models) {
    Product.hasMany(models.OrderItem, {
      foreignKey: "product_id",
      as: "products",
      onDelete: "CASCADE",
    });
    Product.hasMany(models.Cart, {
      foreignKey: "product_id",
      as: "product",
      onDelete: "CASCADE",
    });
  };
  return Product;
};
