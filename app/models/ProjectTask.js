// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import Employee from './Employee.js';
// import Customer from './Customer.js';


const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../../config/connectdb.js');
const User = require('./User.js');
const Project = require('./project.js');
const Employee = require('./Employee.js');


const ProjectTask = sequelize.define("projectTask", {
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        notEmpty: true,
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        notEmpty: false,
    },
 
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        notEmpty: true,
    },
  status: {
        type: Sequelize.ENUM('Active', 'Pending','Completed'),
        defaultValue: 'Pending',
        allowNull: true,
        notEmpty: true,
    },  
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        notEmpty: true,
    },
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        notEmpty: true,
    },
});


// ProjectTask.associate = function (models) {

// };

sequelize.sync().then(() => {
    console.log('ProjectTask table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

ProjectTask.belongsTo(Project, { as: 'project', foreignKey: 'projectId' })
ProjectTask.belongsTo(Employee, { as: 'employee', foreignKey: 'assignedTo' })
// export default ProjectTask
module.exports = ProjectTask