// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import UserRole from './UserRole.js';
// import Leave from './Leave.js';
const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const UserRole = require("./UserRole.js");
const UserGroup = require("./User_Group.js");
const User = sequelize.define("users", {
	name: {
		type: DataTypes.STRING,
		// allowNull: true,
		notEmpty: true
	},
	lastName: {
		type: DataTypes.STRING,
		// allowNull: true,
		notEmpty: true
	},
	email: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},

	mobileNo: {
		type: DataTypes.STRING,
		notEmpty: true
	},

	password: {
		type: DataTypes.STRING,
		notEmpty: true
	},

	image: {
		type: DataTypes.STRING,
		allowNull: true,
		nonEmpty: true,
		get() {
			const rawValue = this.getDataValue("image");
			return `${process.env.APP_URL}/${rawValue}`;
		}
	},

	role: {
		type: DataTypes.INTEGER,
		allowNull: false,
		notEmpty: true
	},

	status: {
		type: DataTypes.BOOLEAN,
		allowNull: true,
		notEmpty: true
	},
	user_group: {
		type: DataTypes.INTEGER,
		allowNull: true,
		notEmpty: true
	}
});

sequelize
	.sync()
	.then(() => {
		// console.log('User table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});
User.belongsTo(UserRole, { as: "roles", foreignKey: "role" });
User.belongsTo(UserGroup, { as: "User_Group", foreignKey: "user_group" });

module.exports = User;
