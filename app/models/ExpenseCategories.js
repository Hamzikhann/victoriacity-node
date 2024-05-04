const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('../../config/connectdb.js');


const expensecategory = sequelize.define('expenscategory', {
  type: {
    type: DataTypes.STRING,
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
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

expensecategory.hasMany(expensecategory, { as: 'child', foreignKey: 'parentId' });
expensecategory.belongsTo(expensecategory, { as: 'parent', foreignKey: 'parentId' });

module.exports = expensecategory;
