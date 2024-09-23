const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const AccountCategory = require("../models/AccountsCategory.js");
const EmployeeSalaryHistory = require("../models/EmployeeSalaryHistory.js");
const { InstallmentReceipts } = require("./index.js");
const expensecategory = require("./ExpenseCategories.js");
const incomecategory = require("./IncomeCategories.js");

const accounttransaction = sequelize.define("accounttransaction", {
	amount: {
		type: DataTypes.DECIMAL,
		allowNull: false
	},
	balance: {
		type: DataTypes.DECIMAL,
		allowNull: true
	},
	categoryId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	ledgerNo: {
		type: DataTypes.INTEGER,
		allowNull: true
	},
	date: {
		type: DataTypes.DATEONLY,
		allowNull: false
	},
	employeeSalaryHistory: {
		type: DataTypes.INTEGER,
		allowNull: true
	},
	type: {
		type: DataTypes.ENUM("Expense", "Income"),
		allowNull: true
	},
	description: {
		type: DataTypes.STRING,
		allowNull: true
	},
	projectId: {
		type: DataTypes.INTEGER,
		allowNull: true
	},
	receiptId: {
		type: DataTypes.INTEGER,
		allowNull: true
	},
	pmId: {
		type: DataTypes.INTEGER,
		allowNull: true
	}
});
// accounttransaction.belongsTo(AccountCategory, {as: 'Category',foreignKey: 'categoryId'});
accounttransaction.belongsTo(expensecategory, { as: "categoryExpense", foreignKey: "categoryId" });
accounttransaction.belongsTo(incomecategory, { as: "categoryIncome", foreignKey: "categoryId" });
accounttransaction.belongsTo(EmployeeSalaryHistory, {
	as: "EmployeeSalaryHistory",
	foreignKey: "employeeSalaryHistory"
});
// accounttransaction.belongsTo(InstallmentReceipts, { as: "InstallmentReceipts", foreignKey: "receiptId" });
module.exports = accounttransaction;
