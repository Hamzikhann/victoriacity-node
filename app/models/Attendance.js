// import {Sequelize,DataTypes} from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();
const sequelize = require("../../config/connectdb.js");
const Employee = require("./Employee.js");

const Attendance = sequelize.define("attendence", {
	month: {
		type: DataTypes.STRING,
		allowNull: false,
		notEmpty: true
	},
	year: {
		type: DataTypes.STRING,
		allowNull: false,
		notEmpty: true
	},
	date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
		notEmpty: true
	},
	attendance: {
		type: DataTypes.TEXT,
		allowNull: false,
		notEmpty: true
	},

	employeeId: {
		type: DataTypes.INTEGER
	},
	isDeleted: {
		type: DataTypes.BOOLEAN,
		default: 0
	}
});

sequelize
	.sync()
	.then(() => {
		// console.log('Attendance table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});
Attendance.belongsTo(Employee, { as: "employee", foreignKey: "employeeId", targetKey: "employeeId" });

// export default Attendance;
module.exports = Attendance;
