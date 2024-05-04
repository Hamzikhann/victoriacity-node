module.exports = (sequelize, Sequelize) => {
  return sequelize.define("NDC_Charges_MST", {
    NDC_ID: {
      type: Sequelize.INTEGER(),
      autoIncrement: true,
      primaryKey: true,
    },
    FC_ID: {
      type: Sequelize.INTEGER(),
      allowNull: false,
      nonEmpty: false,
    },
    Name: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    Fee_Amt: {
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
  });
};
