

module.exports = (sequelize, Sequelize) => {
  return sequelize.define("VOUCH_TYPE_MST", {
    Vouch_Type_ID: {
      type: Sequelize.INTEGER(),
      autoIncrement: true,
      primaryKey: true,
    },
    Vouch_Type_NAME: {
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




