// import {Sequelize,DataTypes} from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import Project from './project.js';
// import Employee from './Employee.js';

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = require('../../config/connectdb.js');
const Project = require('./project.js');
const Employee = require('./Employee.js');


const employeeProject= sequelize.define("employeeProject", {
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        notEmpty: true,
    }
 });
 employeeProject.belongsTo(Project, { as: 'project', foreignKey: 'projectId' })
 employeeProject.belongsTo(Employee, { as: 'employee', foreignKey: 'employeeId' })
sequelize.sync().then(() => {
    console.log('Project table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

// export default employeeProject
module.exports = employeeProject
