module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Tax_Payee_Category", {
        TPC_ID: {
        type: Sequelize.INTEGER(),
        autoIncrement: true,
        primaryKey: true,
      },
      Name: {
        type: Sequelize.STRING,
        allowNull: true,
        nonEmpty: true,
      }
    });
  };
  