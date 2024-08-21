const { Op } = require("sequelize");
const {
	TRSRequest,
	Booking,
	Voucher,
	Member,
	MemNominee,
	UnitType,
	PlotSize,
	PaymentPlan,
	UnitNature,
	Sector,
	Phase,
	BookingInstallmentDetails,
	InstallmentReceipts,
	InstallmentType
} = require("../models");
const User = require("../models/User");
const pdfGenerator = require("./PdfGenerator");

class BookingService {
	static ndcFee = async (body) => {
		const currentDate = new Date();
		const expireDate = currentDate.setDate(currentDate.getDate() + 21);
		try {
			const BookingO = await Booking.findOne({ where: { BK_ID: body.BK_ID } });
			const member = await Member.findOne({
				where: { MEMBER_ID: body.Member_id }
			});
			const TRSRequestRes = await TRSRequest.findOne({
				where: { BK_ID: body.BK_ID, status: [0, 1, 2, 3, 4] }
			});
			if (!TRSRequestRes || new Date(TRSRequestRes.Expire_Date) < new Date()) {
				let TRSRequestMaxId = await TRSRequest.max("TRSR_NO");
				const data = await TRSRequest.create({
					TRSR_NO: ++TRSRequestMaxId || 1,
					TRSR_DATE: new Date(),
					Expire_Date: expireDate,
					Descrip: body.description,
					BK_ID: body.BK_ID,
					FC_ID: body.NDC_ID,
					BK_Reg_Code: BookingO.BK_Reg_Code,
					Reg_Code_Disply: BookingO.Reg_Code_Disply,
					IsApproved: 1,
					IsCompleted: 1,
					AdminVarified: 0,
					COMPANY_ID: 1,
					PR_ID: 1,
					FISCAL_YEAR_ID: 1,
					USER_ID: body.userId,
					TIME_STAMP: new Date(),
					LAST_UPDATE: new Date(),
					status: 0
				});
				const jsonData = data.toJSON();
				if (jsonData) {
					let maxId = await Voucher.max("VOUCHER_NO");
					const voucherData = await Voucher.create({
						VOUCHER_NO: ++maxId || 1,
						VOUCHER_DATE: new Date(),
						VOUCHER_EXPIRY_DATE: expireDate,
						PAYEE_NAME: member.BuyerName,
						BK_ID: body.BK_ID,
						BK_Reg_Code: jsonData.BK_Reg_Code,
						Reg_Code_Disply: jsonData.Reg_Code_Disply,
						NDC_ID: body.NDC_ID,
						TRSR_ID: jsonData.TRSR_ID,
						Description: body.description,
						PMID: BookingO.PMID,
						INSTRUMENT_NO: body.instrument_no,
						DEBIT: body.amount,
						CREDIT: 0.0,
						COMPANY_ID: 1,
						USER_ID: body.userId,
						TIME_STAMP: new Date(),
						LAST_UPDATE: new Date()
					});

					TRSRequest.update(
						{
							VOUCHER_ID: voucherData.VOUCHER_ID
						},
						{ where: { TRSR_ID: jsonData.TRSR_ID } }
					);

					let maxInstallment_Code = await InstallmentReceipts.max("Installment_Code");
					maxInstallment_Code = maxInstallment_Code + 1;

					let maxIRCId = await InstallmentReceipts.max("IRC_NO");
					maxIRCId = maxIRCId + 1;

					var [row, created] = await InstallmentReceipts.findOrCreate({
						where: { IRC_NO: maxIRCId || 1 },
						defaults: {
							IRC_NO: maxIRCId,
							IRC_Date: new Date(),
							BK_ID: body.BK_ID,
							BK_Reg_Code: jsonData.BK_Reg_Code,
							BKI_DETAIL_ID: null,
							Installment_Code: maxInstallment_Code,
							Installment_Month: null,
							InsType_ID: 5,
							MEMBER_ID: body.Member_id,
							Remarks: body.description,
							INSTRUMENT_NO: body.instrument_no,
							INSTRUMENT_DETAILS: body.instrument_details,
							INSTRUMENT_DATE: body.instrument_date != "" ? body.instrument_date : null,
							RECEIPT_HEAD: body.receipt_head,
							Installment_Due: body.amount,
							Installment_Paid: body.amount,
							Remaining_Amount: 0,
							Received_Total_Amount: body.amount,
							USER_ID: body.userId,
							PMID: body.payment_mode.value,
							isCompleted: 1,
							IsDeleted: 0,
							TIME_STAMP: new Date(),
							LAST_UPDATE: new Date(),
							voucher_ID: voucherData.VOUCHER_ID
						}
					});

					return data;
				}
			} else {
				return "NDC fee already paid!";
			}
		} catch (error) {
			// console.log("EEEEEEEEEEEEEEEEEE", error);
			return error;
		}
	};

