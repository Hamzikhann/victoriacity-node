// import Customer from "../../models/Customer.js";
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// dotenv.config()

const Customer = require('../../models/Customer.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Designation = require('../../models/Designation.js');
const Project = require('../../models/project.js');
const CustomerProject = require('../../models/CustomerProject.js')
dotenv.config();




class CustomerController {
    static addCustomer = async (req, res, next) => {
        const { fullName, gender, fatherName, dob, cnic, contact, email, address, customerId, designation, companyName, emergencyContactNumber, emergencyContactAddress, projectId } = req.body

        let image = ''
        if (req.file) {
            image = req.file.filename
            image = 'uploads/' + image;
        }

        if (
            fullName && fatherName && dob && cnic && email && designation && companyName && gender) {
            const Designations = await Designation.findAll({ where: { id: designation } })
            const CustomerValidation = await Customer.findAll({where : {email:email}})
            if(CustomerValidation.length <=0){
            if (Designations.length > 0) { 
            try {
                const createCustomer = new Customer({
                    fullName: fullName,
                    fatherName: fatherName,
                    companyName: companyName,
                    customerId: customerId,
                    dob: dob,
                    cnic: cnic,
                    contact: contact,
                    email: email,
                    gender: gender,
                    address: address,
                    designation: designation,
                    emergencyContactNumber: emergencyContactNumber,
                    emergencyContactAddress: emergencyContactAddress,
                    // projectId: projectId,
                    image: image,
                });

                const result = await createCustomer.save();

                res.status(200).send({
                    status: 200,
                    message: "Add Customer successfully",
                    Customer: createCustomer,
                });
            } catch (error) {
                console.log(error);
                res.status(400).send({
                    status: 400 ,
                    message: "Unable to Add Customer",
                });
            }
        }else {
            res.status(400).send({
                status: 400 ,
                message: "NO Designation Found ",
            });
        }
    }else {
       return  res.status(400).send({
            status: 400 ,
            message: "Customer Alreadt Exist With Same Email",
        });   
    }

        } else {
          return  res.status(400).send({
                status: 400 ,
                message: "All fields are required",
            });
        }
    }

    // Search Customer by Id
    static getCustomerById = async (req, res, next) => {
        // const custId = req.body.id
        const custId = req.query.id
        console.log(req.query)
        let projects = []
        try {
            const custById = await Customer.findAll({ include: [{ as: 'designationDetail', model: Designation }], where: { id: custId } })
            if (custById[0]) {
                console.log("custid", custById[0].id)
                projects = await Project.findAll({ where: { customerId: custById[0].id } })
            }
            if (custById.length >= 1) {
                res.status(200).send({
                    "status": 200,
                    "message": "get Customer successfully",
                    "customers": { ...custById, projects }

                })
            } else {
                res.status(400).send({
                    "status": 400,
                    "message": "No CustomerFound against id"
                })
            }
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE Customer
    static getAllCustomer = async (req, res) => {
        const allCustomer = await Customer.findAll({order: [["createdAt", "DESC"]], include: [{ as: 'designationDetail', model: Designation }]});

        if (allCustomer !== null) {
            res.status(200).send({
                status: 200 ,
                "message": "Get all Customer successfully",

                "customers": allCustomer

            })
        } else {
            res.status(200).send({
                status: 200 ,
                "message": "No Customer present",

            })
        }
    }
    // Delete Customer

    static deleteCustomer = async (req, res) => {
        const custId = req.query.id
        console.log(req.body, "asdasdasdgfffffffffffffffffffff")
        if (custId) {
            try {
                const custById = await Customer.findAll({ where: { id: custId } })

                if (custById.length > 0) {
                    Customer.destroy({
                        where: {
                            id: custId
                        }
                    })
                    res.status(200).send({
                        "status": 200,
                        "message": "Customer Deleted successfully"
                    })
                } else {
                    res.status(400).send({
                        status: 200 ,
                        "message": "Customer not found"
                    })
                }



            } catch (error) {
                console.log(error);
                res.status(400).send({
                    status: 400 ,
                    "message": "Unable to Deleted Customer",
                })
            }
        } else {
            res.status(400).send({
                status: 400 ,
                "message": "ID IS REQUIRED"
            })
        }
    }
    // Update Customer

    static updateCustomer = async (req, res, next) => {
        const { fullName, fatherName, dob, cnic, contact, gender, email, maritalStatus, address, customerId, designation, department, branch, dateOfJoining, basicSalary, emergencyContactName, relationship, emergencyContactNumber, emergencyContactAddress, status, projectId } = req.body
        let image = ''
        if (req.file) {
            image = req.file.filename
            image = 'uploads/' + image;
        }
        const custId = req.query.id
        try {
            const result = await Customer.findAll({ where: { id: custId } })



            if (result.length > 0) {

                const custById = await Customer.update({
                    fullName: fullName,
                    fatherName: fatherName,
                    dob: dob,
                    cnic: cnic,
                    contact: contact,
                    email: email,
                    gender: gender,
                    address: address,
                    customerId: customerId,
                    designation: designation,
                    emergencyContactNumber: emergencyContactNumber,
                    emergencyContactAddress: emergencyContactAddress,
                    image: image,

                }, { where: { id: custId } })

                res.status(200).send({
                    "status": 200,
                    "message": " Customer updated successfully",
                    "Customer": result
                })
            } else {
                res.status(200).send({
                    status: 200 ,
                    "message": "No Customer Found against id"
                })
            }

        } catch (error) {
            res.status(400).send({
                "status":  400,
                "message": "unable to update"
            })
        }
    }

    static getCustomerProject = async (req, res, next) => {
        // const custId = req.body.id
        const custId = req.query.id
        console.log(req.query)
        let projects = []
        try {
            const custById = await CustomerProject.findAll({ include: [{ as: 'project', model: Project },{ as: 'customer', model: Customer }], where: { id: custId } })
            
            if (custById.length >= 1) {
                res.status(200).send({
                    "status": 200,
                    "message": "get CustomerProject successfully",
                    "customersProject":custById

                })
            } else {
                res.status(400).send({
                    "status": 400,
                    "message": "No CustomerFound against id"
                })
            }
        } catch (error) {
            return next(error)
        }
    }

}

// export default CustomerController
module.exports = CustomerController
