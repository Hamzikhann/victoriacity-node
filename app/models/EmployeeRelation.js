const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const Employee = require("./Employee.js");

const EmployeeRelation = sequelize.define("employeeRelation", {
	// employeeId: {
	//   type: DataTypes.INTEGER,
	//   allowNull: false,
	//   notEmpty: true,
	// },
	relation: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	},
	dob: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		notEmpty: true
	},
	contact: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: true
	}
});

sequelize
	.sync()
	.then(() => {
		// EmployeeRelation.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' })
		// console.log('EmployeeRelations table created successfully!');
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});

// export default EmployeeRelation
module.exports = EmployeeRelation;