	static processingFee = async (body) => {
		try {
			const search = await TRSRequest.findOne({
				where: {
					[Op.and]: [
						{ BK_ID: body.BK_ID }, // Users with age greater than or equal to 18
						{ status: [0, 1, 2, 3, 4] } // Users who are active
					]
				}
			});
			if (body.receipt_head == "transfer_fee") {
				if (!search) {
					return "NDC FEE NOT PAID!";
				} else if (new Date(search.Expire_Date) < new Date()) {
					return "NDC Fee Request is Expire!";
				}
			}
			const OST = await this.outStandingAmount(body.BK_ID);
			// console.log("Out standing amount", OST);
			// console.log("Out standing amount", OST > 0 && body.amount == true);
			if (OST > 0) {
				return `Out Standing Amount not Paid!`;
			}

			if (body.receipt_head == "transfer_fee" && search?.VOUCHER_Transfer_FEE_ID) {
				return "TRANSFER FEE ALREADY PAID!";
			}

			if (body.receipt_head == "transfer_tax") {
				if (!search?.VOUCHER_Transfer_FEE_ID) {
					return "Transfer fee not paid!";
				}
			}
			if (body.receipt_head == "transfer_tax") {
				if (search?.VOUCHER_SELLER_ID && body.TPC_ID == 1) {
					return "Transfer tax for seller is already paid!";
				}
				if (search?.VOUCHER_BUYER_ID && body.TPC_ID == 2) {
					return "Transfer tax for buyer is already paid!";
				}
			}

			// if(body.receipt_head == "transfer_tax" && !search?.VOUCHER_BUYER_ID){
			//   return 'Buyer not pay transfer tax'
			// }
			// if(body.receipt_head == "transfer_tax" && !search?.VOUCHER_SELLER_ID){
			//   return 'Seller not pay transfer tax'
			// }

			const BookingO = await Booking.findOne({ where: { BK_ID: body.BK_ID } });
			const member = await Member.findOne({
				where: { MEMBER_ID: body.Member_id }
			});

			let maxId = await Voucher.max("VOUCHER_NO");

			const today = new Date(); // Get the current date

			const voucherData = await Voucher.create({
				VOUCHER_NO: ++maxId || 1,
				VOUCHER_DATE: new Date(),
				PAYEE_NAME: body.receipt_head !== "transfer_fee" && body.TPC_ID == 2 ? body.buyer_name : member.BuyerName,
				BK_ID: body.BK_ID,
				BK_Reg_Code: BookingO.BK_Reg_Code,
				Reg_Code_Disply: BookingO.Reg_Code_Disply,
				NDC_ID: typeof body.NDC_ID == "string" ? 0 : body.NDC_ID,
				Description: body.description,
				PMID: BookingO.PMID,
				INSTRUMENT_NO: body.instrument_no,
				DEBIT: body.amount,
				TT_ID: typeof body.TT_ID == "string" ? 0 : body.TT_ID,
				TPC_ID: typeof body.TPC_ID == "string" ? 0 : body.TPC_ID,
				CREDIT: 0.0,
				COMPANY_ID: 1,
				USER_ID: body.userId,
				Cnic: body.Cnic,
				Address: body.Address,
				TIME_STAMP: new Date(),
				LAST_UPDATE: new Date()
			});

			if (body.receipt_head == "transfer_fee") {
				await TRSRequest.update(
					{
						VOUCHER_Transfer_FEE_ID: voucherData.VOUCHER_ID
					},
					{
						where: {
							[Op.and]: [
								{ BK_ID: body.BK_ID }, // Users with age greater than or equal to 18
								{ status: [0, 1, 2, 3, 4] } // Users who are active
							]
						},
						order: [["Expire_Date", "DESC"]], // Order by Expire_Date in descending order
						limit: 1
					}
				);
			}

			if (body.receipt_head !== "transfer_fee" && body.TPC_ID == 2) {
				await TRSRequest.update(
					{
						VOUCHER_BUYER_ID: voucherData.VOUCHER_ID
					},
					{
						where: {
							[Op.and]: [
								{ BK_ID: body.BK_ID }, // Users with age greater than or equal to 18
								{ status: [0, 1, 2, 3, 4] } // Users who are active
							]
						},
						order: [["Expire_Date", "DESC"]], // Order by Expire_Date in descending order
						limit: 1
					}
				);
			} else if (body.receipt_head !== "transfer_fee" && body.TPC_ID == 1) {
				await TRSRequest.update(
					{
						VOUCHER_SELLER_ID: voucherData.VOUCHER_ID
					},
					{
						where: {
							[Op.and]: [
								{ BK_ID: body.BK_ID }, // Users with age greater than or equal to 18
								{ status: [0, 1, 2, 3, 4] } // Users who are active
							]
						},
						order: [["Expire_Date", "DESC"]], // Order by Expire_Date in descending order
						limit: 1
					}
				);
			}

			// body.receipt_head == 'transfer_fee'

			let maxInstallment_Code = await InstallmentReceipts.max("Installment_Code");
			maxInstallment_Code = maxInstallment_Code + 1;

			let maxIRCId = await InstallmentReceipts.max("IRC_NO");
			maxIRCId = maxIRCId + 1;

			var [row, created] = await InstallmentReceipts.findOrCreate({
				where: { IRC_NO: maxIRCId || 1 },
				defaults: {
					IRC_NO: maxIRCId,
					IRC_Date: new Date(),
					BK_ID: body.BK_ID,
					BK_Reg_Code: BookingO.BK_Reg_Code,
					BKI_DETAIL_ID: null,
					Installment_Code: maxInstallment_Code,
					Installment_Month: null,
					InsType_ID: body.receipt_head == "transfer_fee" ? 7 : 6,
					MEMBER_ID: body.Member_id,
					Remarks: body.description,
					INSTRUMENT_NO: body.instrument_no,
					INSTRUMENT_DETAILS: body.instrument_details,
					INSTRUMENT_DATE: body.instrument_date != "" ? body.instrument_date : null,
					RECEIPT_HEAD: body.receipt_head,
					Installment_Due: body.amount,
					Installment_Paid: body.amount,
					Remaining_Amount: 0,
					Received_Total_Amount: body.amount,
					USER_ID: body.userId,
					PMID: body.payment_mode.value,
					isCompleted: 1,
					IsDeleted: 0,
					TIME_STAMP: new Date(),
					LAST_UPDATE: new Date(),
					voucher_ID: voucherData.VOUCHER_ID
				}
			});

			let trs = await TRSRequest.findOne({
				where: {
					[Op.and]: [
						{ BK_ID: body.BK_ID }, // Users with age greater than or equal to 18
						{ status: 0 } // Users who are active
					]
				},
				order: [["Expire_Date", "DESC"]], // Order by Expire_Date in descending order
				limit: 1
			});

			if (trs && trs.VOUCHER_BUYER_ID && trs.VOUCHER_SELLER_ID && trs.VOUCHER_Transfer_FEE_ID) {
				await TRSRequest.update(
					{ status: 1 },
					{
						where: {
							[Op.and]: [
								{ BK_ID: body.BK_ID }, // Users with age greater than or equal to 18
								{ status: 0 } // Users who are active
							]
						},
						order: [["Expire_Date", "DESC"]], // Order by Expire_Date in descending order
						limit: 1
					}
				);
			}

			return false;
		} catch (error) {
			return error;
			// console.log("EEEEEEEEEEEEEEEEEE", error);
		}
	};

