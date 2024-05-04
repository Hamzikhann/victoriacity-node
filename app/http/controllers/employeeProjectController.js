// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import EmployeeProject from "../../models/EmployeeProject.js";
// import Project from '../../models/project.js';
// import Employee from '../../models/Employee.js';
// dotenv.config()


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const EmployeeProject = require('../../models/EmployeeProject.js');
const Project = require('../../models/project.js');
const Employee = require('../../models/Employee.js');
dotenv.config();

class EmployeeProjectController {
    static addEmployeeProject = async (req, res, next) => {
        const { employeeId, projectId } = req.body
        console.log({ employeeId, projectId });
        if (employeeId && projectId) {

            try {
                const createProject = new EmployeeProject({
                    employeeId: employeeId,
                    projectId: projectId
                })

                let projectResult = await Project.findAll({ where: { id: projectId } })
                let employeeResult = await Employee.findAll({ where: { id: employeeId } })

                if(employeeResult.length > 0){
                    if(projectResult.length > 0){
                        await createProject.save();

                        res.status(200).send({
                            "status": 200,
                            "message": "Add EmployeeProject successfully",
                            "Projects": createProject
                        });
                        
                    }
                    else{
                        res.status(404).send({
                            "status": 404,
                            "message": "NO Project Found Against Id"
                        });
                    }
                }
                else{
                    res.status(404).send({
                        "status": 404,
                        "message": "NO Employee Found Against Id"
                    });
                }
                       

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Add Project",
                })
            }
        } else {
            res.status(400).send({
                "status": 400,
                "message": "All fields are required"
            })
        }
    }

}

// export default EmployeeProjectController
module.exports = EmployeeProjectController
