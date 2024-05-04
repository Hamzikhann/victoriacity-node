const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  return sequelize.define("withdraw", {
    amount:{
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    withdrawalId:{
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
