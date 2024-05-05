// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import User from './User.js';

const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const User = require("./User.js");

const UserRole = sequelize.define("roles", {
	name: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	status: {
		type: Sequelize.BOOLEAN,
		allowNull: true,
		notEmpty: true
	},
	slug: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	}
});

sequelize
	.sync()
	.then(() => {
		// console.log('Roles table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});
// UserRole.hasmany(User, { as: 'User',foreignKey: 'userId' })
// export default UserRole;

module.exports = UserRole;
