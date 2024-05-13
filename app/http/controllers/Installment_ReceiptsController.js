const { InstallmentReceipts, Member, Payment_Mode, Booking } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const { Sequelize, Op } = require("sequelize");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Upload = require("../middlewares/Storages");
const pdfGenerator = require("../../services/PdfGenerator.js");
const User = require("../../models/User");
class InstallmentReceiptsController {
	static create = async (req, res, next) => {
		// console.log("hello")
		const {
			IRC_Date,
			BK_ID,
			BK_Reg_Code,
			BKI_DETAIL_ID,
			Installment_Code,
			Installment_Month,
			InsType_ID,
			MEMBER_ID,
			PMID,
			CHQUE_DATE,
			CHEQUE_NO,
			INSTRUMENT_NO,
			Installment_Due,
			RECEIPT_HEAD,
			Installment_Paid,
			Remaining_Amount,
			Remarks,
			AdminVarified,
			IsCompleted,
			USER_ID
		} = req.body;

		if (
			!(
				IRC_Date &&
				BK_ID &&
				BK_Reg_Code &&
				BKI_DETAIL_ID &&
				Installment_Code &&
				Installment_Month &&
				InsType_ID &&
				MEMBER_ID &&
				PMID &&
				CHQUE_DATE &&
				CHEQUE_NO &&
				INSTRUMENT_NO &&
				Installment_Due &&
				Installment_Paid &&
				Remaining_Amount &&
				Remarks &&
				USER_ID
			)
		) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}
		try {
			let maxId = await InstallmentReceipts.max("IRC_NO");
			const [row, created] = await InstallmentReceipts.findOrCreate({
				where: { IRC_NO: ++maxId || 1 },
				defaults: {
					IRC_Date,
					BK_ID,
					BK_Reg_Code,
					BKI_DETAIL_ID,
					Installment_Code,
					Installment_Month,
					InsType_ID,
					MEMBER_ID,
					PMID,
					CHQUE_DATE,
					CHEQUE_NO,
					INSTRUMENT_NO,
					Installment_Due,
					RECEIPT_HEAD,
					Installment_Paid,
					Remaining_Amount,
					Remarks,
					AdminVarified,
					IsCompleted,
					USER_ID
				}
			});
			if (!created) {
				return next(CustomErrorHandler.alreadyExist());
			}
			res.status(200).json({
				status: 200,
				message: "Add File Submission successfully",
				installmentReceipts: row
			});
		} catch (error) {
			return next(error);
		}
	};
	// SEARCH file BY ID
	static getInstallmentReceiptsById = async (req, res, next) => {
		const installmentReceiptsId = req.query.id;

		try {
			const installment = await InstallmentReceipts.findOne({ where: { INS_RC_ID: installmentReceiptsId } });
			if (!installment) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get InstallmentReceipts successfully",
				InstallmentReceipts: installment
			});
		} catch (error) {
			return next(error);
		}
	};
	// Search File by BK_ID
	static getInstallmentReceiptsByBK_ID = async (req, res, next) => {
		const installmentReceipts_BK_ID = req.query.id;

		try {
			const installment = await InstallmentReceipts.findAll({ where: { BK_ID: installmentReceipts_BK_ID } });
			if (!installment.length > 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get InstallmentReceipts successfully",
				InstallmentReceipts: installment
			});
		} catch (error) {
			return next(error);
		}
	};

	//
	static getInstallmentReceiptsByBK_Reg_Code = async (req, res, next) => {
		const BK_Reg_Code = req.query.BK_Reg_Code;

		try {
			const installment = await InstallmentReceipts.findAll({ where: { BK_Reg_Code: BK_Reg_Code } });
			if (!installment.length > 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get InstallmentReceipts successfully",
				InstallmentReceipts: installment
			});
		} catch (error) {
			return next(error);
		}
	};
	///
	static getInstallmentReceipts = async (req, res, next) => {
		try {
			const installment = await InstallmentReceipts.findAll();

			if (!installment) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get Installment_Receipts successfully",
				InstallmentReceipts: installment
			});
		} catch (error) {
			return next(error);
		}
	};
	/////////////////////////
	static getUnVarifiedReceipts = async (req, res, next) => {
		try {
			const installment = await InstallmentReceipts.findAll({
				include: [
					{ as: "Member", model: Member },
					{ as: "Payment_Mode", model: Payment_Mode }
				],
				where: {
					[Op.or]: [{ AdminVarified: null }, { AdminVarified: 0 }]
				}
			});

			// const installment = await InstallmentReceipts.findAll({  where: {
			//   [Op.or]: [
			//     { AdminVarified: null },
			//     { AdminVarified: 0 }
			//   ]
			// } });

			if (!installment) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get Installment_Receipts successfully",
				InstallmentReceipts: installment
			});
		} catch (error) {
			return next(error);
		}
	};
	////////////////////////////////////////////////

	static getUnVarifiedReceiptsPdf = async (req, res, next) => {
		try {
			// const checkedIds  = req.query.id.split(',');
			const { checkedIds } = req.body;

			const installment = await InstallmentReceipts.findAll({
				include: [
					{ as: "Member", model: Member },
					{ as: "Payment_Mode", model: Payment_Mode }
				],
				where: {
					INS_RC_ID: checkedIds,
					[Op.or]: [{ AdminVarified: null }, { AdminVarified: 0 }]
				}
			});

			if (!installment) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			const pdf = await pdfGenerator.getUnVarifiedReceiptsPdf(installment);

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` },
				installment: installment
			});
		} catch (error) {
			return next(error);
		}
	};

	static getUnVarifiedPdfByUsers = async (req, res, next) => {
		try {
			// const checkedIds  = req.query.id.split(',');
			const { checkedIds } = req.body;
			const installment = await InstallmentReceipts.findAll({
				include: [
					{ as: "Member", model: Member },
					{ as: "Payment_Mode", model: Payment_Mode },
					{ as: "User", model: User },
					{ as: "Booking", model: Booking }
				],
				where: {
					INS_RC_ID: checkedIds,
					[Op.or]: [{ AdminVarified: null }, { AdminVarified: 0 }]
				},
				raw: true
			});
			let grandTotalAmount = 0;
			const groupedData = installment.reduce((acc, item) => {
				const { USER_ID, ...rest } = item;
				if (!acc[USER_ID]) {
					acc[USER_ID] = { payOrderTotal: 0, total: 0, items: [] }; // Initialize totalAmount, totalQuantity, and items array
				}
				acc[USER_ID].payOrderTotal += +item.Installment_Due; // Add the amount to totalAmount
				acc[USER_ID].total += +item.Installment_Paid; // Add the quantity to total
				acc[USER_ID].items.push({
					...rest,
					payOrderTotal: +item.Installment_Due + acc[USER_ID].payOrderTotal,
					total: +item.Installment_Paid + acc[USER_ID].total
				}); // Push the item with updated totalAmount and totalQuantity

				grandTotalAmount += +item.Installment_Paid;
				return acc;
			}, {});

			// Sort items within each user's group by planId
			for (const userId in groupedData) {
				groupedData[userId].items.sort((a, b) => a.PMID - b.PMID);
			}

			// console.log(groupedData);

			if (!installment) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			const pdf = await pdfGenerator.getUnVarifiedPdfByUser(groupedData, grandTotalAmount);

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` },
				installment: groupedData
			});
		} catch (error) {
			return next(error);
		}
	};
	//////////////////////////////////////
	static updateUnVarifiedReceipts = async (req, res, next) => {
		try {
			const { checkedIds } = req.body; // Assuming the checked item IDs are sent in the request body
			// Perform the update based on the checked IDs
			const updatedReceipts = await InstallmentReceipts.update(
				{ AdminVarified: 1 }, // Update AdminVarified to 1 to mark it as verified
				{ where: { INS_RC_ID: checkedIds, AdminVarified: { [Op.or]: [null, 0] } } } // Update only the matching IDs that are unverified
			);

			if (updatedReceipts[0] === 0) {
				return res.status(400).json({ message: "No Receipt Found To Update" });
			}

			const updatedData = await InstallmentReceipts.findAll({ where: { INS_RC_ID: checkedIds } });

			return res.status(200).json({
				status: 200,
				message: "Receipts updated successfully",
				updatedReceipts: updatedData
			});
		} catch (error) {
			return next(error);
		}
	};
	//////////////////////////////////////////////

	///UPDATE file
	static update = async (req, res, next) => {
		const installmentId = req.query.id;
		let result;
		try {
			const exist = await InstallmentReceipts.findOne({ where: { INS_RC_ID: installmentId } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			result = await InstallmentReceipts.update(
				{ ...req.body, LAST_UPDATE: Date.now() },
				{ where: { INS_RC_ID: installmentId }, returning: true }
			);
			res.status(200).json({
				status: 200,
				message: " Installment Receipts updated successfully",
				"Updated Installment Receipts": result
			});
		} catch (error) {
			return next(error);
		}
	};
	/////Delete FileIssue
	static deleteInstallmentReceipts = async (req, res, next) => {
		const { id } = req.query;
		let data;
		try {
			const exist = await InstallmentReceipts.findOne({ where: { INS_RC_ID: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			if (!exist.IsDeleted) {
				data = await InstallmentReceipts.update({ IsDeleted: 1 }, { where: { INS_RC_ID: id }, returning: true });
			}
			res.status(200).json({
				status: 200,
				message: "Installment Receipts Deleted successfully",
				"Deleted Installment Receipts": data
			});
		} catch (error) {
			return next(error);
		}
	};
}

module.exports = InstallmentReceiptsController;
