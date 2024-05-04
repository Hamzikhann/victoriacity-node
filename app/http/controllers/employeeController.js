// import Job from "../../models/Job.js";
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import User from "../../models/User.js";
// import Employee from "../../models/Employee.js";
// import Designation from "../../models/Designation.js";
// import ProjectLog from "../../models/ProjectLog.js";
// import Attendance from "../../models/Attendance.js";
// import { NUMBER } from "sequelize";
// import Leave from "../../models/Leave.js";
// import JobCandidate from "../../models/JobCandidate.js";
// dotenv.config()

const Job = require("../../models/Job.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../../models/User.js");
const Employee = require("../../models/Employee.js");
const Designation = require("../../models/Designation.js");
const ProjectLog = require("../../models/ProjectLog.js");
const Attendance = require("../../models/Attendance.js");
const { NUMBER } = require("sequelize");
const Leave = require("../../models/Leave.js");
const JobCandidate = require("../../models/JobCandidate.js");
const employeeRelation = require("../../models/EmployeeRelation.js");
const EmployeeRelation = require("../../models/EmployeeRelation.js");
const EmployeeAsset = require("../../models/EmployeeAsset.js");
const Asset = require("../../models/Asset.js");
const Project = require("../../models/project.js");
const ProjectTask = require("../../models/ProjectTask.js");
const employeeProject = require("../../models/EmployeeProject.js");
const attendanceController = require("./attendenceController.js");
dotenv.config();

