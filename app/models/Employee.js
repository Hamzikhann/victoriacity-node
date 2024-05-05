// import { Sequelize, DataTypes } from 'sequelize';

// import sequelize from "../../config/connectdb.js"
// import Designation from './Designation.js';
// import JobCandidate from './JobCandidate.js';

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const Designation = require("./Designation.js");
const JobCandidate = require("./JobCandidate.js");
const EmployeeRelation = require("./EmployeeRelation.js");
function setUrl() {
	let value = process.env.APP_URL;
	return value;
}
let image;

const Employee = sequelize.define("employees", {
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
	dob: {
		type: DataTypes.DATEONLY,
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
	maritalStatus: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	address: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	employeeId: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	designation: {
		type: DataTypes.INTEGER(11),
		allowNull: true,
		notEmpty: true
	},
	department: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	branch: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	dateOfJoining: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		notEmpty: false
	},
	basicSalary: {
		type: DataTypes.INTEGER,
		allowNull: true,
		notEmpty: true
	},
	emergencyContactName: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	relationship: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	gender: {
		type: Sequelize.ENUM("Male", "Female"),
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
	status: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		notEmpty: true
	},
	image: {
		//image: `http://dev.sheranwalabackendtest.axiscodingsolutions.com +${image}`,
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true,
		get() {
			const rawValue = this.getDataValue("image");
			return `${process.env.APP_URL}/${rawValue}`;
		}
	},

	candidateId: {
		type: DataTypes.INTEGER(11),
		allowNull: true,
		notEmpty: true
	},
	isDeleted: {
		type: DataTypes.BOOLEAN,
		default: false
	}
});

sequelize
	.sync()
	.then(() => {
		// console.log('Employee table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});
Employee.belongsTo(Designation, { as: "designationAss", foreignKey: "designation" });
Employee.belongsTo(JobCandidate, { as: "candidate", foreignKey: "candidateId" });

// Employee.belongsTo(EmployeeRelation,{as:'employeeRelation',foreignKey:'relationship'})
// // Employee.belongsTo(Leave, { as: 'leave', foreignKey: ' leaveId' })
// export default Employee
module.exports = Employee;
