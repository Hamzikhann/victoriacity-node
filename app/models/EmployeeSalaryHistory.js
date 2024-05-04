const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../../config/connectdb.js');
const AccountTransaction = require('./AccountTransaction.js');
const Employee = require('./Employee.js');



const EmployeeSalaryHistory = sequelize.define('employeesalaryhistory', {
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

// EmployeeSalaryHistory.hasMany(AccountTransaction, { as: 'EmployeeSalaryHistory', foreignKey: 'employeeId' });
EmployeeSalaryHistory.belongsTo(Employee, { as: "Employee", foreignKey: "employeeId",targetKey:'employeeId' });
module.exports = EmployeeSalaryHistory;
