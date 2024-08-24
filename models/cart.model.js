module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define(
    "Cart",
    {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      underscored: true,
    }
  );

   Cart.associate = function (models) {
     Cart.belongsTo(models.Product, {
       foreignKey: "product_id",
       as: "product",
     });
     Cart.belongsTo(models.User, {
       foreignKey: "user_id",
       as: "users",
     });
   };
  return Cart;
};