class EmployeeController {
  static addEmployee = async (req, res, next) => {
    const {
      fullName,
      fatherName,
      dob,
      cnic,
      gender,
      contact,
      email,
      maritalStatus,
      address,
      employeeId,
      designation,
      department,
      branch,
      dateOfJoining,
      basicSalary,
      emergencyContactName,
      relationship,
      emergencyContactNumber,
      emergencyContactAddress,
      status,
      candidateId,
      isDeleted,
      role,
      password,
    } = req.body;
    console.log({
      fullName,
      fatherName,
      dob,
      cnic,
      gender,
      contact,
      email,
      maritalStatus,
      address,
      employeeId,
      designation,
      department,
      branch,
      dateOfJoining,
      basicSalary,
      emergencyContactName,
      relationship,
      emergencyContactNumber,
      emergencyContactAddress,
      status,
      candidateId,
      isDeleted,
    });
    let image = "";
    if (req.file) {
      image = req.file.filename;
      image = "uploads/" + image;
    }
    if (
      fullName &&
      fatherName &&
      dob &&
      cnic &&
      gender &&
      email &&
      maritalStatus &&
      designation &&
      department &&
      dateOfJoining &&
      basicSalary &&
      role &&
      password && employeeId
    ) {

      const employeeIds = await Employee.findAll({
        where: { employeeId: employeeId },
      });
  
      if (employeeIds.length > 0) {
        return res
          .status(400)
          .json({
            status: 400,
            message: "Employee already exist in Employee Table",
          });
      }

      const result = await Designation.findAll({ where: { id: designation } });
      const validEmployee = await Employee.findAll({ where: { email: email } });
      if (validEmployee.length <= 0) {
        if (result.length > 0) {
          try {
            const createEployee = new Employee({
              fullName: fullName,
              fatherName: fatherName,
              dob: dob,
              cnic: cnic,
              contact: contact,
              email: email,
              maritalStatus: maritalStatus,
              address: address,
              employeeId: employeeId,
              designation: designation,
              department: department,
              branch: branch,
              dateOfJoining: dateOfJoining,
              basicSalary: basicSalary,
              emergencyContactName: emergencyContactName,
              relationship: relationship,
              emergencyContactNumber: emergencyContactNumber,
              emergencyContactAddress: emergencyContactAddress,
              status: status,
              gender: gender,
              candidateId: candidateId,
              image: image,
              isDeleted: false,
            });
            await createEployee.save();

            const { role, password } = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            const createUser = new User({
              name: fullName.split(" ")[0],
              lastName: fullName.split(" ")[1],
              password: hashPassword,
              role: role,
              email: email,
              mobileNo: contact,
              image: image,
              status: status,
            });

            await createUser.save();
            // res.status(200).send({
            //   status: 200,
            //   message: "Add User successfully",
            //   User: createUser
            // });

            const date = new Date(dateOfJoining);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            // let attendance_date =
            // '[{"1":{"punch_in":"","punch_out":"","attendance":"" },"2":{"punch_in":"","punch_out":"","attendance":""},"3":{"punch_in":"","punch_out":"","attendance":""},"4":{"punch_in":"","punch_out":"","attendance":""},"5":{"punch_in":"","punch_out":"","attendance":""},"6":{"punch_in":"","punch_out":"","attendance":""},"7":{"punch_in":"","punch_out":"","attendance":""},"8":{"punch_in":"","punch_out":"","attendance":""},"9":{"punch_in":"","punch_out":"","attendance":""},"10":{"punch_in":"","punch_out":"","attendance":""},"11":{"punch_in":"","punch_out":"","attendance":""},"12":{"punch_in":"","punch_out":"","attendance":""},"13":{"punch_in":"","punch_out":"","attendance":""},"14":{"punch_in":"","punch_out":"","attendance":""},"15":{"punch_in":"","punch_out":"","attendance":""},"16":{"punch_in":"","punch_out":"","attendance":""},"17":{"punch_in":"","punch_out":"","attendance":""},"18":{"punch_in":"","punch_out":"","attendance":""},"19":{"punch_in":"","punch_out":"","attendance":""},"20":{"punch_in":"","punch_out":"","attendance":""},"21":{"punch_in":"","punch_out":"","attendance":""},"22":{"punch_in":"","punch_out":"","attendance":""},"23":{"punch_in":"","punch_out":"","attendance":""},"24":{"punch_in":"","punch_out":"","attendance":""},"25":{"punch_in":"","punch_out":"","attendance":""},"26":{"punch_in":"","punch_out":"","attendance":""},"27":{"punch_in":"","punch_out":"","attendance":""},"28":{"punch_in":"","punch_out":"","attendance":""},"29":{"punch_in":"","punch_out":"","attendance":""},"31":{"punch_in":"","punch_out":"","attendance":""}}]';
            let attendance_date = {
              1: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              2: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              3: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              4: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              5: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              6: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              7: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              8: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              9: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              10: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              11: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              12: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              13: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              14: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              15: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              16: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              17: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              18: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              19: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              20: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              21: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              22: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              23: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              24: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              25: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              26: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              27: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              28: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              29: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              30: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
              31: {
                punch_in: "",
                punch_out: "",
                attendance: "",
                punch_in_note: "",
                punch_out_note: "",
                attendance_note: "",
                holiday_note: "",
                holiday: false,
              },
            };

            attendance_date = JSON.stringify(attendance_date);
            let date1 = new Date(year, month, 1);
            // Set the date to the last day of the month
            date1.setMonth(date.getMonth() + 1);
            date1.setDate(date.getDate() - 1);
            // Return the last date of the month

            const attendance = new Attendance({
              month: month,
              year: year,
              date: date1,
              attendance: attendance_date,
              employeeId: createEployee.id,
            });
            await attendance.save();

            res.status(200).send({
              status: 200,
              message: "Add Employee successfully",
              Employee: "createEmployee",
              createUser,
            });
          } catch (error) {
            console.log(error);
            res.status(400).send({
              status: 400,
              message: "Unable to Add Employee",
              error: error,
            });
          }
        } else {
          res.status(400).send({
            status: 400,
            message: "NO Designation Found",
          });
        }
      } else {
        res.status(400).send({
          status: 400,
          message: "Employee Already Exist with Same Email",
        });
      }
    } else {
      res.status(400).send({
        status: 400,
        message: "All fields are required",
      });
    }
  };

  // Search Employee by Id
  static getEmployeeById = async (req, res, next) => {
    const empId = req.query.id;
    try {
      const empById = await Employee.findAll({
        include: [
          { as: "designationAss", model: Designation },
          { as: "candidate", model: JobCandidate },
        ],
        where: { id: empId },
      });
      if (empById.length > 0) {
        res.status(200).send({
          status: 200,
          message: "get Employee successfully",
          Employee: empById,
        });
      } else {
        res.status(200).send({
          status: 200,
          message: "No EmployeeFound against id",
        });
      }
    } catch (error) {
      return next(error);
    }
  };
  // GET ALL AVAILABLE Employee
  static getAllEmployee = async (req, res) => {
    const allEmployee = await Employee.findAll({
      include: [
        { as: "designationAss", model: Designation },
        { as: "candidate", model: JobCandidate },
      ],
      where: { isDeleted: 0 },
    });

    if (allEmployee !== null) {
      res.status(200).send({
        status: 200,
        message: "Get all Employee successfully",
        employee: allEmployee,
      });
    } else {
      res.status(200).send({
        status: 200,
        message: "No Employee present",
      });
    }
  };
  //Get Deleted Employees

