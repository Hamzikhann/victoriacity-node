const sequelize = require('../../config/connectdb.js');
const { Sequelize, DataTypes } = require('sequelize');

const UserGroup = sequelize.define("User_Group", {
    Group_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
   
      },
      GROUP_NAME: {
        type: Sequelize.STRING,
        allowNull: true,
        notEmpty: true,
      },
      GROUP_DESCRIPTION: {
        type: Sequelize.STRING,
        allowNull: true,
        notEmpty: true,
      },
})
sequelize.sync().then(() => {
    console.log('UserGroup table created successfully!');
  }).catch((error) => {
    console.error('Unable to create table : ', error);
  });
module.exports = UserGroup
// module.exports = (sequelize, Sequelize) => {
//     return sequelize.define("User_Group", {
//         Group_ID: {
//             type: Sequelize.INTEGER,
//             allowNull: true,
//             notEmpty: true,
       
//           },
//           GROUP_NAME: {
//             type: Sequelize.STRING,
//             allowNull: true,
//             notEmpty: true,
//           },
//           GROUP_DESCRIPTION: {
//             type: Sequelize.STRING,
//             allowNull: true,
//             notEmpty: true,
//           },
//     })
// }
