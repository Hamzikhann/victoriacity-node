module.exports = (sequelize, Sequelize) => {
	return sequelize.define("restorationfee", {
		id: {
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

		paidAt: {
			type: Sequelize.DATE,
			allowNull: true,
			notEmpty: true
		},
		BK_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		}
	});
};
