
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../../config/connectdb.js');

const employeeAsset= sequelize.define("multiSalaryTransaction", {
   accountTransaction: {
      type: DataTypes.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    employeeSalaryHistory: {
        type: DataTypes.INTEGER,
        allowNull: true,
        notEmpty: true,
    }
 });

module.exports = employeeAsset
