
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Settings = require('../../models/Settings.js');
const incomeCategory = require('../../models/IncomeCategories.js');
const { response } = require('express');
const expensecategory = require('../../models/ExpenseCategories.js');
dotenv.config();
class SettingsController {
    static addSettings = async (req, res, next) =>{
        const { expenseCategoryId, incomeCategoryId } = req.body;
        
        try {
          let setting = await Settings.findOne();
          if (!setting) {
            setting = await Settings.create({
              expenseCategoryId,
              incomeCategoryId,
            });
          } else {
            if (expenseCategoryId) {
              // const result = await expensecategory.findAll({where : {id:expenseCategoryId}})
              // if (result.length<1){
              //   return res.send(400).json({Message:"Expense Category Not Available "})
              // }
              setting.expenseCategoryId = expenseCategoryId;
            }
            if (incomeCategoryId) {
              // const results = await incomeCategory.findAll({where : {id:incomeCategoryId}})
              // if (results.length<1){
              //   return res.send(400).json({Message:"income Category Not Available "})
              // }
              setting.incomeCategoryId = incomeCategoryId;
            }
            await setting.save();
          }
      
          res.status(200).json({ status:200,message: 'Settings updated successfully',Settings:Settings  });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ error: 'An error occurred' });
        }
      
    }
       // //SEARCH Settings BY ID
    // static getSettingsById = async (req, res, next) => {
    //     const settingId = req.query.id
    //     console.log(req.query)
    //     try {
    //         const settingById = await Settings.findAll({ include:[{as:'Category',model:accountcategory}],where: { id: settingId } })
    //         if (settingById.length>0) {
    //             res.status(200).send({
    //                 status: 200 ,
    //                 "message": "get Settings successfully",
    //                 "Settings":settingById
    //             })
    //          }else{
    //             res.status(400).send({
    //                 "status": 404,
    //                 "message": "No Settings Found against id"
    //             })
    //          }
    //     } catch (error) {
    //         return next(error)
    //     }
    // }
    // GET ALL AVAILABLE PROJECTS
    static getAllSettings = async (req, res) => {
        try {
            const allSettings = await Settings.findAll({ include: [
                { as: 'incomeCategory', model: incomeCategory, foreignKey: 'incomeCategoryId' },
                { as: 'expenseCategory', model: expensecategory, foreignKey: 'expenseCategoryId' }
            ]});
        if (allSettings.length > 0) {
           return res.status(200).json({
                status: 200 ,
                "message": "Get all Settings successfully",
                "Settings": allSettings
            })
        } else {
           return res.status(404).json({
                "status": 404,
                "message": "No Settings present",
                
            })
        }
    } catch (error) {
        return res.status(500).json({Message:"Error Occured", error:error})
    }
    }

    //
//     static getIncomeCategories = async (req, res) => {
//         try {
//             const allSettings = await Settings.findAll({order: [["createdAt", "DESC"]] ,include:[{as: 'Category',model:accountcategory}],where:{type:"incomeCategory"}});
//         if (allSettings.length > 0) {
//            return res.status(200).json({
//                 status: 200 ,
//                 "message": "Get all Settings successfully",
//                 "Settings": allSettings
//             })
//         } else {
//            return res.status(404).json({
//                 "status": 404,
//                 "message": "No Settings present",
                
//             })
//         }
//     } catch (error) {

//         return next(error)
//     }
//     }
//     static getExpenseCategories = async (req, res) => {
//         try {
//             const allSettings = await Settings.findAll({order: [["createdAt", "DESC"]] ,include:[{as: 'Category',model:accountcategory}],where:{type:"expenseSalaryCategory"}});
//         if (allSettings.length > 0) {
//            return res.status(200).json({
//                 status: 200 ,
//                 "message": "Get all Settings successfully",
//                 "Settings": allSettings
//             })
//         } else {
//            return res.status(404).json({
//                 "status": 404,
//                 "message": "No Settings present",
                
//             })
//         }
//     } catch (error) {

//         return next(error)
//     }
//     }


// ///UPDATE PROJECT
// static updateSettings = async (req, res, next) => {
//     const {type,categoryId  } = req.body
//     const settingId = req.query.id
//     try {
//         const result = await Settings.findAll({ where: { id: settingId } })

        
        
//         if (result) {

//             const settingById = await Settings.update({
//                 type: type,
//                 categoryId:categoryId
                 
//             },{ where: { id: settingId } })

//             res.status(200).send({
//                 status: 200 ,
//                 "message": " Settings updated successfully",
//                 "Settings":settingById
//             })
//          }else{
//             res.status(200).send({
//                 status: 200 ,
//                 "message": "No Settings Found against id"
//             })
//          }

//     } catch (error) {
//         return next(error)
//     }
// }
// /////Delete Settings 

// static deleteSettings = async (req, res) =>{
//     const settingId = req.query.id
//     if (settingId) {
//         try {

//             const result = await Settings.findAll({ where: { id: settingId } })

        
        
//             if (result.length > 0) {
//                 Settings.destroy({
//                     where:{
//                         id :  settingId
//                     }
//                 })
                
//                 res.status(200).send({
//                     status: 200 ,
//                     "message": "Settings Deleted successfully",
//                     "Deleted Settings":result
//                 })
//             }else{
//                 res.status(400).send({
//                     "status": 404,
//                     "message": "Settings not found"
//                 })
//             }


            
//         } catch (error) {
//             console.log(error);
//             res.status(400).send({
//                 status: 400 ,
//                 "message": "Unable to Deleted Settings",
//             })
//         }
//     }else{
//         res.status(400).send({
//             status: 400 ,
//             "message": "ID IS REQUIRED"
//         })
//     }
// }


}

// export default SettingsController;
module.exports = SettingsController
   