// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import EmployeeAsset from "../../models/EmployeeAsset.js";
// import Assets from '../../models/Asset.js';
// dotenv.config()


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const EmployeeAsset = require('../../models/EmployeeAsset.js');
const Assets = require('../../models/Asset.js');
const Employee = require('../../models/Employee.js');
dotenv.config();

class EmployeeAssetController {
    static addEmployeeAsset = async (req, res, next) => {
        const { employeeId, assetId } = req.body
        console.log({ employeeId, assetId });
        if (employeeId && assetId) {
            const Employees = await Employee.findAll({where : {id : employeeId }})
            let result = await Assets.findAll({ where: { id: assetId } })
            if(Employees.length>0){
              if(result.length>0){
            try {
                const createAsset = new EmployeeAsset({
                    employeeId: employeeId,
                    assetId: assetId
                })

                
                result = JSON.stringify(result);
                result = JSON.parse(result);
                if (result.length > 0) {

                    if (result[0].quantity != 0) {
                        let newQuantity = result[0].quantity - 1;
                        await Assets.update({
                            quantity: newQuantity
                        }, { where: { id: assetId } })



                        await createAsset.save();

                        res.status(200).send({
                            "status": 200,
                            "message": "Add EmployeeAsset successfully",
                            "Assets": createAsset
                        });
                    }
                    else {
                        res.status(400).send({
                            "status": 400,
                            "message": "Asset Have 0 Quantity"
                        })
                    }
                }

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Add Asset",
                    error: error
                })
            }}
            else {
                res.status(400).send({
                    "status": 400,
                    "message": "No Asset Found",
                })
            }
        }  else {
            res.status(400).send({
                "status": 400,
                "message": "No Employee Found",
            })
        }
        } else {
            res.status(400).send({
                "status": 400,
                "message": "All fields are required"
            })
        }
    }

    static deleteEmployeeAsset = async (req, res) => {
        const { id } = req.query;
        try {
            const exist = await EmployeeAsset.findOne({ where: { employeeId : id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }

            const result = await EmployeeAsset.destroy({ where: { employeeId : id }, returning: true });
            res.status(200).json({
                "status": 200,
                "message": "Employee Asset Deleted successfully",
                "Employee Asset Deleted": result
            })
        } catch (error) {
            return next(error)
        }

    }

}


// export default EmployeeAssetController
module.exports = EmployeeAssetController
