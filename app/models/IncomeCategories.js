const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("../../config/connectdb.js");
const Project = require("../models/project.js");

const incomecategory = sequelize.define("incomecategory", {
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
incomecategory.hasMany(incomecategory, { as: 'child', foreignKey: 'parentId' });
incomecategory.belongsTo(incomecategory, { as: 'parent', foreignKey: 'parentId' });

module.exports = incomecategory;
