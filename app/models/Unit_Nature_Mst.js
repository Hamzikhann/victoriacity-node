

module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Unit_Nature_Mst", {
      NType_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Name: {
        type: Sequelize.STRING,
        allowNull: true,
        notEmpty: true,
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
        defaultValue: 0,
      },
    });
}

