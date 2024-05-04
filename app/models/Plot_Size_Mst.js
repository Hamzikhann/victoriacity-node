
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Plot_Size_Mst", {
        PS_ID: {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey: true,
        },
        Name: {
            type: Sequelize.STRING,
            allowNull: false,
            notEmpty: true,
        },
        Size_Marla: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            notEmpty: true,
        },
        Size_SQF: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            notEmpty: true,
        },
        IsActive: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true
        }
    })
}

