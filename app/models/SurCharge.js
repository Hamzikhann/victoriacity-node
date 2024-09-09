
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("SurCharge", {
        SC_ID: {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey: true
        },
        amount: {
            type: Sequelize.INTEGER,
            allowNull: true,
			notEmpty: true,
            defaultValue: 0
        },
        waveOff: {
            type: Sequelize.INTEGER,
            allowNull: true,
			notEmpty: true,
            defaultValue: 0
        },
        paidAt: {
            type: Sequelize.DATE,
            allowNull: true,
			notEmpty: true,
        },
        BK_ID: {
            type: Sequelize.INTEGER,
            allowNull: true,
			notEmpty: true
        }
    });
};