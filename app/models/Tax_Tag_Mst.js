module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Tax_Tag_Mst", {
        TT_ID: {
        type: Sequelize.INTEGER(),
        autoIncrement: true,
        primaryKey: true,
      },
      Name: {
        type: Sequelize.STRING,
        allowNull: true,
        nonEmpty: true,
      },
      Amount: {
        type: Sequelize.STRING,
        allowNull: true,
        nonEmpty: true,
      }
    });
  };
  