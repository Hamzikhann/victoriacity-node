const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../../config/connectdb.js');
const expenseCategory= require('./ExpenseCategories.js')
const incomeCategory = require('./IncomeCategories.js');


const Settings = sequelize.define("setting",  {
   
    

   incomeCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    expenseCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }

});

Settings.belongsTo(incomeCategory, {as: 'incomeCategory',foreignKey: 'incomeCategoryId'});
Settings.belongsTo(expenseCategory, {as: 'expenseCategory',foreignKey: 'expenseCategoryId'});

module.exports = Settings