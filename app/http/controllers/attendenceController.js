// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
// import Attendance from "../../models/Attendance.js";
// import { json } from 'sequelize';
// // import { Json } from 'sequelize/types/utils.js';
// dotenv.config()

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Attendance = require("../../models/Attendance");
const { json, Op } = require("sequelize");
const Leave = require("../../models/Leave");
const moment = require("moment");
const Employee = require("../../models/Employee");
const { Sequelize, DataTypes } = require("sequelize");
// const { Json } = require('sequelize/types/utils.js');
dotenv.config();

class attendanceController {
  static addAttendence = async (req, res, next) => {
    const { month, year, date, employeeId, attendance } = req.body;
    let formattedDate = `${year}-${month}-${date}`;
    if (date <= 9 && date >= 1 && month <= 9 && month >= 1) {
      formattedDate = `${year}-0${month}-0${date}`;
    } else if (date <= 9 && date >= 1) {
      formattedDate = `${year}-${month}-0${date}`;
    } else if (month <= 9 && month >= 1) {
      formattedDate = `${year}-0${month}-${date}`;
    }
    console.log(attendance.attendance);

    const parts = attendance.attendance.split("-");
    attendance.attendance = parts[0];
    console.log(attendance.attendance);

    console.log({ formattedDate });
    console.log(attendance.attendance, employeeId, date, month, year);
    if (attendance && employeeId && date && month && year) {
      //    try {
      if (attendance.attendance == "L" || attendance.attendance == "l") {
        let specificDateLeaves = await Leave.findAll({
          where: {
            [Op.and]: [
              { startDate: { [Op.gte]: new Date(formattedDate) } },
              { endDate: { [Op.lte]: new Date(formattedDate) } },
            ],
            employeeId: employeeId,
            status: "approved",
          },
        });
        console.log({ specificDateLeaves });
        if (specificDateLeaves.length < 1) {
          return res.status(200).send({
            status: 200,
            message: "You have no leave",
          });
        }
      }
      let allAttendance = await Attendance.findOne({
        where: { month: month, year: year, employeeId: employeeId },
      });
      console.log(allAttendance);

      if (allAttendance) {
        // console.log(allAttendance);
        let attendance_data = JSON.parse(allAttendance.attendance);

        attendance_data[date] = attendance;

        attendance_data = JSON.stringify(attendance_data);

        const result = await Attendance.update(
          {
            attendance: attendance_data,
          },
          { where: { id: allAttendance.id } }
        );

        res.status(200).send({
          status: 200,
          message: "Attendance added successfully",
        });
      } else {
        let attendance_data = {
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

        attendance_data[date] = attendance;

        attendance_data = JSON.stringify(attendance_data);
        let date1 = new Date(year, month, 1);
        // Set the date to the last day of the month
        date1.setMonth(date1.getMonth() + 1);
        date1.setDate(date1.getDate() - 1);
        // Return the last date of the month
        console.log("zzzzzzzzzzzzzzzzzzzzzzzzzz", date1);
        try {
          const attendance_new = new Attendance({
            month: month,
            year: year,
            date: formattedDate,
            attendance: attendance_data,
            employeeId: employeeId,
            isDeleted: false,
          });

          await attendance_new.save();
          return res.status(200).send({
            status: 200,
            message: "Attendance added successfully",
          });
        } catch (error) {
          return next(error);
        }
      }
    } else {
      res.status(400).send({
        status: 400,
        message: "All fields are required",
      });
    }
  };
  static getAttendence = async (req, res, next) => {
    const year = req.body.year;
    const month = req.body.month;
    console.log(year, month);
    try {
      let attendenceById = await Attendance.findAll(
        {
          order: [["createdAt", "DESC"]],
        },
        {
          where: { month: month, year: year, isDeleted: false },
        }
      );

      if (attendenceById.length >= 1) {
        attendenceById[0].attendance = JSON.parse(attendenceById[0].attendance);
        return res.status(200).send({
          status: 200,
          message: "get Attendence successfully",
          Attendance: attendenceById,
        });
      } else {
        return res.status(200).send({
          status: "Failed",
          message: "No Attendence Found",
          Attendance: [],
        });
      }
    } catch (error) {
      res.status(400).send({
        status: 400,
        message: "Something Went Wrong check your code",
        error: error,
      });
    }
  };
  static getAttendenceByEmployeeId = async (req, res, next) => {
    const employeeId = req.params.id;
    const year = req.body.year;
    const month = req.body.month;

    try {
      let attendenceById = await Attendance.findAll({
        where: { month: month, year: year, employeeId: employeeId },
      });

      if (attendenceById.length >= 1) {
        attendenceById[0].attendance = JSON.parse(attendenceById[0].attendance);
        res.status(200).send({
          status: 200,
          message: "get Attendence successfully",
          // Attendance: attendenceById,
          Attendance: attendenceById,
        });
      } else {
        res.status(404).send({
          status: 200,
          message: "No Attendence Found ",
          Attendance: [],
        });
      }
    } catch (error) {
      res.status(400).send({
        status: 400,
        message: "Something Went Wrong check your code",
        error: error,
      });
    }
  };
  static searchAttendence = async (req, res, next) => {
    const employeeId = req.params.id;
    const { startDate, endDate } = req.body;

    let result = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const months = [];

    let currentDate = start;
    while (currentDate <= end) {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();

      months.push({
        month: parseInt(`${month < 9 ? "0" : ""}${month + 1}`),
        year: year,
      });

      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
    }
    let rows;
    if (employeeId) {
      rows = await Attendance.findAll({
        where: {
          [Op.or]: months.map((month) => {
            return {
              [Op.and]: [{ month: month.month }, { year: month.year }],
            };
          }),
          employeeId: employeeId,
        },
      });
    } else {
      rows = await Attendance.findAll({
        where: {
          [Op.or]: months.map((month) => {
            return {
              [Op.and]: [{ month: month.month }, { year: month.year }],
            };
          }),
        },
      });
    }

    res.status(200).send({
      status: 200,
      message: "Search Data",
      result: rows,
    });
  };
  static getAttendenceById = async (req, res, next) => {
    const id = req.params.id;
    const year = req.body.year;
    const month = req.body.month;
    console.log(year, month, id);

    try {
      let attendenceById = await Attendance.findAll({
        where: { month: month, year: year, id: id },
      });
      if (attendenceById.length >= 1) {
        attendenceById[0].attendance = JSON.parse(attendenceById[0].attendance);

        res.status(200).send({
          status: 200,
          message: "get Attendence successfully",
          // Attendance: attendenceById,
          Attendance: attendenceById,
        });
      } else {
        res.status(404).send({
          status: 400,
          message: "No Attendence Found ",
          Attendance: [],
        });
      }
    } catch (error) {
      res.status(400).send({
        status: 400,
        message: "Something Went Wrong check your code",
        error: error,
      });
    }
  };

  static getMonthsBetween = async (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const months = [];

    let currentDate = start;
    while (currentDate <= end) {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();

      months.push({
        month: parseInt(`${month < 9 ? "0" : ""}${month + 1}`),
        year: year,
      });

      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
    }

    return months;
  };

  static getAttendanceByDate = async (req, res, next) => {
    const { year, month, date } = req.body;

    // Perform the database query to retrieve attendance for all employees on the given date
    try {
      const allAttendance = await Attendance.findAll({
        include: [{ as: "employee", model: Employee }],
        where: { month: month, year: year },
      });

      // console.log('kdjfkdjfkd', allAttendance)
      if (allAttendance.length === 0) {
        return res.status(404).json({
          status: "Failed",
          message: "No attendance records found for the given date.",
        });
      }

      // Extract the required information from the attendance records
      const attendanceData = allAttendance
        .filter((item) => item.employee !== null)
        .map((attendance) => {
          // console.log(attendance.employee);
          let attendances = JSON.parse(attendance.attendance);
          console.log(
            "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
            attendance.employee
          );
          return {
            employee: attendance.employee,
            attendance: attendances[date],
          };
        });

      res.status(200).json({
        status: 200,
        data: attendanceData,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "An error occurred while retrieving attendance data.",
        error: error,
      });
    }
  };

  ///////////////////////////////////////////////
  // New punch in API
  static punchInAttendance = async (req, res, next) => {
    const { employeeId, punch_in_note, year, month, date } = req.body;

    const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

    if (employeeId) {
      const attendances = await Attendance.findOne({
        where: { employeeId: employeeId, month: month, year: year },
      });
      if (!attendances) {
        return res.status(404).send({
          status: 400,
          message: "Attendance record not found",
        });
      }
      let formatData = JSON.parse(attendances.attendance);
      console.log(
        formatData,
        "ooooooooooooooooooooooooooooooooooooooooooooooooooooooo",
        formatData[date]
      );
      const dateObj = formatData[date];
      console.log("xxxxxxxxxxxxxxxxxxxxxxxx", dateObj);

      if (dateObj && !dateObj.punch_in) {
        dateObj.punch_in = currentDateTime;
        dateObj.attendance = "P";
        dateObj.punch_in_note = punch_in_note;
        formatData[date] = dateObj;
        const updatedAttendance = JSON.stringify(formatData);
        await Attendance.update(
          { attendance: updatedAttendance },
          { where: { id: attendances.id } }
        );
        return res.status(200).json({
          status: 200,
          message: "Attendance marked as punched in successfully.",
        });
      } else {
        return res.status(400).send({
          status: 400,
          message: "Attendance already punched in ",
        });
      }
    } else {
      res.status(400).send({
        status: 400,
        message: "Employee ID is required",
      });
    }
  };

  // Punch Out API
  static punchOutAttendance = async (req, res, next) => {
    const { employeeId, punch_out_note, year, month, date } = req.body;

    const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

    if (employeeId) {
      const attendances = await Attendance.findOne({
        where: { employeeId: employeeId, month: month, year: year },
      });
      if (!attendances) {
        return res.status(404).send({
          status: 400,
          message: "Attendance record not found",
        });
      }
      let formatData = JSON.parse(attendances.attendance);

      const dateObj = formatData[date];

      if (dateObj && !dateObj.punch_out) {
        dateObj.punch_out = currentDateTime;
        dateObj.punch_out_note = punch_out_note;
        formatData[date] = dateObj;
        const updatedAttendance = JSON.stringify(formatData);
        await Attendance.update(
          { attendance: updatedAttendance },
          { where: { id: attendances.id } }
        );
        return res.status(200).json({
          status: 200,
          message: "Attendance marked as punched Out successfully.",
        });
      } else {
        return res.status(400).send({
          status: 400,
          message: "Attendance already punched Out ",
        });
      }
    } else {
      res.status(400).send({
        status: 400,
        message: "Employee ID is required",
      });
    }
  };

  ////
  static getAttendanceByEmployeeId = async (req, res, next) => {
    const { employeeId, punch_in_note, year, month, date } = req.query;

    const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

    if (employeeId) {
      const attendances = await Attendance.findOne({
        where: { employeeId: employeeId, month: month, year: year },
      });
      if (!attendances) {
        return res.status(404).send({
          status: 400,
          message: "Attendance record not found",
        });
      }
      let formatData = JSON.parse(attendances.attendance);
      const dateObj = formatData[date];
      console.log("xxxxxxxxxxxxxxxxxxxxxxxx", dateObj);

      return res.status(200).json({
        status: 200,
        message: "Get Attendance Successfully",
        Attendance: dateObj,
      });
    } else {
      res.status(400).send({
        status: 400,
        message: "Employee ID is required",
      });
    }
  };
}
module.exports = attendanceController;
