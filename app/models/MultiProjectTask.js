// import {Sequelize,DataTypes} from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import User from './User.js';
// import MultiProjectTask from './MultiProjectTask.js';

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const User = require("./User.js");
const ProjectTask = require("./ProjectTask.js");

const MultiProjectTask = sequelize.define("MultiProjectTask", {
	projectTaskId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		notEmpty: true
	},
	userId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		notEmpty: true
	}
});
MultiProjectTask.belongsTo(User, { as: "user", foreignKey: "userId" });
MultiProjectTask.belongsTo(ProjectTask, { as: "projectTask", foreignKey: "projectTaskId" });
sequelize
	.sync()
	.then(() => {
		// console.log('Multi Project Task  table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

// export default MultiProjectTaskAsset
module.exports = MultiProjectTask;
