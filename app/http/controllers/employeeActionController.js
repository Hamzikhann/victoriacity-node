// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import EmployeeAction from "../../models/EmployeeAction.js";
// dotenv.config()

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const EmployeeAction = require("../../models/EmployeeAction.js");
const Employee = require("../../models/Employee.js");
dotenv.config();

class EmployeeActionController {
	static addAction = async (req, res, next) => {
		const { action, actionDate, employeeId } = req.body;
		// console.log({ action, actionDate, employeeId });
		if (action && actionDate && employeeId) {
			const result = await Employee.findAll({ where: { id: employeeId } });
			if (result.length > 0) {
				try {
					const employeeAction = new EmployeeAction({
						action: action,
						actionDate: actionDate,
						employeeId: employeeId
					});

					await employeeAction.save();

					res.status(200).send({
						status: 200,
						message: "Add Action successfully"
					});
				} catch (error) {
					console.log(error);
					res.status(400).send({
						status: 400,
						message: "Unable to Add Action"
					});
				}
			} else {
				res.status(400).send({
					status: 400,
					message: "No Employee Found "
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "All fields are required"
			});
		}
	};
}

// export default EmployeeActionController;
module.exports = EmployeeActionController;
