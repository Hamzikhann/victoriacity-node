module.exports = (sequelize, Sequelize) => {
	return sequelize.define("calendarcomments", {
		Comment: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		callDisposition: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		CR_ID: {
			type: Sequelize.INTEGER(11),
			allowNull: true,
			notEmpty: true
		},
		USER_ID: {
			type: Sequelize.INTEGER(11),
			allowNull: true,
			notEmpty: true
		},
	});
};
