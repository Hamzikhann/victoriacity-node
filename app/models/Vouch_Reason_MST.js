
module.exports = (sequelize, Sequelize) => {
  return sequelize.define("Vouch_Reason_MST", {
    VR_ID: {
      type: Sequelize.INTEGER(),
      autoIncrement: true,
      primaryKey: true,
    },
    VR_NAME: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    VR_TYPE: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    Descrip: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
  })
};




