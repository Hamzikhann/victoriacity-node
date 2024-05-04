const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../../config/connectdb.js');


const accountcategory = sequelize.define('accountcategory', {
  type: {
    type: DataTypes.ENUM('Expense','Revenue'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

accountcategory.hasMany(accountcategory, { as: 'child', foreignKey: 'parentId' });


module.exports = accountcategory;
