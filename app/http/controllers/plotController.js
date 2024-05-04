// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import Plot from "../../models/Plot.js";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Plot = require('../../models/Plot.js');


dotenv.config()

class plotController {

    static addplot = async (req, res, next) => {
        
        const {name,status,fileId} = req.body
        console.log({ name,status,fileId});
        if (name && status && fileId) {
            try {
                const createPlot = new Plot({
                  name:name,
                  status:status,
                  fileId:fileId

                })

                await createPlot.save();

                res.status(200).send({
                    "status": 200,
                    "message": "Add Plot successfully",
                    "plot":createPlot,
                });

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Add Plot",
                })
            }
            
        } else {
            res.status(400).send({
                "status": 400,
                "message": "All fields are required"
            })
        }
    }
    // SEARCH Plot BY ID
    static getPlotById = async (req, res, next) => {
        const plotId = req.query.id
        console.log(req.query)
        console.log(req.params)
        try {
            const plotById = await Plot.findAll({ where: { id: plotId } })
            if (plotById.length>0) {
                res.status(200).send({
                    status: 200 ,
                    "message": "get plot successfully",
                    "plot": plotById
                })
            } else {
                res.status(400).send({
                    "status": 404,
                    "message": "No plot Found against id"
                })
            }
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE Plots
    static getAllPlot = async (req, res) => {
        const allPlot = await Plot.findAll({
          order: [["createdAt", "DESC"]],
        });
        console.log(allPlot);
        if (allPlot !== null) {
            res.status(200).send({
                status: 200 ,
                "message": "Get all Plot Successfully",
                "Plots": allPlot
            })
        } else {
            res.status(200).send({
                status: 200 ,
                "message": "No plot present",

            })
        }
    }
    ///UPDATE Plot
    static updatePlot = async (req, res, next) => {
        const { name,status,fileId} = req.body
        const plotId = req.body.id
        try {
            const result = await Plot.findAll({ where: { id: plotId } })



            if (result) {

                const plotById = await Plot.update({
                    name:name,
                  status:status,
                  plotId:result

                    
                }, { where: { id: plotId } })

                res.status(200).send({
                    status: 200 ,
                    "message": " Plot  updated successfully",
                    "Updated Plot": result
                })
            } else {
                res.status(200).send({
                    status: 200 ,
                    "message": "No plot Found against id"
                })
            }

        } catch (error) {
            return next(error)
        }
    }
    /////Delete PlotIssue 

    static deletePlot = async (req, res) => {
        const { id } = req.query;

        if (id) {
            try {

                const result = await Plot.findAll({ where: { id: id } })



                if (result.length>0) {
                    Plot.destroy({
                        where: {
                            id: id
                        }
                    })

                    res.status(200).send({
                        "status": 200,
                        "message": "Plot Deleted successfully",
                        "Deleted Plot":result
                    })
                } else {
                    res.status(400).send({
                        "status": 404,
                        "message": "Plot not found"
                    })
                }

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Deleted PlotIssue",
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

// export default plotController;   
module.exports = plotController
