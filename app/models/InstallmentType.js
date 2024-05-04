

module.exports = (sequelize, Sequelize) => {
  return sequelize.define("installment_type", {
    InsType_ID: {
      type: Sequelize.INTEGER(),
      autoIncrement: true,
      primaryKey: true,
    },
    Name: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    Abbrev: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    Status: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      notEmpty: true,
      defaultValue:0,
    },
  })
};




