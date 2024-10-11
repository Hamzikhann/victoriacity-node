const { DataTypes } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
	return sequelize.define("Booking_Mst", {
		BK_ID: {
			type: Sequelize.INTEGER(),
			autoIncrement: true,
			primaryKey: true
		},
		BK_Reg_Code: {
			type: Sequelize.INTEGER(),
			allowNull: true,
			notEmpty: true
		},
		BK_Date: {
			type: Sequelize.DATEONLY,
			defaultValue: Sequelize.NOW
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
		MEMBER_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		MN_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		UType_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		PS_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		PHASE_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: false
		},
		SECTOR_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: false
		},
		PP_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		BKType_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		Dealer_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		CommissionAgentID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		PMID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		CHQUE_DATE: {
			type: Sequelize.DATE,
			allowNull: true,
			notEmpty: true
		},
		CHEQUE_NO: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		INSTRUMENT_NO: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		Total_Amt: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		Advance_Amt: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		Rebate_Amt: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		TotalRemainNet_Amt: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		Discount_Amt: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		Total_Payable_Net_Amt: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		Ballot_Amt: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		Possession_Amt: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		ByAnnual_Charges: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		ByAnnual_TimePeriod: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		InstallmentAmount: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		No_Of_Installments: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		Plan_Years: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		IsCompPaid: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			notEmpty: true
		},
		AdminVarified: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			notEmpty: true
		},
		USER_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		Unit_ID: {
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
		IsDeleted: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			notEmpty: true,
			defaultValue: 0
		},
		Reg_Code_Disply: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		Sec_MEM_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		NType_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		Location_ID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: true
		},
		Discount_PerAge: {
			type: Sequelize.DECIMAL,
			allowNull: true,
			notEmpty: true
		},
		Status: {
			type: DataTypes.ENUM("Active", "InActive", "Blocked", "Merged"),
			allowNull: false,
			notEmpty: true,
			defaultValue: "Active"
		},
		MERGED_VCNO: {
			type: Sequelize.STRING,
			allowNull: true,
			notEmpty: true
		},
		Ost_Amount: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			notEmpty: true,
			defaultValue: 1
		},
		totalSurcharges: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: false,
			defaultValue: 0
		},
		remainingSurcharges: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: false,
			defaultValue: 0
		},
		paidSurcharges: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: false,
			defaultValue: 0
		},
		outstandingTillDate: {
			type: Sequelize.INTEGER,
			allowNull: true,
			notEmpty: false,
			defaultValue: 0
		}
	});
};
