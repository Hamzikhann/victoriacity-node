// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import Employee from './Employee.js';
// import User from './User.js';


const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../../config/connectdb.js');
const Employee = require('./Employee.js');
const User = require('./User.js');



const Leave = sequelize.define("leaves", {
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    notEmpty: true,
    // references: {
    //     model: 'Employee',
    //     key: 'id'
    // }
  },
  status: {
    type: Sequelize.ENUM("Approved", "Rejected", "Pending"),
    defaultValue: "Pending",
    allowNull: true,
    notEmpty: true,
  },

  reason: {
    type: DataTypes.STRING,
    allowNull: false,
    notEmpty: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER, /// USE as a Foreign key in User Table
    allowNull: true,
    notEmpty: true,
  },
  updatedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    notEmpty: true,
  },
  adminComment: {
    type: DataTypes.STRING,
    allowNull: true,
    notEmpty: true,
  },
  hrComment: {
    type: DataTypes.STRING,
    allowNull: true,
    notEmpty: true,
  },

  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    notEmpty: true,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    notEmpty: true,
  },
});


// Associations
Leave.belongsTo(Employee, { as: 'employee', foreignKey: 'employeeId' });
Leave.belongsTo(User, { as: 'user', foreignKey: 'updatedBy' });

sequelize
  .sync()
  .then(() => {
    console.log('Leave table created successfully!');
  })
  .catch((error) => {
    console.error('Unable to create table:', error);
  });

// export default Leave;
module.exports = Leave