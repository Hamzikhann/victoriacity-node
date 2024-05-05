// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// // import Project from './project.js';
// import Designation from './Designation.js';
// // import project from './project.js';
// // import Project from './project.js';
const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const Designation = require("./Designation.js");

const Customer = sequelize.define("customer", {
	fullName: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	fatherName: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	companyName: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	dob: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		notEmpty: true
	},
	customerId: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: false
	},
	gender: {
		type: Sequelize.ENUM("Male", "Female"),
		allowNull: true,
		notEmpty: true
	},
	cnic: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	contact: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	email: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	address: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},

	designation: {
		type: DataTypes.INTEGER(11),
		allowNull: true,
		notEmpty: true
	},

	emergencyContactNumber: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	emergencyContactAddress: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},

	image: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: false,
		get() {
			const rawValue = this.getDataValue("image");
			return `${process.env.APP_URL}/${rawValue}`;
		}
	}
});

sequelize
	.sync()
	.then(() => {
		// console.log('Customer table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

Customer.belongsTo(Designation, { foreignKey: "designation", as: "designationDetail" });

module.exports = Customer;
