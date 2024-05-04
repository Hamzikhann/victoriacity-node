// import User from '../../models/User.js';
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import Project from '../../models/project.js';
// import Customer from '../../models/Customer.js';
// import Job from '../../models/Job.js';
// import Employee from '../../models/Employee.js';
// import { Sequelize } from 'sequelize';
// import UserRole from '../../models/UserRole.js';
// import { query } from 'express';
// dotenv.config();
// import fs from 'fs';
// import Leave from '../../models/Leave.js';

const User = require("../../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Project = require("../../models/project.js");
const Customer = require("../../models/Customer.js");
const Job = require("../../models/Job.js");
const Employee = require("../../models/Employee.js");
const { Sequelize } = require("sequelize");
const UserRole = require("../../models/UserRole.js");
const UserGroup = require("../../models/User_Group.js");
const { query } = require("express");
dotenv.config();
const fs = require("fs");
const Leave = require("../../models/Leave.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const GroupMenu = require("../../models/GroupMenu.js");
const Menu = require("../../models/Menu.js");

class UserController {
	static Register = async (req, res) => {
		const { name, email, password, password_confirm, role } = req.body;
		console.log(req.body);
		const user = await User.findOne({ where: { email: email } });
		if (user) {
			res.status(409).send({
				status: 400,
				message: "Email already exists"
			});
		} else {
			if (name && email && password && password_confirm && role) {
				if (password === password_confirm) {
					// try {
					const salt = await bcrypt.genSalt(10);
					const hashPassword = await bcrypt.hash(password, salt);
					const createUser = new User({
						name: name,
						email: email,
						role: role,
						status: "Active",

						password: hashPassword
					});
					await createUser.save();

					const savedUser = await User.findOne({ where: { email: email } });
					const token = jwt.sign({ userID: savedUser.id, role: savedUser.role }, process.env.JWT_SECRET_KEY, {
						expiresIn: "2d"
					});

					res.status(200).send({
						status: 200,
						message: "User registered successfully",
						token: token
					});
					// } catch (error) {
					//     res.status(400).send({
					//         status: 400 ,
					//         "message": "Unable to Register",
					//     })
					// }
				} else {
					res.status(401).send({
						status: 400,
						message: "Password and Confirm Password doesn't match"
					});
				}
			} else {
				res.status(400).send({
					status: 400,
					message: "All fields are required"
				});
			}
		}
	};

	static Login = async (req, res, next) => {
		try {
			console.log(req.body);
			const { email, password } = req.body;
			if (email && password) {
				let user = await User.findOne({
					include: [
						{ as: "roles", model: UserRole },
						{ as: "User_Group", model: UserGroup }
					],
					where: { email: email }
				});
				console.log("hamza");
				// if (user) {
				// 	const userJSON = user.toJSON();
				// }
				// console.log('IIIIIIIIIIIIIIIIIIIIIIIIIIII', user)
				if (user != null) {
					const isMatch = await bcrypt.compare(password, user.password);
					if (user.email === email && isMatch) {
						//Generate JWT Token
						let employee;
						const { name } = await UserRole.findByPk(user.role);
						if (name === "Employee") {
							employee = await Employee.findOne({ where: { email: email } });
						}
						const menus = await GroupMenu.findAll({
							include: [
								{ as: "Groups", model: UserGroup },
								{ as: "Menus", model: Menu }
							],
							where: { Group_ID: user.user_group }
						});
						const token = jwt.sign({ userID: user.id, role: user.role }, process.env.JWT_SECRET_KEY, {
							expiresIn: "2d"
						});
						user.dataValues.employee = employee ? employee : "User not a employee";
						return res.status(200).send({
							status: 200,
							message: "User Login Successfully",
							token: token,
							user: user,
							menus
						});
					} else {
						return res.status(401).send({
							status: 400,
							message: "Email or Password is not valid"
						});
					}
				} else {
					return res.status(404).send({
						status: 400,
						message: "You are not a registered user, Register yourself first."
					});
				}
			} else {
				return res.status(400).send({
					status: 400,
					message: "All fields are required"
				});
			}
		} catch (error) {
			return next(error);
		}
	};

	static addUser = async (req, res, next) => {
		const { name, lastName, email, mobileNo, password, status, role, user_group } = req.body;
		let image = "";
		if (req.file) {
			image = req.file.filename;
			image = "uploads/" + image;
		}

		if (!name && !lastName && !email && !mobileNo && !password && !role) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}
		const { name: roleName } = await UserRole.findByPk(role);
		try {
			const salt = await bcrypt.genSalt(10);

			const hashPassword = await bcrypt.hash(password, salt);

			const [row, created] = await User.findOrCreate({
				where: { email: email },
				defaults: {
					name: name,
					lastName: lastName,
					mobileNo: mobileNo,
					password: hashPassword,
					user_group: user_group,
					image: image,
					role: role,
					status: status
				}
			});

			if (!created) {
				return next(CustomErrorHandler.alreadyExist());
			}
			if (created && roleName === "Employee") {
				await Employee.findOrCreate({
					where: { email: email },
					defaults: {
						fullName: `${name} ${lastName}`,
						contact: mobileNo,
						email: email,
						user_group: user_group,
						image: image,
						status: status
					}
				});
			}

			res.status(200).json({
				status: 200,
				message: "Add User successfully",
				user: row
			});
		} catch (error) {
			return next(error);
		}
	};

	// Search ConversionUser by Id
	static getUserById = async (req, res, next) => {
		// const userId = req.body.id
		const userId = req.query.id;
		console.log(req.query);
		try {
			const userById = await User.findAll({
				include: [
					{ as: "roles", model: UserRole },
					{ as: "User_Group", model: UserGroup }
				],
				where: { id: userId }
			});
			console.log("iiiiiiiiiiiiiii", userById);
			if (userById.length >= 1) {
				res.status(200).send({
					status: 200,
					message: "get  User successfully",
					user: userById
				});
			} else {
				res.status(400).send({
					status: 400,
					message: "No  User Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};

	// Get User Where Role is Cashier
	static getCashier = async (req, res, next) => {
		try {
			const user = await User.findAll({
				include: [
					{ as: "roles", model: UserRole },
					{ as: "User_Group", model: UserGroup }
				],
				where: { role: 5 }
			});
			if (user.length >= 1) {
				res.status(200).send({
					status: 200,
					message: "get  User successfully",
					user: user
				});
			} else {
				res.status(400).send({
					status: 400,
					message: "No  User Found "
				});
			}
		} catch (error) {
			return next(error);
		}
	};

	// GET ALL AVAILABLE ConversionUser
	static getAllUser = async (req, res) => {
		const allConversionUser = await User.findAll({
			include: [
				{ as: "roles", model: UserRole },
				{ as: "User_Group", model: UserGroup }
			],
			order: [["createdAt", "DESC"]]
		});

		if (allConversionUser !== null) {
			res.status(200).send({
				status: 200,
				message: "Get all user successfully",
				user: allConversionUser
			});
		} else {
			res.status(200).send({
				status: 200,
				message: "No user present"
			});
		}
	};
	// Delete ConversionUser

	static deleteUser = async (req, res) => {
		const userId = req.query.id;

		if (userId) {
			try {
				const userById = await User.findAll({ where: { id: userId } });

				if (userById.length > 0) {
					User.destroy({
						where: {
							id: userId
						}
					});
					res.status(200).send({
						status: 200,
						message: "User Deleted successfully",
						"USER DELETED": userById
					});
				} else {
					res.status(400).send({
						status: 404,
						message: "User not found"
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Deleted ConversionUser"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "ID IS REQUIRED"
			});
		}
	};
	// Update ConversionUser

	static updateUser = async (req, res, next) => {
		const { name, lastName, email, mobileNo, password, status, role, updatedBy, user_group } = req.body;
		const userId = req.query.id;

		let image = "";
		if (req.file) {
			image = req.file.filename;
			image = "uploads/" + image;
		}

		try {
			const result = await User.findAll({ where: { id: userId } });
			console.log(result, "Before Result");

			if (result.length > 0) {
				const userById = await User.update(
					{
						name: name,
						lastName: lastName,
						email: email,
						mobileNo: mobileNo,
						user_group: user_group,
						...(req.file && { image: image }),
						role: role,
						status: status,
						updatedBy: updatedBy
					},
					{ where: { id: userId } }
				);
				console.log(`${appRoot}/uploads${result[0].image.split("/uploads")[7]}`, "After Result");
				if (userById) {
					fs.unlink(`${appRoot}/uploads${result[0].image.split("/uploads")[7]}`, (err) => {
						console.log("file errro r", err);
						if (err) {
							return next(err);
						}
					});
				}
			} else {
				return res.status(200).json({
					status: 200,
					message: "No User Found against id"
				});
			}
			return res.status(200).json({
				status: 200,
				message: "User updated successfully"
			});
		} catch (error) {
			console.log("errrrrrrrrrrrrrrrrrr", error);
			return next(error);
		}
	};

	static dashboardData = async (req, res, next) => {
		const projectResult = await Project.count({ where: { status: "active" } });
		const clientResult = await Customer.count();
		const jobResult = await Job.count({ where: { isActive: 1 } });
		const employeeResult = await Employee.count({ where: { status: "active" } });
		const latestProjectResult = await Project.findAll({
			order: [[Sequelize.literal("id"), "DESC"]],
			limit: 5,
			where: { status: "active" }
		});
		const latestClientResult = await Customer.findAll({ order: [[Sequelize.literal("id"), "DESC"]], limit: 5 });

		res.status(200).send({
			status: 200,
			message: {
				projects: latestProjectResult,
				project: projectResult,
				customers: latestClientResult,
				customer: clientResult,
				openJobs: jobResult,
				employee: employeeResult
			}
		});
	};
}

// export default UserController;
module.exports = UserController;