	static outStandingAmount = async (bookingO, type = null) => {
		let outstandingAmt = 0;

		const plans = await BookingInstallmentDetails.findAll({
			order: [["Installment_Code", "ASC"]],
			where: { BK_ID: bookingO, BKI_TYPE: type }
		});

		const installmentPaidReceipts = await InstallmentReceipts.findAll({
			include: [{ as: "Installment_Type", model: InstallmentType }],
			where: { BK_ID: bookingO }
		});

		let remainingPaidOstBreak = 0;
		var remainingOstBreak = 0;
		var remainingOst = 0;
		var tillDatePaidAmt = 0;
		let month = 0;

		plans.map(async (item, i) => {
			const instMonth = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[1] : "");
			const instYear = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[0] : "");

			const IROBJECTS = installmentPaidReceipts.filter((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);

			if (instMonth == new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
				remainingOstBreak = 0;
			}

			if (remainingOstBreak == 0) {
				remainingOst += parseFloat(item.Installment_Due);

				for (var k = 0; k < IROBJECTS.length; k++) {
					if (
						remainingPaidOstBreak == 1 &&
						instMonth == new Date().getMonth() + 1 &&
						new Date().getFullYear() == instYear
					) {
						remainingPaidOstBreak = 0;
					}

					if (remainingPaidOstBreak == 0) {
						tillDatePaidAmt += +IROBJECTS[k].Installment_Paid;
					}

					if (parseInt(instMonth) === new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
						remainingPaidOstBreak = 1;
					}
				}
			}

			if (instMonth == new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
				remainingOstBreak = 1;
			}
			month = instMonth;
		});

