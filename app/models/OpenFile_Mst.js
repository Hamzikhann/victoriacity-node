
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("OpenFile_Mst", {
        OF_ID: {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey: true,
        },
        OF_MaxCode: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        UType_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        PS_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        PP_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        PHS_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        SECT_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        BK_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        NType_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        USER_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        SR_Name: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        SR_Prefix: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        SRForm_No: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        SR_Start: {
            type: Sequelize.DECIMAL,
            allowNull: true,
            notEmpty: true,
        },
        SR_End: {
            type: Sequelize.DECIMAL,
            allowNull: true,
            notEmpty: true,
        },
        Code_Prefix: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        Code_Start: {
            type: Sequelize.DECIMAL,
            allowNull: true,
            notEmpty: true,
        },
        Form_Code: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        LAST_Verified: {
            type: Sequelize.DATE,
            allowNull: true,
            notEmpty: true,

        },
        Verify_Count: {
            type: Sequelize.INTEGER,
            allowNull: true,
            notEmpty: true,

        },
        IsDeleted: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true,
            defaultValue: 0
        }
    }, {
        timestamps: true,
    });
}