  static getAllDeltedEmployee = async (req, res) => {
    const allEmployee = await Employee.findAll({
      include: [
        { as: "designationAss", model: Designation },
        { as: "candidate", model: JobCandidate },
      ],
      where: { isDeleted: true },
    });

    if (allEmployee !== null) {
      res.status(200).send({
        status: 200,
        message: "Get all Deleted Employee successfully",
        employee: allEmployee,
      });
    } else {
      res.status(200).send({
        status: 200,
        message: "No Employee Deleted",
      });
    }
  };

  // Delete Employee

  static deleteEmployee = async (req, res) => {
    const id = req.query.id;
    console.log(req.query);
    if (id) {
      try {
        const empById = await Employee.findAll({
          where: { id: id, isDeleted: false },
        });
        const Attendances = await Attendance.findAll({
          where: { employeeId: id },
        });

        if (empById.length > 0) {
          Employee.update({ isDeleted: true }, { where: { id: id } });
          if(Attendances.length>0){
            Attendance.update({ isDeleted: true }, { where: { employeeId: id } });
          }
          return res.status(200).send({
            status: 200,
            message: "Employee Deleted successfully",
            "Employee Deleted": empById,
          });

        } else {
          return res.status(400).send({
            status: 400,
            message: "Employee Not Found",
          });
        }

        
      } catch (error) {
        console.log(error);
        res.status(400).send({
          status: 400,
          message: "Unable to Deleted Employee",
          error:error
        });
      }
    } else {
      res.status(400).send({
        status: 400,
        message: "ID IS REQUIRED",
      });
    }
  };
  // Update Employee

  static updateEmployee = async (req, res, next) => {
    const {
      fullName,
      fatherName,
      dob,
      cnic,
      gender,
      contact,
      email,
      maritalStatus,
      address,
      employeeId,
      designation,
      department,
      branch,
      dateOfJoining,
      basicSalary,
      emergencyContactName,
      relationship,
      emergencyContactNumber,
      emergencyContactAddress,
      status,
    } = req.body;
    let image = "";
    if (req.file) {
      image = req.file.filename;
      image = "uploads/" + image;
    }
    const empId = req.query.id;

    try {
      const result = await Employee.findAll({ where: { id: empId } });

      if (result.length > 0) {
        const empById = await Employee.update(
          {
            fullName: fullName,
            fatherName: fatherName,
            dob: dob,
            cnic: cnic,
            contact: contact,
            email: email,
            maritalStatus: maritalStatus,
            address: address,
            employeeId: employeeId,
            designation: designation,
            department: department,
            branch: branch,
            dateOfJoining: dateOfJoining,
            basicSalary: basicSalary,
            emergencyContactName: emergencyContactName,
            relationship: relationship,
            emergencyContactNumber: emergencyContactNumber,
            emergencyContactAddress: emergencyContactAddress,
            status: status,
            gender: gender,
            image: image,
          },
          { where: { id: empId } }
        );
        res.status(200).send({
          status: 200,
          message: " Employee updated successfully",
          Employee: result,
        });
      } else {
        res.status(200).send({
          status: 200,
          message: "No Employee Found against id",
        });
      }
    } catch (error) {
      return next(error);
    }
  };

  static getEmployeeAssetById = async (req, res, next) => {
    const empId = req.query.id;
    try {
      const empById = await EmployeeAsset.findAll({
        include: [
          { as: "employee", model: Employee },
          { as: "Asset", model: Asset },
        ],
        where: { employeeId: empId },
      });
      if (empById.length > 0) {
        res.status(200).send({
          status: 200,
          message: "get Employee Asset successfully",
          Employee: empById,
        });
      } else {
        res.status(200).send({
          status: 200,
          message: "No EmployeeAsset Found against id",
        });
      }
    } catch (error) {
      return next(error);
    }
  };
  static getprojectTaskByEmployeeId = async (req, res, next) => {
    const empId = req.query.id;
    let taskCount;
    try {
      const empById = await ProjectTask.findAll({
        include: [
          { as: "employee", model: Employee },
          { as: "project", model: Project },
        ],
        where: { assignedTo: empId },
      });
      const projectIds = new Set();
      empById.forEach((task) => {
        projectIds.add(task.project.id);
      });
      const projectCount = projectIds.size;

      if (empById.length > 0) {
        res.status(200).send({
          status: 200,
          message: "get Project Task successfully",
          ProjectTask: empById,
          taskCount: empById.length,
          projectCount: projectCount,
        });
      } else {
        res.status(200).send({
          status: 200,
          message: "No Project Task Found against id",
        });
      }
    } catch (error) {
      return next(error);
    }
  };
}

// export default EmployeeController;
module.exports = EmployeeController;
