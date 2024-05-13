// import {Sequelize,DataTypes} from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");

const ConversionUser = sequelize.define("conversionUsers", {
	name: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	email: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},

	mobileNo: {
		type: DataTypes.STRING,
		notEmpty: true
	},

	password: {
		type: DataTypes.STRING,
		notEmpty: true
	},

	image: {
		type: DataTypes.STRING,
		allowNull: true,
		nonEmpty: true
	},

	role: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},

	status: {
		type: Sequelize.ENUM("active", "InActive"),
		allowNull: true,
		notEmpty: true
	}
});

sequelize
	.sync()
	.then(() => {
		// console.log('ConversionUser table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

// export default ConversionUser;
module.exports = ConversionUser;
