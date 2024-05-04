// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import Project from "../../models/project.js";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Project = require('../../models/project.js');
const incomecategory = require('../../models/IncomeCategories.js');
const CustomErrorHandler = require("../../services/CustomErrorHandler");
dotenv.config()

class projectController {
    static addproject = async (req, res, next) => {
        const { name, description, customerId, status, startDate, endDate, priority } = req.body
        console.log({ name, description, status, startDate, endDate, priority });
        let image = ''
        if (req.file) {
          image = req.file.filename;
          image = 'uploads/' + image;
        }
        console.log(
          "uuuuuuuuu",
          name,
          description,
          status,
          startDate,
          endDate,
          priority,
          image
        );
        if (
          name &&
          description &&
          status &&
          startDate &&
          endDate &&
          priority
        ) {
          console.log("cccccc", {
            name: name,description: description,
            status: status,
            startDate: startDate,
            endDate: endDate,
            priority: priority,
            customerId: customerId, image: image,
            // CustomerId: CustomerId
          });
          try {
            const createProject = new Project({
              name: name,
              description: description,
              status: status,
              startDate: startDate,
              endDate: endDate,
              priority: priority,
              customerId: customerId,
              image: image,
              // CustomerId: CustomerId
            });

            await createProject.save();

            res.status(200).send({
              status: 200,
              message: "Add Project successfully",
              project: createProject,
            });
          } catch (error) {
            console.log("qqqqqqqqqqqqqqqqqqqq", error);
            res.status(400).send({
              status: 400,
              message: "Unable to Add project",
            });
          }
        } else {
          res.status(400).send({
            status: 400,
            message: "All fields are required",
          });
        }
    }
    // SEARCH PROJECT BY ID
    static getProjectById = async (req, res, next) => {
        const prjId = req.query.id
        console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', req.query)
        try {
            const prjById = await Project.findAll({where: { id: prjId } })
            if (prjById.length > 0) {
                res.status(200).send({
                    status: 200 ,
                    "message": "get project successfully",
                    "project": prjById
                })
            } else {
                res.status(200).send({
                    status: 200 ,
                    "message": "No project Found against id"
                })
            }
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE PROJECTS
    static getAllProjects = async (req, res) => {
        const allProjects = await Project.findAll({ 
            order: [["createdAt", "DESC"]],
          });

        if (allProjects !== null) {
            res.status(200).send({
                status: 200 ,
                "message": "Get all Projects successfully",
                "project": allProjects
            })
        } else {
            res.status(200).send({
                status: 200 ,
                "message": "No project present",

            })
        }
    }
    ///UPDATE PROJECT
    static updateProject= async (req, res, next) => {
        const { name, description, customerId, status, startDate, endDate, priority } = req.body
        let image = ''
        if (req.file) {
          image = req.file.filename;
          image = 'uploads/' + image;
        }
        console.log(image,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        const prjId = req.query.id;
    
        try {
          const result = await Project.findAll({ where: { id: prjId } });
    
          if (result.length > 0) {
            const prjById = await Project.update(
              {
                name: name,
              description: description,
              status: status,
              startDate: startDate,
              endDate: endDate,
              priority: priority,
              customerId: customerId,
              image: image,
              },
              { where: { id: prjId } }
            );
            res.status(200).send({
              status: 200,
              message: " Project updated successfully",
              Project: prjById,
            });
          } else {
            res.status(200).send({
              status: 200,
              message: "No Project Found against id",
            });
          }
        } catch (error) {
          return next(error);
        }
      };
    
    /////Delete Project 

    static deleteProject = async (req, res) => {
        const { id } = req.query
        console.log("ssssssssssss", req.query)
        if (id) {
            try {

                const result = await Project.findAll({ where: { id: id } })



                if (result) {
                    Project.destroy({
                        where: {
                            id: id
                        }
                    })

                    res.status(200).send({
                        "status": 200,
                        "message": "Project Deleted successfully"
                    })
                } else {
                    res.status(40).send({
                        status: 200 ,
                        "message": "Project not found"
                    })
                }

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    status: 400 ,
                    "message": "Unable to Deleted Project",
                })
            }
        } else {
            res.status(400).send({
                status: 400 ,
                "message": "ID IS REQUIRED"
            })
        }
    }

    static projectIncome  = async (req , res) => {
      const projectId = req.query.id;
      try {
          const project = await incomecategory.findAll( {
            where:{projectId:projectId}
          });
          if(!project){
              return CustomErrorHandler.notFound("Location not found");
          }
          res.status(200).json({status:200,Message:"Get data Successfully !",data:project});

  
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error',error:error });
      }
  }

}

// export default projectController;   
module.exports = projectController
