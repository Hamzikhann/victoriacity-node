const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  return sequelize.define("pay_off", {
    amount:{
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    liabilityId:{
      type: DataTypes.INTEGER(),
      allowNull: true,
    },
    description:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
  },
  });
};
