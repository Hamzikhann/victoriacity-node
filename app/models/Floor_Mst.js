
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("floor_mst", {
        FL_ID: {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey: true,
        },
        Name: {
            type: Sequelize.STRING,
            allowNull: false,
            notEmpty: true,
        },
        Abbrev: {
            type: Sequelize.STRING,
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

