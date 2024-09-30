module.exports = (sequelize, Sequelize) => {
	return sequelize.define("calendarreminders", {
		CR_ID: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		Summary: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		Description: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		Start_Date: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		End_Date: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		reminderTime: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		USER_ID: {
			type: Sequelize.INTEGER(11),
			allowNull: true,
			notEmpty: true
		},
		BK_ID: {
			type: Sequelize.INTEGER(11),
			allowNull: true,
			notEmpty: true
		},
		Event_ID: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		status: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			notEmpty: true,
			default: "Y"
		}
	});
};
