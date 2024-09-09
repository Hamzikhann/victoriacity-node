const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Transactions = require("../../models/Transactions.js");
const UserRole = require("../../models/UserRole.js");
const { Op, Sequelize } = require("sequelize");

const {
	InstallmentReceipts,
	FileSubmissionDetail,
	FileSubmission,
	OpenFile,
	UnitType,
	PlotSize,
	Phase,
	PaymentPlan,
	Sector,
	Block,
	UnitNature,
	Payment_Mode,
	Booking,
	BookingInstallmentDetails,
	InstallmentType,
	Member,
	Voucher,
	TaxPayeeCategory,
	TaxTag,
	TRSRequest,
	SurCharge
} = require("../../models");
const User = require("../../models/User");
const pdfGenerator = require("../../services/PdfGenerator.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const { file } = require("pdfkit");
const Booking_Mst = require("../../models/Booking_Mst.js");
const BookingService = require("../../services/BookingService.js");

dotenv.config();

class TransactionController {
	static addTransaction = async (req, res, next) => {
		const { payeeName, bookingRegNo, recieptHead, paymentMode, amount, instrumentNo, instrumentNoDetail, description } =
			req.body;
		// console.log({
		//   payeeName,
		//   bookingRegNo,
		//   recieptHead,
		//   paymentMode,
		//   amount,
		//   instrumentNo,
		//   instrumentNoDetail,
		//   description,
		// });
		if (
			payeeName &&
			bookingRegNo &&
			recieptHead &&
			paymentMode &&
			amount &&
			instrumentNo &&
			instrumentNoDetail &&
			description
		) {
			try {
				const createTransaction = new Transactions({
					payeeName: payeeName,
					bookingRegNo: bookingRegNo,
					recieptHead: recieptHead,
					paymentMode: paymentMode,
					amount: amount,
					instrumentNo: instrumentNo,
					instrumentNoDetail: instrumentNoDetail,
					description: description
				});

				await createTransaction.save();

				return res.status(200).send({
					status: 200,
					message: "Add Transaction successfully",
					Transaction: createTransaction
				});
			} catch (error) {
				console.log(error);
				return res.status(400).send({
					status: 400,
					error: error,
					message: "Unable to Add Transaction"
				});
			}
		} else {
			return res.status(400).send({
				status: 400,
				message: "All fields are required"
			});
		}
	};
	// SEARCH Transaction BY ID
	static getTransactionById = async (req, res, next) => {
		const TransactionId = req.query.id;
		// console.log(req.query);
		// try {
		const TransactionById = await Transactions.findAll({
			where: { id: TransactionId }
		});
		if (TransactionById.length > 0) {
			res.status(200).send({
				status: 200,
				message: "get Transaction successfully",
				Transaction: TransactionById
			});
		} else {
			res.status(400).send({
				status: 404,
				message: "No Transaction Found against id"
			});
		}
		// } catch (error) {
		//     return next(error)
		// }
	};
	static getTransactionByBK_Reg_Code = async (req, res, next) => {
		let Reg_Code_Disply = req.query.Reg_Code_Disply;
		// console.log(req.query);
		try {
			const TransactionById = await InstallmentReceipts.findAll({
				include: [
					{ as: "Booking", model: Booking },
					{ as: "Payment_Mode", model: Payment_Mode },
					{
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails
					},
					{ as: "Installment_Type", model: InstallmentType },
					{ as: "Member", model: Member },
					{ as: "User", model: User }
				],
				// where: {  '$Booking.Reg_Code_Disply$': BK_Reg_Code },
				where: {
					"$Booking.Reg_Code_Disply$": {
						[Sequelize.Op.like]: `%${Reg_Code_Disply}%`
					}
				}
			});
			if (TransactionById.length > 0) {
				return res.status(200).send({
					status: 200,
					message: "get Transaction successfully",
					Transaction: TransactionById
				});
			} else {
				return res.status(400).send({
					status: 404,
					message: "No Transaction Found against BK_Reg_Code"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE Transactions
	static getAllTransactions = async (req, res) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;

		const userId = req.user.id;
		const role = req.user.role;
		const roleName = await UserRole.findAll({ where: { id: role } });

		let where = { IsDeleted: 0 };
		if (roleName.length > 0 && roleName[0].name !== "Admin") {
			where = {
				IsDeleted: 0,
				USER_ID: userId,
				[Op.or]: [{ AdminVarified: null }, { AdminVarified: 0 }]
			};
		}

		const { count, rows } = await InstallmentReceipts.findAndCountAll({
			include: [
				{ as: "Booking", model: Booking },
				{ as: "Payment_Mode", model: Payment_Mode },
				{ as: "Booking_Installment_Details", model: BookingInstallmentDetails },
				{ as: "Installment_Type", model: InstallmentType },
				{ as: "Member", model: Member },
				{ as: "User", model: User }
			],
			where: where,
			offset: limit * page,
			limit: limit,
			order: [["INS_RC_ID", "DESC"]]
		});
		// const allTransactions = await InstallmentReceipts.findAll();

		if (rows.length > 0) {
			res.status(200).send({
				status: 200,
				message: "Get all Transaction Successfully",
				Transactions: rows,
				totalPage: Math.ceil(count / limit) + 1,
				page: page,
				limit: limit,
				totalRecords: count
			});
		} else {
			res.status(404).send({
				status: 404,
				message: "No Transaction Found"
			});
		}
	};
	///UPDATE Transaction
	static updateTransaction = async (req, res, next) => {
		const { payeeName, bookingRegNo, recieptHead, paymentMode, amount, instrumentNo, instrumentNoDetail, description } =
			req.body;
		const TransactionId = req.query.id;
		try {
			const result = await Transactions.findAll({
				where: { id: TransactionId }
			});

			if (result) {
				const TransactionById = await Transactions.update(
					{
						payeeName: payeeName,
						bookingRegNo: bookingRegNo,
						recieptHead: recieptHead,
						paymentMode: paymentMode,
						amount: amount,
						instrumentNo: instrumentNo,
						instrumentNoDetail: instrumentNoDetail,
						description: description
					},
					{ where: { id: TransactionId } }
				);

				res.status(200).send({
					status: 200,
					message: " Transaction  updated successfully",
					"Updated Transaction": result
				});
			} else {
				res.status(200).send({
					status: 200,
					message: "No Transaction Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	/////Delete Transaction

	static deleteTransaction = async (req, res) => {
		const { id } = req.query;

		if (id) {
			try {
				const result = await Transactions.findAll({ where: { id: id } });

				if (result.length > 0) {
					Transactions.destroy({
						where: {
							id: id
						}
					});

					res.status(200).send({
						status: 200,
						message: "Transaction Deleted successfully",
						"Deleted Transaction": result
					});
				} else {
					res.status(400).send({
						status: 404,
						message: "Transaction not found"
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Deleted Transaction"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "ID IS REQUIRED"
			});
		}
	};

	static transactionPdf = async (req, res, next) => {
		let trsr_id = req.query.TRSR_ID;
		const id = req.query.id;
		let bk_id = req.query.BK_ID;

		let receipt_head = req.query.RECEIPT_HEAD;
		console.log("HEAAAAAAAAAAD", receipt_head);
		console.log("IddDDDDdD", id);
		let installmentReceipt;
		try {
			if (!trsr_id && id) {
				const iR = await InstallmentReceipts.findOne({
					where: { INS_RC_ID: id }
				});
				console.log("IRECCCCC", iR);

				if (iR && iR.RECEIPT_HEAD == "transfer_tax") {
					// receipt_head = iR.RECEIPT_HEAD;
					console.log("In Ir.RECiept Head")
					let voucherId = iR.voucher_ID;
					const trsrequest = await TRSRequest.findOne({
						where: {
							[Op.or]: [
								{
									VOUCHER_BUYER_ID: voucherId
								},
								{
									VOUCHER_SELLER_ID: voucherId
								}
							]
						}
					});
					// return next(CustomErrorHandler.notFound("Data not found = "+ trsrequest.TRSR_ID));
					if (trsrequest) {
						trsr_id = trsrequest.TRSR_ID;
					}
				}
			}

			if (trsr_id && receipt_head) {
				console.log("I amIn BhaiJAANNNNNNNN");
				const trsrequest = await TRSRequest.findOne({
					where: { TRSR_ID: trsr_id }
				});
				let arr = [];

				if (receipt_head == "transfer_tax") {
					arr.push(trsrequest.VOUCHER_BUYER_ID);
					arr.push(trsrequest.VOUCHER_SELLER_ID);
				} else if (receipt_head == "ndc_fee") {
					arr.push(trsrequest.VOUCHER_ID);
				} else if (receipt_head == "transfer_fee") {
					arr.push(trsrequest.VOUCHER_Transfer_FEE_ID);
				}

				installmentReceipt = await InstallmentReceipts.findAll({
					include: [
						{
							as: "Booking",
							model: Booking,
							include: [
								{ as: "UnitType", model: UnitType },
								{ as: "PlotSize", model: PlotSize }
							]
						},
						{ as: "Payment_Mode", model: Payment_Mode },
						{
							as: "Voucher",
							model: Voucher,
							include: [
								{ as: "TaxPayeeCategory", model: TaxPayeeCategory },
								{ as: "TaxTag", model: TaxTag }
							]
						},
						{
							as: "Booking_Installment_Details",
							model: BookingInstallmentDetails
						},
						{ as: "Installment_Type", model: InstallmentType },
						{ as: "Member", model: Member },
						{ as: "User", model: User }
					],
					where: { voucher_ID: arr },
					order: [["TIME_STAMP", "DESC"]]
				});
			} else {
				console.log("no one")
				let where = { INS_RC_ID: id };

				if (receipt_head != null && receipt_head != "") {
					where = { INS_RC_ID: id, RECEIPT_HEAD: receipt_head };
				}

				installmentReceipt = await InstallmentReceipts.findAll({
					include: [
						{
							as: "Booking",
							model: Booking,
							include: [
								{ as: "UnitType", model: UnitType },
								{ as: "PlotSize", model: PlotSize }
							]
						},
						{ as: "Payment_Mode", model: Payment_Mode },
						{
							as: "Voucher",
							model: Voucher,
							include: [
								{ as: "TaxPayeeCategory", model: TaxPayeeCategory },
								{ as: "TaxTag", model: TaxTag }
							]
						},
						{
							as: "Booking_Installment_Details",
							model: BookingInstallmentDetails
						},
						{ as: "Installment_Type", model: InstallmentType },
						{ as: "Member", model: Member },
						{ as: "User", model: User }
					],
					where: where,
					order: [["TIME_STAMP", "DESC"]]
				});
				console.log("InstallMentDetails", installmentReceipt[0])
			}

			// if (installmentReceipt.length == 0) {
			//   return next(CustomErrorHandler.notFound("Data not found!"));
			// }

			if (installmentReceipt.length == 0) {
				return next(CustomErrorHandler.notFound("Data not found! id = " + trsr_id));
			}

			if (!receipt_head) {
				console.log("IN REciept Head")
				receipt_head = installmentReceipt[0].RECEIPT_HEAD;
			}

			let pdf;
			receipt_head = "surCharge"; //  Changed for surcharge
			if (receipt_head == "ndc_fee") {
				let outstandingAmt = 0;
				let bookingO = installmentReceipt[0].Booking.BK_ID;

				const plans = await BookingInstallmentDetails.findAll({
					order: [["Installment_Code", "ASC"]],
					where: { BK_ID: bookingO }
				});

				const installmentPaidReceipts = await InstallmentReceipts.findAll({
					include: [{ as: "Installment_Type", model: InstallmentType }],
					where: { BK_ID: bookingO }
				});

				let remainingPaidOstBreak = 0;
				var remainingOstBreak = 0;
				var remainingOst = 0;
				var tillDatePaidAmt = 0;

				// plans.map(async (item, i) => {
				//   const instMonth = parseInt(
				//     item.Installment_Month ? item.Installment_Month.split("-")[1] : ""
				//   );
				//   const instYear = parseInt(
				//     item.Installment_Month ? item.Installment_Month.split("-")[0] : ""
				//   );

				//   const IROBJECTS = installmentPaidReceipts.filter(
				//     (el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID
				//   );

				//   if (remainingOstBreak == 0) {
				//     remainingOst += parseFloat(item.Installment_Due);

				//     for (var k = 0; k < IROBJECTS.length; k++) {
				//       if (
				//         remainingPaidOstBreak == 1 &&
				//         instMonth == new Date().getMonth() + 1 &&
				//         new Date().getFullYear() == instYear
				//       ) {
				//         remainingPaidOstBreak = 0;
				//       }

				//       if (remainingPaidOstBreak == 0) {
				//         tillDatePaidAmt += +IROBJECTS[k].Installment_Paid;
				//       }

				//       if (
				//         parseInt(instMonth) === new Date().getMonth() + 1 &&
				//         new Date().getFullYear() == instYear
				//       ) {
				//         remainingPaidOstBreak = 1;
				//       }
				//     }

				//   }

				//   if (
				//     instMonth == new Date().getMonth() + 1 &&
				//     new Date().getFullYear() == instYear
				//   ) {
				//     remainingOstBreak = 1;
				//   }

				//   // if(instYear == 2023 && instMonth == 9){
				//   // return res.status(200).json({
				//   //   status: 200,
				//   //   message: "Get File details successfully",
				//   //   file: { url: `${process.env.APP_URL}/${pdf}` },
				//   //   InstallmentReceipts:installmentReceipt,
				//   //   remainingOst: remainingOst,
				//   //   tillDatePaidAmt: tillDatePaidAmt,
				//   //   bookingO: bookingO,
				//   //   instMonth: instMonth,
				//   //   instYear: instYear,
				//   //   m: (new Date().getMonth()+1),
				//   //   y: (new Date().getFullYear())
				//   // });
				//   // }
				// });

				outstandingAmt = await BookingService.outStandingAmount(bookingO);
				const userobj = await User.findOne({ where: { id: req.user.id } });
				pdf = await pdfGenerator.NDC_Report_Generator(
					installmentReceipt[0],
					installmentReceipt,
					outstandingAmt,
					userobj
				);

				return res.status(200).json({
					status: 200,
					message: "Get File details successfully",
					file: { url: `${process.env.APP_URL}/${pdf}` },
					InstallmentReceipts: installmentReceipt,
					remainingOst: remainingOst,
					tillDatePaidAmt: tillDatePaidAmt,
					bookingO: bookingO
				});
			} else if (receipt_head == "installments" || receipt_head == "development_charges") {
				const trsrequest = [];
				pdf = await pdfGenerator.cashReceiptGeneratorOld(installmentReceipt[0], installmentReceipt, receipt_head);
			} else if (receipt_head == "transfer_tax") {
				let whereClause = { BK_ID: bk_id };

				if (trsr_id) {
					whereClause = { TRSR_ID: trsr_id };
				}
				const trsrequest = await TRSRequest.findOne({
					include: [
						{ as: "User", model: User },
						{ as: "VoucherBuyerTaxId", model: Voucher },
						{ as: "VoucherSellerTaxId", model: Voucher },
						{
							as: "Booking",
							model: Booking,
							include: [{ as: "Member", model: Member }]
						}
					],
					order: [["TRSR_ID", "DESC"]],
					where: whereClause
				});
				pdf = await pdfGenerator.cashReceiptGenerator(installmentReceipt[0], installmentReceipt, trsrequest);
			} else if(receipt_head == "surCharge") {
				console.log("IN surcharge")
				const booking = await Booking.findOne({
					where: {Reg_Code_Disply: installmentReceipt[0].Booking.Reg_Code_Disply},
				})
				// const latestSurcharge = await SurCharge.findOne({
				// 	where: { BK_ID: installmentReceipt[0].BK_ID },
				// 	order: [['createdAt', 'DESC']], // Sort by createdAt in descending order to get the latest record
				// 	include: [
				// 		{
				// 			model: Booking, // Include the Booking_Mst model
				// 			as: 'Booking',   // The alias should match the alias defined in the association
				// 			// attributes: ['totalSurcharges', 'remainingSurcharges', 'paidSurcharges'],
				// 		}
				// 	]
				// });
				console.log("Latest", booking);
				const pdfBody = {
					totalSurcharges: booking.totalSurcharges,
					remainingSurcharges: booking.remainingSurcharges,
					paidSurcharges: booking.paidSurcharges,
					BK_ID: booking.BK_ID,
					date: booking.updatedAt,
				}
				pdf = await pdfGenerator.SurchargeGenerator(installmentReceipt[0], pdfBody, installmentReceipt, receipt_head);
			} else {
				pdf = await pdfGenerator.transferFeeGenerator(installmentReceipt[0], installmentReceipt);
			}

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` },
				InstallmentReceipts: installmentReceipt
			});
		} catch (error) {
			return next(error);
		}
	};
}

module.exports = TransactionController;
