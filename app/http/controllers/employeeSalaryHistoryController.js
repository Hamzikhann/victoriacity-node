const EmployeeSalaryHistory = require("../../models/EmployeeSalaryHistory");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Employee = require("../../models/Employee.js");
const { request } = require("express");
const AccountTransaction = require("../../models/AccountTransaction");
const Settings = require("../../models/Settings.js");
const accounttransaction = require("../../models/AccountTransaction");
const { Sequelize, Op, QueryTypes } = require('sequelize');
const sequelize = require('./../../../config/connectdb')
dotenv.config();

class EmployeeSalaryHistoryController {
  /////////////////////
  static createEmployeeSalaryHistory = async (req, res, next) => {
    const { employeeId, salary } = req.body;
  
    if (!(employeeId && salary)) {
      return res.status(400).json({ status: 400, message: "All fields are required" });
    }
  
    try {
      const result = await Employee.findAll({ where: { employeeId: employeeId } });
      if (result.length < 1) {
        return res.status(400).json({ status: 400, message: "EmployeeId does not exist" });
      }
  
      const createSalaryHistory = new EmployeeSalaryHistory({
        employeeId: employeeId,
        salary: salary,
      });
  
      const salaryHistory = await createSalaryHistory.save();
  
      // Fetch the expenseSalaryCategory from the Settings table
      const settings = await Settings.findOne({
        where: { type: 'expenseSalaryCategory' },
      });
  
      if (!settings) {
        return res.status(400).json({ status: 400, message: "Expense salary category not found" });
      }
  
      // Insert a new entry into the accounttransactions table
      await AccountTransaction.create({
        categoryId: settings.categoryId, // Use the correct categoryId from the fetched settings
        amount: salary,
        date: new Date(), // Provide the current date or a valid date value
        employeeSalaryHistory: salaryHistory.id,
      });
  
      return res.status(200).json({
        status: 200,
        message: "Add Employee Salary History successfully",
        SalaryHistory: salaryHistory,
      });
    } catch (error) {
      console.log(error); // Log the error to the console for debugging purposes
  
      return res.status(500).json({
        status: 500,
        message: "Unable to add Employee Salary History",
        error: error,
      });
    }
  };
  
  // select expense_category_id from settings limit 0,1
  // need to insert new entry in accounttransactions table
  // category_id fetch from settings table
  // amount variable = salary

  //////////////////
  static dispatchSalariesBulk = async (req, res) => {
    try {
      const Employees = await Employee.findAll();
      const expenseCategorySetting = await Settings.findOne({ where: { expenseCategoryId: { [Op.not]: null } } });
  
      if (Employees.length < 1) {
        return res.status(200).json({ Message: "No Employee Available" });
      }
    
      
  
  
      const salaryHistoryPromises = Employees.map(async employee => {
        const createSalaryHistory = await EmployeeSalaryHistory.create({
          employeeId: employee.id,
          salary: employee.basicSalary,
        });
  
        return createSalaryHistory;
      });
  
      const salaryHistoryResults = await Promise.all(salaryHistoryPromises);
  
      const accountTransactionPromises = salaryHistoryResults.map(async salaryHistory => {
        await AccountTransaction.create({
          categoryId: expenseCategorySetting.expenseCategoryId,
          amount: salaryHistory.salary,
          date: new Date(),
          employeeSalaryHistory:salaryHistory.id,
          type:'Expense'
        });
      });
  
      await Promise.all(accountTransactionPromises);
  
      return res.status(200).json({
        status: 200,
        message: "Dispatch Salaries Successful",
        SalaryHistory: salaryHistoryResults,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 500,
        message: "Unable to add Employee Salary History",
        error: error.message,
      });
    }
  }
  
  static dispatchSalaryByEmployeeId = async (req, res) => {
    try {
      const { employeeId } = req.query;
      if (!employeeId){
        return res.status(200).json({Message:"Employee Id is Required"})
      }
      // Find the specified employee
      const employee = await Employee.findOne({where:{employeeId:employeeId}});
      if (employee.length<1) {
        return res.status(404).json({ Message: "Employee not found" });
      }
  
      const expenseCategorySetting = await Settings.findOne({ where: { expenseCategoryId: { [Op.not]: null } } });
  
      if (!expenseCategorySetting) {
        return res.status(404).json({ Message: "Expense category setting not found" });
      }
  
      const createSalaryHistory = await EmployeeSalaryHistory.create({
        employeeId: employee.employeeId,
        salary: employee.basicSalary,
      });
  
      await AccountTransaction.create({
        categoryId: expenseCategorySetting.expenseCategoryId,
        amount: createSalaryHistory.salary,
        date: new Date(),
        employeeSalaryHistory: createSalaryHistory.id,
        type: 'Expense'
      });
  
      return res.status(200).json({
        status: 200,
        message: "Salary Dispatch Successful",
        SalaryHistory: createSalaryHistory,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 500,
        message: "Unable to add Employee Salary History",
        error: error.message,
      });
    }
  }
  


  static getEmployeeSalaryHistoryById = async (req, res) => { 
    const { id } = req.query;
    try {
      if (!id) {
        return res.status(400).json({ status: 400, Message: "Id is required" });
      }
      const employeeSalaries = await EmployeeSalaryHistory.findOne({ include:[{ as: "Employee", model:Employee }],
        where: { id: id },
      });
      if (employeeSalaries.length <= 0) {
        return res
          .status(400)
          .json({ status: 400, Message: "No Employee Salary History found" });
      }
      return res.status(200).json({ EmployeeSalaryHistory: employeeSalaries });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Failed to get employee salary history.",
          error: error,
        });
    }
  };

  static getAllEmployeeSalaryHistory = async (req, res) => {
    try {
   
      const employeeSalaries = await EmployeeSalaryHistory.findAll({include:[{ as: "Employee", model:Employee }]});
      if (employeeSalaries.length <= 0) {
        return res
          .status(400)
          .json({ status: 400, Message: "No Employee Salary History found" });
      }
      return res.status(200).json({ 
        EmployeeSalaryHistory: employeeSalaries ,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Failed to get employee salary history.",
          error: error,
        });
    }
  };


  

  static updateEmployeeSalaryHistory = async (req, res) => {
    try {
      const { id } = req.query;
      const { salary, employeeId } = req.body;
  
      if (!id) {
        return res
          .status(400)
          .json({ status: 400, Message: "Id is required" });
      }
  
      const employeeSalary = await EmployeeSalaryHistory.findOne({ where: { id: id } });
      if (!employeeSalary) {
        return res
          .status(404)
          .json({ error: "Employee salary history not found." });
      }
  
      const updatedSalaryHistory = await employeeSalary.update({
        employeeId: employeeId,
        salary: salary,
      });
  
      return res.status(200).json({
        status: 200,
        Message: 'Successfully Updated',
        updatedSalaryHistory: updatedSalaryHistory
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to update employee salary history." });
    }
  };
  
  static deleteEmployeeSalaryHistory = async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(404).json({ error: "Id is required" });
      }
      const employeeSalary = await EmployeeSalaryHistory.findByPk(id);
      if (employeeSalary.length <= 0) {
        return res
          .status(404)
          .json({ error: "Employee salary history not found." });
      }

      await employeeSalary.destroy();
      res
        .status(200)
        .json({
          status: 200,
          Message: "Salary History Deleted Successfully",
          History: employeeSalary,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Failed to delete employee salary history.",
          error: error,
        });
    }
  };



}


module.exports = EmployeeSalaryHistoryController;
