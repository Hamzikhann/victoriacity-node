
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Block_Mst", {
        BLK_ID: {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey: true,
        },
        Name: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        SECT_ID: {
            type: Sequelize.STRING,
            allowNull: true,
            notEmpty: true,
        },
        Status: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            notEmpty: true,
            defaultValue: 0
        }
    })
   
}

