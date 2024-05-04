// import { Sequelize, DataTypes } from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
// import sequelize from "../../config/connectdb.js"
// import AssetType from './AssetType.js';
// import Employee from './Employee.js';

const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../../config/connectdb.js');
const AssetType = require('./AssetType.js');
const Employee = require('./Employee.js');

const Assets = sequelize.define("Asset",     {
    name: {
        type: DataTypes.INTEGER,
        allowNull: true,
        
        notEmpty: true,
    },
    type: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        notEmpty: true,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: true,
        notEmpty: true,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true,
        notEmpty: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        notEmpty: true,
    },
    expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        notEmpty: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        notEmpty: true,
    },
    addedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        notEmpty: true,
    }
});

sequelize.sync().then(() => {
    console.log('Assets table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});
Assets.belongsTo(AssetType, { as: "AssetType", foreignKey: "type" });

module.exports = Assets