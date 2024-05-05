const sequelize = require("../../config/connectdb.js");
const { Sequelize, DataTypes } = require("sequelize");
const Users = require("./User.js");
const Nominee = require("./MemNominee_MST.js");

const fileTransfer = sequelize.define("file_Transfer", {
	BK_ID: {
		type: Sequelize.INTEGER,
		allowNull: false,
		notEmpty: false
	},
	User_ID: {
		type: Sequelize.INTEGER,
		allowNull: false,
		notEmpty: false
	},
	Nominee_ID: {
		type: Sequelize.INTEGER,
		allowNull: true,
		notEmpty: true
	},
	Member_ID: {
		type: Sequelize.INTEGER,
		allowNull: true,
		notEmpty: true
	},
	Secondary_Member_ID: {
		type: Sequelize.INTEGER,
		allowNull: true,
		notEmpty: true
	},
	Combine_Image: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: false
		// get() {
		//   const rawValue = this.getDataValue("Combine_Image");
		//   return `${process.env.APP_URL}/${rawValue}`;
		// },
	},
	Buyer_Image: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: false
		// get() {
		//   const rawValue = this.getDataValue("Buyer_Image");
		//   return `${process.env.APP_URL}/${rawValue}`;
		// },
	},
	Seller_Image: {
		type: DataTypes.STRING,
		allowNull: true,
		notEmpty: false
		// get() {
		//   const rawValue = this.getDataValue("Seller_Image");
		//   return `${process.env.APP_URL}/${rawValue}`;
		// },
	},

	Booking_Temp: {
		type: Sequelize.STRING,
		allowNull: true,
		notEmpty: true
	},
	Unit_Temp: {
		type: Sequelize.STRING,
		allowNull: true,
		notEmpty: true
	},
	Nominee_Temp_ID: {
		type: Sequelize.INTEGER,
		allowNull: true,
		notEmpty: true
	},
	Member_Temp_ID: {
		type: Sequelize.INTEGER,
		allowNull: true,
		notEmpty: true
	},
	TRSR_ID: {
		type: Sequelize.INTEGER,
		allowNull: true,
		notEmpty: false
	}
});
sequelize
	.sync()
	.then(() => {
		// console.log("FILE Transfer Dummy table created successfully!");
	})
	.catch((error) => {
		console.error("Unable to create table : ", error);
	});
// fileTransfer.belongsTo(Users, { as: 'Users', foreignKey: 'User_ID' })
// fileTransfer.belongsTo(Nominee, { as: 'Nominee', foreignKey: 'Nominee_ID' })
module.exports = fileTransfer;
