const { InstallmentType } = require(".");
const accounttransaction = require("./AccountTransaction");
const incomecategory = require("./IncomeCategories");

module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    "Installment_Receipts",
    {
      INS_RC_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      INSTRUMENT_DETAILS: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      RECEIPT_HEAD: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      INSTRUMENT_DATE: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      IRC_NO: {
        type: Sequelize.INTEGER(),
        allowNull: false,
        notEmpty: true,
      },
      IRC_Date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        notEmpty: true,
      },
      BK_ID: {
        type: Sequelize.INTEGER(),
        allowNull: true,
        notEmpty: true,
      },
      voucher_ID: {
        type: Sequelize.INTEGER(),
        allowNull: true,
        notEmpty: true,
      },
      BK_Reg_Code: {
        type: Sequelize.INTEGER(),
        allowNull: true,
        notEmpty: true,
      },
      BKI_DETAIL_ID: {
        type: Sequelize.STRING,
        allowNull: true,
        notEmpty: true,
      },
      Installment_Code: {
        type: Sequelize.INTEGER(),
        allowNull: true,
        notEmpty: true,
      },
      Installment_Month: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        notEmpty: true,
      },
      InsType_ID: {
        type: Sequelize.INTEGER(),
        allowNull: true,
        notEmpty: true,
      },
      MEMBER_ID: {
        type: Sequelize.INTEGER(),
        allowNull: true,
        notEmpty: true,
      },
      PMID: {
        type: Sequelize.INTEGER(),
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
      Installment_Due: {
        type: Sequelize.DECIMAL,
        allowNull: true,
        notEmpty: true,
        default: 0,
      },
      Installment_Paid: {
        type: Sequelize.DECIMAL,
        allowNull: true,
        notEmpty: true,
        default: 0,
      },
      Remaining_Amount: {
        type: Sequelize.DECIMAL,
        allowNull: true,
        notEmpty: true,
        default: 0,
      },
      Received_Total_Amount: {
        type: Sequelize.DECIMAL,
        allowNull: true,
        notEmpty: true,
        default: 0,
      },
      Remarks: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: true,
      },
      AdminVarified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        notEmpty: true,
      },
      IsCompleted: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        notEmpty: true,
      },
      USER_ID: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: true,
      },
      TIME_STAMP: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      LAST_UPDATE: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      IsDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        notEmpty: true,
        default: 0,
      },
    },
    {
      timestamps: false,
      // hooks: {
      //   beforeCreate: async (record, options) => {
      //     const installmentType = await InstallmentType.findOne({
      //       where: { InsType_ID: record.InsType_ID },
      //     });
      //     if (installmentType) {
      //       const findCat = await incomecategory.findOne({
      //         where: { title: installmentType.Name },
      //       });
      //       if (findCat) {
      //           let balance = await accounttransaction.max("balance", {
      //               where: { type: "Income", projectId: 2 },
      //             });
      //         await accounttransaction.create({
      //           ledgerNo: record.INS_RC_ID,
      //           amount: record.Installment_Paid,
      //           balance: balance + record.Installment_Paid,
      //           categoryId: findCat.id,
      //           date: record.IRC_Date, 
      //           pmId: record.PMID,
      //           type: "Income",
      //           receiptId: record.INS_RC_ID,
      //           description: record.INSTRUMENT_NO,
      //           projectId: 2
      //         });
      //       }
      //     }
      //   },
      // },
    },
  );
};
