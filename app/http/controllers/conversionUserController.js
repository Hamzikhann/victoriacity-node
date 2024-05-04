// import ConversionUser from "../../models/CoversionUser.js";
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv';

// dotenv.config()

const ConversionUser = require('../../models/CoversionUser.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

class ConversionUserController {
    static addConversionUser = async (req, res, next) => {
        const { name,lastName,email,mobileNo,password,status } = req.body
        let image = ''
        if(req.file){
            image = req.file.filename
        }

        if (name && lastName && email && mobileNo && image && status ) {
            try {
                
                const createConversionUser = new ConversionUser({
                    name:name,
                    lastName: lastName,
                    email:email,
                    mobileNo:mobileNo,
                    password:password,
                    image:image,
                    status:status,
                })

                const result = await createConversionUser.save();

                res.status(200).send({
                    "status": 200,
                    "message": "Add ConversionUser successfully",
                    "coversionUser":result
                });

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Add ConversionUser",
                })
            }
        } else {
            res.status(400).send({
                "status": 400,
                "message": "All fields are required"
            })
        }
    }

    // Search ConversionUser by Id
    static getConversionUserById = async (req, res, next) => {
        // const userId = req.body.id
        const userId = req.query.id
        console.log(req.query)
        try {
            const userById = await ConversionUser.findAll({ where: { id: userId } })
            console.log('iiiiiiiiiiiiiii', userById);
            if (userById.length >= 1) {
                res.status(200).send({
                    "status": 200,
                    "message": "get Conversion User successfully",

                    "userConversion": userById

                })
            } else {
                res.status(400).send({
                    "status": 400,
                    "message": "No Conversion User Found against id"
                })
            }
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE ConversionUser
    static getAllConversionUser = async (req, res) => {
        const allConversionUser = await ConversionUser.findAll();

        if (allConversionUser !== null) {
            res.status(200).send({
                status: 200 ,
                "message": "Get all ConversionUser successfully",

                "userConversion": allConversionUser

            })
        } else {
            res.status(200).send({
                status: 200 ,
                "message": "No ConversionUser present",

            })
        }
    }
    // Delete ConversionUser

    static deleteConversionUser = async (req, res) => {
        const userId = req.query.id
        console.log(req.query, "asdasdasdgfffffffffffffffffffff")
        if (userId) {
            try {
                const userById = await ConversionUser.findAll({ where: { id: userId } })

                if (userById.length > 0) {
                    ConversionUser.destroy({
                        where: {
                            id: userId
                        }
                    })
                    res.status(200).send({
                        "status": 200,
                        "message": "ConversionUser Deleted successfully",
                        "USER DELETED":userById
                    })
                } else {
                    res.status(400).send({
                        "status": 404,
                        "message": "ConversionUser not found"
                    })
                }



            } catch (error) {
                console.log(error);
                res.status(400).send({
                    status: 400 ,
                    "message": "Unable to Deleted ConversionUser",
                })
            }
        } else {
            res.status(400).send({
                status: 400 ,
                "message": "ID IS REQUIRED"
            })
        }
    }
    // Update ConversionUser

    static updateConversionUser = async (req, res, next) => {
        const { name,lastName,email,mobileNo,password,image,status } = req.body
        const userId = req.query.id
        try {
            const result = await ConversionUser.findAll({ where: { id: userId } })



            if (result.length > 0) {

                const userById = await ConversionUser.update({
                    name:name,
                    lastName: lastName,
                    email:email,
                    mobileNo:mobileNo,
                    password:password,
                    image:image,
                    status:status,

                }, { where: { id: userId } })

                res.status(200).send({
                    "status": 200,
                    "message": " ConversionUser updated successfully",
                    "ConversionUser": result
                })
            } else {
                res.status(200).send({
                    status: 200 ,
                    "message": "No ConversionUser Found against id"
                })
            }

        } catch (error) {
            return next(error)
        }
    }



}

// export default ConversionUserController
module.exports = ConversionUserController
