// import bcrypt from 'bcrypt'
// // const bcrypt = require('bcrypt');
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import Leave from "../../models/Leave.js";
// import Employee from '../../models/Employee.js';
// import User from '../../models/User.js';
// import UserRole from '../../models/UserRole.js';

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Leave = require("../../models/Leave.js");
const Employee = require("../../models/Employee.js");
const User = require("../../models/User.js");
const UserRole = require("../../models/UserRole.js");

dotenv.config();

class leaveController {
	static addleave = async (req, res, next) => {
		const { employeeId, reason, startDate, endDate } = req.body;

		// console.log({ employeeId, reason, startDate, endDate });
		const empById = await Employee.findAll({ where: { id: employeeId } });
		// console.log("empById", empById);

		if (employeeId && reason && startDate && endDate) {
			try {
				if (empById.length < 1) {
					res.status(400).send({
						status: 400,
						message: "Employee does not exist against leave"
					});
				} else {
					const createLeave = new Leave({
						employeeId: employeeId,
						reason: reason,
						startDate: startDate,
						endDate: endDate,
						status: "Pending"
					});

					await createLeave.save();

					res.status(200).send({
						status: 200,
						message: "Add Leave successfully",
						leave: createLeave
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Add Leave"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "All fields are required"
			});
		}
	};
	// SEARCH Leave BY ID
	static getLeaveById = async (req, res, next) => {
		const leaveId = req.query.id;
		// console.log(req.query)
		// console.log(req.params)
		try {
			const leaveById = await Leave.findAll({
				include: [
					{ as: "employee", model: Employee },
					{ as: "user", model: User }
				],
				where: { id: leaveId }
			});
			if (leaveById.length > 0) {
				res.status(200).send({
					status: 200,
					message: "get leave successfully",
					leave: leaveById
				});
			} else {
				res.status(400).send({
					status: 404,
					message: "No leave Found against id 12"
				});
			}
		} catch (error) {
			return next(error);
		}
	};

	static getLeaveByEmployeeId = async (req, res, next) => {
		const leaveId = req.query.id;
		// console.log(req.query)
		// console.log(req.params)
		try {
			const leaveById = await Leave.findAll({
				include: [
					{ as: "employee", model: Employee },
					{ as: "user", model: User }
				],
				where: { employeeId: leaveId }
			});
			if (leaveById.length > 0) {
				res.status(200).json({
					status: 200,
					message: "get leave successfully",
					leave: leaveById
				});
			} else {
				res.status(400).send({
					status: 404,
					message: "No leave Found against employee id "
				});
			}
		} catch (error) {
			return next(error);
		}
	};

	// GET ALL AVAILABLE Leaves
	static getAllLeave = async (req, res) => {
		const allLeave = await Leave.findAll({
			include: [
				{ as: "employee", model: Employee },
				{ as: "user", model: User }
			],
			order: [["createdAt", "DESC"]]
		});

		if (allLeave.length > 0) {
			res.status(200).send({
				status: 200,
				message: "Get all Leave Successfully",
				Leaves: allLeave
			});
		} else {
			res.status(200).send({
				status: 200,
				message: "No leaves present"
			});
		}
	};
	///UPDATE Leave
	static updateLeave = async (req, res, next) => {
		const { employeeId, reason, startDate, endDate } = req.body;
		const leaveId = req.query.id;
		try {
			let result = await Leave.findAll({ where: { id: leaveId } });
			result = JSON.stringify(result);
			result = JSON.parse(result);
			if (result.length > 0) {
				// console.log("assssssssssssssssssssssssssasssssssssss", result[0].status)
				if (result[0].status == "pending") {
					const leaveById = await Leave.update(
						{
							employeeId: employeeId,
							reason: reason,
							startDate: startDate,
							endDate: endDate
						},
						{ where: { id: leaveId } }
					);
					res.status(200).send({
						status: 200,
						message: " Leave  updated successfully",
						"Updated Leave": result
					});
				} else {
					res.status(400).send({
						status: 400,
						message: " You have no access to edit Leave now"
					});
				}
			} else {
				res.status(200).send({
					status: 200,
					message: "No leave Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};

	///Leave Status Update
	static updateStatusLeave = async (req, res, next) => {
		const { employeeId, status, updatedBy, updatedDate, comment } = req.body;
		const leaveId = req.query.id;
		// try {
		let result = await Leave.findAll({ include: [{ as: "employee", model: Employee }], where: { id: leaveId } });
		// result = JSON.stringify(result);
		// result = JSON.parse(result);
		// console.log(result , 'result');
		let user = await User.findAll({ include: [{ as: "roles", model: UserRole }], where: { id: updatedBy } });
		// let employee = await Employee.findAll({where:{id:employeeId}})

		if (result.length > 0) {
			if (user[0] != null) {
				if (user[0].roles.name == "Admin" || user[0].roles.name == "Super Admin") {
					const leaveById = await Leave.update(
						{
							// employeeId:employeeId,
							status: status,
							updatedDate: updatedDate,
							updatedBy: updatedBy,
							adminComment: comment
							//   hrComment:comment,
						},
						{ where: { id: leaveId } }
					);
					res.status(200).send({
						status: 200,
						message: " Leave Status  updated successfully by Admin",
						"Updated Leave": result
					});
				} else if (user[0].roles.name == "Hr") {
					const leaveById = await Leave.update(
						{
							// employeeId:employeeId,
							status: status,
							updatedDate: updatedDate,
							updatedBy: updatedBy,
							//   adminComment:comment,
							hrComment: comment
						},
						{ where: { id: leaveId } }
					);

					res.status(200).send({
						status: 200,
						message: " Leave   updated successfully by Hr",
						"Updated Leave": result
					});
				} else {
					res.status(400).send({
						status: "error",
						message: user[0].roles.name + " unauthorized for this api"
						// "Updated Leave": result
					});
				}
			} else {
				res.status(400).send({
					status: 200,
					message: " User Not Found"
					// "Updated Leave": result
				});
			}
		} else {
			res.status(200).send({
				status: 200,
				message: "No Leave Found against id"
			});
		}

		// } catch (error) {
		//     return next(error)
		// }
	};
	/////Delete LeaveIssue

	static deleteLeave = async (req, res) => {
		const { id } = req.query;

		if (id) {
			try {
				const result = await Leave.findAll({ where: { id: id } });

				if (result.length > 0) {
					if (result[0].status == "Pending") {
						Leave.destroy({
							where: {
								id: id
							}
						});

						res.status(200).send({
							status: 200,
							message: "Leave Deleted successfully",
							"Deleted Leave": result
						});
					} else {
						res.status(200).send({
							status: 200,
							message: "Unauthorized to delete leave by employee when status is not pending"
						});
					}
				} else {
					res.status(400).send({
						status: 404,
						message: "Leave not found"
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Deleted LeaveIssue"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "ID IS REQUIRED"
			});
		}
	};
}

module.exports = leaveController;
