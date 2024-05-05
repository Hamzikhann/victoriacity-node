// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js";

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");

const ProjectLog = sequelize.define("projectLog", {
	employeeId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		notEmpty: true
	},
	// date: {
	//     type: DataTypes.DATEONLY,
	//     allowNull: true,
	//     notEmpty: false,
	// },

	projectId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		notEmpty: true
	}
});

ProjectLog.associate = function (models) {};

sequelize
	.sync()
	.then(() => {
		// console.log('ProjectLog table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

// export default ProjectLog;
module.exports = ProjectLog;
