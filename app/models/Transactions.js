const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");

const Transaction = sequelize.define("transactions", {
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
	instrumentNoDetail: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	description: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	}
});

sequelize
	.sync()
	.then(() => {
		// console.log('Transaction table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

module.exports = Transaction;
