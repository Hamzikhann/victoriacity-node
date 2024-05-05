// import {Sequelize,DataTypes} from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import Assets from './Asset.js';
// import Employee from './Employee.js';

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const Assets = require("./Asset.js");
const Employee = require("./Employee.js");

const employeeAsset = sequelize.define("employeeAsset", {
	employeeId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		notEmpty: true
	},
	assetId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		notEmpty: true
	}
});
employeeAsset.belongsTo(Assets, { as: "Asset", foreignKey: "assetId" });
employeeAsset.belongsTo(Employee, { as: "employee", foreignKey: "employeeId" });
sequelize
	.sync()
	.then(() => {
		// console.log('Assets table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

// export default employeeAsset
module.exports = employeeAsset;
