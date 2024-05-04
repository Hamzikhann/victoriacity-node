
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Sector_Mst", {
        SECT_ID: {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey: true,
        },
        PHS_ID: {
            type: Sequelize.INTEGER(),
            allowNull: true,

        },
        NAME: {
            type: Sequelize.STRING,
            allowNull: false,
            notEmpty: true,
        },
        ABBRE: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        IsActive: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true,
            defaultValue:0
        }
    })
}
