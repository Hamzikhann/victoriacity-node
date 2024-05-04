module.exports = (sequelize, Sequelize) => {
    return sequelize.define("TRS_Fee_Struct_Mst", {
      TRFS_ID: {
        type: Sequelize.INTEGER(),
        autoIncrement: true,
        primaryKey: true,
      },
      Name: {
        type: Sequelize.STRING,
        allowNull: true,
        nonEmpty: true,
      },
      PS_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      UType_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      Type: {
        type: Sequelize.STRING,
        allowNull: true,
        notEmpty: true,
      },
      Amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        notEmpty: true,
      }
    });
  };
  