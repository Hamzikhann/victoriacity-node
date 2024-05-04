
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Payment_PlanPack_Mst", {
        PP_ID: {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey: true
        },
        PP_Code: {
            type: Sequelize.INTEGER(),
            allowNull: true,
            notEmpty: true,
        },
        Name: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        Auto_Name: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        INS_Start_Date: {
            type: Sequelize.DATEONLY,
            notEmpty: true
        },
        PS_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        UType_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            notEmpty: true,
        },
        DC_START_DATE: {
            type: Sequelize.DATEONLY,
            notEmpty: true
        },
        DC_NO_OF_INSTALLMENT: {
            type: Sequelize.INTEGER(11),
            allowNull: true
        },
        DC_INSTALLMENT_AMOUNT: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },
        DC_TOTAL_AMOUNT: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },

        Total_Amt: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },
        Advance_Amt: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },
        TotalRemainNet_Amt: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },
        Ballot_Amt: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },
        Possession_Amt: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },

        ByAnnual_Charges: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },
        ByAnnual_TimePeriod: {
            type: Sequelize.INTEGER(11),
            allowNull: true
        },
        InstallmentAmount: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },
        No_Of_Installments: {
            type: Sequelize.INTEGER(11),
            allowNull: true
        },
        Plan_Years: {
            type: Sequelize.INTEGER(11),
            allowNull: true
        },
        USER_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true
        },
        IncludeDC: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true,
            defaultValue: 1
        },
        IncludeLC: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true,
            defaultValue: 1
        },
        downPayment: {
            type: Sequelize.DECIMAL,
            allowNull: true
        },
        IsActive: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true,
            defaultValue: 1
        },
        IsDeleted: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true,
            defaultValue: 0
        }

    })
}