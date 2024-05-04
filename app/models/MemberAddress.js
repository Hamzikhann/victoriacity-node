const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = require('../../config/connectdb.js');


const memberAddress= sequelize.define("memberAddress", {
    memberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    memberAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        notEmpty: true,
    }
 });

  
module.exports = memberAddress
