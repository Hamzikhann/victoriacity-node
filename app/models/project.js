const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");

const Project = sequelize.define("project", {
	name: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	startDate: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		notEmpty: false
	},
	endDate: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		notEmpty: false
	},
	priority: {
		type: Sequelize.ENUM("High", "Low", "Medium"),
		allowNull: true,
		notEmpty: true
	},
	description: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	image: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	status: {
		type: DataTypes.BOOLEAN,
		allowNull: true,
		notEmpty: true
	},
	customerId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		notEmpty: true
	}
});

// Project.associate = function (models) {

// };

sequelize
	.sync()
	.then(() => {
		// Project.associate = function (models) {
		//     Project.hasMany(Employee, { as: 'Employee' })
		//     Project.hasOne(Customer, { as: 'Customer' })
		// };
		// console.log('Project table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});
module.exports = Project;
