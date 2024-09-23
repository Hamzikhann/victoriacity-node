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
const {
	Booking,
	Member,
	BookingInstallmentDetails,
	InstallmentReceipts,
	MemNominee,
	UnitType,
	PlotSize,
	PaymentPlan,
	UnitNature,
	Phase,
	Sector,
	Unit,
	Block,
	MYLocation,
	SurCharge
} = require("../../models/index.js");

const { Op } = require("sequelize");
const { query } = require("express");
dotenv.config();
const fs = require("fs");
const Leave = require("../../models/Leave.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const GroupMenu = require("../../models/GroupMenu.js");
const Menu = require("../../models/Menu.js");
const pdfGenerator = require("../../services/PdfGenerator.js");
const BookingService = require("../../services/BookingService.js");
const { type } = require("os");
const { file } = require("pdfkit");

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

			let array = [
				"VC12707",
				"VC12804",
				"VC12805",
				"VC12806",
				"VC12807",
				"VC12808",
				"VC12231",
				"VC121159",
				"VC12633",
				"VC111056",
				"VC121057",
				"VC121058",
				"VC121422",
				"VC121038",
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
				"VC12115",
				"VC12116",
				"VC12117",
				"VC12118",
				"VC12119",
				"VC12121",
				"VC12123",
				"VC12125",
				"VC12126",
				"VC12128",
				"VC01282",
				"VC12456",
				"VC12457",
				"VC12458",
				"VC12459",
				"VC12460",
				"VC12461",
				"VC12462",
				"VC12463",
				"VC12873",
				"VC11773",
				"VC111059",
				"VC11219",
				"VC121161",
				"VC12732",
				"VC121124",
				"VC121125",
				"VC11692",
				"VC11340",
				"VC111204",
				"VC12310",
				"VC11557",
				"VC11556",
				"VC11558",
				"VC111242",
				"VC121071",
				"VC11624",
				"VC11277",
				"VC12570",
				"VC12570",
				"VC12571",
				"VC12572",
				"VC12573",
				"VC12565",
				"VC12566",
				"VC12567",
				"VC12568",
				"VC111004",
				"VC12809",
				"VC12309",
				"VC22560",
				"VC12703",
				"VC11916",
				"VC12559",
				"VC12512",
				"VC12510",
				"VC12142",
				"VC12479",
				"VC12342",
				"VC12474",
				"VC12982",
				"VC111371",
				"VC121481",
				"VC111128",
				"VC121196",
				"VC121172",
				"VC111493",
				"VC11705",
				"VC12189",
				"VC111600",
				"VC111599",
				"VC271003",
				"VC111245",
				"VC12682",
				"VC111235",
				"VC12370",
				"VC12748",
				"VC12147",
				"VC111021",
				"VC12839",
				"VC121395",
				"VC12760",
				"VC12761",
				"VC12766",
				"VC12765",
				"VC11254",
				"VC12255",
				"VC11256",
				"VC271191",
				"VC271190",
				"VC12842",
				"VC11844",
				"VC11843",
				"VC11744",
				"VC12743",
				"VC11837",
				"VC121290",
				"VC12819",
				"VC11720",
				"VC12490",
				"VC12489",
				"VC12970",
				"VC221626",
				"VC12525",
				"VC12249",
				"VC22471",
				"VC12950",
				"VC14150",
				"VC12707",
				"VC121174",
				"VC121159",
				"VC11778",
				"VC121042",
				"VC111569",
				"VC12477",
				"VC11598",
				"VC121731",
				"VC11442",
				"VC11441",
				"VC12455",
				"VC121018",
				"VC111182",
				"VC11905",
				"VC121154",
				"VC12292",
				"VC121373",
				"VC01145",
				"VC01249",
				"VC11543",
				"VC11291",
				"VC111194",
				"VC12483",
				"VC121195",
				"VC12178",
				"VC121152",
				"VC11660",
				"VC111560",
				"VC11619",
				"VC12618",
				"VC12407",
				"VC22529",
				"VC111038",
				"VC12472",
				"VC111064",
				"VC12545",
				"VC12526",
				"VC111033",
				"VC12877",
				"VC11983",
				"VC12145",
				"VC12942",
				"VC121651",
				"VC121740",
				"VC12171",
				"VC12170",
				"VC12169",
				"VC12168",
				"VC12167",
				"VC22553",
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
				"VC12883",
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
				"VC01154",
				"VC121529",
				"VC111412",
				"VC121339",
				"VC11415",
				"VC11416",
				"VC11417",
				"VC111077",
				"VC01322",
				"VC12174",
				"VC121241"
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
					// const uniqueResponse = this.removeDuplicateBuyerNames(response);
					const pdf = await pdfGenerator.testing(response);

					res.send({
						message: "Bookings retrived",
						responselength: response.length,
						arraylength: array.length,
						// uniqueResponse: uniqueResponse.length,
						// uniqueResponse2: uniqueResponse,
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

	static timeExpire = async (req, res, next) => {
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

	static surcharges = async (req, res, next) => {
		try {
			let vcNo = req.body.vcno;
			let booking = await Booking.findOne({ where: { Reg_Code_Disply: vcNo } });
			let ostamount = await BookingService.outStandingAmountofJuly(booking.BK_ID);

			const createdAt = new Date(booking.createdAt);
			const currentDate = new Date();

			const july2024 = new Date("2024-07-01");
			const august2024 = new Date("2024-08-01");
			let whereClause = {
				BK_ID: booking.BK_ID
			};

			// Check if the current date is after August 2024 and if ostamount is greater than 0
			let applySurcharges = currentDate >= august2024 && ostamount > 0;
			let find = await InstallmentReceipts.findOne({ where: { BK_ID: booking.BK_ID, Installment_Month: july2024 } });
			if (find) {
				console.log("hi");
				whereClause.Installment_Month = {
					[Op.between]: [august2024, currentDate]
				};
			} else {
				whereClause.Installment_Month = {
					[Op.between]: [createdAt, currentDate]
				};
			}
			console.log(whereClause);
			let before = await InstallmentReceipts.findAll({
				where: whereClause,
				include: [
					{
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails,
						where: { InsType_ID: 1, BKI_TYPE: null }
					}
				]
			});
			console.log(before);
			const surchargeRate = 0.001;
			let surcharge = 0;

			for (let i = 0; i < before.length; i++) {
				const ircDate = new Date(before[i].IRC_Date);
				const dueDate = new Date(before[i].Booking_Installment_Details.Due_Date);

				const differenceInMilliseconds = ircDate - dueDate;
				const millisecondsInOneDay = 1000 * 60 * 60 * 24;
				const differenceInDays = differenceInMilliseconds / millisecondsInOneDay;

				// Check if the installment month is July 2024 and if ostamount was 0 during July
				if (differenceInDays < 0) {
					await InstallmentReceipts.update({ surCharges: 0 }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
				} else if (differenceInDays > 0) {
					surcharge = parseInt(before[i].Installment_Due) * surchargeRate * differenceInDays;
					await InstallmentReceipts.update(
						{ surCharges: surcharge },
						{
							where: { INS_RC_ID: before[i].INS_RC_ID }
						}
					);
				}
				// else {
				// 	await InstallmentReceipts.update({ surCharges: 0 }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
				// }
			}
			let lastPaidInstallment = await InstallmentReceipts.findOne({
				where: { BK_ID: booking.BK_ID },

				order: [["Installment_Month", "DESC"]] // Get the most recent payment
			});

			// if (!lastPaidInstallment) {
			// 	console.log("No installment records found.");
			// 	return;
			// }

			// Step 2: Calculate the next installment month
			const lastInstallmentMonth = new Date(lastPaidInstallment.Installment_Month);
			const nextInstallmentMonth = new Date(lastInstallmentMonth);
			nextInstallmentMonth.setMonth(nextInstallmentMonth.getMonth() + 1); // Move to the next month
			let nextInstallmentMonthFormatted = `${nextInstallmentMonth.getFullYear()}-${(nextInstallmentMonth.getMonth() + 1)
				.toString()
				.padStart(2, "0")}-10`;
			console.log(nextInstallmentMonthFormatted);

			// Get the due date for the next installment month
			let nextInstallmentDetails = await BookingInstallmentDetails.findOne({
				where: {
					BK_ID: booking.BK_ID,
					Due_Date: nextInstallmentMonthFormatted
				}
			});

			if (!nextInstallmentDetails) {
				console.log("No next installment details found.");
				return;
			}

			// Step 3: Calculate the surcharge
			const currentDate2 = new Date();
			const dueDate = new Date(nextInstallmentDetails.Due_Date);

			const differenceInMilliseconds = currentDate2 - dueDate;
			const millisecondsInOneDay = 1000 * 60 * 60 * 24;
			const differenceInDays = Math.floor(differenceInMilliseconds / millisecondsInOneDay);

			let surcharge2 = 0;

			if (differenceInDays > 0) {
				surcharge2 = parseInt(nextInstallmentDetails.Installment_Due) * surchargeRate * differenceInDays;
			}

			let InstallmentReceipt = await InstallmentReceipts.findAll({
				where: { BK_ID: booking.BK_ID },
				include: [
					{
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails,
						where: { InsType_ID: 1, BKI_TYPE: null }
					}
				]
			});

			let updatebookinginstallment = await BookingInstallmentDetails.update(
				{ surCharges: surcharge2 },
				{
					where: {
						BK_ID: booking.BK_ID,
						Due_Date: nextInstallmentMonthFormatted
					}
				}
			);

			res.send({
				lastPaidInstallment,
				updatebookinginstallment,
				ostamount,
				nextInstallmentMonthFormatted,
				lastInstallmentMonth,
				surcharge2,
				booking,
				createdAt,
				currentDate,
				before
			});
		} catch (err) {
			res.status(500).send({
				message: err.message || "Some error occurred."
			});
		}
	};

	static ballotSearch = async (req, res, next) => {
		try {
			// const cnic = "35202-2626119-3";
			const cnic = req.body.cnic;

			Booking.findAll({
				include: [
					{
						as: "Member",
						model: Member,
						where: {
							BuyerCNIC: cnic
						},
						attributes: ["MEMBER_ID", "BuyerName", "BuyerContact", "BuyerCNIC"]
					},
					{ as: "UnitType", model: UnitType, attributes: ["Name"] },
					{ as: "PlotSize", model: PlotSize, attributes: ["Name"] },
					{ as: "Phase", model: Phase, attributes: ["NAME"] },
					{ as: "Sector", model: Sector, attributes: ["NAME"] },
					{
						as: "Unit",
						model: Unit,
						attributes: ["Plot_No"],
						include: { as: "Block", model: Block, attributes: ["Name"] }
					},
					{ as: "Location", model: MYLocation, attributes: ["Plot_Location"] }
				],
				attributes: ["BK_ID", "Reg_Code_Disply"]
			})
				.then((response) => {
					res.send({ message: "info", data: response });
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

	static paySurcharges = async (req, res) => {
		try {
			console.log("1ssss1",req.body);
			let amountToBePaid = parseInt(req.body.amount);
			let vcno = req.body.vcno;
			let waveofNo = parseInt(req.body.waveOffNo);

			console.log("Typeeeee",typeof amountToBePaid, amountToBePaid, typeof waveofNo, waveofNo);

			Booking.findOne({
				 where: { Reg_Code_Disply: vcno },
				 include: [
					{ model: UnitType, as: 'UnitType' },
					{ model: PlotSize, as: 'PlotSize' },
					{ model: Member, as: 'Member' },
				  ],
				})
				.then(async (response) => {
					console.log("respoonse", response);
					let totalSurcharge = parseInt(response.totalSurcharges);
						let remainingSurchages = response.remainingSurcharges ? parseInt(response.remainingSurcharges) : 0;
						let paidSurcharges = response.paidSurcharges ? parseInt(response.paidSurcharges) : 0;
						// console.log(typeof remainingSurchages, remainingSurchages);
						// console.log(typeof amountToBePaid, amountToBePaid);

						let finalAmount;
						if (waveofNo > 0) {
							// waveofNo = waveofNo / 100;
							// let newRemainingSurcharges = waveofNo * remainingSurchages;
							// remainingSurchages = remainingSurchages - newRemainingSurcharges;
							// if(amountToBePaid > remainingSurchages){
							// 	res.send("Amount you are paying is greater then the Surcharges.")
							// }
							// Convert wave-off percentage to decimal and apply
							let waveOffPercentage = waveofNo / 100;
							let waveOffAmount = waveOffPercentage * remainingSurchages;
							remainingSurchages -= waveOffAmount;
							if (amountToBePaid > remainingSurchages) {
								return res.send("Amount you are paying is greater than the remaining surcharges after wave-off.");
							}
						} else {
							remainingSurchages = remainingSurchages - amountToBePaid;
						}
						// console.log(typeof totalSurcharge, totalSurcharge);
						// console.log(typeof finalAmount, finalAmount);

						if (amountToBePaid >= remainingSurchages) {
							let updateBooking = await Booking.update(
								{ totalSurcharge: totalSurcharge, remainingSurcharges: 0, paidSurcharges: totalSurcharge },
								{ where: { Reg_Code_Disply: vcno } }
							);
						} else {
							let updatedPaidSurcharges = paidSurcharges + amountToBePaid;
							let updateBooking = await Booking.update(
								{ paidSurcharges: updatedPaidSurcharges, remainingSurcharges: remainingSurchages },
								{ where: { Reg_Code_Disply: vcno } }
							);
						}

						let surcharge;
						if(response.BK_ID !== null || response.BK_ID !== ""){
							console.log("In Surcharge Create")
							surcharge = await SurCharge.create({
								amount: amountToBePaid,
								waveOff: waveofNo,
								paidAt: Date.now(),
								BK_ID: response.BK_ID,
							})
						} else {
							res.status(403).send({ message: "Booking ID is missing, cannot create surcharge."});
						}

						const findBookingDetails = await SurCharge.findAll({
							where: {SC_ID: surcharge.SC_ID, BK_ID: surcharge.BK_ID},
							include: [
								{ 
									model: Booking,
									as: "Booking",
									include: [
										{ as: "UnitType", model: UnitType },
										{ as: "PlotSize", model: PlotSize },
										{ as: "Member", model: Member },
									]
								}
							]
						});

						// console.log("resultttt", findBookingDetails[0])

						let receipt_head = "Surcharge";
						
						const pdfBody = {
							totalSurcharge: findBookingDetails[0].Booking.totalSurcharges,
							remainingSurcharge: findBookingDetails[0].Booking.remainingSurcharges,
							paidSurcharge: findBookingDetails[0].Booking.paidSurcharges,
							paidAt: findBookingDetails[0].paidAt,
							BK_ID: findBookingDetails[0].BK_ID,
							unitType: findBookingDetails[0].Booking.UnitType.Name,
							plotSize: findBookingDetails[0].Booking.PlotSize.Name,
							member: findBookingDetails[0].Booking.Member.BuyerName,
							vcno: findBookingDetails[0].Booking.Reg_Code_Disply,
						}
						// console.log("PDFFFFFFF",pdfBody)

						let pdf = await pdfGenerator.SurchargeGenerator(pdfBody, findBookingDetails, receipt_head);


						return res.status(200).json({
							status: 200,
							message: "Surcharges Paid successfully",
							file: { url: `${process.env.APP_URL}/${pdf}` },
						});
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

	static getAllSurcharges = async (req,res) => {
		try {

			const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
			const limit = parseInt(req.query.limit) || 25; // Default to 10 items per page if not provided
			const offset = (page - 1) * limit; // Calculate offset for the query

			const { count, rows } = await SurCharge.findAndCountAll({
				include: [
					{
						model: Booking,
						as: "Booking",
						include: [
							{ as: "UnitType", model: UnitType },
							{ as: "PlotSize", model: PlotSize },
							{ as: "Member", model: Member },
						],
					}
				],
				offset: offset,
				limit: limit,
			});

			const totalPages = Math.ceil(count / limit); // Calculate total pages

			return res.status(200).send({
				message: "Surcharges Paid successfully",
				data: rows,
				pagination: {
					totalItems: count,
					totalPages: totalPages,
					currentPage: page,
					limit: limit,
				},
			});


		} catch (error) {

			res.status(500).send({
				message: err.message || "Some error occurred.",
			});

		}
	};

	static downloadSurchargeReport = async (req,res) => {
		try {

			const {scid, bkid} = req.body;
			
			const findBookingDetails = await SurCharge.findAll({
				where: {SC_ID: scid, BK_ID: bkid},
				include: [
					{ 
						model: Booking,
						as: "Booking",
						include: [
							{ as: "UnitType", model: UnitType },
							{ as: "PlotSize", model: PlotSize },
							{ as: "Member", model: Member },
						]
					}
				]
			});

			let receipt_head = "Surcharge";
			
			const pdfBody = {
				totalSurcharge: findBookingDetails[0].Booking.totalSurcharges,
				remainingSurcharge: findBookingDetails[0].Booking.remainingSurcharges,
				paidSurcharge: findBookingDetails[0].Booking.paidSurcharges,
				paidAt: findBookingDetails[0].paidAt,
				BK_ID: findBookingDetails[0].BK_ID,
				unitType: findBookingDetails[0].Booking.UnitType.Name,
				plotSize: findBookingDetails[0].Booking.PlotSize.Name,
				member: findBookingDetails[0].Booking.Member.BuyerName,
				vcno: findBookingDetails[0].Booking.Reg_Code_Disply,
			}

			let pdf = await pdfGenerator.SurchargeGenerator(pdfBody, findBookingDetails, receipt_head);


			return res.status(200).json({
				status: 200,
				message: "Surcharge found successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` },
			});

		} catch (error) {
			
			res.status(500).send({
				message: err.message || "Some error occurred.",
			});

		}
	}
	static search = async (req, res) => {
		const { card_no } = req.body;
		console.log(req.body);

		if (!card_no) {
			return res.status(400).send({ error: "Card_No is required" });
		}

		// Read the JSON file
		fs.readFile("file.json", "utf8", (err, data) => {
			if (err) {
				return res.status(500).send({ error: "Failed to read file" });
			}

			let records;
			try {
				records = JSON.parse(data);
			} catch (parseError) {
				return res.status(500).send({ error: "Failed to parse JSON" });
			}

			// Search for the object with the given Card_No
			const result = records.find((record) => record.Card_No === card_no);

			if (result) {
				res.send(result);
			} else {
				res.status(404).send({ error: "Card_No not found" });
			}
		});
	};
}

// export default UserController;
module.exports = UserController;
