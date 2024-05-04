// import Designation from "../../models/Designation.js";
const Designation = require('../../models/Designation.js');
const CustomErrorHandler = require('../../services/CustomErrorHandler.js');
class DesignationController {
    static addDesignation = async (req, res, next) => {
        const { title, status } = req.body

        if (!title) {
            return next(
                CustomErrorHandler.wrongCredentials("All fields are required!")
            );
        }
        try {
            const [row, created] = await Designation.findOrCreate({
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
                "message": "Add Designation successfully",
                "Designation": row
            });

        } catch (error) {
            return next(error)
        }
    }

    static getAllDesignations = async (req, res) => {
        const allDesignations = await Designation.findAll({
            order: [["createdAt", "DESC"]],
        });

        if (allDesignations !== null) {
            res.status(200).send({
                "status": 200,
                "message": "Get all Designations successfully",
                "designations": allDesignations
            })
        } else {
            res.status(400).send({
                "status": 400,
                "message": "No Designation present",
                "designations": []
            })
        }
    }

    static getAllActiveDesignations = async (req, res) => {

        const allDesignations = await Designation.findAll({ where: { status:true } });

        if (allDesignations !== null) {
            res.status(200).send({
                "status": 200,
                "message": "Designations listed successfully",
                "designations": allDesignations
            })
        } else {
            res.status(400).send({
                "status": 400,
                "message": "No Designation present",
                "designations": []
            })
        }
    }

    ///////////
    static updateDesignation = async (req, res, next) => {
        const { title, status } = req.body
        const designationId = req.query.id
        try {
            const result = await Designation.findAll({ where: { id: designationId } })
            if (result) {

                const DesignationById = await Designation.update({
                    title: title,
                    status: status,


                }, { where: { id: designationId } })

                res.status(200).send({
                    "status": 200,
                    "message": " Designation  updated successfully",
                    "Updated Designation": result
                })
            } else {
                res.status(200).send({
                    "status": 200,
                    "message": "No Designation Found against id"
                })
            }

        } catch (error) {
            return next(error)
        }
    }
    ////////////
    static deleteDesignation = async (req, res) => {
        const { id } = req.query;

        if (id) {
            try {

                const result = await Designation.findAll({ where: { id: id } })
                if (result.length > 0) {
                    Designation.destroy({
                        where: {
                            id: id
                        }
                    })
                    res.status(200).send({
                        "status": 200,
                        "message": "Designation Deleted successfully",
                        "Deleted Designation": result
                    })
                } else {
                    res.status(400).send({
                        "status": 400,
                        "message": "Designation not found"
                    })
                }

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Deleted Designation",
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

// export default DesignationController
module.exports = DesignationController
