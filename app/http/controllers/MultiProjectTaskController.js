// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import MultiProjectTask from "../../models/MultiProjectTask.js";
// dotenv.config()

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const MultiProjectTask = require("../../models/MultiProjectTask.js");
const User = require("../../models/User");
const projectTask = require("../../models/ProjectTask");
const ProjectTask = require("../../models/ProjectTask");
dotenv.config();

class MultiProjectTaskController {
	static addMultiProjectTask = async (req, res, next) => {
		const { projectTaskId, userId } = req.body;
		// console.log({ projectTaskId, userId });

		if (projectTaskId && userId) {
			const projectTaskResult = await projectTask.findAll({ where: { id: projectTaskId } });
			const userResult = await User.findAll({ where: { id: userId } });
			if (projectTaskResult.length > 0) {
				if (userResult.length > 0) {
					try {
						const createProjectTask = new MultiProjectTask({
							projectTaskId: projectTaskId,
							userId: userId
						});

						await createProjectTask.save();

						res.status(200).send({
							status: 200,
							message: "Add Task  successfully",
							Floor: createProjectTask
						});
					} catch (error) {
						console.log(error);
						res.status(400).send({
							status: 400,
							message: "Unable to Add Task"
						});
					}
				} else {
					return res.status(400).send({
						status: 400,
						message: "NO USER FOUND AGAINST ID"
					});
				}
			} else {
				return res.status(400).send({
					status: 400,
					message: "NO Task  FOUND AGAINST ID"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "All fields are required"
			});
		}
	};

	////////////////////////////////////////////////////////////
	// static getMultiProjectTaskById = async (req, res, next) => {
	//     const prjTaskId = req.query.id
	//     console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', req.query)
	//     try {
	//     const prjTaskById = await MultiProjectTask.findAll({ include: [{ as: 'projecTask', model: projectTask }, { as: 'user', model: User }], where: { id: prjTaskId } })
	//     if (prjTaskById.length > 0) {
	//         res.status(200).send({
	//             status: 200 ,
	//             "message": "get ProjectTask successfully",
	//             "ProjectTask": prjTaskById
	//         })
	//     } else {
	//         res.status(200).send({
	//             status: 200 ,
	//             "message": "No ProjectTask Found against id"
	//         })
	//     }
	//     } catch (error) {
	//         return next(error)
	//     }
	// }
	// ///////////GET ALL TASK ASSIGNED TO USER
	// static getAllMultiProjectTasks = async (req, res) => {
	//     const allMultiProjectTasks = await MultiProjectTask.findAll({ include: [{ as: 'projectTask', model: projectTask }, { as: 'user', model: User }] });

	//     if (allMultiProjectTasks !== null) {
	//         res.status(200).send({
	//             status: 200 ,
	//             "message": "Get all ProjectTasks successfully",
	//             "ProjectTask": allMultiProjectTasks
	//         })
	//     } else {
	//         res.status(200).send({
	//             status: 200 ,
	//             "message": "No ProjectTask present",

	//         })
	//     }
	// }
	// //////////////////////////////////UPDATE ASSIGNED TASK
	// static updateMultiProjectTask = async (req, res, next) => {
	//     const { userId, projectTaskId } = req.body
	//     const prjTaskId = req.query.id

	//     console.log(prjTaskId, "askjdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd")

	//     try {
	//     const result = await MultiProjectTask.findAll({ where: { id: prjTaskId } });

	//     if (result.length > 0) {
	//         if (userId != null) {
	//             const UserResult = await User.findAll({ where: { id: userId } });
	//             if (UserResult.length > 0) {
	//                 const prjTaskById = await MultiProjectTask.update({

	//                     userId: userId,

	//                 }, { where: { id: prjTaskId } })
	//             }
	//             else {

	//                 return res.status(404).send({
	//                     "status": 404,
	//                     "message": "No User Available ",
	//                 })
	//             }
	//         }
	//         if (projectTaskId != null) {
	//             const projectTaskResult = await projectTask.findAll({ where: { id: projectId } })
	//             if (projectTaskResult.length > 0) {
	//                 const prjTaskById = await MultiProjectTask.update({
	//                     projectTaskId: projectTaskId,
	//                 }, { where: { id: prjTaskId } })

	//             }
	//             else {

	//                 return res.status(404).send({
	//                     "status": 404,
	//                     "message": "No Project Task Available against Project Id",
	//                 })
	//             }
	//         }

	//         return res.status(200).send({
	//             status: 200 ,
	//             "message": " ProjectTask updated successfully",
	//             "ProjectTask": MultiProjectTask

	//         })

	//     } else {
	//         return res.status(200).send({
	//             "status": 404,
	//             "message": "No ProjectTask Found against id"
	//         })
	//     }

	//         } catch (error) {
	//             return next(error)
	//         }
	// }
	// /////Delete Multi ProjectTask

	// static deleteMultiProjectTask = async (req, res) => {
	//     const { id } = req.query
	//     console.log("ssssssssssss", req.query)
	//     if (id) {
	//         try {

	//         const result = await MultiProjectTask.findAll({ where: { id: id } })

	//         if (result.length > 0) {
	//             MultiProjectTask.destroy({
	//                 where: {
	//                     id: id
	//                 }
	//             })

	//             res.status(200).send({
	//                 "status": 200,
	//                 "message": "ProjectTask Deleted successfully"
	//             })
	//         } else {
	//             res.status(404).send({
	//                 "status": 404,
	//                 "message": "ProjectTask not found"
	//             })
	//         }

	//         } catch (error) {
	//             console.log(error);
	//             res.status(400).send({
	//                 status: 400 ,
	//                 "message": "Unable to Deleted MultiProjectTask",
	//             })
	//         }
	//     } else {
	//         res.status(400).send({
	//             status: 400 ,
	//             "message": "ID IS REQUIRED"
	//         })
	//     }
	// }
}
module.exports = MultiProjectTaskController;
