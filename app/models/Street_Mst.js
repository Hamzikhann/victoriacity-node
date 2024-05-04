
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Street_Mst", {
        ST_ID: {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey: true,
        },
        ST_Code: {
            type: Sequelize.INTEGER(),
            allowNull: true,

        },
        Name: {
            type: Sequelize.STRING,
            allowNull: false,
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
