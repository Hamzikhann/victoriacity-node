// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import Employee from './Employee.js';
// import Customer from './Customer.js';

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const Employee = require("./Employee.js");
const Customer = require("./Customer.js");
const IncomeCategoryController = require("../http/controllers/incomeCategoryController.js");
const incomecategory = require("./IncomeCategories.js");

const Project = sequelize.define("project", {
	name: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	startDate: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		notEmpty: false
	},
	endDate: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		notEmpty: false
	},
	priority: {
		type: Sequelize.ENUM("High", "Low", "Medium"),
		allowNull: true,
		notEmpty: true
	},
	description: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	image: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	status: {
		type: DataTypes.BOOLEAN,
		allowNull: true,
		notEmpty: true
	},
	customerId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		notEmpty: true
	}
});

// Project.associate = function (models) {

// };

sequelize
	.sync()
	.then(() => {
		// Project.associate = function (models) {
		//     Project.hasMany(Employee, { as: 'Employee' })
		//     Project.hasOne(Customer, { as: 'Customer' })
		// };
		// console.log('Project table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});
module.exports = Project;
