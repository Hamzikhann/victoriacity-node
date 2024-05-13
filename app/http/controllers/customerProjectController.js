// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import CustomerProject from "../../models/CustomerProject.js";
// import Project from '../../models/project.js';
// import Customer from '../../models/Customer.js';
// dotenv.config()

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const CustomerProject = require("../../models/CustomerProject.js");
const Project = require("../../models/project.js");
const Customer = require("../../models/Customer.js");
dotenv.config();

class CustomerProjectController {
	static addCustomerProject = async (req, res, next) => {
		const { customerId, projectId } = req.body;
		// console.log({ customerId, projectId });
		if (customerId && projectId) {
			try {
				const createProject = new CustomerProject({
					customerId: customerId,
					projectId: projectId
				});

				let projectResult = await Project.findAll({ where: { id: projectId } });
				let customerResult = await Customer.findAll({ where: { id: customerId } });

				if (customerResult.length > 0) {
					if (projectResult.length > 0) {
						await createProject.save();

						res.status(200).send({
							status: 200,
							message: "Add CustomerProject successfully",
							Projects: createProject
						});
					} else {
						res.status(404).send({
							status: 404,
							message: "NO Project Found Against Id"
						});
					}
				} else {
					res.status(404).send({
						status: 404,
						message: "NO Customer Found Against Id"
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Add Project"
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

// export default CustomerProjectController
module.exports = CustomerProjectController;
