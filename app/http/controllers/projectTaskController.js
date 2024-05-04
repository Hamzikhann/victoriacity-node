// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import ProjectTask from "../../models/ProjectTask.js";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const ProjectTask = require('../../models/ProjectTask.js');
const Project = require('../../models/project.js');
const User = require('../../models/User.js');
const Employee = require('../../models/Employee.js');
dotenv.config()

class ProjectTaskController {
    static addProjectTask = async (req, res, next) => {
        const { name, description, status, dueDate, assignedTo, projectId } = req.body
        console.log({ name, description, status, dueDate, assignedTo, projectId });


    
        if (name && description && dueDate && assignedTo && projectId) {
            const projectResult = await Project.findAll({ where: { id: projectId } });
            const UserResult = await Employee.findAll({ where: { id: assignedTo } });
            try {
            if (projectResult.length > 0) {
                if (UserResult.length > 0) {

                   
                    const createProjectTask = new ProjectTask({
                        projectId: projectId,
                        name: name,
                        description: description,
                        status: 'Pending',
                        assignedTo: assignedTo,
                        dueDate: dueDate,
                    })

                    await createProjectTask.save();

                    res.status(200).send({
                        "status": 200,
                        "message": "Add ProjectTask successfully",
                        "ProjectTask": createProjectTask
                    });             

                }
                else {

                    res.status(404).send({
                        "status": 404,
                        "message": "No Employee Available ",
                    })
                }
            }
            else {
                res.status(404).send({
                    "status": 404,
                    "message": "NO PROJECT Available Against Project ID",
                })
            }
        } catch (error) {
            console.log(error);
            res.status(400).send({
                "status": 400,
                "message": "Unable to Add ProjectTask",
                error:error
            })
        }
        } 
        else {
            res.status(400).send({
                "status": 400,
                "message": "All fields are required"
            })
        }
    }
    // SEARCH ProjectTask BY ID
    static getProjectTaskById = async (req, res, next) => {
        const prjTaskId = req.query.id
        console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', req.query)
        try {
        const prjTaskById = await ProjectTask.findAll({ include: [{ as: 'project', model: Project }, { as: 'employee', model: Employee }], where: { id: prjTaskId } })
        if (prjTaskById.length > 0) {
            res.status(200).send({
                status: 200 ,
                "message": "get ProjectTask successfully",
                "ProjectTask": prjTaskById
            })
        } else {
            res.status(200).send({
                status: 200 ,
                "message": "No ProjectTask Found against id"
            })
        }
        } catch (error) {
            return next(error)
        }
    }
    

    ///
    static getProjectTaskByProjectId = async (req, res, next) => {
        const prjId = req.query.id
        console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', req.query)
        try {
        const prjTask= await ProjectTask.findAll({ include: [{ as: 'project', model: Project }, { as: 'employee', model: Employee }], where: { projectId: prjId } })
        if (prjTask.length > 0) {
            res.status(200).send({
                status: 200 ,
                "message": "get ProjectTask successfully by project id",
                "ProjectTask": prjTask
            })
        } else {
            res.status(200).send({
                status: 200 ,
                "message": "No ProjectTask Found against id"
            })
        }
        } catch (error) {
            return next(error)
        }
    }
    
    // GET ALL AVAILABLE ProjectTaskS
    static getAllProjectTasks = async (req, res) => {

        try{
        const allProjectTasks = await ProjectTask.findAll(
          {
            order: [["createdAt", "DESC"]],
            include: [
              { as: "project", model: Project },
              { as: "employee", model: Employee },
            ],
          }
        );

        if (allProjectTasks !== null) {
            res.status(200).send({
                status: 200 ,
                "message": "Get all ProjectTasks successfully",
                "ProjectTask": allProjectTasks
            })
        } else {
            res.status(200).send({
                status: 200 ,
                "message": "No ProjectTask present",

            })
        }
    }catch (error) {
        return next(error)
    }
    }
    ///UPDATE ProjectTask
    static updateProjectTask = async (req, res, next) => {
        const { name, description, status, dueDate, assignedTo, projectId } = req.body
        const prjTaskId = req.query.id

        console.log(prjTaskId, "askjdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd")


        try {
        const result = await ProjectTask.findAll({ where: { id: prjTaskId } });



        if (result.length > 0) {
            if (assignedTo != null) {
                const UserResult = await User.findAll({ where: { id: assignedTo } });
                if (UserResult.length > 0) {
                    const prjTaskById = await ProjectTask.update({

                        assignedTo: assignedTo,

                    }, { where: { id: prjTaskId } })
                }
                else {

                    return res.status(404).send({
                        "status": 404,
                        "message": "No User Available ",
                    })
                }
            }
            if (projectId != null) {
                const projectResult = await Project.findAll({ where: { id: projectId } })
                if (projectResult.length > 0) {
                    const prjTaskById = await ProjectTask.update({
                        projectId: projectId,
                    }, { where: { id: prjTaskId } })

                }
                else {

                    return res.status(404).send({
                        "status": 404,
                        "message": "No Project  Available against Project Id",
                    })
                }
            }
            const prjTaskById = await ProjectTask.update({
                name: name,
                description: description,
                status: 'Pending',
                dueDate: dueDate,
            }, { where: { id: prjTaskId } })
            return res.status(200).send({
                status: 200 ,
                "message": " ProjectTask updated successfully",
                "ProjectTask": ProjectTask

            })


        } else {
            return res.status(200).send({
                "status": 404,
                "message": "No ProjectTask Found against id"
            })
        }

            } catch (error) {
                return next(error)
            }
    }
    /////Delete ProjectTask 

    static deleteProjectTask = async (req, res) => {
        const { id } = req.query
        console.log("ssssssssssss", req.query)
        if (id) {
            try {

            const result = await ProjectTask.findAll({ where: { id: id } })



            if (result.length > 0) {
                ProjectTask.destroy({
                    where: {
                        id: id
                    }
                })

                res.status(200).send({
                    "status": 200,
                    "message": "ProjectTask Deleted successfully"
                })
            } else {
                res.status(404).send({
                    "status": 404,
                    "message": "ProjectTask not found"
                })
            }



            } catch (error) {
                console.log(error);
                res.status(400).send({
                    status: 400 ,
                    "message": "Unable to Deleted ProjectTask",
                })
            }
        } else {
            res.status(400).send({
                status: 400 ,
                "message": "ID IS REQUIRED"
            })
        }
    }

    
}

// export default ProjectTaskController;   
module.exports = ProjectTaskController
