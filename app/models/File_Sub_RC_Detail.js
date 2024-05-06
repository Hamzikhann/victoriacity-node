module.exports = (sequelize, Sequelize) => {
	return sequelize.define(
		"file_sub_rc_detail",
		{
			FSRC_DETAIL_ID: {
				type: Sequelize.INTEGER(),
				autoIncrement: true,
				primaryKey: true
			},
			FSRC_ID: {
				type: Sequelize.INTEGER(11)
			},
			OF_ID: {
				type: Sequelize.INTEGER(11),
				allowNull: true,
				notEmpty: true
			},
			SRForm_No: {
				type: Sequelize.STRING,
				allowNull: true,
				notEmpty: true
			},
			Form_Code: {
				type: Sequelize.STRING,
				allowNull: true,
				notEmpty: true
			},
			UType_ID: {
				type: Sequelize.INTEGER(11),
				allowNull: true,
				notEmpty: true
			},
			PS_ID: {
				type: Sequelize.INTEGER(11),
				allowNull: true,
				notEmpty: true
			},
			USER_ID: {
				type: Sequelize.INTEGER(11),
				allowNull: true,
				notEmpty: true
			},
			TIME_STAMP: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW
			},
			LAST_UPDATE: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW
			},
			IsDeleted: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				notEmpty: true,
				defaultValue: 0
			},
			IsBooked: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				notEmpty: true,
				defaultValue: 0
			}
		},
		{
			timestamps: false
		}
	);
};
