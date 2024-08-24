module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User",
    {
        username: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },{ underscored: true, paranoid: true }
  );
  User.associate = function (models) {
    User.hasMany(models.Cart, {
      foreignKey: "user_id",
      as: "cart",
      constraints: false,
      onDelete: "CASCADE",
    });

    User.hasMany(models.Order, {
      foreignKey: "user_id",
      as: "orders",
      constraints: false,
      onDelete: "CASCADE",
    });
  };
  return User;
};