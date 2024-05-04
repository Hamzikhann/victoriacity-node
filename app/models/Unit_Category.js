

module.exports = (sequelize, Sequelize) => {
    return sequelize.define("unit_category", {
        CAT_ID: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        CAT_Name: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        Abbrev: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        Status: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true,
            defaultValue: 0,
        },
        IsDeleted: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            notEmpty: true,
            defaultValue: 0,
        },
    });
}

