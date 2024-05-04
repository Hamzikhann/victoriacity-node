const sequelize = require('../../config/connectdb.js');
const { Sequelize, DataTypes } = require('sequelize');
const User_Group= require('./User_Group.js')
const Menu = require('./Menu.js')
const GroupMenu = sequelize.define("Group_Menu", {
    Menu_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        notEmpty: false,
   
      },
      Group_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        notEmpty: false,
      },
      Read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        notEmpty: false,
        defaultValue: 1,
      },
      Write: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        notEmpty: false,
        defaultValue: 1,
      },

     
})
sequelize.sync().then(() => {
    console.log('Group Menu table created successfully!');
  }).catch((error) => {
    console.error('Unable to create table : ', error);
  });
  GroupMenu.belongsTo(User_Group, { as: 'Groups', foreignKey: 'Group_ID' })
  GroupMenu.belongsTo(Menu, { as: 'Menus', foreignKey: 'Menu_ID' })
module.exports = GroupMenu