
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("calendarreminders", {
        CR_ID: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Summary: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        Description: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        Start_Date: {
            type: Sequelize.DATE,
            allowNull: true,
            notEmpty: true,
        },
        End_Date: {
            type: Sequelize.DATE,
            allowNull: true,
            notEmpty: true,
        },
        USER_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true
        },
        COMMENT_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true
        },
        BK_ID: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true
        },
    })
}