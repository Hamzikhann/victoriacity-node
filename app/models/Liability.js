const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  return sequelize.define("Liability", {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount:{
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    balance:{
      type: DataTypes.FLOAT,
      allowNull: true,
    }
  });
};
