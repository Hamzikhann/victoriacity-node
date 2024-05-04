// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import FileIssue from './FileIssue.js';


const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../../config/connectdb.js');
const FileIssue = require('./OpenFile_Mst.js');


const Street
 = sequelize.define("street", {
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        notEmpty: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        notEmpty: true,
    },
    
    
});



sequelize.sync().then(() => { 
   
    console.log('Street table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

// export default Street
module.exports = Street
