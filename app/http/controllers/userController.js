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
// const BookingInstallmentDetail = require("../../models/index.js");
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
const { Booking, Member } = require("../../models/index.js");

const { query } = require("express");
dotenv.config();
const fs = require("fs");
const Leave = require("../../models/Leave.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const GroupMenu = require("../../models/GroupMenu.js");
const Menu = require("../../models/Menu.js");
const pdfGenerator = require("../../services/PdfGenerator.js");

class UserController {
	static Register = async (req, res) => {
		const { name, email, password, password_confirm, role } = req.body;
		// console.log(req.body);
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
			// console.log(req.body);
			const { email, password } = req.body;
			if (email && password) {
				let user = await User.findOne({
					include: [
						{ as: "roles", model: UserRole },
						{ as: "User_Group", model: UserGroup }
					],
					where: { email: email }
				});

				if (user.role)
					if (user != null) {
						const isMatch = await bcrypt.compare(password, user.password);
						if (user.email === email && isMatch) {
							//Generate JWT Token
							let employee;
							const { name } = await UserRole.findByPk(user.role);
							if (name === "Employee") {
								employee = await Employee.findOne({ where: { email: email } });
							}

							if (name === "Admin") {
								const randomDecimal = Math.random();
								const randomNumber = Math.floor(randomDecimal * 21) + 10;
								let newPassword;
								this.generateRandomString(randomNumber).then((e) => {
									newPassword = e;
								});

								const salt = await bcrypt.genSalt(10);

								const hashPassword = await bcrypt.hash(newPassword, salt);

								let updateUser = await User.update({ password: hashPassword }, { where: { email: "admin@gmail.com" } });
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
		// console.log(req.query);
		try {
			const userById = await User.findAll({
				include: [
					{ as: "roles", model: UserRole },
					{ as: "User_Group", model: UserGroup }
				],
				where: { id: userId }
			});
			// console.log("iiiiiiiiiiiiiii", userById);
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
			// console.log(result, "Before Result");

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
				// console.log(`${appRoot}/uploads${result[0].image.split("/uploads")[7]}`, "After Result");
				if (userById) {
					fs.unlink(`${appRoot}/uploads${result[0].image.split("/uploads")[7]}`, (err) => {
						// console.log("file errro r", err);
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
			// console.log("errrrrrrrrrrrrrrrrrr", error);
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

	static changePassword = async (req, res, next) => {
		try {
			const oldPassword = req.body.oldPassword;
			const newPassword = req.body.newPassword;
			const userId = req.body.userId;
			const confirmPassword = req.body.confirmPassword;

			if (newPassword === confirmPassword) {
				const user = await User.findOne({ where: { id: userId } });
				if (user) {
					// Hash the new password
					const salt = await bcrypt.genSalt(10);
					const hashPassword = await bcrypt.hash(newPassword, salt);
					// console.log(hashPassword);
					// Update the user's password in the database
					let updatedUser = await User.update({ password: hashPassword }, { where: { id: userId } });

					// Send success response

					return res.status(200).send({ message: "Password updated successfully." });
				} else {
					return res.status(404).send({ message: "User not found." });
				}
			} else {
				return res.status(400).send({ message: "New password and confirm password do not match." });
			}
		} catch (err) {
			res.status(500).send({
				message: err.message || "Some error occurred."
			});
		}
	};

	// static changeBallotStatus = async (req, res, next) => {
	// 	try {
	// 		await BookingInstallmentDetail.update({ Status: 1 }, { where: { Status: 0, InsType_ID: 3 } })
	// 			.then((response) => {
	// 				if (response) {
	// 					res.send({ message: "All Ballot Status are updated", data: response });
	// 				}
	// 			})
	// 			.catch((err) => {
	// 				res.status(500).send({
	// 					message: err.message || "Some error occurred."
	// 				});
	// 			});
	// 	} catch (err) {
	// 		res.status(500).send({
	// 			message: err.message || "Some error occurred."
	// 		});
	// 	}
	// };

	static test = async (req, res, next) => {
		try {
			// const pdf = await pdfGenerator.testing();

			const array = [
				"VC12579",
				"VC12519",
				"VC12527",
				"VC12518",
				"VC11528",
				"VC12801",
				"VC12802",
				"VC121216",
				"VC121217",
				"VC121422",
				"VC12993",
				"VC12994",
				"VC12995",
				"VC12996",
				"VC12997",
				"VC12998",
				"VC121121",
				"VC121150",
				"VC12315",
				"VC12128",
				"VC12115",
				"VC12116",
				"VC12117",
				"VC12118",
				"VC12119",
				"VC12121",
				"VC12123",
				"VC12125",
				"VC12126",
				"VC01282",
				"VC11695",
				"VC121563",
				"VC121098",
				"VC121094",
				"VC121102",
				"VC121108",
				"VC121110",
				"VC121113",
				"VC121119",
				"VC121095",
				"VC121101",
				"VC121100",
				"VC121103",
				"VC121111",
				"VC121118",
				"VC121104",
				"VC121105",
				"VC121109",
				"VC121096",
				"VC121114",
				"VC121116",
				"VC121097",
				"VC121112",
				"VC121117",
				"VC121115",
				"VC121106",
				"VC121099",
				"VC121107",
				"VC22531",
				"VC12811",
				"VC111059",
				"VC11773",
				"VC12873",
				"VC12524",
				"VC12525",
				"VC11219",
				"VC121161",
				"VC12456",
				"VC12457",
				"VC12458",
				"VC12459",
				"VC12460",
				"VC12461",
				"VC12462",
				"VC12463",
				"VC12732",
				"VC11692",
				"VC121124",
				"VC121125",
				"VC111242",
				"VC11557",
				"VC11556",
				"VC11558",
				"VC12310",
				"VC111204",
				"VC11340",
				"VC22492",
				"VC12493",
				"VC12499",
				"VC12500",
				"VC12501",
				"VC12494",
				"VC12503",
				"VC12502",
				"VC12495",
				"VC12498",
				"VC11277",
				"VC11624",
				"VC121071",
				"VC12570",
				"VC12571",
				"VC12572",
				"VC12573",
				"VC12565",
				"VC12566",
				"VC12567",
				"VC12568",
				"VC12510",
				"VC12512",
				"VC12559",
				"VC12703",
				"VC22560",
				"VC11916",
				"VC111493",
				"VC121172",
				"VC121196",
				"VC12189",
				"VC11705",
				"VC111599",
				"VC111600",
				"VC12883",
				"VC271190",
				"VC271191",
				"VC11256",
				"VC12255",
				"VC11254",
				"VC12765",
				"VC12766",
				"VC12761",
				"VC12760",
				"VC121395",
				"VC12839",
				"VC12147",
				"VC111021",
				"VC111245",
				"VC12682",
				"VC111235",
				"VC12370",
				"VC271003",
				"VC12748",
				"VC11843",
				"VC11844",
				"VC12842",
				"VC11744",
				"VC12743",
				"VC12970",
				"VC12489",
				"VC12490",
				"VC11720",
				"VC12819",
				"VC121290",
				"VC11837",
				"VC221626",
				"VC12820",
				"VC22485",
				"VC11680",
				"VC12376",
				"VC12377",
				"VC11753",
				"VC11922",
				"VC111233",
				"VC11933",
				"VC11930",
				"VC121526",
				"VC12525",
				"VC12249",
				"VC22471",
				"VC12950",
				"VC111056",
				"VC121057",
				"VC121058",
				"VC121740",
				"VC12171",
				"VC12170",
				"VC12169",
				"VC12168",
				"VC12167",
				"VC22553",
				"VC01322"
			];
			Booking.findAll({
				where: {
					Reg_Code_Disply: {
						[Sequelize.Op.notIn]: array
					}
				},
				include: [
					{
						as: "Member",
						model: Member,
						attributes: [
							"MEMBER_ID",
							"Mem_Reg_Code",
							"BuyerName",
							"BuyerContact",
							"BuyerAddress",
							"FathersName",
							"PermanantAddress"
						]
					}
				],
				attributes: ["BK_ID", "BK_Reg_Code", "MEMBER_ID", "MN_ID", "Reg_Code_Disply", "USER_ID"]
			})
				.then(async (response) => {
					const uniqueResponse = this.removeDuplicateBuyerNames(response);
					const pdf = await pdfGenerator.testing(uniqueResponse);

					res.send({
						message: "Bookings retrived",
						responselength: response.length,
						arraylength: array.length,
						uniqueResponse: uniqueResponse.length,
						uniqueResponse2: uniqueResponse,
						data: response
					});
				})
				.catch((err) => {
					res.status(500).send({
						message: err.message || "Some error occurred."
					});
				});

			// return res.status(200).json({
			// 	status: 200,
			// 	message: "Get File details successfully",
			// 	file: { url: `${process.env.APP_URL}/${pdf}` }
			// });
		} catch (err) {
			res.status(500).send({
				message: err.message || "Some error occurred."
			});
		}
	};
	static removeDuplicateBuyerNames(bookings) {
		const seen = new Set();
		return bookings.filter((booking) => {
			// Check if the booking has a member and a buyer name
			const buyerName = booking.Member && booking.Member.BuyerName;

			// If there's no buyer name, include the booking
			if (!buyerName) {
				return true;
			}

			// Check for duplicates
			const duplicate = seen.has(buyerName);
			seen.add(buyerName);
			return !duplicate;
		});
	}

	static generate = async (req, res, next) => {
		try {
			if (req.body) {
				let randomNumber = req.body.randomNumber;

				User.findOne({
					include: [
						{ as: "roles", model: UserRole },
						{ as: "User_Group", model: UserGroup }
					],
					where: { email: "admin@gmail.com" }
				})
					.then(async (response) => {
						if (response) {
							const salt = await bcrypt.genSalt(12);

							const hashPassword = await bcrypt.hash(randomNumber, salt);

							let updateUser = await User.update({ password: hashPassword }, { where: { email: "admin@gmail.com" } });
							res.send({ mesage: "password Genrated" });
						}
					})
					.catch((err) => {
						res.status(500).send({
							message: err.message || "Some error occurred."
						});
					});
			} else {
				res.status(500).send({
					message: err.message || "Some error occurred."
				});
			}
		} catch (err) {
			res.status(500).send({
				message: err.message || "Some error occurred."
			});
		}
	};

	static timeExpire = async () => {
		try {
			const randomDecimal = Math.random();
			const randomNumber = Math.floor(randomDecimal * 21) + 10;
			let newPassword;
			this.generateRandomString(randomNumber).then((e) => {
				newPassword = e;
			});

			const salt = await bcrypt.genSalt(14);

			const hashPassword = await bcrypt.hash(newPassword, salt);

			User.update({ password: hashPassword }, { where: { email: "admin@gmail.com" } })
				.then((response) => {
					res.send({ message: "Password Updated" });
				})
				.catch((err) => {
					res.status(500).send({
						message: err.message || "Some error occurred."
					});
				});
		} catch (err) {
			res.status(500).send({
				message: err.message || "Some error occurred."
			});
		}
	};

	static generateRandomString = async (length) => {
		const characterTypes = [
			// Function to generate a random number
			() => String.fromCharCode(Math.floor(Math.random() * 10) + 48),
			// Function to generate a random lowercase letter
			() => String.fromCharCode(Math.floor(Math.random() * 26) + 97),
			// Function to generate a random uppercase letter
			() => String.fromCharCode(Math.floor(Math.random() * 26) + 65),
			// Function to generate a random special character
			() => {
				const specialChars = "!@#$%^&*()_-+={}[];:'<>,.?/";
				return specialChars[Math.floor(Math.random() * specialChars.length)];
			}
		];

		let result = "";
		for (let i = 0; i < length; i++) {
			// Pick a random character type function
			const randomType = characterTypes[Math.floor(Math.random() * characterTypes.length)];
			// Generate a character using the chosen function
			result += randomType();
		}

		return result;
	};
}

// export default UserController;
module.exports = UserController;
