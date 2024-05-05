const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");

const UnVarifiedTransaction = sequelize.define("unVarifiedTransactions", {
	payeeName: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	bookingRegNo: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: false
	},
	recieptHead: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: false
	},
	paymentMode: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	amount: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	instrumentNo: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	instrumentDate: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		notEmpty: true
	}
});

sequelize
	.sync()
	.then(() => {
		// console.log('UnVarified Transaction table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

module.exports = UnVarifiedTransaction;
