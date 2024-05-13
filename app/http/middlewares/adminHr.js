// import jwt from 'jsonwebtoken'
// import User from '../../models/User.js'
// import dotenv from 'dotenv'
// import UserRole from '../../models/UserRole.js'
// dotenv.config()

const jwt = require("jsonwebtoken");
const User = require("../../models/User.js");
const dotenv = require("dotenv");
const UserRole = require("../../models/UserRole.js");
dotenv.config();

const adminHrAuth = async (req, res, next) => {
	const userId = req.user.id;

	try {
		// console.log(req.user , 'ROLE')

		const role = req.user.role;

		const { name } = await UserRole.findByPk(role);
		// console.log(name , 'ROLE')
		if (name != "admin" && name != "Hr" && name != "Super Admin") {
			return res.status(401).send({
				status: 400,
				message: "Unauthorized User"
			});
		}

		next();
	} catch (error) {
		res.status(401).send({
			status: "failed",
			message: "Unauthorized User"
		});
	}
};

// export default adminHrAuth
module.exports = adminHrAuth;