		return (outstandingAmt = remainingOst - tillDatePaidAmt);
	};

	static outStandingAmountofJuly = async (bookingO, type = null) => {
		let outstandingAmt = 0;

		// Get all plans related to the booking and type
		const plans = await BookingInstallmentDetails.findAll({
			order: [["Installment_Code", "ASC"]],
			where: {
				BK_ID: bookingO,
				BKI_TYPE: type,
				Installment_Month: {
					[Op.lte]: "2024-07-01"
				}
			}
		});

		// Get all installment receipts related to the booking
		const installmentPaidReceipts = await InstallmentReceipts.findAll({
			include: [{ as: "Installment_Type", model: InstallmentType }],
			where: { BK_ID: bookingO }
		});

		let remainingPaidOstBreak = 0;
		var remainingOstBreak = 0;
		var remainingOst = 0;
		var tillDatePaidAmt = 0;
		let month = 0;

		// Define the cutoff date (July 2024)
		const cutoffMonth = 7; // July
		const cutoffYear = 2024;

		plans.map((item, i) => {
			const instMonth = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[1] : "");
			const instYear = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[0] : "");
			console.log(instMonth);
			console.log(instYear);

			// Filter receipts related to the current installment
			const IROBJECTS = installmentPaidReceipts.filter((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);

			// Skip installments that are after the cutoff date (after July 2024)
			if (instYear > cutoffYear || (instYear === cutoffYear && instMonth > cutoffMonth)) {
				console.log("heyyyyyyy");
				return;
			}

			if (instMonth == cutoffMonth && cutoffYear == instYear) {
				remainingOstBreak = 0;
			}

			if (remainingOstBreak == 0) {
				remainingOst += parseFloat(item.Installment_Due);

				for (var k = 0; k < IROBJECTS.length; k++) {
					if (remainingPaidOstBreak == 1 && instMonth == cutoffMonth && cutoffYear == instYear) {
						remainingPaidOstBreak = 0;
					}

					if (remainingPaidOstBreak == 0) {
						tillDatePaidAmt += +IROBJECTS[k].Installment_Paid;
					}

					if (instMonth === cutoffMonth && cutoffYear == instYear) {
						remainingPaidOstBreak = 1;
					}
				}
			}

			if (instMonth == cutoffMonth && cutoffYear == instYear) {
				remainingOstBreak = 1;
			}
			month = instMonth;
		});

		// Calculate the outstanding amount up to July 2024
		return (outstandingAmt = remainingOst - tillDatePaidAmt);
	};

	static checkConsecutiveUnpaidInstallments = async () => {
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
		const monthsToCheck = 3; // Number of consecutive months to trigger blocking

		// Find all distinct BK_IDs from the database
		const distinctBK_IDs = await Booking.findAll({
			include: [
				{ as: "Member", model: Member },
				{ as: "MemNominee", model: MemNominee },
				{ as: "UnitType", model: UnitType },
				{ as: "PlotSize", model: PlotSize },
				{ as: "PaymentPlan", model: PaymentPlan },
				{ as: "UnitNature", model: UnitNature },
				{ as: "Sector", model: Sector },
				{ as: "Phase", model: Phase },
				{ as: "User", model: User }
			],
			raw: true
			// attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("BK_ID")), "BK_ID"]],
		});
		// console.log(distinctBK_IDs)
		// const distinctBK_IDs =[{BK_ID: 14}]

		for (let i = 0; i < distinctBK_IDs.length; i++) {
			const { BK_ID } = distinctBK_IDs[i];

			const installmentReceipts = await BookingInstallmentDetails.findAll({
				order: [["Installment_Code", "ASC"]],
				where: { BK_ID: BK_ID }
			});

			const installmentReceipt = await InstallmentReceipts.findAll({
				where: { BK_ID: BK_ID },
				raw: true
			});

			let remainingPaidOstBreak = 0;
			let ostMonths = 0;

			for (const item of installmentReceipts) {
				const IR = installmentReceipt.find((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);

				const instMonth = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[1] : "");
				const instYear = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[0] : "");
				if (
					remainingPaidOstBreak == 1 &&
					parseInt(instMonth) === new Date().getMonth() + 1 &&
					new Date().getFullYear() == instYear
				) {
					remainingPaidOstBreak = 0;
				}

				if (remainingPaidOstBreak == 0 && !IR) {
					ostMonths++;
				}

				if (remainingPaidOstBreak == 0 && item?.InsType_ID == 2 && !IR) {
					// console.log('IIIIIIIIIIIi',IR, instMonth, instYear )
					ostMonths += 3;
				}

				if (parseInt(instMonth) === new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
					remainingPaidOstBreak = 1;
				}

				// consecutiveUnpaidMonths++;

				// if (consecutiveUnpaidMonths >= monthsToCheck) {
				//    await Booking.update({status:"Blocked",where:{BK_ID:BK_ID}})
				//     break; // Exit the loop for this BK_ID
				// }

				// // Reset the counter if there's a paid installment or a different BK_ID
				// if (installment.Installment_Paid === 1 || installment.BK_ID !== BK_ID) {
				//     consecutiveUnpaidMonths = 0;
				// }
			}
			// console.log(ostMonths)
			if (ostMonths >= 3) {
				pdfGenerator.sampleLetter(booking);

				// const a =   await Booking.update({ Status: "Blocked"}, {where: { BK_ID: BK_ID } });
				// console.log('KKKKKKKKKKKKKKKKK',a, ostMonths)
			}
		}
	};

	static getOutStandingMonths = async (plans, installmentPaidReceipts) => {
		// const plans = await BookingInstallmentDetails.findAll({
		//   order: [["Installment_Code", "ASC"]],
		//   where: { BK_ID: bookingO, BKI_TYPE: type },
		// });

		// const installmentPaidReceipts = await InstallmentReceipts.findAll({
		//   include: [{ as: "Installment_Type", model: InstallmentType }],
		//   where: { BK_ID: bookingO },
		// });

		let remainingPaidOstBreak = 0;
		var remainingOstBreak = 0;
		var remainingOst = 0;
		var tillDatePaidAmt = 0;
		let outstandingMonths = 0;

		plans.map(async (item, i) => {
			const instMonth = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[1] : "");
			const instYear = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[0] : "");

			const IROBJECTS = installmentPaidReceipts.filter((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);

			if (instMonth == new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
				remainingOstBreak = 0;
			}

			let itemPaidAmount = 0;

			if (remainingOstBreak == 0) {
				remainingOst += parseFloat(item.Installment_Due);
				outstandingMonths++;

				for (var k = 0; k < IROBJECTS.length; k++) {
					if (
						remainingPaidOstBreak == 1 &&
						instMonth == new Date().getMonth() + 1 &&
						new Date().getFullYear() == instYear
					) {
						remainingPaidOstBreak = 0;
					}

					if (remainingPaidOstBreak == 0) {
						tillDatePaidAmt += +IROBJECTS[k].Installment_Paid;
						itemPaidAmount += +IROBJECTS[k].Installment_Paid;
					}

					if (parseInt(instMonth) === new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
						remainingPaidOstBreak = 1;
					}
				}

				if (itemPaidAmount == parseFloat(item.Installment_Due)) {
					outstandingMonths--;
				}
			}

			if (instMonth == new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
				remainingOstBreak = 1;
			}
			month = instMonth;
		});

		return outstandingMonths;
	};

	static checkConsecutiveTenMonthUnpaidInstallments = async () => {
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
		const monthsToCheck = 3; // Number of consecutive months to trigger blocking
		try {
			let allMonths = [];
			let activeFiles = [];

			let tenMonths = [];
			// Find all distinct BK_IDs from the database
			const distinctBK_IDs = await Booking.findAll({
				include: [
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Sector", model: Sector },
					{ as: "Phase", model: Phase },
					{ as: "User", model: User }
				]

				// attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("BK_ID")), "BK_ID"]],
			});

			const installmentReceiptsAll = await BookingInstallmentDetails.findAll({
				order: [["Installment_Code", "ASC"]]
				// where: { type: NULL },
			});
			// BK_ID: BK_ID

			const installmentReceiptAll = await InstallmentReceipts.findAll({
				// where: { BK_ID: BK_ID },
				raw: true
			});

			// console.log(distinctBK_IDs)
			// const distinctBK_IDs =[{BK_ID: 14}]

			for (let i = 0; i < distinctBK_IDs.length; i++) {
				const { BK_ID } = distinctBK_IDs[i];

				const installmentReceipts = installmentReceiptsAll.filter((it) => it.BK_ID == BK_ID && it.BKI_TYPE != "DC");
				let installmentReceipt = installmentReceiptAll.filter((it) => it.BK_ID == BK_ID);

				// return {allMonths: {
				//   i: installmentReceipts,
				//   j: 2
				// }}

				const booking = distinctBK_IDs[i];

				let ostMonths = await this.getOutStandingMonths(installmentReceipts, installmentReceipt);

				let BKPaidAmount = +booking.Advance_Amt;
				// plans.map(async (item, i) => {
				installmentReceipt.map((it) => {
					BKPaidAmount += +it.Installment_Paid;
				});

				// console.log(ostMonths)
				if (ostMonths >= 5) {
					// await Booking.update({ Status: "Active"}, {where: { BK_ID: BK_ID, Status: "Blocked" } });

					// allMonths.push({vc: booking.Reg_Code_Disply, months: ostMonths, paidAmount: BKPaidAmount});

					let BKRemAmount = 0;

					BKRemAmount = +booking.Total_Amt - +BKPaidAmount;
					allMonths.push({
						vc: booking.Reg_Code_Disply,
						PlotSize: booking.PlotSize.Name,
						UnitType: booking.UnitType.Name,
						months: ostMonths,
						paidAmount: BKPaidAmount,
						remAmount: BKRemAmount
					});
					// const a = await Booking.update({ Status: "Blocked"}, {where: { BK_ID: BK_ID } });
				} else {
					// let BKRemAmount = 0;
					// BKRemAmount = (+booking.Total_Amt) - (+BKPaidAmount);
					// allMonths.push({vc: booking.Reg_Code_Disply, PlotSize: booking.PlotSize, UnitType: booking.UnitType, months: ostMonths, paidAmount: BKPaidAmount, remAmount: BKRemAmount});
				}

				if (ostMonths <= 5) {
					let BKRemAmount = 0;

					BKRemAmount = +booking.Total_Amt - +BKPaidAmount;
					tenMonths.push({
						vc: booking.Reg_Code_Disply,
						PlotSize: booking.PlotSize.Name,
						UnitType: booking.UnitType.Name,
						months: ostMonths,
						paidAmount: BKPaidAmount,
						remAmount: BKRemAmount
					});
				}

				// if (ostMonths == 10) {
				//   tenMonths.push(booking);
				//   // const a =   await Booking.update({ Status: "Blocked"}, {where: { BK_ID: BK_ID } });
				//   // console.log('KKKKKKKKKKKKKKKKK',a, ostMonths)
				// }
			}
			return { allMonths, tenMonths };
		} catch (error) {
			return { error, allMonths: false };
		}
	};

	static generatePlotSizeData = async (data) => {
		let groupedData = {};
		const distinctBK_IDs = data;
		for (let i = 0; i < distinctBK_IDs.length; i++) {
			const { BK_ID, PS_ID, UnitType, ...rest } = distinctBK_IDs[i];
			// console.log("OOOOOOOOOOOOOOOO", UnitType.Name);
			// const groupedData = data.reduce(async(result, item) => {
			//   const {BK_ID, PS_ID, ...rest } = item; // Extract plotSize and the rest of the item

			if (!groupedData[PS_ID]) {
				groupedData[PS_ID] = {};
			}

			if (!groupedData[PS_ID][UnitType.Name]) {
				groupedData[PS_ID][UnitType.Name] = {
					bookingTotal: 0,
					total: 0,
					lessSixMonth: 0,
					graterSixMoth: 0,
					records: []
				};
			}

			const installmentReceipts = await BookingInstallmentDetails.findAll({
				order: [["Installment_Code", "ASC"]],
				where: { BK_ID: BK_ID }
			});

			const installmentReceipt = await InstallmentReceipts.findAll({
				where: { BK_ID: BK_ID },
				raw: true
			});

			let remainingPaidOstBreak = 0;
			let ostMonths = 0;

			for (const item of installmentReceipts) {
				const IR = installmentReceipt.find((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);

				const instMonth = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[1] : "");
				const instYear = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[0] : "");
				if (
					remainingPaidOstBreak == 1 &&
					parseInt(instMonth) === new Date().getMonth() + 1 &&
					new Date().getFullYear() == instYear
				) {
					remainingPaidOstBreak = 0;
				}

				if (remainingPaidOstBreak == 0 && !IR) {
					ostMonths++;
				}

				// if(remainingPaidOstBreak == 0 && item?.InsType_ID == 2 && !IR){
				//   // console.log('IIIIIIIIIIIi',IR, instMonth, instYear )
				//   ostMonths +=3
				// }

				if (parseInt(instMonth) === new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
					remainingPaidOstBreak = 1;
				}

				// consecutiveUnpaidMonths++;

				// if (consecutiveUnpaidMonths >= monthsToCheck) {
				//    await Booking.update({status:"Blocked",where:{BK_ID:BK_ID}})
				//     break; // Exit the loop for this BK_ID
				// }

				// // Reset the counter if there's a paid installment or a different BK_ID
				// if (installment.Installment_Paid === 1 || installment.BK_ID !== BK_ID) {
				//     consecutiveUnpaidMonths = 0;
				// }
			}
			if (ostMonths >= 3) {
				pdfGenerator.sampleLetter(i + 1, distinctBK_IDs[i]);

				// const a =   await Booking.update({ Status: "Blocked"}, {where: { BK_ID: BK_ID } });
				// console.log('KKKKKKKKKKKKKKKKK',a, ostMonths)
			}
			groupedData[PS_ID][UnitType.Name].bookingTotal += 1;

			// return result;
			// }, {});
		}
		return groupedData;
	};
	static surcharges = async (vcno) => {
		try {
			let vcNo = vcno;
			let id = (await Booking.findOne({ where: { Reg_Code_Disply: vcNo } })).BK_ID;
			console.log(id);
			InstallmentReceipts.findAll({
				where: { BK_ID: id },
				include: [
					{
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails,
						where: { InsType_ID: 1, BKI_TYPE: null }
					}
				]
			})
				.then(async (response) => {
					let arr = [];
					let arr2 = [];
					const surchargeRate = 0.001;
					var surcharge = 0;
					for (let i = 0; i < response.length; i++) {
						const ircDate = new Date(response[i].IRC_Date);
						const dueDate = new Date(response[i].Booking_Installment_Details.Due_Date);

						// Calculate the difference in milliseconds
						const differenceInMilliseconds = ircDate - dueDate;

						// Convert the difference from milliseconds to days
						const millisecondsInOneDay = 1000 * 60 * 60 * 24;
						const differenceInDays = differenceInMilliseconds / millisecondsInOneDay;
						arr.push(differenceInDays);
						if (differenceInDays < 0) {
							// surcharge = parseFloat(response[0].Installment_Due) * surchargeRate * differenceInDays;
							let updateSurchare = await BookingInstallmentDetails.update(
								{ surCharges: 0 },
								{ where: { BKI_DETAIL_ID: response[i].BKI_DETAIL_ID, BKI_TYPE: null } }
							);
							// response[i].BookingInstallmentDetails.surCharges = surcharge;
						} else {
							surcharge = parseInt(response[i].Installment_Due) * surchargeRate * differenceInDays;
							arr2.push(surcharge);
							let updateSurchare = await BookingInstallmentDetails.update(
								{ surCharges: surcharge },
								{ where: { BKI_DETAIL_ID: response[i].BKI_DETAIL_ID, BKI_TYPE: null } }
							);
						}
					}
					// return id;
					// res.send({ arr, arr2, message: response });
					// Parse the dates
				})
				.catch((err) => {
					console.log("error");
				});
		} catch (err) {
			console.log("error");
		}
	};
}

module.exports = BookingService;
