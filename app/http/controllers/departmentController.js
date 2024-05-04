// import Job from "../../models/Job.js";
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import User from "../../models/User.js";
// import Department from "../../models/Department.js";
// dotenv.config()


const Job = require("../../models/Job.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require("../../models/User.js");
const Department = require("../../models/Department.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
dotenv.config();

class DepartmentController {
    static addDeparment = async (req, res, next) => {
        const { title, status } = req.body
        console.log({ title, status });
        if (!title) {
            return next(
                CustomErrorHandler.wrongCredentials("All fields are required!")
            );
        }
        try {

            const [row, created] = await Department.findOrCreate({
                where: { title: title },
                defaults: {
                    status: status,
                },
            });

            if (!created) {
                return next(CustomErrorHandler.alreadyExist());
            }

            res.status(200).json({
                "status": 200,
                "message": "Add Department successfully",
                "data": row
            });

        } catch (error) {
            return next(error)
        }
    }

    static getAllDepartments = async (req, res) => {
        const allDepartments = await Department.findAll({
            order: [["createdAt", "DESC"]],
        });
        try{
        if (allDepartments !== null) {
            res.status(200).send({
                "status": 200,
                "message": "Get all Departments successfully",
                "departments": allDepartments
            })
        } else {
            res.status(200).send({
                "status": 200,
                "message": "No Department present",
                "jobs": []
            })
        }
    } catch (error) {
        return next(error)
    }
    }

    static getAllActiveDepartments = async (req, res) => {

        const allDepartments = await Department.findAll({ where: { status: 'active' } });
      try{
        if (allDepartments !== null) {
            res.status(200).send({
                "status": 200,
                "message": "Departments listed successfully",
                "departments": allDepartments
            })
        } else {
            res.status(200).send({
                "status": 200,
                "message": "No Department present",
                "jobs": []
            })
        }
    } catch (error) {
        return next(error)
    }
    }
    static getDepartmentById = async (req, res, next) => {
        const depId = req.body.id
        console.log(req.body)
        console.log(req.params)
        try {
            const depById = await Department.findAll({ where: { id: depId } })
            if (depById) {
                res.status(200).send({
                    "status": 200,
                    "message": "get department successfully",
                    "departments": depById
                })
            }
        } catch (error) {
            return next(error)
        }
    }

    static updateDepartment = async (req, res, next) => {
        const { title, status } = req.body
        const departmentId = req.query.id
        try {
            const result = await Department.findAll({ where: { id: departmentId } })
            if (result) {

                const DepartmentById = await Department.update({
                    title: title,
                    status: status,


                }, { where: { id: departmentId } })

                res.status(200).send({
                    "status": 200,
                    "message": " Department  updated successfully",
                    "Updated Department": result
                })
            } else {
                res.status(200).send({
                    "status": 200,
                    "message": "No Department Found against id"
                })
            }

        } catch (error) {
            return next(error)
        }
    }
    ////////////
    static deleteDepartment = async (req, res) => {
        const { id } = req.query;

        if (id) {
            try {

                const result = await Department.findAll({ where: { id: id } })
                if (result.length > 0) {
                    Department.destroy({
                        where: {
                            id: id
                        }
                    })
                    res.status(200).send({
                        "status": 200,
                        "message": "Department Deleted successfully",
                        "Deleted Department": result
                    })
                } else {
                    res.status(400).send({
                        "status": 404,
                        "message": "Department not found"
                    })
                }

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Deleted Department",
                })
            }
        } else {
            res.status(400).send({
                status: 400 ,
                "message": "ID IS REQUIRED"
            })
        }
    }
    //////////

}

// export default DepartmentController
module.exports = DepartmentController
