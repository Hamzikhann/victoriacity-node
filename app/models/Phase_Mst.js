module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Phase_Mst", {
        PHS_ID: {
            type: Sequelize.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
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
        },
       
    })
}

