const sequelize = require("../../config/connectdb.js");
const { Sequelize, DataTypes } = require("sequelize");

const Menu = sequelize.define("Menu", {
	Menu_ID: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	Title: {
		type: Sequelize.STRING,
		allowNull: true,
		notEmpty: true
	},
	Is_Deleted: {
		type: Sequelize.BOOLEAN,
		allowNull: true,
		notEmpty: true
	},
	Path: {
		type: Sequelize.STRING,
		allowNull: true,
		notEmpty: true
	}
});
sequelize
	.sync()
	.then(() => {
		// console.log('Menu table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});
module.exports = Menu;
