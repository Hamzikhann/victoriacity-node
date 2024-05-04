const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  return sequelize.define("Location", {
    Location_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Plot_Location:{
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    Percentage:{
      type: DataTypes.FLOAT,
      allowNull: true,
      notEmpty: true,
    },
    isActive:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
      notEmpty: true,
    }
  });
};
