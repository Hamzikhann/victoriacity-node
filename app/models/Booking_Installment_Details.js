module.exports = (sequelize, Sequelize) => {
	return sequelize.define(
		"booking_installment_details",
		{
			BKI_DETAIL_ID: {
				type: Sequelize.INTEGER(),
				autoIncrement: true,
				primaryKey: true
			},
			Installment_Code: {
				type: Sequelize.INTEGER(),
				allowNull: true,
				notEmpty: true
			},
			Due_Date: {
				type: Sequelize.DATEONLY,
				defaultValue: Sequelize.NOW
			},
			Installment_Month: {
				type: Sequelize.DATEONLY,
				defaultValue: Sequelize.NOW
			},
			BK_ID: {
				type: Sequelize.INTEGER,
				allowNull: true,
				notEmpty: true
			},
			BK_Reg_Code: {
				type: Sequelize.INTEGER,
				allowNull: true,
				notEmpty: true
			},
			InsType_ID: {
				type: Sequelize.INTEGER,
				allowNull: true,
				notEmpty: true
			},
			Installment_Due: {
				type: Sequelize.DECIMAL,
				allowNull: true,
				notEmpty: true
			},
			Installment_Paid: {
				type: Sequelize.DECIMAL,
				allowNull: true,
				notEmpty: true
			},
			Remaining_Amount: {
				type: Sequelize.DECIMAL,
				allowNull: true,
				notEmpty: true
			},
			IsCompleted: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				notEmpty: true
			},
			MEMBER_ID: {
				type: Sequelize.INTEGER,
				allowNull: true,
				notEmpty: true
			},
			USER_ID: {
				type: Sequelize.INTEGER,
				allowNull: true,
				notEmpty: true
			},
			TIME_STAMP: {
				type: Sequelize.DATE,
				allowNull: true,
				notEmpty: true
			},
			LAST_UPDATE: {
				type: Sequelize.DATE,
				allowNull: true,
				notEmpty: true
			},
			BKI_TYPE: {
				type: Sequelize.STRING,
				allowNull: true,
				notEmpty: true
			},
			IsDeleted: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				notEmpty: true,
				defaultValue: 0
			},
			Status: {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			},
			surCharges: Sequelize.INTEGER
		}
		// {
		// 	indexes: [
		// 		{
		// 			fields: ["BKI_DETAIL_ID"] // Primary Key index is created by default
		// 		},
		// 		{
		// 			fields: ["BK_ID"] // Often queried by booking ID
		// 		},
		// 		{
		// 			fields: ["Installment_Code"] // To quickly access based on installment codes
		// 		},
		// 		{
		// 			fields: ["USER_ID"] // Indexing user for user-based lookups
		// 		},
		// 		{
		// 			fields: ["Due_Date"] // For querying installments due in a specific time range
		// 		},
		// 		{
		// 			fields: ["Status"] // Status field for incomplete or completed installments
		// 		}
		// 	]
		// }
	);
};
