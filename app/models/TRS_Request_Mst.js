module.exports = (sequelize, Sequelize) => {
  return sequelize.define("TRS_Request_Mst", {
    TRSR_ID: {
      type: Sequelize.INTEGER(),
      autoIncrement: true,
      primaryKey: true,
    },
    TRSR_NO: {
      type: Sequelize.INTEGER(),
      allowNull: true,
      notEmpty: true,
    },
    TRSR_DATE: {
      type: Sequelize.DATE,
      allowNull: true,
      notEmpty: true,
    },
    Expire_Date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      notEmpty: true,
    },
    Descrip: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    BK_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    BK_Reg_Code: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    Reg_Code_Disply: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    VOUCHER_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    VOUCHER_Transfer_FEE_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    VOUCHER_BUYER_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    VOUCHER_SELLER_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    FC_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    IsApproved: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      notEmpty: true,
    },
    IsCompleted: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      notEmpty: true,
    },
    AdminVarified: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      notEmpty: true,
    },
    COMPANY_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    PR_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    FISCAL_YEAR_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },

    status: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    USER_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },

    BUYER_MEMBER_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    BUYER_MEMBER_NOMINEE_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    BUYER_SECOND_MEMBER_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    ASSIGN_BY: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    TIME_STAMP: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      notEmpty: true,
    },
    LAST_UPDATE: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      notEmpty: true,
    },
    IsDeleted: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      notEmpty: true,
      defaultValue: 0,
    },
  });
};
