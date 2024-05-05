// import {Sequelize,DataTypes} from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import Job from './Job.js';

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const Job = require("./Job.js");

const Department = sequelize.define("departments", {
	title: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	status: {
		type: DataTypes.BOOLEAN,
		allowNull: true,
		notEmpty: true
	}
});

Department.associate = function (models) {
	Department.hasMany(Job, { as: "Job" });
};

sequelize
	.sync()
	.then(() => {
		// console.log('Department table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

// export default Department
// module.exports = Department
module.exports = Department;
