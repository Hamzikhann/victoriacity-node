const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./config/connectdb.js');
const Employee = require('./app/models/Employee.js');



const DispatchedSalaries = sequelize.define('dispatchedSalaries', {
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  salary: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: Sequelize.literal('CURRENT_DATE'),
  },
  month: {
    type: DataTypes.INTEGER,
    defaultValue: Sequelize.literal('MONTH(CURRENT_DATE)'),
  },
});
// DispatchedSalaries.belongsTo(Employee, { as: "Employee", foreignKey: "employeeId" });
module.exports = DispatchedSalaries;
