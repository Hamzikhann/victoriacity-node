module.exports = (sequelize, Sequelize) => {
    return sequelize.define("payment_mode", {
      PMID: {
        type: Sequelize.INTEGER(),
        autoIncrement: true,
        primaryKey: true,
      },
      Description: {
        type: Sequelize.STRING,
        allowNull: true,
        nonEmpty: true,
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        notEmpty: true,
      },
    })
  };