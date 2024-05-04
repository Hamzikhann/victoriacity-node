// const EmployeeSalaryHistory = require("../../models/EmployeeSalaryHistory");
// const CustomErrorHandler = require("../../services/CustomErrorHandler");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// const Employee = require("../../models/Employee.js");
// const { request } = require("express");
// const DispatchedSalaries= require("../../models/DispatchedSalaries")
// const { Sequelize, Op, QueryTypes } = require('sequelize');
// const sequelize = require('../../../config/connectdb')
// dotenv.config();


// class DispatchedSalariesController {


//     static dispatchSalariesBulk = async (req, res) => {
//         try {
//           // Get the latest salaries for each employee
//           const latestSalaries = await sequelize.query(`SELECT histories.*
//           FROM employeesalaryhistories AS histories
//           JOIN (
//             SELECT employeeId, MAX(updatedAt) AS maxDate
//             FROM employeesalaryhistories
//             GROUP BY employeeId
//           ) sub ON histories.employeeId = sub.employeeId AND histories.updatedAt = sub.maxDate GROUP BY employeeId`, { type: QueryTypes.SELECT });
    
//           // Create a map of latest salaries for easy access by employeeId
//           const latestSalaryMap = latestSalaries.reduce((acc, salary) => {
//             acc[salary.employeeId] = salary.salary;
//             return acc;
//           }, {});
      
//           // Fetch all employees
//           const employees = await Employee.findAll();
      
//           // Update the basicSalary field for each employee with their latest salary
//           await Promise.all(
//             employees.map(async (employee) => {
//               const latestSalary = latestSalaryMap[employee.employeeId];
      
//               if (latestSalary) {
//                 await DispatchedSalaries.create(
//                   { salary: latestSalary,
//                     employeeId:employee.employeeId
//                   },
                 
//                 );
//               }
//             })
//           );
      
//           return res.status(200).json({
//             message: 'Employee salaries Dispatched successfully',
//             latestSalaries:latestSalaries
//           });
      
//         } catch (error) {
//           console.error('Error updating data:', error);
//           res.status(500).json({ error: error });
//         }
//       };
//       static dispatchSalaryOfEmployee = async (req, res) => {
//         try {
//           const {employeeId}= req.query
//           if (!employeeId){
//             return res.status(400).json({
//               message:"EmployeeId is required"
//             })
//           }
//           // Get the latest salaries for each employee
//           const latestSalaries = await sequelize.query(`SELECT histories.*
//           FROM employeesalaryhistories AS histories
//           JOIN (
//             SELECT MAX(updatedAt) AS maxDate
//             FROM employeesalaryhistories
//             where employeeId=${employeeId}
//           ) sub ON histories.employeeId = ${employeeId} AND histories.updatedAt = sub.maxDate`, { type: QueryTypes.SELECT});
    
//           // Create a map of latest salaries for easy access by employeeId
//           const latestSalaryMap = latestSalaries.reduce((acc, salary) => {
//             acc[salary.employeeId] = salary.salary;
//             return acc;
//           }, {});
      
//           // Fetch all employees
//           const employees = await Employee.findAll();
      
//           // Update the basicSalary field for each employee with their latest salary
//           await Promise.all(
//             employees.map(async (employee) => {
//               const latestSalary = latestSalaryMap[employee.employeeId];
      
//               if (latestSalary) {
//                 await DispatchedSalaries.create(
//                   { salary: latestSalary,
//                     employeeId:employeeId                
//                   },
                  
//                 );
//               }
//             })
//           );
      
//           return res.status(200).json({
//             message: 'Employee salary Dispatched successfully',
//             latestSalaries:latestSalaries
//           });
      
//         } catch (error) {
//           console.error('Error updating data:', error);
//           res.status(500).json({ error: error });
//         }
//       };

//     static getAllDispatchedSalaries= async (req, res, next) => {
        
//         try{
//         const salaryTransactions= await DispatchedSalaries.findAll()
//         if(salaryTransactions.length<1){
//             return res.status(400).json({message:'No Transaction Available'})
//         }
//         return res.status(200).json({
//             status:200,
//             Message:"Succeess",
//             salaryTransactions:salaryTransactions
//         })
//     }
//     catch(error){
//         return next(error)
//     }

//     }


//     static getDispatchedSalariesById= async (req, res, next) => {
//         const {employeeId}=req.query;
//         try{
//           if (!employeeId){
//             return res.status(400).json({message:"employeeId is required"})
//           }
//         const salaryTransactions= await DispatchedSalaries.findAll({where:{employeeId:employeeId}})
//         if(salaryTransactions.length<1){
//             return res.status(400).json({message:'No Transaction Available'})
//         }
//         return res.status(200).json({
//             status:200,
//             Message:"Succeess",
//             DispatchedSalaries:salaryTransactions
//         })
//     }
//     catch(error){
//         return next(error)
//     }
    
//     }
// }
 
// module.exports= DispatchedSalariesController;