

module.exports = (sequelize, Sequelize) => {
  return sequelize.define("VOUCHER_MST", {
    VOUCHER_ID: {
      type: Sequelize.INTEGER(),
      autoIncrement: true,
      primaryKey: true,
    },
    VOUCHER_DATE: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      notEmpty: true,
    },
    VOUCHER_EXPIRY_DATE: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      notEmpty: true,
    },
    VOUCHER_NO: {
      type: Sequelize.INTEGER(),
      allowNull: true,
      notEmpty: true,
    },
    PAYEE_NAME: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    Vouch_Type_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    IRH_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    BK_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    BK_Reg_Code: {
      type: Sequelize.DECIMAL,
      allowNull: true,
      notEmpty: true,
    },
    Reg_Code_Disply: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    VR_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    NDC_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    TPC_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    TT_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    TRSR_ID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    Description: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    PMID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    CHQUE_DATE: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      notEmpty: true,
    },
    CHEQUE_NO: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    INSTRUMENT_NO: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    
    CREDIT: {
      type: Sequelize.INTEGER,
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
    USER_ID: {
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
    Cnic: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    Address: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    IsDeleted: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      notEmpty: true,
      defaultValue:0
    },
    Assign_BY: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },

  })
};




