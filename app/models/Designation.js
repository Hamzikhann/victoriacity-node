// import {Sequelize,DataTypes} from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");

const Designation = sequelize.define("designations", {
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

sequelize
	.sync()
	.then(() => {
		// Designation.associate = function (models) {
		//    Designation.hasmany(Customer, { as: 'Customer' })
		// };
		// console.log('Designation table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

// export default Designation
module.exports = Designation;
