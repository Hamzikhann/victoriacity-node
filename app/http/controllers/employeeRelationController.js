// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import EmployeeRelation from "../../models/EmployeeRelation.js";
// import multer from 'multer'
// import fileUpload from 'express-fileupload';
// import { fileURLToPath } from 'url';

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const EmployeeRelation = require("../../models/EmployeeRelation.js");
const multer = require("multer");
const fileUpload = require("express-fileupload");
const { fileURLToPath } = require("url");
const Employee = require("../../models/Employee.js");
dotenv.config();

// dotenv.config()

class employeeRelationController {
	static addEmployeeRelation = async (req, res, next) => {
		const { relation, name, contact, dob } = req.body;
		if (relation && name && contact && dob) {
			try {
				const createEmployeeRelation = new EmployeeRelation({
					relation: relation,
					name: name,
					dob: dob,
					contact: contact
				});

				await createEmployeeRelation.save();

				res.status(200).send({
					status: 200,
					message: "Add EmployeeRelation successfully",
					EmployeeRelations: createEmployeeRelation
				});
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Add EmployeeRelation"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "All fields are required"
			});
		}
	};
	// SEARCH employeeRealtion BY ID
	static getEmployeeRelationById = async (req, res, next) => {
		const id = req.query.employeeId;
		// console.log(req.query)
		// console.log(req.params)
		try {
			const relation = await EmployeeRelation.findAll({ where: { employeeId: id } });
			if (relation.length > 0) {
				res.status(200).send({
					status: 200,
					message: "get EmployeeRelation successfully",
					employeeRelation: relation
				});
			} else {
				res.status(400).send({
					status: 404,
					message: "No EmployeeRelation Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};

	static getEmployeeRelationByEmployeeId = async (req, res, next) => {
		const id = req.query.id;
		// console.log(req.query)
		// console.log(req.params)
		try {
			const relation = await EmployeeRelation.findAll({ where: { employeeId: id } });
			if (relation.length > 0) {
				res.status(200).send({
					status: 200,
					message: "get EmployeeRelation successfully",
					employeeRelation: relation
				});
			} else {
				res.status(400).send({
					status: 404,
					message: "No EmployeeRelation Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE employeeRealtionS
	static getAllEmployeeRelation = async (req, res) => {
		const allEmployeeRelation = await EmployeeRelation.findAll({
			order: [["createdAt", "DESC"]]
		});
		// console.log(allEmployeeRelation);
		if (allEmployeeRelation !== null) {
			res.status(200).send({
				status: 200,
				message: "Get all Employee Relation successfully",
				employeeRelation: allEmployeeRelation
			});
		} else {
			res.status(200).send({
				status: 200,
				message: "No Employee Relation present"
			});
		}
	};
	///UPDATE employeeRealtion
	static updateEmployeeRelation = async (req, res, next) => {
		const { relation, name, dob, contact } = req.body;

		const id = req.query.id;
		try {
			const result = await EmployeeRelation.findAll({ where: { id: id } });

			if (result) {
				const relationResult = await EmployeeRelation.update(
					{
						employeeId: employeeId,
						relation: relation,
						name: name,
						dob: dob,
						contact: contact
					},
					{ where: { id: id } }
				);

				res.status(200).send({
					status: 200,
					message: " EmployeeRelation  updated successfully",
					"Updated EmployeeRelation": result
				});
			} else {
				res.status(200).send({
					status: 200,
					message: "No EmployeeRelation Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	/////Delete EmployeeRelation

	static deleteEmployeeRelation = async (req, res) => {
		const { id } = req.query;

		if (id) {
			try {
				const result = await EmployeeRelation.findAll({ where: { id: id } });

				if (result.length > 0) {
					EmployeeRelation.destroy({
						where: {
							id: id
						}
					});

					res.status(200).send({
						status: 200,
						message: "EmployeeRelation Deleted successfully",
						"Deleted EmployeeRelation": result
					});
				} else {
					res.status(400).send({
						status: 404,
						message: "EmployeeRelation not found"
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Deleted EmployeeRelation"
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

// export default employeeRelationController;
module.exports = employeeRelationController;
