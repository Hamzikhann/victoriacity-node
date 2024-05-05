// import {Sequelize,DataTypes} from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// const {Sequelize = require('sequelize').Sequelize;
// const DataTypes = require('sequelize').DataTypes;
const { Sequelize, DataTypes } = require("sequelize");

const dotenv = require("dotenv");
dotenv.config();
// const sequelize = require('../../config/connectdb.js').sequelize;
const sequelize = require("../../config/connectdb.js");

const AssetType = sequelize.define("assetType", {
	name: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	status: {
		type: Sequelize.ENUM("Active", "InActive"),
		allowNull: true,
		notEmpty: true
	}
});

sequelize
	.sync()
	.then(() => {
		// console.log('Assets table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

module.exports = AssetType;
