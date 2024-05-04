// import {Sequelize,DataTypes} from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import Project from './project.js';
// import customer from './customer.js';

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = require('../../config/connectdb.js');
const Project = require('./project.js');
const customer = require('./Customer.js');
const Customer = require('./Customer.js');


const customerProject= sequelize.define("customerProject", {
    customerId: {
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
 customerProject.belongsTo(Project, { as: 'project', foreignKey: 'projectId' })
 customerProject.belongsTo(Customer, { as: 'customer', foreignKey: 'customerId' })
sequelize.sync().then(() => {
    console.log('Project table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

// export default customerProject
module.exports = customerProject
