

module.exports = (sequelize, Sequelize) => {
    return sequelize.define("unit_mst", {
      ID: {
        type: Sequelize.INTEGER(),
        autoIncrement: true,
        primaryKey: true,
      },
      Unit_Code: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      Plot_No: {
        type: Sequelize.STRING,
        allowNull: true,
        notEmpty: true,
      },
      NameAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        notEmpty: true,
      },
      Length: {
        type: Sequelize.DECIMAL,
        allowNull: true,
        notEmpty: true,
      },
      Width: {
        type: Sequelize.DECIMAL,
        allowNull: true,
        notEmpty: true,
      },
      AreaMeasure: {
        //buyer contact
        type: Sequelize.DECIMAL,
        allowNull: true,
        notEmpty: true,
      },
      MeterRef_No: {
        type: Sequelize.STRING,
        allowNull: true,
        nonEmpty: true,
      },
      Ref_No: {
        type: Sequelize.STRING,
        allowNull: true,
        nonEmpty: true,
      },
      BLK_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      S_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      PHS_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      SECT_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      NType_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      ST_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      FL_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      UType_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      PS_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      CAT_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      C_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      MEMBER_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      MN_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        notEmpty: true,
      },
      IsActive: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        notEmpty: true,
        defaultValue: 0,
      },
      IsAvailable: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        notEmpty: true,
      },
      IsDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        notEmpty: true,
        defaultValue: 0
      },
      IsPossession: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        notEmpty: true,
      },
    });
};




