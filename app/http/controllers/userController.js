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
const axios = require("axios");
const macaddress = require("macaddress");
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

					// if (user.role)
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

			let data = [
				"VC00118",
				"VC00122",
				"VC00123",
				"VC00125",
				"VC00127",
				"VC00129",
				"VC00224",
				"VC01113",
				"VC01119",
				"VC01135",
				"VC01140",
				"VC01170",
				"VC01180",
				"VC01210",
				"VC01212",
				"VC01215",
				"VC01216",
				"VC01217",
				"VC01218",
				"VC01227",
				"VC01233",
				"VC01234",
				"VC01238",
				"VC01241",
				"VC01243",
				"VC01244",
				"VC01248",
				"VC01250",
				"VC01257",
				"VC01258",
				"VC01260",
				"VC01262",
				"VC01263",
				"VC01265",
				"VC01266",
				"VC01269",
				"VC01275",
				"VC01279",
				"VC01283",
				"VC01285",
				"VC01288",
				"VC01291",
				"VC01298",
				"VC01299",
				"VC01361",
				"VC01387",
				"VC01472",
				"VC02224",
				"VC02232",
				"VC02255",
				"VC02256",
				"VC02259",
				"VC02264",
				"VC111005",
				"VC111006",
				"VC111008",
				"VC111009",
				"VC11101",
				"VC111017",
				"VC111019",
				"VC111023",
				"VC111028",
				"VC111036",
				"VC11105",
				"VC111053",
				"VC111061",
				"VC111065",
				"VC111066",
				"VC111074",
				"VC111085",
				"VC111135",
				"VC111137",
				"VC111142",
				"VC111146",
				"VC111153",
				"VC111164",
				"VC111168",
				"VC111183",
				"VC111198",
				"VC111200",
				"VC111201",
				"VC111202",
				"VC111203",
				"VC111212",
				"VC111213",
				"VC111214",
				"VC111215",
				"VC111224",
				"VC111229",
				"VC111236",
				"VC111237",
				"VC111240",
				"VC111247",
				"VC111250",
				"VC111251",
				"VC111252",
				"VC111257",
				"VC111258",
				"VC111261",
				"VC111264",
				"VC111265",
				"VC111275",
				"VC111279",
				"VC111281",
				"VC111292",
				"VC111299",
				"VC111301",
				"VC111309",
				"VC111311",
				"VC111313",
				"VC111317",
				"VC111325",
				"VC111341",
				"VC111348",
				"VC111349",
				"VC111350",
				"VC111351",
				"VC111359",
				"VC111360",
				"VC111363",
				"VC111364",
				"VC111365",
				"VC111366",
				"VC111367",
				"VC111369",
				"VC111370",
				"VC111372",
				"VC111374",
				"VC111383",
				"VC111386",
				"VC111388",
				"VC111389",
				"VC111390",
				"VC111401",
				"VC111407",
				"VC111408",
				"VC111409",
				"VC11141",
				"VC111417",
				"VC111427",
				"VC11144",
				"VC111443",
				"VC111444",
				"VC111457",
				"VC111462",
				"VC111465",
				"VC111469",
				"VC111471",
				"VC111473",
				"VC111474",
				"VC111475",
				"VC111483",
				"VC111492",
				"VC111495",
				"VC111496",
				"VC111504",
				"VC111505",
				"VC111506",
				"VC111511",
				"VC111520",
				"VC111521",
				"VC111524",
				"VC11153",
				"VC111539",
				"VC11154",
				"VC111556",
				"VC111559",
				"VC111562",
				"VC111587",
				"VC111598",
				"VC111612",
				"VC111616",
				"VC111617",
				"VC111620",
				"VC111644",
				"VC111648",
				"VC11165",
				"VC111653",
				"VC111656",
				"VC111659",
				"VC11166",
				"VC111675",
				"VC111680",
				"VC111681",
				"VC111684",
				"VC111689",
				"VC111693",
				"VC111702",
				"VC111706",
				"VC111707",
				"VC111708",
				"VC111717",
				"VC111719",
				"VC111721",
				"VC111726",
				"VC111738",
				"VC111768",
				"VC111772",
				"VC111773",
				"VC111794",
				"VC111796",
				"VC11206",
				"VC11208",
				"VC11209",
				"VC11212",
				"VC11227",
				"VC11228",
				"VC11234",
				"VC11238",
				"VC11241",
				"VC11248",
				"VC11250",
				"VC11261",
				"VC11265",
				"VC11266",
				"VC11273",
				"VC11274",
				"VC11282",
				"VC11284",
				"VC11295",
				"VC11296",
				"VC11322",
				"VC11327",
				"VC11339",
				"VC11341",
				"VC11343",
				"VC11344",
				"VC11351",
				"VC11365",
				"VC11385",
				"VC11391",
				"VC11403",
				"VC11404",
				"VC11408",
				"VC11409",
				"VC11423",
				"VC11427",
				"VC11428",
				"VC11432",
				"VC11435",
				"VC11436",
				"VC11439",
				"VC11443",
				"VC11445",
				"VC11446",
				"VC11449",
				"VC11450",
				"VC11454",
				"VC11470",
				"VC11480",
				"VC11482",
				"VC11530",
				"VC11533",
				"VC11534",
				"VC11539",
				"VC11540",
				"VC11544",
				"VC11549",
				"VC11550",
				"VC11563",
				"VC11574",
				"VC11585",
				"VC11590",
				"VC11591",
				"VC11600",
				"VC11606",
				"VC11607",
				"VC11613",
				"VC11622",
				"VC11625",
				"VC11632",
				"VC11634",
				"VC11655",
				"VC11656",
				"VC11657",
				"VC11661",
				"VC11669",
				"VC11670",
				"VC11671",
				"VC11674",
				"VC11677",
				"VC11678",
				"VC11679",
				"VC11708",
				"VC11709",
				"VC11713",
				"VC11721",
				"VC11722",
				"VC11737",
				"VC11739",
				"VC11740",
				"VC11750",
				"VC11755",
				"VC11756",
				"VC11771",
				"VC11774",
				"VC11784",
				"VC11786",
				"VC11794",
				"VC11798",
				"VC11799",
				"VC11800",
				"VC11812",
				"VC11834",
				"VC11840",
				"VC11848",
				"VC11849",
				"VC11863",
				"VC11875",
				"VC11878",
				"VC11879",
				"VC11901",
				"VC11904",
				"VC11906",
				"VC11910",
				"VC11912",
				"VC11918",
				"VC11919",
				"VC11931",
				"VC11934",
				"VC11937",
				"VC11938",
				"VC11948",
				"VC11959",
				"VC11967",
				"VC11968",
				"VC11969",
				"VC11977",
				"VC11984",
				"VC11985",
				"VC11987",
				"VC12100",
				"VC121007",
				"VC121015",
				"VC121022",
				"VC121024",
				"VC121025",
				"VC121026",
				"VC121029",
				"VC121030",
				"VC12104",
				"VC121043",
				"VC121044",
				"VC121045",
				"VC121046",
				"VC121047",
				"VC121051",
				"VC121052",
				"VC121055",
				"VC121067",
				"VC121069",
				"VC12107",
				"VC121079",
				"VC12108",
				"VC121080",
				"VC121087",
				"VC12109",
				"VC12110",
				"VC12112",
				"VC121122",
				"VC121155",
				"VC121156",
				"VC121160",
				"VC121162",
				"VC121170",
				"VC121176",
				"VC121181",
				"VC121187",
				"VC121188",
				"VC121199",
				"VC121219",
				"VC121223",
				"VC121238",
				"VC121239",
				"VC121243",
				"VC121249",
				"VC121253",
				"VC121256",
				"VC121259",
				"VC121260",
				"VC121266",
				"VC121267",
				"VC121268",
				"VC121270",
				"VC121271",
				"VC121274",
				"VC121276",
				"VC121278",
				"VC121280",
				"VC121282",
				"VC121285",
				"VC121286",
				"VC121287",
				"VC121291",
				"VC121294",
				"VC121298",
				"VC12130",
				"VC121303",
				"VC121304",
				"VC121305",
				"VC121306",
				"VC121307",
				"VC121310",
				"VC121312",
				"VC121318",
				"VC121319",
				"VC121320",
				"VC121326",
				"VC121327",
				"VC121329",
				"VC12133",
				"VC121336",
				"VC12134",
				"VC121342",
				"VC121343",
				"VC121345",
				"VC121346",
				"VC12135",
				"VC121352",
				"VC121354",
				"VC121355",
				"VC121356",
				"VC12136",
				"VC121362",
				"VC121368",
				"VC12138",
				"VC121380",
				"VC121381",
				"VC121384",
				"VC121385",
				"VC121391",
				"VC121392",
				"VC121393",
				"VC121394",
				"VC121398",
				"VC121399",
				"VC121400",
				"VC121404",
				"VC121410",
				"VC121413",
				"VC121414",
				"VC121415",
				"VC121416",
				"VC121419",
				"VC121420",
				"VC121421",
				"VC121428",
				"VC12143",
				"VC121440",
				"VC121441",
				"VC121453",
				"VC121454",
				"VC121455",
				"VC121456",
				"VC121464",
				"VC121467",
				"VC121468",
				"VC121470",
				"VC121476",
				"VC121482",
				"VC121485",
				"VC121486",
				"VC121487",
				"VC121488",
				"VC121489",
				"VC12149",
				"VC121494",
				"VC121501",
				"VC121508",
				"VC121509",
				"VC121522",
				"VC121523",
				"VC121530",
				"VC121531",
				"VC121532",
				"VC121535",
				"VC121536",
				"VC121540",
				"VC121551",
				"VC121564",
				"VC121565",
				"VC121568",
				"VC121575",
				"VC121576",
				"VC121577",
				"VC121579",
				"VC121580",
				"VC121581",
				"VC121588",
				"VC121590",
				"VC121594",
				"VC121596",
				"VC12161",
				"VC121611",
				"VC121618",
				"VC121619",
				"VC12162",
				"VC121622",
				"VC121623",
				"VC121624",
				"VC121625",
				"VC121627",
				"VC121628",
				"VC121629",
				"VC121630",
				"VC121631",
				"VC121638",
				"VC121639",
				"VC121640",
				"VC121641",
				"VC121642",
				"VC121643",
				"VC121645",
				"VC121650",
				"VC121654",
				"VC121657",
				"VC121664",
				"VC121665",
				"VC121667",
				"VC121668",
				"VC121669",
				"VC121671",
				"VC121672",
				"VC121673",
				"VC121679",
				"VC121682",
				"VC121683",
				"VC121687",
				"VC121688",
				"VC121690",
				"VC121691",
				"VC121692",
				"VC121709",
				"VC121710",
				"VC121715",
				"VC121716",
				"VC121720",
				"VC121723",
				"VC121724",
				"VC121729",
				"VC121733",
				"VC121762",
				"VC121769",
				"VC121770",
				"VC121771",
				"VC121775",
				"VC121777",
				"VC121793",
				"VC121798",
				"VC12180",
				"VC121801",
				"VC121803",
				"VC121804",
				"VC12186",
				"VC12197",
				"VC12210",
				"VC12211",
				"VC12213",
				"VC12214",
				"VC12215",
				"VC12217",
				"VC12220",
				"VC12221",
				"VC12222",
				"VC12223",
				"VC12224",
				"VC12226",
				"VC12229",
				"VC12235",
				"VC12236",
				"VC12237",
				"VC12240",
				"VC12244",
				"VC12245",
				"VC12246",
				"VC12252",
				"VC12262",
				"VC12263",
				"VC12264",
				"VC12270",
				"VC12272",
				"VC12276",
				"VC12278",
				"VC12279",
				"VC12285",
				"VC12288",
				"VC12293",
				"VC12294",
				"VC12297",
				"VC12299",
				"VC12300",
				"VC12301",
				"VC12304",
				"VC12306",
				"VC12316",
				"VC12317",
				"VC12321",
				"VC12323",
				"VC12326",
				"VC12328",
				"VC12329",
				"VC12333",
				"VC12334",
				"VC12335",
				"VC12338",
				"VC12345",
				"VC12346",
				"VC12347",
				"VC12352",
				"VC12354",
				"VC12360",
				"VC12363",
				"VC12364",
				"VC12368",
				"VC12369",
				"VC12380",
				"VC12383",
				"VC12387",
				"VC12402",
				"VC12406",
				"VC12412",
				"VC12413",
				"VC12414",
				"VC12422",
				"VC12424",
				"VC12425",
				"VC12426",
				"VC12429",
				"VC12434",
				"VC12437",
				"VC12438",
				"VC12444",
				"VC12448",
				"VC12451",
				"VC12464",
				"VC12465",
				"VC12475",
				"VC12481",
				"VC12484",
				"VC12486",
				"VC12487",
				"VC12491",
				"VC12504",
				"VC12505",
				"VC12506",
				"VC12507",
				"VC12516",
				"VC12517",
				"VC12522",
				"VC12523",
				"VC12537",
				"VC12541",
				"VC12542",
				"VC12546",
				"VC12547",
				"VC12548",
				"VC12554",
				"VC12555",
				"VC12561",
				"VC12564",
				"VC12569",
				"VC12575",
				"VC12576",
				"VC12577",
				"VC12578",
				"VC12581",
				"VC12582",
				"VC12583",
				"VC12584",
				"VC12586",
				"VC12592",
				"VC12597",
				"VC12599",
				"VC12601",
				"VC12603",
				"VC12604",
				"VC12605",
				"VC12608",
				"VC12609",
				"VC12610",
				"VC12612",
				"VC12614",
				"VC12615",
				"VC12620",
				"VC12626",
				"VC12627",
				"VC12628",
				"VC12630",
				"VC12636",
				"VC12637",
				"VC12638",
				"VC12639",
				"VC12640",
				"VC12644",
				"VC12653",
				"VC12658",
				"VC12659",
				"VC12662",
				"VC12672",
				"VC12673",
				"VC12675",
				"VC12676",
				"VC12685",
				"VC12693",
				"VC12700",
				"VC12701",
				"VC12702",
				"VC12710",
				"VC12717",
				"VC12723",
				"VC12726",
				"VC12727",
				"VC12728",
				"VC12729",
				"VC12730",
				"VC12731",
				"VC12733",
				"VC12734",
				"VC12741",
				"VC12742",
				"VC12745",
				"VC12747",
				"VC12754",
				"VC12759",
				"VC12762",
				"VC12763",
				"VC12764",
				"VC12767",
				"VC12768",
				"VC12770",
				"VC12775",
				"VC12779",
				"VC12783",
				"VC12787",
				"VC12788",
				"VC12791",
				"VC12792",
				"VC12793",
				"VC12795",
				"VC12797",
				"VC12813",
				"VC12814",
				"VC12815",
				"VC12816",
				"VC12817",
				"VC12818",
				"VC12823",
				"VC12824",
				"VC12828",
				"VC12829",
				"VC12831",
				"VC12832",
				"VC12833",
				"VC12838",
				"VC12845",
				"VC12850",
				"VC12853",
				"VC12854",
				"VC12855",
				"VC12856",
				"VC12857",
				"VC12858",
				"VC12859",
				"VC12862",
				"VC12864",
				"VC12865",
				"VC12866",
				"VC12867",
				"VC12868",
				"VC12869",
				"VC12870",
				"VC12871",
				"VC12876",
				"VC12887",
				"VC12888",
				"VC12891",
				"VC12892",
				"VC12893",
				"VC12894",
				"VC12895",
				"VC12899",
				"VC12915",
				"VC12917",
				"VC12920",
				"VC12923",
				"VC12924",
				"VC12925",
				"VC12926",
				"VC12927",
				"VC12928",
				"VC12929",
				"VC12935",
				"VC12941",
				"VC12947",
				"VC12951",
				"VC12952",
				"VC12954",
				"VC12955",
				"VC12957",
				"VC12960",
				"VC12961",
				"VC12962",
				"VC12963",
				"VC12971",
				"VC12972",
				"VC12973",
				"VC12974",
				"VC12978",
				"VC12979",
				"VC12988",
				"VC131012",
				"VC131013",
				"VC131178",
				"VC131472",
				"VC13157",
				"VC131593",
				"VC13172",
				"VC13173",
				"VC13188",
				"VC13298",
				"VC13302",
				"VC13515",
				"VC14308",
				"VC1741",
				"VC1748",
				"VC1752",
				"VC1754",
				"VC1756",
				"VC1758",
				"VC221062",
				"VC221089",
				"VC221131",
				"VC221163",
				"VC221177",
				"VC22120",
				"VC22131",
				"VC221337",
				"VC221347",
				"VC221376",
				"VC221377",
				"VC221382",
				"VC221490",
				"VC221497",
				"VC221498",
				"VC221499",
				"VC221500",
				"VC221502",
				"VC221537",
				"VC22155",
				"VC221614",
				"VC221655",
				"VC221663",
				"VC221678",
				"VC221701",
				"VC221778",
				"VC221779",
				"VC22205",
				"VC22218",
				"VC22225",
				"VC22243",
				"VC22325",
				"VC22349",
				"VC22421",
				"VC22447",
				"VC22467",
				"VC22476",
				"VC22611",
				"VC22645",
				"VC22683",
				"VC22699",
				"VC22758",
				"VC22803",
				"VC22810",
				"VC22851",
				"VC22852",
				"VC22908",
				"VC22956",
				"VC271000",
				"VC271001",
				"VC271002",
				"VC271014",
				"VC271037",
				"VC271151",
				"VC271269",
				"VC271344",
				"VC271573",
				"VC271597",
				"VC271632",
				"VC271649",
				"VC271694",
				"VC271695",
				"VC271696",
				"VC271697",
				"VC271698",
				"VC271699",
				"VC271700",
				"VC271711",
				"VC271714",
				"VC271792",
				"VC271795",
				"VC27999"
			];
			Booking.findAll({
				where: {
					Status: "Active"
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
						arraylength: data.length,
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
			let booking1 = await Booking.findOne({ where: { Reg_Code_Disply: "VC12886" } });
			console.log("BOKINNNGGG", booking1);

			const createdAt = new Date(booking1.createdAt);
			const currentDate = new Date();

			const july2024 = new Date("2024-07-01");
			const august2024 = new Date("2024-08-01");
			let whereClause = {
				BK_ID: booking1.BK_ID
			};

			// Check if the current date is after August 2024 and if ostamount is greater than 0
			let find = await InstallmentReceipts.findOne({ where: { BK_ID: booking1.BK_ID, Installment_Month: july2024 } });
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
						where: { InsType_ID: [1, 2], BKI_TYPE: null }
					}
				]
			});
			const type1Receipts = before.filter((item) => item.Booking_Installment_Details?.InsType_ID === 1);
			const type2Receipts = before.filter((item) => item.Booking_Installment_Details?.InsType_ID === 2);

			// console.log("Receipts with InsType_ID 1:", type1Receipts);
			// console.log("Receipts with InsType_ID 2:", type2Receipts);

			// console.log("BeFOREeeeeeeeeeeee", before);
			const surchargeRate = 0.001;
			let surcharge = 0;
			let total = 0;
			// Set to track processed dates and types
			const processedDates = new Set();
			let datearray = [];
			for (let i = 0; i < before.length; i++) {
				const ircDate = new Date(before[i].IRC_Date);
				const dueDate = new Date(before[i].Booking_Installment_Details.Due_Date);

				const differenceInMilliseconds = ircDate - dueDate;
				const millisecondsInOneDay = 1000 * 60 * 60 * 24;
				const differenceInDays = differenceInMilliseconds / millisecondsInOneDay;
				datearray.push(`${i}-${differenceInDays}`);
				// Create a unique key using the IRC_Date and INS_Type
				var installmentKey = `${before[i].IRC_Date}-${before[i].BKI_DETAIL_ID}`;
				// console.log(installmentKey);

				// Check if we already processed this date and type
				if (processedDates.has(installmentKey)) {
					console.log("true");
					// Skip this installment if we already processed a surcharge for this date and type
					continue;
				}
				// Apply surcharge logic
				if (differenceInDays < 0) {
					console.log("when days are less then 0", differenceInDays);

					await InstallmentReceipts.update({ surCharges: 0 }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
				} else if (differenceInDays > 0) {
					console.log(differenceInDays);
					const surcharge = parseInt(before[i].Installment_Due) * surchargeRate * differenceInDays;
					total = total + surcharge;
					console.log("updating the sur charge at ", i, surcharge);

					await InstallmentReceipts.update({ surCharges: surcharge }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
				}

				// Mark this date and type as processed
				processedDates.add(installmentKey);
			}

			// for (let i = 0; i < before.length; i++) {
			// 	const ircDate = new Date(before[i].IRC_Date);
			// 	const dueDate = new Date(before[i].Booking_Installment_Details.Due_Date);

			// 	const differenceInMilliseconds = ircDate - dueDate;
			// 	const millisecondsInOneDay = 1000 * 60 * 60 * 24;
			// 	const differenceInDays = differenceInMilliseconds / millisecondsInOneDay;

			// 	// Check if the installment month is July 2024 and if ostamount was 0 during July
			// 	if (differenceInDays < 0) {
			// 		await InstallmentReceipts.update({ surCharges: 0 }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
			// 	} else if (differenceInDays > 0) {
			// 		surcharge = parseInt(before[i].Installment_Due) * surchargeRate * differenceInDays;
			// 		total = total + surcharge;
			// 		await InstallmentReceipts.update(
			// 			{ surCharges: surcharge },
			// 			{
			// 				where: { INS_RC_ID: before[i].INS_RC_ID }
			// 			}
			// 		);
			// 	}
			// 	// else {
			// 	// 	await InstallmentReceipts.update({ surCharges: 0 }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
			// 	// }
			// }
			// Step 2: Calculate the next installment month
			// const lastInstallmentMonth = new Date(lastPaidInstallment.Installment_Month);
			// const nextInstallmentMonth = new Date(lastInstallmentMonth);
			// nextInstallmentMonth.setMonth(nextInstallmentMonth.getMonth() + 1); // Move to the next month
			// let nextInstallmentMonthFormatted = `${nextInstallmentMonth.getFullYear()}-${(nextInstallmentMonth.getMonth() + 1)
			// 	.toString()
			// 	.padStart(2, "0")}-10`;
			// console.log(nextInstallmentMonthFormatted);

			// // Get the due date for the next installment month
			// let nextInstallmentDetails = await BookingInstallmentDetails.findOne({
			// 	where: {
			// 		BK_ID: booking.BK_ID,
			// 		Due_Date: nextInstallmentMonthFormatted
			// 	}
			// });

			// if (!nextInstallmentDetails) {
			// 	console.log("No next installment details found.");
			// 	return;
			// }

			// // Step 3: Calculate the surcharge
			// const currentDate2 = new Date();
			// const dueDate = new Date(nextInstallmentDetails.Due_Date);

			// const differenceInMilliseconds = currentDate2 - dueDate;
			// const millisecondsInOneDay = 1000 * 60 * 60 * 24;
			// const differenceInDays = Math.floor(differenceInMilliseconds / millisecondsInOneDay);

			// let surcharge2 = 0;

			// if (differenceInDays > 0) {
			// 	surcharge2 = parseInt(nextInstallmentDetails.Installment_Due) * surchargeRate * differenceInDays;
			// }

			// let InstallmentReceipt = await InstallmentReceipts.findAll({
			// 	where: { BK_ID: booking.BK_ID },
			// 	include: [
			// 		{
			// 			as: "Booking_Installment_Details",
			// 			model: BookingInstallmentDetails,
			// 			where: { InsType_ID: 1, BKI_TYPE: null }
			// 		}
			// 	]
			// });

			// let updatebookinginstallment = await BookingInstallmentDetails.update(
			// 	{ surCharges: surcharge2 },
			// 	{
			// 		where: {
			// 			BK_ID: booking.BK_ID,
			// 			Due_Date: nextInstallmentMonthFormatted
			// 		}
			// 	}
			// );

			res.send({
				// lastPaidInstallment,
				// updatebookinginstallment,
				// ostamount,
				// nextInstallmentMonthFormatted,
				// lastInstallmentMonth,
				// surcharge2,
				// booking,
				// createdAt,
				// currentDate,
				datearray,
				before,
				processedDates
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
			console.log("1ssss1", req.body);
			let amountToBePaid = parseInt(req.body.amount);
			let vcno = req.body.vcno;
			let waveofNo = parseInt(req.body.waveOffNo);

			console.log("Typeeeee", typeof amountToBePaid, amountToBePaid, typeof waveofNo, waveofNo);

			Booking.findOne({
				where: { Reg_Code_Disply: vcno },
				include: [
					{ model: UnitType, as: "UnitType" },
					{ model: PlotSize, as: "PlotSize" },
					{ model: Member, as: "Member" }
				]
			})
				.then(async (response) => {
					// console.log("respoonse", response);
					let totalSurcharge = parseInt(response.totalSurcharges);
					let remainingSurchages = response.remainingSurcharges ? parseInt(response.remainingSurcharges) : 0;
					let paidSurcharges = response.paidSurcharges ? parseInt(response.paidSurcharges) : 0;
					console.log(typeof remainingSurchages, remainingSurchages);
					console.log(typeof amountToBePaid, amountToBePaid);

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
						// if (amountToBePaid > remainingSurchages) {
						// 	return res.send("Amount you are paying is greater than the remaining surcharges after wave-off.");
						// }
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
					if (response.BK_ID !== null || response.BK_ID !== "") {
						console.log("In Surcharge Create");
						surcharge = await SurCharge.create({
							amount: amountToBePaid,
							waveOff: waveofNo,
							paidAt: Date.now(),
							BK_ID: response.BK_ID
						});
					} else {
						res.status(403).send({ message: "Booking ID is missing, cannot create surcharge." });
					}

					const findBookingDetails = await SurCharge.findAll({
						where: { SC_ID: surcharge.SC_ID, BK_ID: surcharge.BK_ID },
						include: [
							{
								model: Booking,
								as: "Booking",
								include: [
									{ as: "UnitType", model: UnitType },
									{ as: "PlotSize", model: PlotSize },
									{ as: "Member", model: Member }
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
						vcno: findBookingDetails[0].Booking.Reg_Code_Disply
					};
					// console.log("PDFFFFFFF",pdfBody)

					let pdf = await pdfGenerator.SurchargeGenerator(pdfBody, findBookingDetails, receipt_head);

					return res.status(200).json({
						status: 200,
						message: "Surcharges Paid successfully",
						file: { url: `${process.env.APP_URL}/${pdf}` }
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

	static getAllSurcharges = async (req, res) => {
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
							{ as: "Member", model: Member }
						]
					}
				],
				offset: offset,
				limit: limit
			});

			const totalPages = Math.ceil(count / limit); // Calculate total pages

			return res.status(200).send({
				message: "Surcharges Paid successfully",
				data: rows,
				pagination: {
					totalItems: count,
					totalPages: totalPages,
					currentPage: page,
					limit: limit
				}
			});
		} catch (error) {
			res.status(500).send({
				message: err.message || "Some error occurred."
			});
		}
	};

	static downloadSurchargeReport = async (req, res) => {
		try {
			const { scid, bkid } = req.body;

			const findBookingDetails = await SurCharge.findAll({
				where: { SC_ID: scid, BK_ID: bkid },
				include: [
					{
						model: Booking,
						as: "Booking",
						include: [
							{ as: "UnitType", model: UnitType },
							{ as: "PlotSize", model: PlotSize },
							{ as: "Member", model: Member }
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
				vcno: findBookingDetails[0].Booking.Reg_Code_Disply
			};

			let pdf = await pdfGenerator.SurchargeGenerator(pdfBody, findBookingDetails, receipt_head);

			return res.status(200).json({
				status: 200,
				message: "Surcharge found successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` }
			});
		} catch (error) {
			res.status(500).send({
				message: err.message || "Some error occurred."
			});
		}
	};
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

	static newloginrestrictionsTesting = async (req, res) => {
		try {
			const macAddr = await macaddress.all();
			const userMAC = macAddr.eth0?.mac;
			const response = await axios.get("https://api.ipify.org?format=json");
			console.log(response);
			const publicIP = response.data.ip;
			res.send({ message: `Your public IP is: ${publicIP}`, data: userMAC, macAddr });
		} catch (error) {
			console.log(error);
		}
	};
}

// export default UserController;
module.exports = UserController;
