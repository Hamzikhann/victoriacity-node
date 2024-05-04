// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import UserRole from "../../models/UserRole.js";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const UserRole = require('../../models/UserRole.js');


dotenv.config()

class userRoleController {

    static addUserRole = async (req, res, next) => {

        const { name, status } = req.body
        console.log({ name, status });
        if (name && status) {
            try {
                const createUserRole = new UserRole({
                    name: name,
                    status: status,


                })

                await createUserRole.save();

                res.status(200).send({
                    "status": 200,
                    "message": "Add Role successfully",
                    "userRole": createUserRole,
                });

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Add Role",
                })
            }
        } else {
            res.status(400).send({
                "status": 400,
                "message": "All fields are required"
            })
        }
    }
    // SEARCH Role BY ID
    static getUserRoleById = async (req, res, next) => {
        const userRoleId = req.query.id
        console.log(req.query)
        console.log(req.params)
        try {
            const userRoleById = await UserRole.findAll({ where: { id: userRoleId } })
            if (userRoleById.length > 0) {
                res.status(200).send({
                    status: 200 ,
                    "message": "get userRole successfully",
                    "userRole": userRoleById
                })
            } else {
                res.status(400).send({
                    "status": 404,
                    "message": "No userRole Found against id"
                })
            }
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE UserRoles
    static getAllUserRole = async (req, res) => {
        const allUserRole = await UserRole.findAll({
          order: [["createdAt", "DESC"]],
        });

        if (allUserRole !== null) {
            res.status(200).send({
                status: 200 ,
                "message": "Get all UserRole Successfully",
                "UserRoles": allUserRole
            })
        } else {
            res.status(200).send({
                status: 200 ,
                "message": "No userRole present",

            })
        }
    }
    ///UPDATE UserRole
    static updateUserRole = async (req, res, next) => {
        const { name, status } = req.body
        const userRoleId = req.query.id
        try {
            const result = await UserRole.findAll({ where: { id: userRoleId } })



            if (result) {

                const userRoleById = await UserRole.update({
                    name: name,
                    status: status,



                }, { where: { id: userRoleId } })

                res.status(200).send({
                    status: 200 ,
                    "message": " UserRole  updated successfully",
                    "Updated UserRole": result
                })
            } else {
                res.status(200).send({
                    status: 200 ,
                    "message": "No userRole Found against id"
                })
            }

        } catch (error) {
            return next(error)
        }
    }
    /////Delete UserRole 

    static deleteUserRole = async (req, res) => {
        const { id } = req.query;

        if (id) {
            try {

                const result = await UserRole.findAll({ where: { id: id } })



                if (result.length > 0) {
                    UserRole.destroy({
                        where: {
                            id: id
                        }
                    })

                    res.status(200).send({
                        "status": 200,
                        "message": "UserRole Deleted successfully",
                        "Deleted UserRole": result
                    })
                } else {
                    res.status(400).send({
                        "status": 404,
                        "message": "UserRole not found"
                    })
                }

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Deleted UserRole",
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

// export default userRoleController;   
module.exports = userRoleController
