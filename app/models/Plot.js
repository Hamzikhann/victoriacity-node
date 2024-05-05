// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import FileIssue from './FileIssue.js';

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const FileIssue = require("./OpenFile_Mst.js");

const Plot = sequelize.define("plot", {
	name: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	status: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},

	fileId: {
		type: DataTypes.STRING,
		allowNull: false,
		notEmpty: true
	}
});

sequelize
	.sync()
	.then(() => {
		Plot.associate = function (models) {
			Plot.hasone(FileIssue, { as: "FileIssue" });
		};
		// console.log('Plot table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

// export default Plot;
module.exports = Plot;
