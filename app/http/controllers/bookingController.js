const {
	Booking,
	Member,
	FileSubmissionDetail,
	MemNominee,
	UnitType,
	PlotSize,
	PaymentPlan,
	UnitNature,
	InstallmentReceipts,
	InstallmentType,
	BookingInstallmentDetails,
	Phase,
	Sector,
	TRSRequest,
	Payment_Mode,
	Voucher,
	Unit,
	Block,
	MYLocation,
	Street
} = require("../../models/index.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const pdfGenerator = require("../../services/PdfGenerator.js");
const UserRole = require("../../models/UserRole");
const User = require("../../models/User");
const Settings = require("../../models/Settings.js");
const AccountTransaction = require("../../models/AccountTransaction.js");
const { Op, Sequelize, where } = require("sequelize");
const BookingService = require("../../services/BookingService.js");
const Booking_Installment_Details = require("../../models/Booking_Installment_Details.js");

function formatBuyersContact(buyersContact) {
	// Check if the length of the contact with dashes is 12
	if (buyersContact.length === 12) {
		// Remove all dashes from the contact number
		let cleanedNumber = buyersContact.replace(/-/g, "");

		// If the length of the number without dashes is 10, add '0' at the start and format it
		if (cleanedNumber.length === 10) {
			cleanedNumber = "0" + cleanedNumber;
			cleanedNumber = cleanedNumber.slice(0, 4) + "-" + cleanedNumber.slice(4);
		} else if (cleanedNumber.length === 11) {
			// If the length of the number without dashes is 11, add a dash after the 4th character
			cleanedNumber = cleanedNumber.slice(0, 4) + "-" + cleanedNumber.slice(4);
		}

		return cleanedNumber; // Return the cleaned and formatted number
	}

	// If the length is not 12, return the original number
	return buyersContact;
}

class BookingController {
	///UPDATE NDC Status
	static updateNdcStatus = async (req, res, next) => {
		const TRSR_ID = req.query.id;
		const { status, memberId, secondMemberId, nominee } = req.body;

		try {
			const exist = await TRSRequest.findOne({ where: { TRSR_ID: TRSR_ID } });

			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			let result;

			if (status == 3) {
				result = await TRSRequest.update(
					{
						status: status,
						BUYER_MEMBER_ID: memberId,
						BUYER_MEMBER_NOMINEE_ID: nominee,
						BUYER_SECOND_MEMBER_ID: secondMemberId
					},
					{ where: { TRSR_ID: TRSR_ID } }
				);
			} else if (status) {
				result = await TRSRequest.update({ status: status }, { where: { TRSR_ID: TRSR_ID } });
			}

			res.status(200).json({
				status: 200,
				message: "NDC status updated successfully"
			});
		} catch (error) {
			return next(error);
		}
	};

	static getAllNDCFees = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		const user = req.user;
		const roleName = await UserRole.findOne({ where: { id: user.role } });
		// console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRR', roleName.name)
		let data;
		try {
			if (roleName.name == "Admin" || roleName.slug == "csr_manager" || roleName.name == "Partner") {
				data = await TRSRequest.findAndCountAll({
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
					offset: limit * page,
					limit: limit,
					order: [["TRSR_ID", "DESC"]],
					where: {
						status: {
							[Op.or]: [1, 2, 3, 4, 5]
						}
					}
				});
			}

			if (roleName.slug == "file_collector") {
				data = await TRSRequest.findAndCountAll({
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
					offset: limit * page,
					limit: limit,
					order: [["TRSR_ID", "DESC"]],
					where: { status: [3, 4], ASSIGN_BY: user.id }
				});
			}
			if (roleName.slug == "accounts") {
				data = await TRSRequest.findAndCountAll({
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
					offset: limit * page,
					limit: limit,
					order: [["TRSR_ID", "DESC"]],
					where: { status: 2 }
				});
			}
			if (roleName.slug == "colonel") {
				data = await TRSRequest.findAndCountAll({
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
					offset: limit * page,
					limit: limit,
					order: [["TRSR_ID", "DESC"]],
					where: { status: 4 }
				});
			}
			if (roleName.slug == "cashier") {
				data = await TRSRequest.findAndCountAll({
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
					offset: limit * page,
					limit: limit,
					order: [["TRSR_ID", "DESC"]],
					where: { status: 2 }
				});
			}

			return res.status(200).send({
				status: 200,
				message: "GET NDC Successfully",
				allRequests: data.rows,
				totalPage: Math.ceil(data.count / limit) + 1,
				totalRecords: data.count,
				page,
				limit
			});
		} catch (error) {
			console.log(error);
			return next(error);
		}
		// Transaction: TransactionById,
		// if (TransactionById.length > 0) {
		//   return res.status(200).send({
		//     status: 200,
		//     message: "GET NDC Successfully",
		//     Transaction: TransactionById,
		//   });
		// } else {
		//   return res.status(400).send({
		//     status: 404,
		//     message: "No Transaction Found against BK_Reg_Code",
		//   });
		// }
	};

	static transactionCreate = async (req, res, next) => {
		const {
			BKI_DETAIL_IDS,
			Member_id,
			BK_ID,
			instrument_no,
			instrument_details,
			instrument_date,
			description,
			amount,
			receipt_head,
			payment_mode,
			user_id,
			NDC_ID,
			TPC_ID,
			TT_ID,
			buyer_name,
			Cnic,
			Address
		} = req.body;
		if (!(BKI_DETAIL_IDS && Member_id && BK_ID && amount && receipt_head && payment_mode)) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}

		let userId = req.user.id;
		if (receipt_head == "ndc_fee") {
			const responce = await BookingService.ndcFee({
				BKI_DETAIL_IDS,
				Member_id,
				BK_ID,
				instrument_no,
				instrument_details,
				instrument_date,
				description,
				amount,
				receipt_head,
				payment_mode,
				userId,
				NDC_ID
			});
			return res.status(200).send({
				status: 200,
				message: typeof responce == "string" ? responce : "NDC Fee added successfully",
				data: responce
			});
		}
		if (receipt_head == "transfer_tax" || receipt_head == "transfer_fee") {
			const responce = await BookingService.processingFee({
				BKI_DETAIL_IDS,
				Member_id,
				BK_ID,
				instrument_no,
				instrument_details,
				instrument_date,
				description,
				amount,
				receipt_head,
				payment_mode,
				userId,
				NDC_ID,
				TPC_ID,
				TT_ID,
				buyer_name,
				Cnic,
				Address
			});
			// console.log("RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", responce);
			return res.status(200).send({
				status: 200,
				message: responce
					? responce
					: receipt_head == "transfer_fee"
					? "Transfer Fee added successfully"
					: "Transfer Tax added successfully",
				data: responce
			});
		}

		// USER_ID = req.user.id;
		try {
			for (let i = 0; i < BKI_DETAIL_IDS.length; i++) {
				let maxId = await InstallmentReceipts.max("IRC_NO");

				const BookingInstallmentDetailO = await BookingInstallmentDetails.findOne({
					where: { BKI_DETAIL_ID: BKI_DETAIL_IDS[i] }
				});
				const BookingO = await Booking.findOne({ where: { BK_ID: BK_ID } });

				const duedate = new Date(Date.now());

				const formattedDate = duedate.toISOString().substring(0, 10);

				let maxInstallment_Code = await InstallmentReceipts.max("Installment_Code");
				maxInstallment_Code = maxInstallment_Code + 1;

				const BookingInstallmentReceiptsO = await InstallmentReceipts.findAll({
					where: { BKI_DETAIL_ID: BKI_DETAIL_IDS[i] }
				});

				var installmentDue = parseFloat(BookingInstallmentDetailO.Installment_Due);
				var installmentPaid = 0;
				var installmentRemaining = 0;
				let totalAmount = 0;

				let count = 0;

				for (let k = 0; k < BookingInstallmentReceiptsO.length; k++) {
					installmentPaid += parseFloat(BookingInstallmentReceiptsO[k].Installment_Paid);

					if (
						BookingInstallmentReceiptsO[k].Installment_Paid == 0 &&
						BookingInstallmentReceiptsO[k].Remaining_Amount == 0 &&
						count != 2
					) {
						totalAmount += +BookingInstallmentReceiptsO[k].Installment_Due;
						count++;
					}

					if (
						BookingInstallmentReceiptsO[k].Installment_Paid != 0 &&
						BookingInstallmentReceiptsO[k].Remaining_Amount != 0 &&
						count != 2
					) {
						totalAmount += +BookingInstallmentReceiptsO[k].Remaining_Amount;
						count++;
					}
				}

				if (BookingInstallmentReceiptsO.length == 0) {
					totalAmount = parseFloat(BookingInstallmentDetailO.Installment_Due);

					const BookingInstallmentDetailNextObj = await BookingInstallmentDetails.findOne({
						where: {
							Installment_Code: {
								[Sequelize.Op.gt]: BookingInstallmentDetailO.Installment_Code
							},
							Remaining_Amount: {
								[Sequelize.Op.gt]: -1 * installmentRemaining - 1
							},
							BK_ID: BK_ID
						}
					});

					if (BookingInstallmentDetailNextObj) {
						totalAmount += parseFloat(BookingInstallmentDetailNextObj.Installment_Due);
					}
				}

				let totalRemaining = 0;
				totalRemaining = parseFloat(BookingO.TotalRemainNet_Amt);
				let BookingInstallmentReceiptsAll = await InstallmentReceipts.findAll({ where: { BK_ID: BK_ID } });
				if (receipt_head == "development_charges") {
					BookingInstallmentReceiptsAll = await InstallmentReceipts.findAll({
						where: { BK_ID: BK_ID, RECEIPT_HEAD: receipt_head }
					});
				}
				for (let k = 0; k < BookingInstallmentReceiptsAll.length; k++) {
					totalRemaining = totalRemaining - parseFloat(BookingInstallmentReceiptsAll[k].Installment_Paid);
				}

				installmentDue = installmentDue - installmentPaid;

				installmentRemaining = installmentDue - amount / BKI_DETAIL_IDS.length;
				var payAmt = amount / BKI_DETAIL_IDS.length;

				if (BKI_DETAIL_IDS.length > 1) {
					installmentRemaining = 0;
					payAmt = installmentDue;
				}

				if (installmentRemaining < 0 && BKI_DETAIL_IDS.length == 1) {
					payAmt = installmentDue;
				}

				if (amount > totalAmount && BKI_DETAIL_IDS.length == 1) {
					return res.status(400).json({
						status: 400,
						Message: "YOU ARE NOT ALLOWED TO ENTER AMOUNT GREATER THAN 2 Months",
						Allowed_Amount: totalAmount
					});
				}
				if (amount > totalRemaining && BKI_DETAIL_IDS.length == 1 && BookingInstallmentDetailO.InsType_ID != 3) {
					return res.status(400).json({
						status: 400,
						Message: "YOU ARE NOT ALLOWED TO ENTER AMOUNT GREATER THAN THE TOTAL REMAINING",
						TOTAL_REMAINING_AMOUNT: totalAmount
					});
				}

				var [row, created] = await InstallmentReceipts.findOrCreate({
					where: { IRC_NO: ++maxId || 1 },
					defaults: {
						IRC_NO: maxId,
						IRC_Date: formattedDate,
						BK_ID: BK_ID,
						BK_Reg_Code: BookingO.BK_Reg_Code,
						BKI_DETAIL_ID: BKI_DETAIL_IDS[i],
						Installment_Code: maxInstallment_Code,
						Installment_Month: BookingInstallmentDetailO.Installment_Month,
						InsType_ID: BookingInstallmentDetailO.InsType_ID,
						MEMBER_ID: Member_id,
						Remarks: description,
						INSTRUMENT_NO: instrument_no,
						INSTRUMENT_DETAILS: instrument_details,
						INSTRUMENT_DATE: instrument_date != "" ? instrument_date : null,
						RECEIPT_HEAD: receipt_head,
						Installment_Due: installmentDue,
						Installment_Paid: payAmt,
						Remaining_Amount: installmentRemaining < 0 ? installmentDue : installmentRemaining,
						Received_Total_Amount: amount,
						USER_ID: req.user.id,
						PMID: payment_mode.value,
						isCompleted: 1,
						IsDeleted: 0,
						TIME_STAMP: new Date(),
						LAST_UPDATE: new Date()
					}
				});

				if (installmentRemaining < 0 && BKI_DETAIL_IDS.length == 1) {
					const BookingInstallmentDetailNextO = await BookingInstallmentDetails.findOne({
						where: {
							Installment_Code: {
								[Sequelize.Op.gt]: BookingInstallmentDetailO.Installment_Code
							},
							Remaining_Amount: {
								[Sequelize.Op.gt]: -1 * installmentRemaining - 1
							},
							BK_ID: BK_ID
						}
					});

					// console.log('BK_ID.Installment_Code',BK_ID);
					// console.log('BookingInstallmentDetailO.Installment_Code',BookingInstallmentDetailO.Installment_Code);
					// console.log("BookingInstallmentDetailNextO", BookingInstallmentDetailNextO);

					if (BookingInstallmentDetailNextO) {
						let nextMaxId = await InstallmentReceipts.max("INS_RC_ID");
						//
						let nextMaxInstallment_Code = await InstallmentReceipts.max("Installment_Code");
						nextMaxInstallment_Code = nextMaxInstallment_Code + 1;

						await InstallmentReceipts.findOrCreate({
							where: { INS_RC_ID: ++nextMaxId || 1 },
							defaults: {
								IRC_NO: maxId,
								IRC_Date: formattedDate,
								BK_ID: BK_ID,
								BK_Reg_Code: BookingO.BK_Reg_Code,
								BKI_DETAIL_ID: BookingInstallmentDetailNextO.BKI_DETAIL_ID,
								Installment_Code: nextMaxInstallment_Code,
								Installment_Month: BookingInstallmentDetailNextO.Installment_Month,
								InsType_ID: BookingInstallmentDetailNextO.InsType_ID,
								MEMBER_ID: Member_id,
								Remarks: description,
								INSTRUMENT_NO: instrument_no,
								INSTRUMENT_DETAILS: instrument_details,
								INSTRUMENT_DATE: instrument_date,
								RECEIPT_HEAD: receipt_head,
								Installment_Due: BookingInstallmentDetailNextO.Installment_Due,
								Installment_Paid: -1 * installmentRemaining,
								Remaining_Amount: BookingInstallmentDetailNextO.Installment_Due - -1 * installmentRemaining,
								USER_ID: req.user.id,
								PMID: payment_mode.value,
								isCompleted: 1,
								IsDeleted: 0,
								TIME_STAMP: new Date(),
								LAST_UPDATE: new Date()
							}
						});

						// console.log("BookingInstallmentDetailNextO -- DONE ", "DONE");
						// BookingInstallmentDetailNextO.Installment_Due = installmentRemaining;
						// await BookingInstallmentDetails.update({Installment_Due: -1*installmentRemaining}, {
						//     where: {BKI_DETAIL_ID: BookingInstallmentDetailNextO.BKI_DETAIL_ID},
						//     returning: true
						// });
					}
				}

				await BookingInstallmentDetails.update(
					{
						Installment_Paid: BookingInstallmentDetailO.Installment_Due,
						Remaining_Amount: 0,
						isCompleted: 1
					},
					{
						where: { BKI_DETAIL_ID: BookingInstallmentDetailO.BKI_DETAIL_ID },
						returning: true
					}
				);
				if (!created) {
					return next(CustomErrorHandler.alreadyExist());
				}
			}

			const settings = await Settings.findOne({
				attributes: ["incomeCategoryId"],
				limit: 1
			});

			if (settings) {
				const categoryId = settings.incomeCategory;

				if (categoryId) {
					// Insert a new entry into the account transactions table
					await AccountTransaction.create({
						categoryId: categoryId,
						amount: amount,
						date: new Date(), // Provide the current date or a valid date value
						type: "Income"
					});
				}
			}
			res.status(200).send({
				status: 200,
				message: "Installment added successfully"
			});
		} catch (error) {
			return next(error);
		}
	};

	static addBooking = async (req, res, next) => {
		// const plotId = await PlotSize.findOne({});
		const {
			SRForm_No,
			Form_Code,
			MEMBER_ID,
			MN_ID,
			UType_ID,
			PS_ID,
			PP_ID,
			BKType_ID,
			Total_Amt,
			Advance_Amt,
			Rebate_Amt,
			TotalRemainNet_Amt,
			Ballot_Amt,
			Possession_Amt,
			ByAnnual_Charges,
			ByAnnual_TimePeriod,
			InstallmentAmount,
			No_Of_Installments,
			Plan_Years,
			USER_ID,
			Reg_Code_Disply,
			Sec_MEM_ID,
			NType_ID,
			BK_Date,
			PHASE_ID,
			SECTOR_ID
		} = req.body;

		if (
			!(
				BK_Date &&
				SRForm_No &&
				Form_Code &&
				MEMBER_ID &&
				MN_ID &&
				UType_ID &&
				PP_ID &&
				BKType_ID &&
				Total_Amt &&
				Advance_Amt &&
				TotalRemainNet_Amt &&
				Ballot_Amt &&
				Possession_Amt &&
				ByAnnual_Charges &&
				ByAnnual_TimePeriod &&
				InstallmentAmount &&
				No_Of_Installments &&
				Plan_Years &&
				USER_ID &&
				Reg_Code_Disply &&
				NType_ID
			)
		) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}

		// USER_ID = req.user.id;
		try {
			Date.isLeapYear = function (year) {
				return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
			};

			Date.getDaysInMonth = function (year, month) {
				return [31, Date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
			};

			Date.prototype.isLeapYear = function () {
				return Date.isLeapYear(this.getFullYear());
			};

			Date.prototype.getDaysInMonth = function () {
				return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
			};
			Date.prototype.addMonths = function (value, iteration = 0) {
				if (iteration === 1) {
					var n = this.getDate();
					this.setDate(1);
					this.setMonth(this.getMonth());
					this.setDate(Math.min(n, this.getDaysInMonth()));
					return this;
				} else {
					var n = this.getDate();
					this.setDate(1);
					this.setMonth(this.getMonth() + value);
					this.setDate(Math.min(n, this.getDaysInMonth()));
					return this;
				}
			};

			function getDateOfEveryTenth(currentDate, day) {
				const currentYear = currentDate.getFullYear();
				const month = currentDate.getMonth();

				const date = new Date(currentYear, month, day);

				return date;
			}

			let maxId = await Booking.max("BK_Reg_Code");
			const plotId = await PlotSize.findOne({ where: { PS_ID: PS_ID } });
			if (plotId.length <= 0) {
				return res.status(400).json({ status: 400, Message: "PLOT SIZE Not exist against ID" });
			}
			const category = await UnitType.findOne({
				where: { UType_ID: UType_ID }
			});
			if (category.length <= 0) {
				return res.status(400).json({ status: 400, Message: "Unit Type Not exist against ID" });
			}
			const [row, created] = await Booking.findOrCreate({
				where: { BK_Reg_Code: ++maxId || 1 },
				defaults: {
					BK_Date,
					SRForm_No: SRForm_No,
					Form_Code: Form_Code,
					MEMBER_ID: MEMBER_ID,
					MN_ID: MN_ID,
					UType_ID: UType_ID,
					PS_ID: PS_ID,
					PP_ID: PP_ID,
					BKType_ID: BKType_ID,
					Total_Amt: Total_Amt,
					Advance_Amt: Advance_Amt,
					Rebate_Amt: Rebate_Amt,
					TotalRemainNet_Amt: TotalRemainNet_Amt,
					Ballot_Amt: Ballot_Amt,
					Possession_Amt: Possession_Amt,
					ByAnnual_Charges: ByAnnual_Charges,
					ByAnnual_TimePeriod: ByAnnual_TimePeriod,
					InstallmentAmount: InstallmentAmount,
					No_Of_Installments: No_Of_Installments,
					Plan_Years: Plan_Years,
					USER_ID: req.user.id,
					Reg_Code_Disply: `${Reg_Code_Disply}`,
					Sec_MEM_ID: Sec_MEM_ID,
					NType_ID: NType_ID,
					PHASE_ID,
					SECTOR_ID
				}
			});
			// ${PS_ID}${UType_ID}
			if (!created) {
				return next(CustomErrorHandler.alreadyExist());
			} else {
				await FileSubmissionDetail.update({ IsBooked: 1 }, { where: { Form_Code: Form_Code } });

				let type = "";
				let amount = 0;
				let instType = 1;
				// PP_ID
				let ppObj = await PaymentPlan.findOne({ where: { PP_ID: PP_ID } });
				// const result = await PaymentPlan.findAll({ where: { PP_ID: id } });

				// console.log('PP_ID',PP_ID);
				// console.log('ppObj.INS_Start_Date',ppObj.INS_Start_Date);
				// console.log('ppObj.INS_Start_Date',(typeof ppObj.INS_Start_Date));

				var myDate = new Date(ppObj.INS_Start_Date);
				// console.log("myDate myDate myDate myDate", myDate);
				// dueDate = myDate.addMonths(-1);

				if (ppObj.downPayment != null) {
					amount = ppObj.downPayment;
					instType = 8;

					var dueDate = myDate.addMonths(1);

					let maxInstallment_Code = await BookingInstallmentDetails.max("Installment_Code");
					maxInstallment_Code = maxInstallment_Code + 1;

					const BookingInstallmentDetailsO = new BookingInstallmentDetails({
						Due_Date: getDateOfEveryTenth(dueDate, 10),
						Installment_Month: getDateOfEveryTenth(dueDate, 1),
						Installment_Code: maxInstallment_Code,
						BK_ID: row.BK_ID,
						BK_Reg_Code: row.BK_ID,
						InsType_ID: instType,
						Installment_Due: amount,
						Installment_Paid: 0,
						Remaining_Amount: amount,
						IsCompleted: null,
						USER_ID: USER_ID,
						TIME_STAMP: new Date(),
						LAST_UPDATE: new Date(),
						IsDeleted: 0
					});

					await BookingInstallmentDetailsO.save();
				}
				let status = false;
				for (let i = 1; i <= No_Of_Installments + 4 + ByAnnual_TimePeriod; i++) {
					if (i == No_Of_Installments + 4 + ByAnnual_TimePeriod) {
						type = "Possession";
						instType = 4;
						amount = Possession_Amt;
						status = true;
					} else if (i == No_Of_Installments + 3 + ByAnnual_TimePeriod) {
						type = "Ballot";
						amount = Ballot_Amt;
						instType = 3;
						status = true;
					} else if (i != 0 && i % (ByAnnual_TimePeriod + 1) == 0) {
						type = "By Annual";
						amount = ByAnnual_Charges;
						instType = 2;
						status = true;
					} else {
						type = "Installment";
						amount = InstallmentAmount;
						instType = 1;
						status = true;
					}

					if (type !== "By Annual") {
						var dueDate = myDate.addMonths(1, i);
					}
					// console.log("Dueeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee DATEEEEEEEEEEE", dueDate);
					let maxInstallment_Code = await BookingInstallmentDetails.max("Installment_Code");
					maxInstallment_Code = maxInstallment_Code + 1;

					const BookingInstallmentDetailsO = new BookingInstallmentDetails({
						Due_Date: getDateOfEveryTenth(dueDate, 10),
						Installment_Month: getDateOfEveryTenth(dueDate, 1),
						Installment_Code: maxInstallment_Code,
						BK_ID: row.BK_ID,
						BK_Reg_Code: row.BK_ID,
						InsType_ID: instType,
						Installment_Due: amount,
						Installment_Paid: 0,
						Remaining_Amount: amount,
						IsCompleted: null,
						USER_ID: USER_ID,
						TIME_STAMP: new Date(),
						LAST_UPDATE: new Date(),
						Status: status,
						IsDeleted: 0
					});

					await BookingInstallmentDetailsO.save();
				}
				if (ppObj && ppObj.DC_START_DATE && ppObj.IncludeDC == 1) {
					const myDate = new Date(ppObj.DC_START_DATE);
					let totalAmount = 0;
					let BookingInstallmentDetailsO = [];
					let maxInstallment_Code = await BookingInstallmentDetails.max("Installment_Code");

					for (let j = 1; j <= 18; j++) {
						const dueDate = myDate.addMonths(1, j);

						let amount = ppObj.DC_INSTALLMENT_AMOUNT;
						maxInstallment_Code = maxInstallment_Code + 1;

						if (j == ppObj.DC_NO_OF_INSTALLMENT) {
							amount = +ppObj.DC_TOTAL_AMOUNT - totalAmount;
						}

						totalAmount = totalAmount + +ppObj.DC_INSTALLMENT_AMOUNT;
						BookingInstallmentDetailsO.push({
							Due_Date: getDateOfEveryTenth(dueDate, 10).addMonths(j - 1),
							Installment_Month: getDateOfEveryTenth(dueDate, 1).addMonths(j - 1),
							Installment_Code: maxInstallment_Code,
							BK_ID: row.BK_ID,
							BK_Reg_Code: row.BK_ID,
							InsType_ID: 1,
							Installment_Due: amount,
							Installment_Paid: 0,
							Remaining_Amount: amount,
							IsCompleted: null,
							BKI_TYPE: "DC",
							USER_ID: USER_ID,
							TIME_STAMP: new Date(),
							LAST_UPDATE: new Date(),
							Status: true,
							IsDeleted: 0
						});
					}
					await BookingInstallmentDetails.bulkCreate(BookingInstallmentDetailsO);
				}

				// for ($i = 1; $i <= $package->no_of_installments+2; $i++) {
				//     $date->modify('+1 month');
				//
				//     if($i == $package->no_of_installments+2) {
				//         $type = 'Possession';
				//         $amount = $package->possession_amount;
				//     } elseif($i == $package->no_of_installments+1) {
				//         $type = 'Ballot';
				//         $amount = $package->ballot_amount;
				//     } elseif ($i!=0 && ($i) % ($package->by_annual_after_month+1) == 0) {
				//         $type = 'By Annual';
				//         $amount = $package->by_annual_charges;
				//     } else {
				//         $type = 'Installment';
				//         $amount = $package->installment_amount;
				//     }
				//
				//     $paidAmt = Transaction::where('source_id',$i)->sum('amount');
				//
				//     $plans[] = [
				//         'sr' => $i,
				//         'type' => $type,
				//         'date' => $date->format('Y-m-d'),
				//         'amount' => $amount,
				//         'paidAmt' => $paidAmt
				// ];
				// }

				// await InstallmentReceipts.update({ BK_ID: row.BK_ID, BK_Reg_Code: row.BK_Reg_Code, MEMBER_ID: row.MEMBER_ID }, { where: { USER_ID: USER_ID }, returning: true })
			}
			res.status(200).send({
				status: 200,
				message: "Booking added successfully",
				Booking: row
			});
		} catch (error) {
			return next(error);
		}
	};

	static dashboardTotal = async (rea, res, next) => {
		try {
			let totalAmount = 0;
			let totalOutstandingTillDate = 0;
			let data = {};
			const bookings = await Booking.findAll({
				attributes: ["BK_ID", "Reg_Code_Disply", "SRForm_No", "Form_Code", "Total_Amt", "Advance_Amt", "Status"]
			});
			console.log("hit");

			// bookings.forEach(async (booking) => {
			for (let i = 0; i < bookings.length; i++) {
				totalAmount += JSON.parse(bookings[i]?.Total_Amt);
				const OSTAmount = await BookingService.outStandingAmount(bookings[i]?.BK_ID);
				totalOutstandingTillDate += OSTAmount;
			}
			data = {
				totalAmount,
				totalOutstandingTillDate
			};
			res.send({ message: "Dashboard Total Counts", data: data });
		} catch (error) {
			return next(error);
		}
	};

	static getTotalAmountOfAllBookings = async (req, res, next) => {
		try {
			const page = req.body.page || 1; // Get the page from request query or default to 1
			const limit = req.body.limit || 5; // Limit the number of documents to 25 per page
			const offset = (page - 1) * limit; // Calculate the offset based on the current page

			let data = [];
			let uniqueBkiDetailIds = [];
			let bkiDetailIds = [];
			let overAllTotal = 0;
			const bookings = await Booking.findAll({
				attributes: ["BK_ID", "Reg_Code_Disply", "SRForm_No", "Form_Code", "Total_Amt", "Advance_Amt", "Status"],
				include: [
					{
						where: { BKI_TYPE: null },
						attributes: [
							"BKI_DETAIL_ID",
							"Installment_Month",
							"Installment_Due",
							"Installment_Paid",
							"Remaining_Amount",
							"BKI_TYPE"
						],
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails
					},
					{
						as: "Installment_Receipts",
						model: InstallmentReceipts,
						attributes: [
							"INS_RC_ID",
							"BK_ID",
							"Installment_Month",
							"Installment_Paid",
							"RECEIPT_HEAD",
							"BKI_DETAIL_ID"
						],
						where: { BK_ID: Sequelize.col("Booking_Mst.BK_ID") }, // Match BK_ID from Booking
						required: false
					},
					{ as: "Member", model: Member, attributes: ["BuyerName", "BuyerContact", "BuyerCNIC"] },
					{ as: "Phase", model: Phase, attributes: ["NAME"] },
					{ as: "Sector", model: Sector, attributes: ["NAME"] },
					{ as: "UnitType", model: UnitType, attributes: ["Name"] },
					{ as: "PlotSize", model: PlotSize, attributes: ["Name"] },
					{
						as: "Unit",
						model: Unit,
						attributes: ["Plot_No"],
						include: { as: "Block", model: Block, attributes: ["Name"] }
					}
				],
				limit: limit,
				offset: offset
			});

			for (let i = 0; i < bookings.length; i++) {
				let paidAmount = 0;
				let totalAmount = 0;
				let advAmount = 0;
				let totalMonthsDiff = 0;

				advAmount += +bookings[i].Advance_Amt;
				const BID = bookings[i].Booking_Installment_Details;
				for (let j = 0; j < BID.length; j++) {
					let installmentDue = +BID[j].Installment_Due;
					totalAmount += installmentDue;
					bkiDetailIds.push(+BID[j].BKI_DETAIL_ID);
				}
				const IR = bookings[i].Installment_Receipts;
				for (let j = 0; j < IR.length; j++) {
					paidAmount += +IR[j].Installment_Paid;
					if (j === IR.length - 1) {
						const lastInstallmentMonth = IR[j].Installment_Month;

						const lastDate = new Date(lastInstallmentMonth);
						const currentDate = new Date();

						const yearDiff = currentDate.getFullYear() - lastDate.getFullYear();
						const monthDiff = currentDate.getMonth() - lastDate.getMonth();

						totalMonthsDiff = yearDiff * 12 + monthDiff;
						// console.log("totalMonthsDiff totalMonthsDiff", totalMonthsDiff);
					}
					//  else {
					// 	totalMonthsDiff = 56;
					// 	console.log("else  totalMonthsDiff totalMonthsDiff", totalMonthsDiff);
					// }
					if (IR[j].RECEIPT_HEAD === "installments" && !uniqueBkiDetailIds.includes(+IR[j].BKI_DETAIL_ID)) {
						// Add only if BKI_DETAIL_ID is not already in the array
						uniqueBkiDetailIds.push(+IR[j].BKI_DETAIL_ID);
					}
				}
				const OSTAmount = await BookingService.outStandingAmountforDashboard(bookings[i].BK_ID);
				let cleanNumber = formatBuyersContact(bookings[i].Member.BuyerContact);
				bookings[i].setDataValue("BK_ID", bookings[i].BK_ID);
				bookings[i].setDataValue("advanceAmount", advAmount);
				bookings[i].setDataValue("totalAmount", totalAmount);
				bookings[i].setDataValue("amountPaid", paidAmount);
				bookings[i].setDataValue("amountRemaing", totalAmount - (paidAmount + advAmount));
				bookings[i].setDataValue("InstallmentsUnpaidCount", bkiDetailIds.length - uniqueBkiDetailIds.length);
				bookings[i].setDataValue(
					"oustadingMonthCount",
					totalMonthsDiff == 0 && OSTAmount.outstandingAmt != 0 ? OSTAmount.count : totalMonthsDiff
				);
				bookings[i].setDataValue("outStandingAmount", OSTAmount.outstandingAmt);
				bookings[i].setDataValue("uniqueBkiDetailIds", uniqueBkiDetailIds.length);
				bookings[i].setDataValue("buyerContact", cleanNumber);

				overAllTotal += totalAmount;
				data.push({
					booking: bookings[i]
				});
				bkiDetailIds = [];
				uniqueBkiDetailIds = [];
			}

			return res.send({
				mesasge: "Bookings Retrieved Successfully!",
				data: data,
				overAllTotal
			});
		} catch (error) {
			return next(error);
		}
	};

	static searchBookingByVCNO = async (req, res) => {
		try {
			const searchItem = req.body.search;

			let data = [];
			let uniqueBkiDetailIds = [];
			let bkiDetailIds = [];

			console.log(1);

			const bookings = await Booking.findAll({
				attributes: ["BK_ID", "Reg_Code_Disply", "SRForm_No", "Form_Code", "Total_Amt", "Advance_Amt", "Status"],
				where: {
					Reg_Code_Disply: searchItem
				},
				include: [
					{
						where: { BKI_TYPE: null },
						attributes: [
							"BKI_DETAIL_ID",
							"Installment_Month",
							"Installment_Due",
							"Installment_Paid",
							"Remaining_Amount",
							"BKI_TYPE"
						],
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails
					},
					{
						as: "Installment_Receipts",
						model: InstallmentReceipts,
						attributes: [
							"INS_RC_ID",
							"BK_ID",
							"Installment_Month",
							"Installment_Paid",
							"RECEIPT_HEAD",
							"BKI_DETAIL_ID"
						],
						where: { BK_ID: Sequelize.col("Booking_Mst.BK_ID") }, // Match BK_ID from Booking
						required: false
					},
					{ as: "Member", model: Member },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{
						as: "Unit",
						model: Unit,
						include: [{ as: "Block", model: Block }]
					}
				]
			});

			console.log(2);

			if (bookings.length === 0) {
				res.status(404).send({ meesage: "Booking not Found!" });
			} else {
				console.log(3);

				for (let i = 0; i < bookings.length; i++) {
					let paidAmount = 0;
					let totalAmount = 0;
					let advAmount = 0;
					let totalMonthsDiff = 0;

					console.log(4);

					advAmount += +bookings[i].Advance_Amt;
					const BID = bookings[i].Booking_Installment_Details;
					console.log(5);
					for (let j = 0; j < BID.length; j++) {
						console.log(6);
						let installmentDue = +BID[j].Installment_Due;
						totalAmount += installmentDue;
						bkiDetailIds.push(+BID[j].BKI_DETAIL_ID);
					}
					console.log(7);
					const IR = bookings[i].Installment_Receipts;
					for (let j = 0; j < IR.length; j++) {
						console.log(8);
						paidAmount += +IR[j].Installment_Paid;
						if (j === IR.length - 1) {
							console.log(9);
							const lastInstallmentMonth = IR[j].Installment_Month;

							const lastDate = new Date(lastInstallmentMonth);
							const currentDate = new Date();

							const yearDiff = currentDate.getFullYear() - lastDate.getFullYear();
							const monthDiff = currentDate.getMonth() - lastDate.getMonth();

							totalMonthsDiff = yearDiff * 12 + monthDiff;
						}
						if (IR[j].RECEIPT_HEAD === "installments" && !uniqueBkiDetailIds.includes(+IR[j].BKI_DETAIL_ID)) {
							console.log(10);
							// Add only if BKI_DETAIL_ID is not already in the array
							uniqueBkiDetailIds.push(+IR[j].BKI_DETAIL_ID);
						}
					}
					console.log(11);
					const OSTAmount = await BookingService.outStandingAmount(bookings[i].BK_ID);
					let cleanNumber = formatBuyersContact(bookings[i].Member.BuyerContact);
					bookings[i].setDataValue("BK_ID", bookings[i].BK_ID);
					bookings[i].setDataValue("advanceAmount", advAmount);
					bookings[i].setDataValue("totalAmount", totalAmount);
					bookings[i].setDataValue("amountPaid", paidAmount);
					bookings[i].setDataValue("amountRemaing", totalAmount - (paidAmount + advAmount));
					bookings[i].setDataValue("InstallmentsUnpaidCount", bkiDetailIds.length - uniqueBkiDetailIds.length);
					bookings[i].setDataValue("oustadingMonthCount", totalMonthsDiff);
					bookings[i].setDataValue("outStandingAmount", OSTAmount);
					bookings[i].setDataValue("uniqueBkiDetailIds", uniqueBkiDetailIds.length);

					bookings[i].setDataValue("buyerContact", cleanNumber);

					data.push({
						booking: bookings[i]
					});
					bkiDetailIds = [];
					uniqueBkiDetailIds = [];
				}

				return res.send({
					mesasge: "Bookings Retrieved Successfully!",
					data: data
				});
			}
		} catch (error) {
			res.status(500).send({ message: "Internal Server Error", error: error });
		}
	};

	static searchBookingByContact = async (req, res) => {
		try {
			const searchItem = req.body.search.trim().toLowerCase();

			let data = [];
			let uniqueBkiDetailIds = [];
			let bkiDetailIds = [];

			console.log(1);

			const bookings = await Booking.findAll({
				attributes: ["BK_ID", "Reg_Code_Disply", "SRForm_No", "Form_Code", "Total_Amt", "Advance_Amt", "Status"],
				include: [
					{
						where: { BKI_TYPE: null },
						attributes: [
							"BKI_DETAIL_ID",
							"Installment_Month",
							"Installment_Due",
							"Installment_Paid",
							"Remaining_Amount",
							"BKI_TYPE"
						],
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails
					},
					{
						as: "Installment_Receipts",
						model: InstallmentReceipts,
						attributes: [
							"INS_RC_ID",
							"BK_ID",
							"Installment_Month",
							"Installment_Paid",
							"RECEIPT_HEAD",
							"BKI_DETAIL_ID"
						],
						where: { BK_ID: Sequelize.col("Booking_Mst.BK_ID") }, // Match BK_ID from Booking
						required: false
					},
					{ as: "Member", model: Member, where: { BuyerContact: { [Sequelize.Op.like]: `%${searchItem}%` } } },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{
						as: "Unit",
						model: Unit,
						include: [{ as: "Block", model: Block }]
					}
				]
			});

			console.log(2);

			if (bookings.length === 0) {
				res.status(404).send({ meesage: "Booking not Found!" });
			} else {
				console.log(3);

				for (let i = 0; i < bookings.length; i++) {
					let paidAmount = 0;
					let totalAmount = 0;
					let advAmount = 0;
					let totalMonthsDiff = 0;

					console.log(4);

					advAmount += +bookings[i].Advance_Amt;
					const BID = bookings[i].Booking_Installment_Details;
					console.log(5);
					for (let j = 0; j < BID.length; j++) {
						console.log(6);
						let installmentDue = +BID[j].Installment_Due;
						totalAmount += installmentDue;
						bkiDetailIds.push(+BID[j].BKI_DETAIL_ID);
					}
					console.log(7);
					const IR = bookings[i].Installment_Receipts;
					for (let j = 0; j < IR.length; j++) {
						console.log(8);
						paidAmount += +IR[j].Installment_Paid;
						if (j === IR.length - 1) {
							console.log(9);
							const lastInstallmentMonth = IR[j].Installment_Month;

							const lastDate = new Date(lastInstallmentMonth);
							const currentDate = new Date();

							const yearDiff = currentDate.getFullYear() - lastDate.getFullYear();
							const monthDiff = currentDate.getMonth() - lastDate.getMonth();

							totalMonthsDiff = yearDiff * 12 + monthDiff;
						}
						if (IR[j].RECEIPT_HEAD === "installments" && !uniqueBkiDetailIds.includes(+IR[j].BKI_DETAIL_ID)) {
							console.log(10);
							// Add only if BKI_DETAIL_ID is not already in the array
							uniqueBkiDetailIds.push(+IR[j].BKI_DETAIL_ID);
						}
					}
					console.log(11);
					const OSTAmount = await BookingService.outStandingAmount(bookings[i].BK_ID);
					let cleanNumber = formatBuyersContact(bookings[i].Member.BuyerContact);
					bookings[i].setDataValue("BK_ID", bookings[i].BK_ID);
					bookings[i].setDataValue("advanceAmount", advAmount);
					bookings[i].setDataValue("totalAmount", totalAmount);
					bookings[i].setDataValue("amountPaid", paidAmount);
					bookings[i].setDataValue("amountRemaing", totalAmount - (paidAmount + advAmount));
					bookings[i].setDataValue("InstallmentsUnpaidCount", bkiDetailIds.length - uniqueBkiDetailIds.length);
					bookings[i].setDataValue("oustadingMonthCount", totalMonthsDiff);
					bookings[i].setDataValue("outStandingAmount", OSTAmount);
					bookings[i].setDataValue("uniqueBkiDetailIds", uniqueBkiDetailIds.length);

					bookings[i].setDataValue("buyerContact", cleanNumber);

					data.push({
						booking: bookings[i]
					});
					bkiDetailIds = [];
					uniqueBkiDetailIds = [];
				}

				return res.send({
					mesasge: "Bookings Retrieved Successfully!",
					data: data
				});
			}
		} catch (error) {
			res.status(500).send({ message: "Internal Server Error", error: error });
		}
	};

	static searchBookingByName = async (req, res) => {
		try {
			const searchItem = req.body.search;

			let data = [];
			let uniqueBkiDetailIds = [];
			let bkiDetailIds = [];
			const searchTerm = searchItem.trim().toLowerCase();
			console.log(1);

			const bookings = await Booking.findAll({
				attributes: ["BK_ID", "Reg_Code_Disply", "SRForm_No", "Form_Code", "Total_Amt", "Advance_Amt", "Status"],
				include: [
					{
						where: { BKI_TYPE: null },
						attributes: [
							"BKI_DETAIL_ID",
							"Installment_Month",
							"Installment_Due",
							"Installment_Paid",
							"Remaining_Amount",
							"BKI_TYPE"
						],
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails
					},
					{
						as: "Installment_Receipts",
						model: InstallmentReceipts,
						attributes: [
							"INS_RC_ID",
							"BK_ID",
							"Installment_Month",
							"Installment_Paid",
							"RECEIPT_HEAD",
							"BKI_DETAIL_ID"
						],
						where: { BK_ID: Sequelize.col("Booking_Mst.BK_ID") }, // Match BK_ID from Booking
						required: false
					},
					{
						as: "Member",
						model: Member,
						where: {
							BuyerName: {
								[Sequelize.Op.like]: `%${searchTerm}%` // Use LIKE for partial matches
							}
						}
					},
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{
						as: "Unit",
						model: Unit,
						include: [{ as: "Block", model: Block }]
					}
				]
			});

			console.log(2);

			if (bookings.length === 0) {
				res.status(404).send({ meesage: "Booking not Found!" });
			} else {
				console.log(3);

				for (let i = 0; i < bookings.length; i++) {
					let paidAmount = 0;
					let totalAmount = 0;
					let advAmount = 0;
					let totalMonthsDiff = 0;

					console.log(4);

					advAmount += +bookings[i].Advance_Amt;
					const BID = bookings[i].Booking_Installment_Details;
					console.log(5);
					for (let j = 0; j < BID.length; j++) {
						console.log(6);
						let installmentDue = +BID[j].Installment_Due;
						totalAmount += installmentDue;
						bkiDetailIds.push(+BID[j].BKI_DETAIL_ID);
					}
					console.log(7);
					const IR = bookings[i].Installment_Receipts;
					for (let j = 0; j < IR.length; j++) {
						console.log(8);
						paidAmount += +IR[j].Installment_Paid;
						if (j === IR.length - 1) {
							console.log(9);
							const lastInstallmentMonth = IR[j].Installment_Month;

							const lastDate = new Date(lastInstallmentMonth);
							const currentDate = new Date();

							const yearDiff = currentDate.getFullYear() - lastDate.getFullYear();
							const monthDiff = currentDate.getMonth() - lastDate.getMonth();

							totalMonthsDiff = yearDiff * 12 + monthDiff;
						}
						if (IR[j].RECEIPT_HEAD === "installments" && !uniqueBkiDetailIds.includes(+IR[j].BKI_DETAIL_ID)) {
							console.log(10);
							// Add only if BKI_DETAIL_ID is not already in the array
							uniqueBkiDetailIds.push(+IR[j].BKI_DETAIL_ID);
						}
					}
					console.log(11);
					const OSTAmount = await BookingService.outStandingAmount(bookings[i].BK_ID);
					let cleanNumber = formatBuyersContact(bookings[i].Member.BuyerContact);
					bookings[i].setDataValue("BK_ID", bookings[i].BK_ID);
					bookings[i].setDataValue("advanceAmount", advAmount);
					bookings[i].setDataValue("totalAmount", totalAmount);
					bookings[i].setDataValue("amountPaid", paidAmount);
					bookings[i].setDataValue("amountRemaing", totalAmount - (paidAmount + advAmount));
					bookings[i].setDataValue("InstallmentsUnpaidCount", bkiDetailIds.length - uniqueBkiDetailIds.length);
					bookings[i].setDataValue("oustadingMonthCount", totalMonthsDiff);
					bookings[i].setDataValue("outStandingAmount", OSTAmount);
					bookings[i].setDataValue("uniqueBkiDetailIds", uniqueBkiDetailIds.length);

					bookings[i].setDataValue("buyerContact", cleanNumber);

					data.push({
						booking: bookings[i]
					});
					bkiDetailIds = [];
					uniqueBkiDetailIds = [];
				}

				return res.send({
					mesasge: "Bookings Retrieved Successfully!",
					data: data
				});
			}
		} catch (error) {
			res.status(500).send({ message: "Internal Server Error", error: error });
		}
	};

	static searchBookingByCNIC = async (req, res) => {
		try {
			const searchItem = req.body.search.trim().toLowerCase();

			let data = [];
			let uniqueBkiDetailIds = [];
			let bkiDetailIds = [];

			console.log(1);

			const bookings = await Booking.findAll({
				attributes: ["BK_ID", "Reg_Code_Disply", "SRForm_No", "Form_Code", "Total_Amt", "Advance_Amt", "Status"],
				include: [
					{
						where: { BKI_TYPE: null },
						attributes: [
							"BKI_DETAIL_ID",
							"Installment_Month",
							"Installment_Due",
							"Installment_Paid",
							"Remaining_Amount",
							"BKI_TYPE"
						],
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails
					},
					{
						as: "Installment_Receipts",
						model: InstallmentReceipts,
						attributes: [
							"INS_RC_ID",
							"BK_ID",
							"Installment_Month",
							"Installment_Paid",
							"RECEIPT_HEAD",
							"BKI_DETAIL_ID"
						],
						where: { BK_ID: Sequelize.col("Booking_Mst.BK_ID") }, // Match BK_ID from Booking
						required: false
					},
					{ as: "Member", model: Member, where: { BuyerCNIC: { [Sequelize.Op.like]: `%${searchItem}%` } } },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{
						as: "Unit",
						model: Unit,
						include: [{ as: "Block", model: Block }]
					}
				]
			});

			console.log(2);

			if (bookings.length === 0) {
				res.status(404).send({ meesage: "Booking not Found!" });
			} else {
				console.log(3);

				for (let i = 0; i < bookings.length; i++) {
					let paidAmount = 0;
					let totalAmount = 0;
					let advAmount = 0;
					let totalMonthsDiff = 0;

					console.log(4);

					advAmount += +bookings[i].Advance_Amt;
					const BID = bookings[i].Booking_Installment_Details;
					console.log(5);
					for (let j = 0; j < BID.length; j++) {
						console.log(6);
						let installmentDue = +BID[j].Installment_Due;
						totalAmount += installmentDue;
						bkiDetailIds.push(+BID[j].BKI_DETAIL_ID);
					}
					console.log(7);
					const IR = bookings[i].Installment_Receipts;
					for (let j = 0; j < IR.length; j++) {
						console.log(8);
						paidAmount += +IR[j].Installment_Paid;
						if (j === IR.length - 1) {
							console.log(9);
							const lastInstallmentMonth = IR[j].Installment_Month;

							const lastDate = new Date(lastInstallmentMonth);
							const currentDate = new Date();

							const yearDiff = currentDate.getFullYear() - lastDate.getFullYear();
							const monthDiff = currentDate.getMonth() - lastDate.getMonth();

							totalMonthsDiff = yearDiff * 12 + monthDiff;
						}
						if (IR[j].RECEIPT_HEAD === "installments" && !uniqueBkiDetailIds.includes(+IR[j].BKI_DETAIL_ID)) {
							console.log(10);
							// Add only if BKI_DETAIL_ID is not already in the array
							uniqueBkiDetailIds.push(+IR[j].BKI_DETAIL_ID);
						}
					}
					console.log(11);
					const OSTAmount = await BookingService.outStandingAmount(bookings[i].BK_ID);
					let cleanNumber = formatBuyersContact(bookings[i].Member.BuyerContact);
					bookings[i].setDataValue("BK_ID", bookings[i].BK_ID);
					bookings[i].setDataValue("advanceAmount", advAmount);
					bookings[i].setDataValue("totalAmount", totalAmount);
					bookings[i].setDataValue("amountPaid", paidAmount);
					bookings[i].setDataValue("amountRemaing", totalAmount - (paidAmount + advAmount));
					bookings[i].setDataValue("InstallmentsUnpaidCount", bkiDetailIds.length - uniqueBkiDetailIds.length);
					bookings[i].setDataValue("oustadingMonthCount", totalMonthsDiff);
					bookings[i].setDataValue("outStandingAmount", OSTAmount);
					bookings[i].setDataValue("uniqueBkiDetailIds", uniqueBkiDetailIds.length);

					bookings[i].setDataValue("buyerContact", cleanNumber);

					data.push({
						booking: bookings[i]
					});
					bkiDetailIds = [];
					uniqueBkiDetailIds = [];
				}

				return res.send({
					mesasge: "Bookings Retrieved Successfully!",
					data: data
				});
			}
		} catch (error) {
			res.status(500).send({ message: "Internal Server Error", error: error });
		}
	};

	static searchBookingByPlotNo = async (req, res) => {
		try {
			const searchItem = req.body.search.trim();

			let data = [];
			let uniqueBkiDetailIds = [];
			let bkiDetailIds = [];

			console.log(1);

			const bookings = await Booking.findAll({
				attributes: ["BK_ID", "Reg_Code_Disply", "SRForm_No", "Form_Code", "Total_Amt", "Advance_Amt", "Status"],
				include: [
					{
						where: { BKI_TYPE: null },
						attributes: [
							"BKI_DETAIL_ID",
							"Installment_Month",
							"Installment_Due",
							"Installment_Paid",
							"Remaining_Amount",
							"BKI_TYPE"
						],
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails
					},
					{
						as: "Installment_Receipts",
						model: InstallmentReceipts,
						attributes: [
							"INS_RC_ID",
							"BK_ID",
							"Installment_Month",
							"Installment_Paid",
							"RECEIPT_HEAD",
							"BKI_DETAIL_ID"
						],
						where: { BK_ID: Sequelize.col("Booking_Mst.BK_ID") }, // Match BK_ID from Booking
						required: false
					},
					{ as: "Member", model: Member },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{
						as: "Unit",
						model: Unit,
						where: { Plot_No: searchItem },
						include: [{ as: "Block", model: Block }],
						required: true
					}
				]
			});

			console.log(2);

			if (bookings.length === 0) {
				res.status(404).send({ meesage: "Booking not Found!" });
			} else {
				console.log(3);

				for (let i = 0; i < bookings.length; i++) {
					let paidAmount = 0;
					let totalAmount = 0;
					let advAmount = 0;
					let totalMonthsDiff = 0;

					console.log(4);

					advAmount += +bookings[i].Advance_Amt;
					const BID = bookings[i].Booking_Installment_Details;
					console.log(5);
					for (let j = 0; j < BID.length; j++) {
						console.log(6);
						let installmentDue = +BID[j].Installment_Due;
						totalAmount += installmentDue;
						bkiDetailIds.push(+BID[j].BKI_DETAIL_ID);
					}
					console.log(7);
					const IR = bookings[i].Installment_Receipts;
					for (let j = 0; j < IR.length; j++) {
						console.log(8);
						paidAmount += +IR[j].Installment_Paid;
						if (j === IR.length - 1) {
							console.log(9);
							const lastInstallmentMonth = IR[j].Installment_Month;

							const lastDate = new Date(lastInstallmentMonth);
							const currentDate = new Date();

							const yearDiff = currentDate.getFullYear() - lastDate.getFullYear();
							const monthDiff = currentDate.getMonth() - lastDate.getMonth();

							totalMonthsDiff = yearDiff * 12 + monthDiff;
						}
						if (IR[j].RECEIPT_HEAD === "installments" && !uniqueBkiDetailIds.includes(+IR[j].BKI_DETAIL_ID)) {
							console.log(10);
							// Add only if BKI_DETAIL_ID is not already in the array
							uniqueBkiDetailIds.push(+IR[j].BKI_DETAIL_ID);
						}
					}
					console.log(11);
					const OSTAmount = await BookingService.outStandingAmount(bookings[i].BK_ID);
					let cleanNumber = formatBuyersContact(bookings[i].Member.BuyerContact);
					bookings[i].setDataValue("BK_ID", bookings[i].BK_ID);
					bookings[i].setDataValue("advanceAmount", advAmount);
					bookings[i].setDataValue("totalAmount", totalAmount);
					bookings[i].setDataValue("amountPaid", paidAmount);
					bookings[i].setDataValue("amountRemaing", totalAmount - (paidAmount + advAmount));
					bookings[i].setDataValue("InstallmentsUnpaidCount", bkiDetailIds.length - uniqueBkiDetailIds.length);
					bookings[i].setDataValue("oustadingMonthCount", totalMonthsDiff);
					bookings[i].setDataValue("outStandingAmount", OSTAmount);
					bookings[i].setDataValue("uniqueBkiDetailIds", uniqueBkiDetailIds.length);

					bookings[i].setDataValue("buyerContact", cleanNumber);

					data.push({
						booking: bookings[i]
					});
					bkiDetailIds = [];
					uniqueBkiDetailIds = [];
				}

				return res.send({
					mesasge: "Bookings Retrieved Successfully!",
					data: data
				});
			}
		} catch (error) {
			res.status(500).send({ message: "Internal Server Error", error: error });
		}
	};

	// SEARCH Booking BY ID
	static getBookingById = async (req, res, next) => {
		const BookingId = req.query.id;

		try {
			const book = await Booking.findOne({
				include: [
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector }
				],
				where: { BK_ID: BookingId }
			});
			if (!book) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			res.status(200).json({
				status: 200,
				message: "get Booking successfully",
				block: book
			});
		} catch (error) {
			return next(error);
		}
	};

	static createDevelopmentPlan = async (req, res, next) => {
		try {
			const allBookings = await Booking.findAll({ where: { Reg_Code_Disply: "VC121782" } });

			allBookings.map(async (booking) => {
				const ppObj = await PaymentPlan.findOne({
					where: { PS_ID: booking.PS_ID, UType_ID: booking.UType_ID }
				});
				Date.isLeapYear = function (year) {
					return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
				};

				Date.getDaysInMonth = function (year, month) {
					return [31, Date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
				};

				Date.prototype.isLeapYear = function () {
					return Date.isLeapYear(this.getFullYear());
				};

				Date.prototype.getDaysInMonth = function () {
					return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
				};
				Date.prototype.addMonths = function (value) {
					var n = this.getDate();
					this.setDate(1);
					this.setMonth(this.getMonth() + value);
					this.setDate(Math.min(n, this.getDaysInMonth()));
					return this;
				};

				function getDateOfEveryTenth(currentDate, day) {
					const currentYear = currentDate.getFullYear();
					const month = currentDate.getMonth();

					const date = new Date(currentYear, month, day);

					return date;
				}
				if (ppObj && ppObj.DC_START_DATE) {
					const myDate = new Date(ppObj.DC_START_DATE);
					const dueDate = myDate.addMonths(1);
					let totalAmount = 0;
					let BookingInstallmentDetailsO = [];

					let maxInstallment_Code = await BookingInstallmentDetails.max("Installment_Code");
					for (let i = 1; i <= ppObj.DC_NO_OF_INSTALLMENT; i++) {
						let amount = ppObj.DC_INSTALLMENT_AMOUNT;
						maxInstallment_Code = maxInstallment_Code + 1;

						if (i == ppObj.DC_NO_OF_INSTALLMENT) {
							amount = +ppObj.DC_TOTAL_AMOUNT - totalAmount;
						}

						totalAmount = totalAmount + +ppObj.DC_INSTALLMENT_AMOUNT;
						BookingInstallmentDetailsO.push({
							Due_Date: getDateOfEveryTenth(dueDate, 10).addMonths(i - 1),
							Installment_Month: getDateOfEveryTenth(dueDate, 1).addMonths(i - 1),
							Installment_Code: maxInstallment_Code,
							BK_ID: booking.BK_ID,
							BK_Reg_Code: booking.BK_ID,
							InsType_ID: 1,
							Installment_Due: amount,
							Installment_Paid: 0,
							Remaining_Amount: amount,
							IsCompleted: null,
							BKI_TYPE: "DC",
							USER_ID: booking.USER_ID,
							TIME_STAMP: new Date(),
							LAST_UPDATE: new Date(),
							IsDeleted: 0
						});
					}
					await BookingInstallmentDetails.bulkCreate(BookingInstallmentDetailsO);
				}
			});
			res.status(200).json({ message: "Booking installment details created successfully" });
		} catch (error) {
			next(error);
		}
	};

	static getBookingByCNIC = async (req, res, next) => {
		const CNIC = req.query.CNIC;

		try {
			const book = await Booking.findAll({
				include: [
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector }
				],
				where: {
					"$Member.BuyerCNIC$": {
						[Sequelize.Op.like]: `%${CNIC}%`
					}
				}
			});
			if (book.length < 1) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			res.status(200).json({
				status: 200,
				message: "get Booking successfully",
				block: book
			});
		} catch (error) {
			return next(error);
		}
	};

	// GET ALL AVAILABLE Booking
	static getAllBookings = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		const Name = req.query.Name;
		const Form_Code = req.query.Form_Code;
		const VCNO = req.query.vcNo;
		const plotSize = req.query.plotSize;
		const category = req.query.category;
		const status = req.query.status;

		try {
			// if(!Name && !Form_Code || 1==1) {
			// console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
			let where = {
				IsDeleted: 0,
				[Op.or]: [
					{
						[Op.and]: [
							{ "$Member.BuyerName$": { [Op.like]: `%${Name || ""}%` } },
							{ Form_Code: { [Op.like]: `%${Form_Code || ""}%` } },
							{ Reg_Code_Disply: { [Op.like]: `%${VCNO || ""}%` } },
							{ "$UnitType.Name$": { [Op.like]: `%${category || ""}%` } },
							{ "$PlotSize.Name$": { [Op.like]: `%${plotSize || ""}%` } },
							{ Status: { [Op.like]: `%${status || ""}%` } }
						]
					}
				]
			};

			const userId = req.user.id;
			const role = req.user.role;
			const roleName = await UserRole.findAll({ where: { id: role } });

			if (roleName.length > 0 && roleName[0].name !== "Admin" && roleName[0].name !== "Partner") {
				where = {
					IsDeleted: 0,
					USER_ID: userId,
					[Op.or]: [
						{
							[Op.and]: [
								{ "$Member.BuyerName$": { [Op.like]: `%${Name || ""}%` } },
								{ Form_Code: { [Op.like]: `%${Form_Code || ""}%` } },
								{ Reg_Code_Disply: { [Op.like]: `%${VCNO || ""}%` } },
								{ "$UnitType.Name$": { [Op.like]: `%${category || ""}%` } },
								{ "$PlotSize.Name$": { [Op.like]: `%${plotSize || ""}%` } },
								{ Status: { [Op.like]: `%${status || ""}%` } }
							]
						}
					]
				};
			}

			const { count, rows } = await Booking.findAndCountAll({
				include: [
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "SecondMember", model: Member },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
				],
				where: where,
				offset: limit * page,
				limit: limit,
				order: [["BK_ID", "DESC"]]
			});

			if (rows.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all Block Successfully",
				Blocks: rows,
				totalPage: Math.ceil(count / limit) + 1,
				totalRecords: count,
				page,
				limit
			});
			// }
		} catch (error) {
			return next(error);
		}
	};

	///UPDATE Booking
	static updateBooking = async (req, res, next) => {
		// console.log("hello");

		const BookingId = req.query.id;
		try {
			const exist = await Booking.findOne({ where: { BK_ID: BookingId } });
			// console.log(exist, "assssssssssssssssssssssssss");
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const result = await Booking.update(req.body, {
				where: { BK_ID: BookingId },
				returning: true
			});
			res.status(200).json({
				status: 200,
				message: " Booking  updated successfully",
				"Updated Booking": result
			});
		} catch (error) {
			return next(error);
		}
	};
	///UPDATE Booking Status
	static updateBookingStatus = async (req, res, next) => {
		const BookingId = req.query.id;
		const { status, Unit_ID, VC_NO } = req.body;
		try {
			const exist = await Booking.findOne({ where: { BK_ID: BookingId } });

			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			let result;
			if (Unit_ID) {
				result = await Booking.update(
					{ Unit_ID: Unit_ID, UnitAssign_DATE: new Date() },
					{ where: { BK_ID: BookingId } }
				);
			}
			if (status) {
				if (status == "Merged") {
					if (!VC_NO) {
						return next(CustomErrorHandler.notFound("VC_NO is required"));
					}
					const search = await Booking.findOne({
						where: { Reg_Code_Disply: VC_NO }
					});
					if (!search) {
						return next(CustomErrorHandler.notFound("VC_NO is not exist"));
					}
					result = await Booking.update({ Status: status, MERGED_VCNO: VC_NO }, { where: { BK_ID: BookingId } });
				} else {
					result = await Booking.update({ Status: status }, { where: { BK_ID: BookingId } });
				}
			}

			res.status(200).json({
				status: 200,
				message: " Booking update successfully",
				"Updated Booking": result
			});
		} catch (error) {
			// console.log("error: ", error);
			return next(error);
		}
	};
	/////Delete Booking

	static deleteBooking = async (req, res, next) => {
		const { id } = req.query;
		let data;
		try {
			const exist = await Booking.findOne({ where: { BK_ID: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			if (!exist.IsDeleted) {
				data = await Booking.update({ IsDeleted: 1 }, { where: { BK_ID: id }, returning: true });
			}
			res.status(200).json({
				status: 200,
				message: "Booking Deleted successfully",
				"Deleted Booking": data
			});
		} catch (error) {
			return next(error);
		}
	};

	static createfileAcknowlegmentLetter = async (req, res, next) => {
		const id = req.query.id;

		try {
			const file = await Booking.findOne({
				include: [
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Sector", model: Sector },
					{ as: "Phase", model: Phase },
					{ as: "SecondMember", model: Member },
					{ as: "User", model: User }
				],
				where: { BK_ID: id }
			});

			if (!file) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			const userobj = await User.findOne({ where: { id: req.user.id } });
			// console.log('req.user',userobj);

			file.toJSON();
			const pdf = await pdfGenerator.acknowlegmentLetterGenerator(file, userobj);

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` }
			});
		} catch (error) {
			return next(error);
		}
	};

	static createpaymentPlan = async (req, res, next) => {
		const id = req.query.id;
		const trsr_id = req.query.TRSR_ID;
		const transfer = req.query.transfer;
		const receipt_head = req.query.receipt_head;
		let TRSData;
		try {
			if (trsr_id) {
				TRSData = await TRSRequest.findOne({
					where: { TRSR_ID: trsr_id },
					include: [{ as: "Member", model: Member }]
				});
			}
			const booking = await Booking.findOne({
				where: { BK_ID: id },
				include: [
					{ as: "Member", model: Member },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Unit", model: Unit, include: { as: "Block", model: Block } },
					{ as: "Location", model: MYLocation }
				]
			});

			if (!booking) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			booking.toJSON();

			let installmentReceipts;
			let installmentReceipt;
			let devInsReceipts;
			if (transfer) {
				installmentReceipts = await BookingInstallmentDetails.findAll({
					order: [["Installment_Code", "ASC"]],
					where: {
						BK_ID: booking.BK_ID,
						MEMBER_ID: booking.MEMBER_ID,
						[Op.or]: [{ BKI_TYPE: null }, { BKI_TYPE: "PP" }]
					}
				});
				devInsReceipts = await BookingInstallmentDetails.findAll({
					order: [["Installment_Code", "ASC"]],
					where: {
						BK_ID: booking.BK_ID,
						MEMBER_ID: booking.MEMBER_ID,
						BKI_TYPE: "DC"
					}
				});
				installmentReceipt = await InstallmentReceipts.findAll({
					BK_ID: booking.BK_ID
				});
			} else {
				installmentReceipts = await BookingInstallmentDetails.findAll({
					order: [["Installment_Code", "ASC"]],

					where: {
						BK_ID: booking.BK_ID,
						[Op.or]: [{ BKI_TYPE: null }, { BKI_TYPE: "PP" }]
					}
				});
				devInsReceipts = await BookingInstallmentDetails.findAll({
					order: [["Installment_Code", "ASC"]],
					where: { BK_ID: booking.BK_ID, BKI_TYPE: "DC" }
				});
			}
			// console.log("INSTALLMENTRECIPTS", installmentReceipts, "RECIPT HEAD", receipt_head, "TRSData", TRSData);
			const pdf = await pdfGenerator.paymentPlanGenerator(
				booking,
				installmentReceipts,
				installmentReceipt,
				receipt_head,
				TRSData,
				devInsReceipts
			);
			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` },
				data: devInsReceipts
			});
		} catch (error) {
			return next(error);
		}
	};

	static createStatement = async (req, res, next) => {
		var id = req.query.id;
		const vcNo = req.query.vcNo;
		// let ser = await BookingService.surcharges(vcNo);

		let booking1 = await Booking.findOne({ where: { Reg_Code_Disply: vcNo } });
		console.log("BOKINNNGGG", booking1);
		let ostamount = await BookingService.outStandingAmountofJuly(booking1.BK_ID);

		const createdAt = new Date(booking1.createdAt);
		const currentDate = new Date();

		const july2024 = new Date("2024-07-01");
		const august2024 = new Date("2024-08-01");
		let whereClause = {
			BK_ID: booking1.BK_ID
		};

		// Check if the current date is after August 2024 and if ostamount is greater than 0
		let applySurcharges = currentDate >= august2024 && ostamount > 0;
		let find = await InstallmentReceipts.findOne({ where: { BK_ID: booking1.BK_ID, Installment_Month: july2024 } });
		if (find) {
			console.log("hi");
			whereClause.Installment_Month = {
				[Op.between]: [august2024, currentDate]
			};
		} else {
			whereClause.Installment_Month = {
				[Op.between]: [createdAt, currentDate]
			};
		}
		console.log(whereClause);
		let before = await InstallmentReceipts.findAll({
			where: whereClause,
			include: [
				{
					as: "Booking_Installment_Details",
					model: BookingInstallmentDetails,
					where: { InsType_ID: [1, 2], BKI_TYPE: null }
				}
			]
		});
		console.log("BeFOREeeeeeeeeeeee", before);
		const surchargeRate = 0.001;
		let surcharge = 0;
		let total = 0;

		for (let i = 0; i < before.length; i++) {
			const ircDate = new Date(before[i].IRC_Date);
			const dueDate = new Date(before[i].Booking_Installment_Details.Due_Date);

			const differenceInMilliseconds = ircDate - dueDate;
			const millisecondsInOneDay = 1000 * 60 * 60 * 24;
			const differenceInDays = differenceInMilliseconds / millisecondsInOneDay;

			// Check if the installment month is July 2024 and if ostamount was 0 during July
			if (differenceInDays < 0) {
				await InstallmentReceipts.update({ surCharges: 0 }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
			} else if (differenceInDays > 0) {
				surcharge = parseInt(before[i].Installment_Due) * surchargeRate * differenceInDays;
				total = total + surcharge;
				await InstallmentReceipts.update(
					{ surCharges: surcharge },
					{
						where: { INS_RC_ID: before[i].INS_RC_ID }
					}
				);
			}
			// else {
			// 	await InstallmentReceipts.update({ surCharges: 0 }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
			// }
		}
		let lastInstallmentMonth;
		let lastPaidInstallment = await InstallmentReceipts.findOne({
			where: { BK_ID: booking1.BK_ID },
			order: [["Installment_Month", "DESC"]] // Get the most recent payment
		});
		console.log(lastInstallmentMonth);

		// if (!lastPaidInstallment) {
		// 	// lastInstallmentMonth =
		// 	console.log("No installment records found.");
		// } else {
		// }

		if (!lastPaidInstallment) {
			// lastInstallmentMonth =
			var newLastInstallmentPaid = await BookingInstallmentDetails.findOne({
				where: { BK_ID: booking1.BK_ID, BKI_TYPE: null }
				// order: [["Installment_Month", "ASE"]]
			});
			if (!newLastInstallmentPaid) {
				let id = booking1.BK_ID;

				var booking = await Booking.findByPk(id, {
					include: [
						{ as: "Member", model: Member },
						{ as: "Phase", model: Phase },
						{ as: "Sector", model: Sector },
						{ as: "MemNominee", model: MemNominee },
						{ as: "UnitType", model: UnitType },
						{ as: "PlotSize", model: PlotSize },
						{ as: "PaymentPlan", model: PaymentPlan },
						{ as: "UnitNature", model: UnitNature },
						{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
					]
				});

				if (!booking) {
					return next(CustomErrorHandler.notFound("Data not found!"));
				}

				booking.toJSON();
				// console.log(booking);

				const installmentReceipts = await BookingInstallmentDetails.findAll({
					order: [["Installment_Code", "ASC"]],
					where: { BK_ID: booking.BK_ID }
				});

				// const installmentReceipts= await InstallmentReceipts.findAll({include:[{as:'Installment_Type',model:InstallmentType},{as:'Payment_Mode',model:payment_mode}], where: { BK_ID: booking.BK_ID } });

				var installmentPaidReceipts = await InstallmentReceipts.findAll({
					where: { BK_ID: booking.BK_ID }
				});
				var insRecpData = installmentReceipts.filter((item) => item.BKI_TYPE !== "DC");
				var dcInsRecpData = installmentReceipts.filter((item) => item.BKI_TYPE == "DC");
				const pdf = await pdfGenerator.statementGenerator(booking, insRecpData, dcInsRecpData, installmentPaidReceipts);
			} else {
				lastInstallmentMonth = new Date(newLastInstallmentPaid.Installment_Month);
			}

			console.log("No installment records found.");
		} else {
			lastInstallmentMonth = new Date(lastPaidInstallment.Installment_Month);
		}
		// lastInstallmentMonth = new Date(lastPaidInstallment.Installment_Month);
		// Step 2: Calculate the next installment month
		let nextInstallmentMonth = new Date(lastInstallmentMonth);

		const currentDate2 = new Date();
		let surcharge2 = 0;

		// Loop through each month from the last installment month to the current month
		while (nextInstallmentMonth < currentDate2) {
			nextInstallmentMonth.setMonth(nextInstallmentMonth.getMonth() + 1); // Move to the next month
			let nextInstallmentMonthFormatted = `${nextInstallmentMonth.getFullYear()}-${(nextInstallmentMonth.getMonth() + 1)
				.toString()
				.padStart(2, "0")}-10`;

			console.log(`Processing month: ${nextInstallmentMonthFormatted}`);

			// Get the due date for the next installment month
			let nextInstallmentDetails = await BookingInstallmentDetails.findOne({
				where: {
					BK_ID: booking1.BK_ID,
					Due_Date: nextInstallmentMonthFormatted
				}
			});

			if (!nextInstallmentDetails) {
				console.log(`No installment details found for ${nextInstallmentMonthFormatted}.`);
				continue;
			}

			// Step 3: Calculate the surcharge for this installment
			const dueDate = new Date(nextInstallmentDetails.Due_Date);
			const differenceInMilliseconds = currentDate2 - dueDate;
			const millisecondsInOneDay = 1000 * 60 * 60 * 24;
			const differenceInDays = Math.floor(differenceInMilliseconds / millisecondsInOneDay);

			if (differenceInDays > 0) {
				surcharge2 = parseInt(nextInstallmentDetails.Installment_Due) * surchargeRate * differenceInDays;
				total = total + surcharge2;
				// Update the installment details with the calculated surcharge
				await BookingInstallmentDetails.update(
					{ surCharges: surcharge2 },
					{
						where: {
							BK_ID: booking1.BK_ID,
							Due_Date: nextInstallmentMonthFormatted
						}
					}
				);

				console.log(`Surcharge applied for ${nextInstallmentMonthFormatted}: ${surcharge2}`);
			}
		}
		let remainingsurcharges = parseFloat(booking1.remainingSurcharges);
		let paidSurcharges = parseFloat(booking1.paidSurcharges);

		const updateBooking = await Booking.update(
			{ totalSurcharges: total, remainingSurcharges: total - paidSurcharges },
			{ where: { Reg_Code_Disply: vcNo } }
		);

		try {
			let id = booking1.BK_ID;

			const booking = await Booking.findByPk(id, {
				include: [
					{ as: "Member", model: Member },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
				]
			});

			if (!booking) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			booking.toJSON();
			// console.log(booking);

			const installmentReceipts = await BookingInstallmentDetails.findAll({
				order: [["Installment_Code", "ASC"]],
				where: { BK_ID: booking.BK_ID }
			});

			// const installmentReceipts= await InstallmentReceipts.findAll({include:[{as:'Installment_Type',model:InstallmentType},{as:'Payment_Mode',model:payment_mode}], where: { BK_ID: booking.BK_ID } });

			const installmentPaidReceipts = await InstallmentReceipts.findAll({
				where: { BK_ID: booking.BK_ID }
			});
			const insRecpData = installmentReceipts.filter((item) => item.BKI_TYPE !== "DC");
			const dcInsRecpData = installmentReceipts.filter((item) => item.BKI_TYPE == "DC");
			const pdf = await pdfGenerator.statementGenerator(booking, insRecpData, dcInsRecpData, installmentPaidReceipts);

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` },
				booking,
				installmentReceipts: installmentPaidReceipts,
				dcInsRecpData,
				insRecpData
			});
		} catch (error) {
			return next(error);
		}
	};

	static createStatementForTest = async (req, res, next) => {
		// var id = req.query.id;
		// const vcNo = req.query.vcNo;
		// // let ser = await BookingService.surcharges(vcNo);
		let data = [
			"VC12707",
			"VC12804",
			"VC12805",
			"VC12806",
			"VC12807",
			"VC12808",
			"VC12231",
			"VC121159",
			"VC12633",
			"VC111056",
			"VC121057",
			"VC121058",
			"VC121422",
			"VC121038",
			"VC121094",
			"VC121102",
			"VC121108",
			"VC121110",
			"VC121113",
			"VC121119",
			"VC121095",
			"VC121101",
			"VC121100",
			"VC121103",
			"VC121111",
			"VC121118",
			"VC121104",
			"VC121105",
			"VC121109",
			"VC121096",
			"VC121114",
			"VC121116",
			"VC121097",
			"VC121112",
			"VC121117",
			"VC121115",
			"VC121106",
			"VC121099",
			"VC121107",
			"VC12115",
			"VC12116",
			"VC12117",
			"VC12118",
			"VC12119",
			"VC12121",
			"VC12123",
			"VC12125",
			"VC12126",
			"VC12128",
			"VC01282",
			"VC12456",
			"VC12457",
			"VC12458",
			"VC12459",
			"VC12460",
			"VC12461",
			"VC12462",
			"VC12463",
			"VC12873",
			"VC11773",
			"VC111059",
			"VC11219",
			"VC121161",
			"VC12732",
			"VC121124",
			"VC121125",
			"VC11692",
			"VC11340",
			"VC111204",
			"VC12310",
			"VC11557",
			"VC11556",
			"VC11558",
			"VC111242",
			"VC121071",
			"VC11624",
			"VC11277",
			"VC12570",
			"VC12570",
			"VC12571",
			"VC12572",
			"VC12573",
			"VC12565",
			"VC12566",
			"VC12567",
			"VC12568",
			"VC111004",
			"VC12809",
			"VC12309",
			"VC22560",
			"VC12703",
			"VC11916",
			"VC12559",
			"VC12512",
			"VC12510",
			"VC12142",
			"VC12479",
			"VC12342",
			"VC12474",
			"VC12982",
			"VC111371",
			"VC121481",
			"VC111128",
			"VC121196",
			"VC121172",
			"VC111493",
			"VC11705",
			"VC12189",
			"VC111600",
			"VC111599",
			"VC271003",
			"VC111245",
			"VC12682",
			"VC111235",
			"VC12370",
			"VC12748",
			"VC12147",
			"VC111021",
			"VC12839",
			"VC121395",
			"VC12760",
			"VC12761",
			"VC12766",
			"VC12765",
			"VC11254",
			"VC12255",
			"VC11256",
			"VC271191",
			"VC271190",
			"VC12842",
			"VC11844",
			"VC11843",
			"VC11744",
			"VC12743",
			"VC11837",
			"VC121290",
			"VC12819",
			"VC11720",
			"VC12490",
			"VC12489",
			"VC12970",
			"VC221626",
			"VC12525",
			"VC12249",
			"VC22471",
			"VC12950",
			"VC14150",
			"VC12707",
			"VC121174",
			"VC121159",
			"VC11778",
			"VC121042",
			"VC111569",
			"VC12477",
			"VC11598",
			"VC121731",
			"VC11442",
			"VC11441",
			"VC12455",
			"VC121018",
			"VC111182",
			"VC11905",
			"VC121154",
			"VC12292",
			"VC121373",
			"VC01145",
			"VC01249",
			"VC11543",
			"VC11291",
			"VC111194",
			"VC12483",
			"VC121195",
			"VC12178",
			"VC121152",
			"VC11660",
			"VC111560",
			"VC11619",
			"VC12618",
			"VC12407",
			"VC22529",
			"VC111038",
			"VC12472",
			"VC111064",
			"VC12545",
			"VC12526",
			"VC111033",
			"VC12877",
			"VC11983",
			"VC12145",
			"VC12942",
			"VC121651",
			"VC121740",
			"VC12171",
			"VC12170",
			"VC12169",
			"VC12168",
			"VC12167",
			"VC22553",
			"VC12579",
			"VC12519",
			"VC12527",
			"VC12518",
			"VC11528",
			"VC12801",
			"VC12802",
			"VC121216",
			"VC121217",
			"VC121422",
			"VC12993",
			"VC12994",
			"VC12995",
			"VC12996",
			"VC12997",
			"VC12998",
			"VC121121",
			"VC121150",
			"VC12315",
			"VC12128",
			"VC12115",
			"VC12116",
			"VC12117",
			"VC12118",
			"VC12119",
			"VC12121",
			"VC12123",
			"VC12125",
			"VC12126",
			"VC01282",
			"VC11695",
			"VC121563",
			"VC121098",
			"VC121094",
			"VC121102",
			"VC121108",
			"VC121110",
			"VC121113",
			"VC121119",
			"VC121095",
			"VC121101",
			"VC121100",
			"VC121103",
			"VC121111",
			"VC121118",
			"VC121104",
			"VC121105",
			"VC121109",
			"VC121096",
			"VC121114",
			"VC121116",
			"VC121097",
			"VC121112",
			"VC121117",
			"VC121115",
			"VC121106",
			"VC121099",
			"VC121107",
			"VC22531",
			"VC12811",
			"VC111059",
			"VC11773",
			"VC12873",
			"VC12524",
			"VC12525",
			"VC11219",
			"VC121161",
			"VC12456",
			"VC12457",
			"VC12458",
			"VC12459",
			"VC12460",
			"VC12461",
			"VC12462",
			"VC12463",
			"VC12732",
			"VC11692",
			"VC121124",
			"VC121125",
			"VC111242",
			"VC11557",
			"VC11556",
			"VC11558",
			"VC12310",
			"VC111204",
			"VC11340",
			"VC22492",
			"VC12493",
			"VC12499",
			"VC12500",
			"VC12501",
			"VC12494",
			"VC12503",
			"VC12502",
			"VC12495",
			"VC12498",
			"VC11277",
			"VC11624",
			"VC121071",
			"VC12570",
			"VC12571",
			"VC12572",
			"VC12573",
			"VC12565",
			"VC12566",
			"VC12567",
			"VC12568",
			"VC12510",
			"VC12512",
			"VC12559",
			"VC12703",
			"VC22560",
			"VC11916",
			"VC12883",
			"VC12820",
			"VC22485",
			"VC11680",
			"VC12376",
			"VC12377",
			"VC11753",
			"VC11922",
			"VC111233",
			"VC11933",
			"VC11930",
			"VC121526",
			"VC12525",
			"VC01154",
			"VC121529",
			"VC111412",
			"VC121339",
			"VC11415",
			"VC11416",
			"VC11417",
			"VC111077",
			"VC01322",
			"VC12174",
			"VC121241"
		];

		// let booking1 = await Booking.findAll({ where: { Reg_Code_Disply: vcNo } });
		let booking1 = await Booking.findAll({
			where: {
				Reg_Code_Disply: {
					[Op.notIn]: data // Exclude bookings with Reg_Code_Disply in the data array
				}
			}
		});
		for (let book = 0; booking1.length > book; book++) {
			const createdAt = new Date(booking1[book].createdAt);
			const currentDate = new Date();

			const july2024 = new Date("2024-07-01");
			const august2024 = new Date("2024-08-01");
			let whereClause = {
				BK_ID: booking1[book].BK_ID
			};

			// Check if the current date is after August 2024 and if ostamount is greater than 0
			let find = await InstallmentReceipts.findOne({
				where: { BK_ID: booking1[book].BK_ID, Installment_Month: july2024 }
			});
			if (find) {
				console.log("hi");
				whereClause.Installment_Month = {
					[Op.between]: [august2024, currentDate]
				};
			} else {
				whereClause.Installment_Month = {
					[Op.between]: [createdAt, currentDate]
				};
			}
			console.log(whereClause);
			let before = await InstallmentReceipts.findAll({
				where: whereClause,
				include: [
					{
						as: "Booking_Installment_Details",
						model: BookingInstallmentDetails,
						where: { InsType_ID: [1, 2], BKI_TYPE: null }
					}
				]
			});
			console.log(before);
			const surchargeRate = 0.001;
			let surcharge = 0;
			let total = 0;

			for (let i = 0; i < before.length; i++) {
				const ircDate = new Date(before[i].IRC_Date);
				const dueDate = new Date(before[i].Booking_Installment_Details.Due_Date);

				const differenceInMilliseconds = ircDate - dueDate;
				const millisecondsInOneDay = 1000 * 60 * 60 * 24;
				const differenceInDays = differenceInMilliseconds / millisecondsInOneDay;

				// Check if the installment month is July 2024 and if ostamount was 0 during July
				if (differenceInDays < 0) {
					await InstallmentReceipts.update({ surCharges: 0 }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
				} else if (differenceInDays > 0) {
					surcharge = parseInt(before[i].Installment_Due) * surchargeRate * differenceInDays;
					total = total + surcharge;
					await InstallmentReceipts.update(
						{ surCharges: surcharge },
						{
							where: { INS_RC_ID: before[i].INS_RC_ID }
						}
					);
				}
				// else {
				// 	await InstallmentReceipts.update({ surCharges: 0 }, { where: { INS_RC_ID: before[i].INS_RC_ID } });
				// }
			}
			let lastInstallmentMonth;
			let lastPaidInstallment = await InstallmentReceipts.findOne({
				where: { BK_ID: booking1[book].BK_ID },
				order: [["Installment_Month", "DESC"]] // Get the most recent payment
			});
			console.log(lastInstallmentMonth);

			if (!lastPaidInstallment) {
				// lastInstallmentMonth =
				var newLastInstallmentPaid = await BookingInstallmentDetails.findOne({
					where: { BK_ID: booking1[book].BK_ID, BKI_TYPE: null }
					// order: [["Installment_Month", "ASE"]]
				});
				if (!newLastInstallmentPaid) {
					let id = booking1[book].BK_ID;

					var booking = await Booking.findByPk(id, {
						include: [
							{ as: "Member", model: Member },
							{ as: "Phase", model: Phase },
							{ as: "Sector", model: Sector },
							{ as: "MemNominee", model: MemNominee },
							{ as: "UnitType", model: UnitType },
							{ as: "PlotSize", model: PlotSize },
							{ as: "PaymentPlan", model: PaymentPlan },
							{ as: "UnitNature", model: UnitNature },
							{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
						]
					});

					if (!booking) {
						return next(CustomErrorHandler.notFound("Data not found!"));
					}

					booking.toJSON();
					// console.log(booking);

					const installmentReceipts = await BookingInstallmentDetails.findAll({
						order: [["Installment_Code", "ASC"]],
						where: { BK_ID: booking.BK_ID }
					});

					// const installmentReceipts= await InstallmentReceipts.findAll({include:[{as:'Installment_Type',model:InstallmentType},{as:'Payment_Mode',model:payment_mode}], where: { BK_ID: booking.BK_ID } });

					var installmentPaidReceipts = await InstallmentReceipts.findAll({
						where: { BK_ID: booking.BK_ID }
					});
					var insRecpData = installmentReceipts.filter((item) => item.BKI_TYPE !== "DC");
					var dcInsRecpData = installmentReceipts.filter((item) => item.BKI_TYPE == "DC");
					const pdf = await pdfGenerator.statementGenerator(
						booking,
						insRecpData,
						dcInsRecpData,
						installmentPaidReceipts
					);
					continue;
				} else {
					lastInstallmentMonth = new Date(newLastInstallmentPaid.Installment_Month);
				}

				console.log("No installment records found.");
			} else {
				lastInstallmentMonth = new Date(lastPaidInstallment.Installment_Month);
			}

			// Step 2: Calculate the next installment month
			let nextInstallmentMonth = new Date(lastInstallmentMonth);

			const currentDate2 = new Date();
			let surcharge2 = 0;

			// Loop through each month from the last installment month to the current month
			while (nextInstallmentMonth < currentDate2) {
				nextInstallmentMonth.setMonth(nextInstallmentMonth.getMonth() + 1); // Move to the next month
				let nextInstallmentMonthFormatted = `${nextInstallmentMonth.getFullYear()}-${(
					nextInstallmentMonth.getMonth() + 1
				)
					.toString()
					.padStart(2, "0")}-10`;

				console.log(`Processing month: ${nextInstallmentMonthFormatted}`);

				// Get the due date for the next installment month
				let nextInstallmentDetails = await BookingInstallmentDetails.findOne({
					where: {
						BK_ID: booking1[book].BK_ID,
						Due_Date: nextInstallmentMonthFormatted
					}
				});

				if (!nextInstallmentDetails) {
					console.log(`No installment details found for ${nextInstallmentMonthFormatted}.`);
					continue;
				}

				// Step 3: Calculate the surcharge for this installment
				const dueDate = new Date(nextInstallmentDetails.Due_Date);
				const differenceInMilliseconds = currentDate2 - dueDate;
				const millisecondsInOneDay = 1000 * 60 * 60 * 24;
				const differenceInDays = Math.floor(differenceInMilliseconds / millisecondsInOneDay);

				if (differenceInDays > 0) {
					surcharge2 = parseInt(nextInstallmentDetails.Installment_Due) * surchargeRate * differenceInDays;
					total = total + surcharge2;
					// Update the installment details with the calculated surcharge
					await BookingInstallmentDetails.update(
						{ surCharges: surcharge2 },
						{
							where: {
								BK_ID: booking1[book].BK_ID,
								Due_Date: nextInstallmentMonthFormatted
							}
						}
					);

					console.log(`Surcharge applied for ${nextInstallmentMonthFormatted}: ${surcharge2}`);
				}
			}
			let remainingsurcharges = parseFloat(booking1[book].remainingSurcharges);
			let paidSurcharges = parseFloat(booking1[book].paidSurcharges);

			const updateBooking = await Booking.update(
				{ totalSurcharges: total, remainingSurcharges: total - paidSurcharges },
				{ where: { Reg_Code_Disply: booking1[book].Reg_Code_Disply } }
			);

			// try {
			let id = booking1[book].BK_ID;

			var booking = await Booking.findByPk(id, {
				include: [
					{ as: "Member", model: Member },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
				]
			});

			if (!booking) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			booking.toJSON();
			// console.log(booking);

			const installmentReceipts = await BookingInstallmentDetails.findAll({
				order: [["Installment_Code", "ASC"]],
				where: { BK_ID: booking.BK_ID }
			});

			// const installmentReceipts= await InstallmentReceipts.findAll({include:[{as:'Installment_Type',model:InstallmentType},{as:'Payment_Mode',model:payment_mode}], where: { BK_ID: booking.BK_ID } });

			var installmentPaidReceipts = await InstallmentReceipts.findAll({
				where: { BK_ID: booking.BK_ID }
			});
			var insRecpData = installmentReceipts.filter((item) => item.BKI_TYPE !== "DC");
			var dcInsRecpData = installmentReceipts.filter((item) => item.BKI_TYPE == "DC");
			const pdf = await pdfGenerator.statementGenerator(booking, insRecpData, dcInsRecpData, installmentPaidReceipts);

			// }
			//  catch (error) {
			// 	return next(error);
			// }
		}
		res.status(200).json({
			status: 200,
			message: "Get File details successfully",
			file: { url: `${process.env.APP_URL}/${pdf}` },
			booking,
			installmentReceipts: installmentPaidReceipts,
			dcInsRecpData,
			insRecpData
		});
	};

	static createStatementZip = async (req, res, next) => {
		// let allBooking = await Booking.findAll({ where: { id: {
		//     [Op.gte]: 1576
		// } } });

		let allBooking = await Booking.findAll({
			include: [
				{ as: "Member", model: Member },
				{ as: "Phase", model: Phase },
				{ as: "Sector", model: Sector },
				{ as: "MemNominee", model: MemNominee },
				{ as: "UnitType", model: UnitType },
				{ as: "PlotSize", model: PlotSize },
				{ as: "PaymentPlan", model: PaymentPlan },
				{ as: "UnitNature", model: UnitNature }
			]
		});

		for (let i = 0; i < allBooking.length; i++) {
			var id = allBooking[i].BK_ID;
			var vcNo = allBooking[i].Reg_Code_Disply;

			try {
				var booking = allBooking[i];

				if (!booking) {
					return next(CustomErrorHandler.notFound("Data not found!"));
				}

				booking.toJSON();

				const installmentReceipts = await BookingInstallmentDetails.findAll({
					order: [["Installment_Code", "ASC"]],
					where: { BK_ID: booking.BK_ID }
				});

				// const installmentReceipts= await InstallmentReceipts.findAll({include:[{as:'Installment_Type',model:InstallmentType},{as:'Payment_Mode',model:payment_mode}], where: { BK_ID: booking.BK_ID } });

				const installmentPaidReceipts = await InstallmentReceipts.findAll({
					where: { BK_ID: booking.BK_ID }
				});

				const pdf = await pdfGenerator.statementGeneratorZip(booking, installmentReceipts, installmentPaidReceipts);
			} catch (error) {
				// return next(error);
			}
		}

		return res.status(200).json({
			status: 200,
			message: "Zip File generated successfully"
			// file: {url: `${process.env.APP_URL}/${pdf}`},
			// installmentReceipts: installmentPaidReceipts,
		});
	};

	static bookingBlockPendingPayments = async (req, res, next) => {
		// let allBooking = await Booking.findAll({ where: { id: {
		//     [Op.gte]: 1576
		// } } });

		let allBooking = await Booking.findAll({
			include: [
				{ as: "Member", model: Member },
				{ as: "Phase", model: Phase },
				{ as: "Sector", model: Sector },
				{ as: "MemNominee", model: MemNominee },
				{ as: "UnitType", model: UnitType },
				{ as: "PlotSize", model: PlotSize },
				{ as: "PaymentPlan", model: PaymentPlan },
				{ as: "UnitNature", model: UnitNature }
			]
		});

		for (let i = 0; i < allBooking.length; i++) {
			var id = allBooking[i].BK_ID;
			var vcNo = allBooking[i].Reg_Code_Disply;

			try {
				var booking = allBooking[i];
			} catch (error) {
				// return next(error);
			}
		}

		return res.status(200).json({
			status: 200,
			message: "Zip File generated successfully"
			// file: {url: `${process.env.APP_URL}/${pdf}`},
			// installmentReceipts: installmentPaidReceipts,
		});
	};

	getOutstandingMonths = async (booking) => {
		const bookingInstallmentDetails = await BookingInstallmentDetails.findAll({
			order: [["Installment_Code", "ASC"]],
			where: { BK_ID: booking.BK_ID }
		});

		const installmentPaidReceipts = await InstallmentReceipts.findAll({
			where: { BK_ID: booking.BK_ID }
		});

		let remainingPaidOstBreak = 0;
		var remainingOstBreak = 0;
		var remainingOst = 0;
		var tillDatePaidAmt = 0;

		plans.map(async (item, i) => {
			const instMonth = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[1] : "");
			const instYear = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[0] : "");

			const IROBJECTS = installmentPaidReceipts.filter((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);

			if (remainingOstBreak == 0) {
				remainingOst += parseFloat(item.Installment_Due);
			}

			if (instMonth == new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
				remainingOstBreak = 1;
			}

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
		});

		outstandingAmt = remainingOst - tillDatePaidAmt;
	};

	///BK_Reg_Code
	static getBookingByCode = async (req, res, next) => {
		let id = req.query.id;
		let code = req.query.code;

		if (code) {
			// code = code.replace("VC", "");
		}

		try {
			let bkDetailObj = null;
			let bkObj = null;

			if (id && typeof id != "undefined") {
				const BKI = await BookingInstallmentDetails.findOne({
					where: { BKI_DETAIL_ID: id }
				});
				if (BKI) {
					bkObj = await Booking.findOne({
						where: { BK_ID: BKI.BK_ID },
						include: [
							{ as: "Member", model: Member },
							{ as: "Phase", model: Phase },
							{ as: "Sector", model: Sector },
							{ as: "MemNominee", model: MemNominee },
							{ as: "UnitType", model: UnitType },
							{ as: "PlotSize", model: PlotSize },
							{ as: "PaymentPlan", model: PaymentPlan },
							{ as: "UnitNature", model: UnitNature }
						]
					});
				}
			} else {
				bkObj = await Booking.findOne({
					where: { Reg_Code_Disply: code },
					include: [
						{ as: "Member", model: Member },
						{ as: "Phase", model: Phase },
						{ as: "Sector", model: Sector },
						{ as: "MemNominee", model: MemNominee },
						{ as: "UnitType", model: UnitType },
						{ as: "PlotSize", model: PlotSize },
						{ as: "PaymentPlan", model: PaymentPlan },
						{ as: "UnitNature", model: UnitNature }
					]
				});
				// }
			}

			if (bkObj.Status === "Blocked") {
				return next(CustomErrorHandler.notFound("File is blocked"));
				// return next(CustomErrorHandler.unavailable('File is blocked'))
			}
			if (bkObj.Status === "Merged") {
				return next(CustomErrorHandler.notFound("File is Merged"));
			}
			const installmentReceipts = await BookingInstallmentDetails.findAll({
				order: [["Installment_Code", "ASC"]],
				where: { BK_ID: bkObj.BK_ID }
			});

			const paymentPlanInstallments = installmentReceipts.filter((item) => item.BKI_TYPE !== "DC");
			const developmentChargesInstallments = installmentReceipts.filter((item) => item.BKI_TYPE == "DC");

			const installmentReceiptsObj = await InstallmentReceipts.findAll({
				include: [{ as: "Payment_Mode", model: Payment_Mode }],
				where: { BK_ID: bkObj.BK_ID }
			});

			if (installmentReceipts.length == 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			var newIDs = [];
			for (var i = 0; i < paymentPlanInstallments.length; i++) {
				var newData = paymentPlanInstallments[i];
				// newData.detailObj = ;

				newIDs.push({
					data: newData,
					obj: installmentReceiptsObj.filter((item) => item.BKI_DETAIL_ID == paymentPlanInstallments[i].BKI_DETAIL_ID)
				});
			}

			let dcNewIDs = [];
			for (var i = 0; i < developmentChargesInstallments.length; i++) {
				var newData = developmentChargesInstallments[i];
				// newData.detailObj = ;

				dcNewIDs.push({
					data: newData,
					obj: installmentReceiptsObj.filter(
						(item) => item.BKI_DETAIL_ID == developmentChargesInstallments[i].BKI_DETAIL_ID
					)
				});
			}

			// installmentReceipts.toJSON();
			const installmentTypes = await InstallmentType.findAll({ raw: true });

			return res.status(200).json({
				status: 200,
				message: "Get Booking successfully",
				file: installmentReceipts,
				types: installmentTypes,
				bkDetailObj: bkDetailObj,
				bkObj: bkObj,
				files: newIDs,
				dcFiles: dcNewIDs
			});
		} catch (error) {
			return next(error);
		}
	};

	static getBookingMemberName = async (req, res, next) => {
		const { Name } = req.query;

		try {
			let bkDetailObj = null;
			let bkObj = null;

			bkObj = await Booking.findOne({
				where: { "$Member.BuyerName$": { [Op.like]: `%${Name}%` } },
				include: [
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "PaymentPlan", model: PaymentPlan }
				]
			});
			// }

			return res.status(200).json({
				status: 200,
				message: "Get Booking successfully",
				bkDetailObj: bkDetailObj,
				bkObj: bkObj
			});
		} catch (error) {
			return next(error);
		}
	};

	static checkStatus = async () => {
		await BookingService.checkConsecutiveUnpaidInstallments();
		return res.status(200).json({ status: 200, Message: "Updated Status SuccessFull" });
	};
	static sampleLetter = async (req, res, next) => {
		const id = req.query.id;

		try {
			const file = await Booking.findOne({
				include: [
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Sector", model: Sector },
					{ as: "Phase", model: Phase },
					{ as: "User", model: User },
					{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
				],
				where: { BK_ID: id }
			});

			if (!file) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			const userobj = await User.findOne({ where: { id: req.user.id } });
			// console.log('req.user',userobj);

			file.toJSON();
			const pdf = await pdfGenerator.sampleLetter(file, userobj);

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` }
			});
		} catch (error) {
			return next(error);
		}
	};

	static updateUser = async (req, res, next) => {
		const TRSR_ID = req.body.TRSR_ID;
		const userId = req.body.userId;
		let result;
		try {
			if (!TRSR_ID) {
				return next(CustomErrorHandler.notFound("TRSR_ID is required"));
			}
			if (!userId) {
				return next(CustomErrorHandler.notFound("userId is required"));
			}
			const exist = await TRSRequest.findAll({ where: { TRSR_ID: TRSR_ID } });
			if (exist.length <= 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			// console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQ", TRSR_ID, userId);
			result = await TRSRequest.update({ ASSIGN_BY: userId }, { where: { TRSR_ID: TRSR_ID } });
			res.status(200).json({
				status: 200,
				Message: "Successfully fetch",
				data: result
			});
		} catch (error) {
			return next(error);
		}
	};

	static transferLetter = async (req, res, next) => {
		const TRSR_ID = req.query.id;
		try {
			// console.log('PPPPPPPPPPPPPp',item)
			const userobj = await User.findOne({ where: { id: req.user.id } });
			const TRSData = await TRSRequest.findOne({
				where: { TRSR_ID: TRSR_ID },
				include: [
					{ as: "Member", model: Member },
					{ as: "secondMember", model: Member }
				]
			});
			const file = await Booking.findOne({
				include: [
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Phase", model: Phase },
					{ as: "Sector", model: Sector },
					{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
				],
				where: { BK_ID: TRSData.BK_ID }
			});

			const totalInstallments = await BookingInstallmentDetails.sum("Installment_Due", {
				where: { BK_ID: file.BK_ID }
			});

			const installmentPaids = await InstallmentReceipts.sum("Installment_Paid", {
				where: { BK_ID: file.BK_ID, InsType_ID: [1, 2, 3, 4] }
			});

			if (!file) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			file.toJSON();
			const pdf = await pdfGenerator.transferLetter(
				file,
				0,
				{
					Block: file && file.Unit && file.Unit.Block && file.Unit.Block.Name,
					Category: file && file.UnitType && file.UnitType.Name,
					Size: file && file.PlotSize && file.PlotSize.Name,
					Plot: file && file.Unit && file.Unit.Plot_No,
					ClientName: TRSData && TRSData.Member && TRSData.Member.name,
					Registration: file && file.Reg_Code_Disply
				},
				userobj,
				totalInstallments,
				installmentPaids,
				TRSData
			);

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${pdf}` },
				data: file,
				TRSData
			});
		} catch (error) {
			return next(error);
		}
	};
	static ballotAllotLetter = async (req, res, next) => {
		const data = [
			{
				"Sr.": "149",
				"Member Name": "Muhammad Nawaz ",
				VC: "VC121804",
				Category: "Residential",
				Size: "5 Marlas",
				Block: "Touheed",
				Plot: "160"
			}
		];

		try {
			data.map(async (item, i) => {
				// console.log('PPPPPPPPPPPPPp',item)

				const file = await Booking.findOne({
					where: { Reg_Code_Disply: item.VC },
					include: [
						{ as: "Member", model: Member },
						{ as: "SecondMember", model: Member },
						{ as: "MemNominee", model: MemNominee },
						{ as: "PaymentPlan", model: PaymentPlan },
						{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
					]
				});

				if (!file) {
					return next(CustomErrorHandler.notFound("Data not found!"));
				}

				// const userobj = await User.findOne({ where: { id: req.user.id } });
				// console.log('req.user',userobj);

				file.toJSON();
				const pdf = await pdfGenerator.ballotAllotLetter(file, i, item);
			});

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${""}` }
			});
		} catch (error) {
			return next(error);
		}
	};

	static developmetChargesLetter = async (req, res, next) => {
		try {
			const data = await Booking.findAll({
				include: [
					{ as: "Member", model: Member },
					{ as: "SecondMember", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Sector", model: Sector },
					{ as: "Phase", model: Phase },
					{ as: "User", model: User },
					{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
				]
			});
			data.slice(0, 1).map(async (item, i) => {
				// console.log('PPPPPPPPPPPPPp',item)

				const userobj = await User.findOne({ where: { id: req.user.id } });
				// console.log('req.user',userobj);
				const pdf = await pdfGenerator.developmentChargesLetter(item, i, userobj);
			});

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				file: { url: `${process.env.APP_URL}/${""}` }
			});
		} catch (error) {
			return next(error);
		}
	};

	static plotSizeData = async (req, res, next) => {
		try {
			const data = await Booking.findAll({
				include: [
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "PaymentPlan", model: PaymentPlan },
					{ as: "UnitNature", model: UnitNature },
					{ as: "Sector", model: Sector },
					{ as: "Phase", model: Phase },
					{ as: "User", model: User },
					{ as: "Unit", model: Unit, include: { as: "Block", model: Block } }
				]
				// attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("BK_ID")), "BK_ID"]],
			});

			const result = await BookingService.generatePlotSizeData(data);
			// console.log("IIIIIIIIIIIIIIIIIIIIIIIII", result);
			res.status(200).json({
				status: 200,
				Message: "Updated Status SuccessFull",
				data: result
			});
		} catch (error) {
			// console.log("OOOOOOOOOOOOOOOOO", error);
			return next(error);
		}
	};

	static plotNumberAllot = async (req, res, next) => {
		const data = [
			{
				"Sr. #": 1,
				"Member Name": "Ahsan Ahmed",
				VC: "VC111772",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 7,
				Location: "Normal"
			},
			{
				"Sr. ": 2,
				"Member Name": "Umer Zahid",
				VC: "VC111773",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 10,
				Location: "Normal"
			},
			{
				"Sr. ": 3,
				"Member Name": "Muhammad Arif",
				VC: "VC11827",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 11,
				Location: "Normal"
			},
			{
				"Sr. ": 4,
				"Member Name": "Muhammad Javed",
				VC: "VC111314",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 12,
				Location: "Normal"
			},
			{
				"Sr. ": 5,
				"Member Name": "Rohail Angelo",
				VC: "VC121421",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 19,
				Location: "Normal"
			},
			{
				"Sr. ": 6,
				"Member Name": "Muhammad Mohsin",
				VC: "VC12372",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 20,
				Location: "Normal"
			},
			{
				"Sr. ": 7,
				"Member Name": "Amir Baig",
				VC: "VC12114",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 21,
				Location: "Normal"
			},
			{
				"Sr. ": 8,
				"Member Name": "Mir Maqsood Ul Rehman Hamdani",
				VC: "VC121070",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 22,
				Location: "Normal"
			},
			{
				"Sr. ": 9,
				"Member Name": "Nasir ALI Khan",
				VC: "VC12176",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 23,
				Location: "Normal"
			},
			{
				"Sr. ": 10,
				"Member Name": "Nasir ALI Khan",
				VC: "VC12177",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 24,
				Location: "Normal"
			},
			{
				"Sr. ": 11,
				"Member Name": "Nimra Khan",
				VC: "VC12184",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 25,
				Location: "Normal"
			},
			{
				"Sr. ": 12,
				"Member Name": "Mohammad ALI Khan",
				VC: "VC12182",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 26,
				Location: "Normal"
			},
			{
				"Sr. ": 13,
				"Member Name": "Haya Ghazali",
				VC: "VC121248",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 27,
				Location: "Normal"
			},
			{
				"Sr. ": 14,
				"Member Name": "NAZAM AMIN",
				VC: "VC121466",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 28,
				Location: "Normal"
			},
			{
				"Sr. ": 15,
				"Member Name": "Muhammad Awais Attari",
				VC: "VC121638",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 29,
				Location: "Normal"
			},
			{
				"Sr. ": 16,
				"Member Name": "Hassan Nawaz",
				VC: "VC12174",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "UMER",
				Plot: 30,
				Location: "Corner"
			},
			{
				"Sr. ": 17,
				"Member Name": "MASOOD AKHTAR",
				VC: "VC111503",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 31,
				Location: "Normal"
			},
			{
				"Sr. ": 18,
				"Member Name": "ASIM BASHIR ",
				VC: "VC11137",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 32,
				Location: "Normal"
			},
			{
				"Sr. ": 19,
				"Member Name": "M. RASHID MAHMOOD ",
				VC: "VC11940",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 33,
				Location: "Normal"
			},
			{
				"Sr. ": 20,
				"Member Name": "MAHMOOD FATEH AHSAN",
				VC: "VC11102",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 34,
				Location: "Normal"
			},
			{
				"Sr. ": 21,
				"Member Name": "QASIM ALI",
				VC: "VC11709",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 35,
				Location: "Normal"
			},
			{
				"Sr. ": 22,
				"Member Name": "SANIA CHUDHARY",
				VC: "VC11878",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 36,
				Location: "Normal"
			},
			{
				"Sr. ": 23,
				"Member Name": "AZEEM UL REHMAN",
				VC: "VC111244",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 37,
				Location: "Normal"
			},
			{
				"Sr. ": 24,
				"Member Name": "SOHAIL LATIF",
				VC: "VC111401",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 38,
				Location: "Normal"
			},
			{
				"Sr. ": 25,
				"Member Name": "M. OMAR QURESHI",
				VC: "VC11365",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 39,
				Location: "Normal"
			},
			{
				"Sr. ": 26,
				"Member Name": "ANIQA MAHOOR",
				VC: "VC111213",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 40,
				Location: "Normal"
			},
			{
				"Sr. ": 27,
				"Member Name": "MIAN TANVEER BASHIR ",
				VC: "VC11266",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 41,
				Location: "Normal"
			},
			{
				"Sr. ": 28,
				"Member Name": "SADAF ZEESHAN",
				VC: "VC11668",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 42,
				Location: "Normal"
			},
			{
				"Sr. ": 29,
				"Member Name": "MUHAMMAD ASLAM ZAHID",
				VC: "VC111520",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 43,
				Location: "Normal"
			},
			{
				"Sr. ": 30,
				"Member Name": "AROOBA AZHAR ",
				VC: "VC11307",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 44,
				Location: "Normal"
			},
			{
				"Sr. ": 31,
				"Member Name": "SAFIA AFZAL",
				VC: "VC111330",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 45,
				Location: "Normal"
			},
			{
				"Sr. ": 32,
				"Member Name": "AWAIS TAUFIQ",
				VC: "VC111137",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 46,
				Location: "Normal"
			},
			{
				"Sr. ": 33,
				"Member Name": "MEHBOOB ELAHIE",
				VC: "VC111512",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 47,
				Location: "Normal"
			},
			{
				"Sr. ": 34,
				"Member Name": "FATIMA SABIR ",
				VC: "VC11780",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 48,
				Location: "Normal"
			},
			{
				"Sr. ": 35,
				"Member Name": "BILAL MEHMOOD ",
				VC: "VC111325",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 49,
				Location: "Normal"
			},
			{
				"Sr. ": 36,
				"Member Name": "SHAHZAD AHMAD CH.",
				VC: "VC11679",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 50,
				Location: "Normal"
			},
			{
				"Sr. ": 37,
				"Member Name": "MEHREEN AHMED ",
				VC: "VC11195",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 51,
				Location: "Normal"
			},
			{
				"Sr. ": 38,
				"Member Name": "MIZLA IFTIKHAR",
				VC: "VC111463",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 52,
				Location: "Normal"
			},
			{
				"Sr. ": 39,
				"Member Name": "MOHSIN MUKHTAR",
				VC: "VC111363",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 53,
				Location: "Normal"
			},
			{
				"Sr. ": 40,
				"Member Name": "MUHAMMAD SAAD TARIQ",
				VC: "VC11151",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 54,
				Location: "Normal"
			},
			{
				"Sr. ": 41,
				"Member Name": "SYEDA FARIDA BANO ",
				VC: "VC11874",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 55,
				Location: "Normal"
			},
			{
				"Sr. ": 42,
				"Member Name": "SYEDA FARIDA BANO ",
				VC: "VC11875",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 56,
				Location: "Normal"
			},
			{
				"Sr. ": 43,
				"Member Name": "AFSHAN ARSHAD ",
				VC: "VC11234",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 57,
				Location: "Normal"
			},
			{
				"Sr. ": 44,
				"Member Name": "BEENISH QASIM ",
				VC: "VC11674",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 58,
				Location: "Normal"
			},
			{
				"Sr. ": 45,
				"Member Name": "MUHAMMAD AWAIS ZIA",
				VC: "VC111202",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 59,
				Location: "Normal"
			},
			{
				"Sr. ": 46,
				"Member Name": "MUHAMMAD IMRAN ",
				VC: "VC11681",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 60,
				Location: "Normal"
			},
			{
				"Sr. ": 47,
				"Member Name": "FAISAL EJAZ",
				VC: "VC111081",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 61,
				Location: "Normal"
			},
			{
				"Sr. ": 48,
				"Member Name": "HAFIZ M. NAUMAN QURESHI",
				VC: "VC11737",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 62,
				Location: "Normal"
			},
			{
				"Sr. ": 49,
				"Member Name": "MUHAMMAD SHAFAQAT SAEED",
				VC: "VC111492",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 63,
				Location: "Normal"
			},
			{
				"Sr. ": 50,
				"Member Name": "NASIR ALI",
				VC: "VC11261",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 64,
				Location: "Normal"
			},
			{
				"Sr. ": 51,
				"Member Name": "ADNAN MANZOOR",
				VC: "VC111226",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 65,
				Location: "Normal"
			},
			{
				"Sr. ": 52,
				"Member Name": "MUHAMMAD ALI",
				VC: "VC111361",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 66,
				Location: "Normal"
			},
			{
				"Sr. ": 53,
				"Member Name": "MUHAMMAD ABU-BAKAR",
				VC: "VC111374",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 67,
				Location: "Normal"
			},
			{
				"Sr. ": 54,
				"Member Name": "MUHAMMAD YAQOOB",
				VC: "VC111175",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 68,
				Location: "Normal"
			},
			{
				"Sr. ": 55,
				"Member Name": "SOBIA MUHAMMAD IMRAN ",
				VC: "VC11840",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 69,
				Location: "Normal"
			},
			{
				"Sr. ": 56,
				"Member Name": "MIAN TANVEER BASHIR ",
				VC: "VC11265",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 70,
				Location: "Normal"
			},
			{
				"Sr. ": 57,
				"Member Name": "MASOOD AKHTAR",
				VC: "VC111504",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 71,
				Location: "Normal"
			},
			{
				"Sr. ": 58,
				"Member Name": "HABIB-UR-REHMAN",
				VC: "VC11275",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 72,
				Location: "Normal"
			},
			{
				"Sr. ": 59,
				"Member Name": "Samrooz Abbas",
				VC: "VC111571",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 73,
				Location: "Normal"
			},
			{
				"Sr. ": 60,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC11374",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 74,
				Location: "Normal"
			},
			{
				"Sr. ": 61,
				"Member Name": "SANAULLAH",
				VC: "VC111132",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 75,
				Location: "Normal"
			},
			{
				"Sr. ": 62,
				"Member Name": "MUKHTAR AHMAD",
				VC: "VC111417",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 76,
				Location: "Normal"
			},
			{
				"Sr. ": 63,
				"Member Name": "SANA HABIB",
				VC: "VC11443",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 77,
				Location: "Normal"
			},
			{
				"Sr. ": 64,
				"Member Name": "FIDA HUSSAIN ",
				VC: "VC111200",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 78,
				Location: "Normal"
			},
			{
				"Sr. ": 65,
				"Member Name": "AZRA ZIA",
				VC: "VC11433",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 79,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 66,
				"Member Name": "FARHAN RASHID",
				VC: "VC01170",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 80,
				Location: "Corner"
			},
			{
				"Sr. ": 67,
				"Member Name": "IMRAN NAEEM",
				VC: "VC11358",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 81,
				Location: "Normal"
			},
			{
				"Sr. ": 68,
				"Member Name": "TOQEER AHMAD ",
				VC: "VC11274",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 82,
				Location: "Normal"
			},
			{
				"Sr. ": 69,
				"Member Name": "WASIM ABBASI",
				VC: "VC01135",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 83,
				Location: "Normal"
			},
			{
				"Sr. ": 70,
				"Member Name": "M. WASEEM ANWAR ",
				VC: "VC11330",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 84,
				Location: "Normal"
			},
			{
				"Sr. ": 71,
				"Member Name": "SYED HASHIM ALI SHAH",
				VC: "VC111072",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 85,
				Location: "Normal"
			},
			{
				"Sr. ": 72,
				"Member Name": "MOHAMMAD EJAZ",
				VC: "VC11698",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 86,
				Location: "Normal"
			},
			{
				"Sr. ": 73,
				"Member Name": "ISHFAQ AHMAD",
				VC: "VC11752",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 87,
				Location: "Normal"
			},
			{
				"Sr. ": 74,
				"Member Name": "SHAHZAD AHMAD CH. ",
				VC: "VC11678",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 88,
				Location: "Normal"
			},
			{
				"Sr. ": 75,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11667",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 89,
				Location: "Normal"
			},
			{
				"Sr. ": 76,
				"Member Name": "RUBINA MAHBOOB",
				VC: "VC11635",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 90,
				Location: "Normal"
			},
			{
				"Sr. ": 77,
				"Member Name": "ABDUL QAYYUM",
				VC: "VC111372",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 91,
				Location: "Normal"
			},
			{
				"Sr. ": 78,
				"Member Name": "SYED NAZIR HASAN",
				VC: "VC11449",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 92,
				Location: "Normal"
			},
			{
				"Sr. ": 79,
				"Member Name": "SEYYAD ZISHAN ALI ",
				VC: "VC11209",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 93,
				Location: "Normal"
			},
			{
				"Sr. ": 80,
				"Member Name": "TAHIRA IMRAN",
				VC: "VC11355",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 94,
				Location: "Normal"
			},
			{
				"Sr. ": 81,
				"Member Name": "KHURRAM SHAHZAD",
				VC: "VC111086",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 95,
				Location: "Normal"
			},
			{
				"Sr. ": 82,
				"Member Name": "MUHAMMAD SHAFI",
				VC: "VC11404",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 96,
				Location: "Normal"
			},
			{
				"Sr. ": 83,
				"Member Name": "MUHAMMAD ALTAF",
				VC: "VC111405",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 97,
				Location: "Normal"
			},
			{
				"Sr. ": 84,
				"Member Name": "ATTA ULLAH",
				VC: "VC11386",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 98,
				Location: "Normal"
			},
			{
				"Sr. ": 85,
				"Member Name": "SAJID ALI",
				VC: "VC11391",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 99,
				Location: "Normal"
			},
			{
				"Sr. ": 86,
				"Member Name": "ARHAM IMRAN",
				VC: "VC11357",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 100,
				Location: "Normal"
			},
			{
				"Sr. ": 87,
				"Member Name": "MUBASHIR REHMAN",
				VC: "VC11713",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 101,
				Location: "Corner"
			},
			{
				"Sr. ": 88,
				"Member Name": "AKIF RASHEED",
				VC: "VC111250",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 102,
				Location: "Corner"
			},
			{
				"Sr. ": 89,
				"Member Name": "MUDASAR ALI",
				VC: "VC11385",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 103,
				Location: "Normal"
			},
			{
				"Sr. ": 90,
				"Member Name": "KASHIF ILYAS ",
				VC: "VC11716",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 104,
				Location: "Normal"
			},
			{
				"Sr. ": 91,
				"Member Name": "ASSIA TARIQ",
				VC: "VC11432",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 105,
				Location: "Normal"
			},
			{
				"Sr. ": 92,
				"Member Name": "M. FARHAN QURESHI",
				VC: "VC11738",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 106,
				Location: "Normal"
			},
			{
				"Sr. ": 93,
				"Member Name": "SHAGUFTA JABEEN",
				VC: "VC11735",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 107,
				Location: "Normal"
			},
			{
				"Sr. ": 94,
				"Member Name": "S TAHIR SAJJAD BOKHARI",
				VC: "VC01142",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 108,
				Location: "Normal"
			},
			{
				"Sr. ": 95,
				"Member Name": "SOBIA RIZWAN ",
				VC: "VC11204",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 109,
				Location: "Normal"
			},
			{
				"Sr. ": 96,
				"Member Name": "ZESHAN ALI ",
				VC: "VC11781",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 110,
				Location: "Normal"
			},
			{
				"Sr. ": 97,
				"Member Name": "SYED MASOOD ALI",
				VC: "VC11574",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 111,
				Location: "Normal"
			},
			{
				"Sr. ": 98,
				"Member Name": "SANIA CHUDHARY",
				VC: "VC11879",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 112,
				Location: "Normal"
			},
			{
				"Sr. ": 99,
				"Member Name": "SHAHBAZ ALI",
				VC: "VC111477",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 113,
				Location: "Normal"
			},
			{
				"Sr. ": 100,
				"Member Name": "MUHAMMAD MOHSIN BHATTI",
				VC: "VC111510",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 114,
				Location: "Normal"
			},
			{
				"Sr. ": 101,
				"Member Name": "IQBAL BASHIR",
				VC: "VC11602",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 115,
				Location: "Normal"
			},
			{
				"Sr. ": 102,
				"Member Name": "MUHAMMAD MOHSIN BHATTI",
				VC: "VC111514",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 116,
				Location: "Normal"
			},
			{
				"Sr. ": 103,
				"Member Name": "RIDA SHAKIL",
				VC: "VC111496",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 117,
				Location: "Normal"
			},
			{
				"Sr. ": 104,
				"Member Name": "MUHAMMAD KASHIF ",
				VC: "VC111017",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 118,
				Location: "Normal"
			},
			{
				"Sr. ": 105,
				"Member Name": "MUHAMMAD IMRAN",
				VC: "VC11881",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 119,
				Location: "Normal"
			},
			{
				"Sr. ": 106,
				"Member Name": "ATIF AKHTAR BHATTI ",
				VC: "VC11193",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 120,
				Location: "Normal"
			},
			{
				"Sr. ": 107,
				"Member Name": "UZAIR BIN IMRAN",
				VC: "VC11356",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 121,
				Location: "Corner"
			},
			{
				"Sr. ": 108,
				"Member Name": "IQRA SITAR",
				VC: "VC11314",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 122,
				Location: "Corner"
			},
			{
				"Sr. ": 109,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11664",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 123,
				Location: "Normal"
			},
			{
				"Sr. ": 110,
				"Member Name": "ASIM RASHEED",
				VC: "VC111257",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 124,
				Location: "Normal"
			},
			{
				"Sr. ": 111,
				"Member Name": "ZAIN UL ABIDEEN",
				VC: "VC111247",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 125,
				Location: "Normal"
			},
			{
				"Sr. ": 112,
				"Member Name": "RANA EJAZ AHMED",
				VC: "VC11194",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 126,
				Location: "Normal"
			},
			{
				"Sr. ": 113,
				"Member Name": "ABDUL REHMAN",
				VC: "VC111513",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 127,
				Location: "Normal"
			},
			{
				"Sr. ": 114,
				"Member Name": "SIDRA AMIR",
				VC: "VC111570",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 128,
				Location: "Normal"
			},
			{
				"Sr. ": 115,
				"Member Name": "USMAN AHMAD",
				VC: "VC111539",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 129,
				Location: "Normal"
			},
			{
				"Sr. ": 116,
				"Member Name": "ASIM RASHEED",
				VC: "VC111258",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 130,
				Location: "Normal"
			},
			{
				"Sr. ": 117,
				"Member Name": "RANA DILDAR AHMAD",
				VC: "VC11616",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 131,
				Location: "Normal"
			},
			{
				"Sr. ": 118,
				"Member Name": "BATOOL EJAZ",
				VC: "VC01137",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 132,
				Location: "Normal"
			},
			{
				"Sr. ": 119,
				"Member Name": "MUHAMMAD ADIL KHAN ",
				VC: "VC111039",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 133,
				Location: "FP"
			},
			{
				"Sr. ": 120,
				"Member Name": "NAVEED AHMED",
				VC: "VC01186",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 134,
				Location: "FP"
			},
			{
				"Sr. ": 121,
				"Member Name": "HAFSA ASHFAQ",
				VC: "VC11896",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 135,
				Location: "FP"
			},
			{
				"Sr. ": 122,
				"Member Name": "FAISAL WAHEED KHAN",
				VC: "VC11469",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 136,
				Location: "FP"
			},
			{
				"Sr. ": 123,
				"Member Name": "FAISAL WAHEED KHAN",
				VC: "VC11468",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 137,
				Location: "FP"
			},
			{
				"Sr. ": 124,
				"Member Name": "SALMA BIBI",
				VC: "VC111262",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 138,
				Location: "FP"
			},
			{
				"Sr. ": 125,
				"Member Name": "MARIYAM FAHAD",
				VC: "VC11694",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 139,
				Location: "FP"
			},
			{
				"Sr. ": 126,
				"Member Name": "SHUMAILA MOHSIN",
				VC: "VC111297",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 140,
				Location: "FP"
			},
			{
				"Sr. ": 127,
				"Member Name": "SAQIB LATIF",
				VC: "VC11696",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 141,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 128,
				"Member Name": "MUHAMMAD TAHIR BASHIR",
				VC: "VC111212",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 142,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 129,
				"Member Name": "MAHEEN IMRAN",
				VC: "VC11359",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 143,
				Location: "FP"
			},
			{
				"Sr. ": 130,
				"Member Name": "MUHAMMAD IMRAN",
				VC: "VC111135",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 144,
				Location: "FP"
			},
			{
				"Sr. ": 131,
				"Member Name": "BASHIR AHMAD",
				VC: "VC111215",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 145,
				Location: "FP"
			},
			{
				"Sr. ": 132,
				"Member Name": "FAHAD ISLAM",
				VC: "VC11140",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 146,
				Location: "FP"
			},
			{
				"Sr. ": 133,
				"Member Name": "MUHAMMAD MOON SHAHZAD",
				VC: "VC111506",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 147,
				Location: "FP"
			},
			{
				"Sr. ": 134,
				"Member Name": "TOOBA HASSAN",
				VC: "VC111524",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 148,
				Location: "FP"
			},
			{
				"Sr. ": 135,
				"Member Name": "SAIMA TARIQ",
				VC: "VC111263",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 149,
				Location: "Normal"
			},
			{
				"Sr. ": 136,
				"Member Name": "UMAIR SABIR",
				VC: "VC11671",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 150,
				Location: "Normal"
			},
			{
				"Sr. ": 137,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC11375",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 151,
				Location: "Normal"
			},
			{
				"Sr. ": 138,
				"Member Name": "MUHAMMAD AKRAM ",
				VC: "VC11631",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 152,
				Location: "Normal"
			},
			{
				"Sr. ": 139,
				"Member Name": "IJAZ AHMAD",
				VC: "VC11478",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 153,
				Location: "Normal"
			},
			{
				"Sr. ": 140,
				"Member Name": "MUHAMMAD AWAIS",
				VC: "VC11410",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 154,
				Location: "Normal"
			},
			{
				"Sr. ": 141,
				"Member Name": "ARSHAD JAVED",
				VC: "VC111203",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 155,
				Location: "Normal"
			},
			{
				"Sr. ": 142,
				"Member Name": "AQSA IZHAR",
				VC: "VC11436",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 156,
				Location: "Normal"
			},
			{
				"Sr. ": 143,
				"Member Name": "MUHAMMAD ADIL KHAN ",
				VC: "VC11980",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 157,
				Location: "Normal"
			},
			{
				"Sr. ": 144,
				"Member Name": "MARYUM MAHMOOD ",
				VC: "VC11153",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 158,
				Location: "Normal"
			},
			{
				"Sr. ": 145,
				"Member Name": "AYESHA AHMED ",
				VC: "VC11623",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 159,
				Location: "Normal"
			},
			{
				"Sr. ": 146,
				"Member Name": "MOUZAM JAVED ",
				VC: "VC11179",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 160,
				Location: "Normal"
			},
			{
				"Sr. ": 147,
				"Member Name": "FAISAL EJAZ",
				VC: "VC111082",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 161,
				Location: "Normal"
			},
			{
				"Sr. ": 148,
				"Member Name": "SOBIA NOUMAN",
				VC: "VC11789",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 162,
				Location: "Corner"
			},
			{
				"Sr. ": 149,
				"Member Name": "MUHAMMAD IMRAN",
				VC: "VC11882",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 163,
				Location: "Corner"
			},
			{
				"Sr. ": 150,
				"Member Name": "MUHAMMAD KAMRAN",
				VC: "VC111474",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 164,
				Location: "Normal"
			},
			{
				"Sr. ": 151,
				"Member Name": "MUHAMMAD KHALID ",
				VC: "VC11945",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 165,
				Location: "Normal"
			},
			{
				"Sr. ": 152,
				"Member Name": "MUHAMMAD JAVED",
				VC: "VC111505",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 166,
				Location: "Normal"
			},
			{
				"Sr. ": 153,
				"Member Name": "RANA HAFEEZ ULLAH",
				VC: "VC11431",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 167,
				Location: "Normal"
			},
			{
				"Sr. ": 154,
				"Member Name": "FATIMA AFZAAL",
				VC: "VC111229",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 168,
				Location: "Normal"
			},
			{
				"Sr. ": 155,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11665",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 169,
				Location: "Normal"
			},
			{
				"Sr. ": 156,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11666",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 170,
				Location: "Normal"
			},
			{
				"Sr. ": 157,
				"Member Name": "YASIR IQBAL",
				VC: "VC11390",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 171,
				Location: "Normal"
			},
			{
				"Sr. ": 158,
				"Member Name": "YASIR IQBAL",
				VC: "VC11388",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 172,
				Location: "Normal"
			},
			{
				"Sr. ": 159,
				"Member Name": "YASIR IQBAL",
				VC: "VC11389",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 173,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 160,
				"Member Name": "SYED KANWAL ZAIDI",
				VC: "VC11450",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 174,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 161,
				"Member Name": "MUHAMMAD SHAKEEL",
				VC: "VC11625",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 176,
				Location: "Normal"
			},
			{
				"Sr. ": 162,
				"Member Name": "AKIF RASHEED",
				VC: "VC111251",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 177,
				Location: "Normal"
			},
			{
				"Sr. ": 163,
				"Member Name": "SHAGUFTA JABEEN",
				VC: "VC11736",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 178,
				Location: "Normal"
			},
			{
				"Sr. ": 164,
				"Member Name": "HINA QAISER",
				VC: "VC11774",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 179,
				Location: "Normal"
			},
			{
				"Sr. ": 165,
				"Member Name": "BALAL AHMAD",
				VC: "VC11101",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 180,
				Location: "Normal"
			},
			{
				"Sr. ": 166,
				"Member Name": "SHAZIA TASNEEM",
				VC: "VC11348",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 181,
				Location: "Normal"
			},
			{
				"Sr. ": 167,
				"Member Name": "IZMA ANWAR",
				VC: "VC111085",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 182,
				Location: "Normal"
			},
			{
				"Sr. ": 168,
				"Member Name": "MUHAMMAD BASHIR ",
				VC: "VC11782",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 183,
				Location: "Normal"
			},
			{
				"Sr. ": 169,
				"Member Name": "M. AZEEM QURESHI",
				VC: "VC11351",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 184,
				Location: "Corner"
			},
			{
				"Sr. ": 170,
				"Member Name": "ZILE HUMA",
				VC: "VC111365",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 185,
				Location: "Corner"
			},
			{
				"Sr. ": 171,
				"Member Name": "MUHAMMAD BILAL",
				VC: "VC11408",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 186,
				Location: "Normal"
			},
			{
				"Sr. ": 172,
				"Member Name": "SHAHZADA ANJUM",
				VC: "VC11790",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 187,
				Location: "Normal"
			},
			{
				"Sr. ": 173,
				"Member Name": "MUHAMMAD ZEESHAN",
				VC: "VC11830",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 188,
				Location: "Normal"
			},
			{
				"Sr. ": 174,
				"Member Name": "MUHAMMAD NASIR",
				VC: "VC01168",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 189,
				Location: "Normal"
			},
			{
				"Sr. ": 175,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11663",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 190,
				Location: "Normal"
			},
			{
				"Sr. ": 176,
				"Member Name": "ZUHAIB KHALID",
				VC: "VC11228",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 191,
				Location: "Normal"
			},
			{
				"Sr. ": 177,
				"Member Name": "FATIMA HABIB",
				VC: "VC01178",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 192,
				Location: "Normal"
			},
			{
				"Sr. ": 178,
				"Member Name": "USMAN AHMAD",
				VC: "VC11772",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 193,
				Location: "Normal"
			},
			{
				"Sr. ": 179,
				"Member Name": "GHULAM ALI",
				VC: "VC111471",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 194,
				Location: "Normal"
			},
			{
				"Sr. ": 180,
				"Member Name": "SHAHZAD AHMAD CHAUDHARY ",
				VC: "VC11677",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 195,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 181,
				"Member Name": "AKIF RASHEED",
				VC: "VC111252",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 196,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 182,
				"Member Name": "BIBI RUKHSANA",
				VC: "VC111367",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 197,
				Location: "Normal"
			},
			{
				"Sr. ": 183,
				"Member Name": "ZULQARNAIN HABIB",
				VC: "VC111302",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 199,
				Location: "Normal"
			},
			{
				"Sr. ": 184,
				"Member Name": "KASHIF ILYAS ",
				VC: "VC11715",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 200,
				Location: "Normal"
			},
			{
				"Sr. ": 185,
				"Member Name": "KASHIF ILYAS ",
				VC: "VC11714",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 201,
				Location: "Normal"
			},
			{
				"Sr. ": 186,
				"Member Name": "ASAD TARIQ ",
				VC: "VC11158",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 202,
				Location: "Normal"
			},
			{
				"Sr. ": 187,
				"Member Name": "MUHAMMAD YOUNAS",
				VC: "VC111228",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 203,
				Location: "Normal"
			},
			{
				"Sr. ": 188,
				"Member Name": "AYESHA SAQIB",
				VC: "VC111315",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 204,
				Location: "Normal"
			},
			{
				"Sr. ": 189,
				"Member Name": "MUHAMMAD ARSLAN",
				VC: "VC111425",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 205,
				Location: "Corner"
			},
			{
				"Sr. ": 190,
				"Member Name": "JAVARIA SALEEM",
				VC: "VC111034",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 206,
				Location: "Corner"
			},
			{
				"Sr. ": 191,
				"Member Name": "TOOBA HASSAN",
				VC: "VC111521",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 207,
				Location: "Normal"
			},
			{
				"Sr. ": 192,
				"Member Name": "Maqsood Ahmad",
				VC: "VC111661",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 208,
				Location: "Normal"
			},
			{
				"Sr. ": 193,
				"Member Name": "Zukhruf Umair",
				VC: "VC11466",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 209,
				Location: "Normal"
			},
			{
				"Sr. ": 194,
				"Member Name": "SAJID MUNIR",
				VC: "VC111460",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 210,
				Location: "Normal"
			},
			{
				"Sr. ": 195,
				"Member Name": "SAJID MUNIR",
				VC: "VC111461",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 211,
				Location: "Normal"
			},
			{
				"Sr. ": 196,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC111543",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 212,
				Location: "Normal"
			},
			{
				"Sr. ": 197,
				"Member Name": "Samrooz Abbas",
				VC: "VC111572",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 213,
				Location: "Normal"
			},
			{
				"Sr. ": 198,
				"Member Name": "Murad ALI",
				VC: "VC11371",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 214,
				Location: "FP"
			},
			{
				"Sr. ": 199,
				"Member Name": "Ch. Sohil",
				VC: "VC11392",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 215,
				Location: "FP"
			},
			{
				"Sr. ": 200,
				"Member Name": "Ch. Sohil",
				VC: "VC11393",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 216,
				Location: "FP"
			},
			{
				"Sr. ": 201,
				"Member Name": "Ch. Sohil",
				VC: "VC11394",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 217,
				Location: "FP"
			},
			{
				"Sr. ": 202,
				"Member Name": "Ch. Sohil",
				VC: "VC11395",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 218,
				Location: "FP"
			},
			{
				"Sr. ": 203,
				"Member Name": "ALI Hamza",
				VC: "VC11398",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 219,
				Location: "FP"
			},
			{
				"Sr. ": 204,
				"Member Name": "ALI Hamza",
				VC: "VC11399",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 220,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 205,
				"Member Name": "ALI Hamza",
				VC: "VC11400",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 221,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 206,
				"Member Name": "ALI Hamza",
				VC: "VC11401",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 222,
				Location: "FP"
			},
			{
				"Sr. ": 207,
				"Member Name": "Kouser Parveen",
				VC: "VC11446",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 223,
				Location: "FP"
			},
			{
				"Sr. ": 208,
				"Member Name": "Muhammad Aslam Tabasum",
				VC: "VC11427",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 224,
				Location: "FP"
			},
			{
				"Sr. ": 209,
				"Member Name": "Fakhar Husnain",
				VC: "VC11473",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 225,
				Location: "FP"
			},
			{
				"Sr. ": 210,
				"Member Name": "Muhammad UMER ALI Usmani / Muhammad ALI",
				VC: "VC111774",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 226,
				Location: "FP"
			},
			{
				"Sr. ": 211,
				"Member Name": "Muhammad Javed",
				VC: "VC11396",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 227,
				Location: "FP"
			},
			{
				"Sr. ": 212,
				"Member Name": "Sameer Ahmad",
				VC: "VC1756",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 228,
				Location: "FP"
			},
			{
				"Sr. ": 213,
				"Member Name": "Zeeshan Nazir",
				VC: "VC11384",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 229,
				Location: "FP"
			},
			{
				"Sr. ": 214,
				"Member Name": "Muhammad Shafique",
				VC: "VC111791",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 230,
				Location: "Normal"
			},
			{
				"Sr. ": 215,
				"Member Name": "Nayab Imtiaz",
				VC: "VC111717",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 231,
				Location: "Normal"
			},
			{
				"Sr. ": 216,
				"Member Name": "Muhammad Iqbal",
				VC: "VC11918",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 232,
				Location: "Normal"
			},
			{
				"Sr. ": 217,
				"Member Name": "Faizan Tariq",
				VC: "VC111584",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 233,
				Location: "Normal"
			},
			{
				"Sr. ": 218,
				"Member Name": "SAJID ALI",
				VC: "VC111541",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 234,
				Location: "Normal"
			},
			{
				"Sr. ": 219,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC111545",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 235,
				Location: "Normal"
			},
			{
				"Sr. ": 220,
				"Member Name": "MUHAMMAD AMJAD",
				VC: "VC111555",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 236,
				Location: "Normal"
			},
			{
				"Sr. ": 221,
				"Member Name": "Muhammad Attique",
				VC: "VC11216",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 238,
				Location: "Normal"
			},
			{
				"Sr. ": 222,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC111542",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 239,
				Location: "Normal"
			},
			{
				"Sr. ": 223,
				"Member Name": "Kashif Raza",
				VC: "VC111426",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 240,
				Location: "Corner"
			},
			{
				"Sr. ": 224,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC111544",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 241,
				Location: "Corner"
			},
			{
				"Sr. ": 225,
				"Member Name": "Abdul Rehman",
				VC: "VC111660",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 242,
				Location: "Normal"
			},
			{
				"Sr. ": 226,
				"Member Name": "Nisha Uzair",
				VC: "VC01131",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 243,
				Location: "Normal"
			},
			{
				"Sr. ": 227,
				"Member Name": "Zeeshan Arif",
				VC: "VC111610",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 244,
				Location: "Normal"
			},
			{
				"Sr. ": 228,
				"Member Name": "Akbar ALI",
				VC: "VC111781",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 245,
				Location: "Normal"
			},
			{
				"Sr. ": 229,
				"Member Name": "Nadeem Ahmed",
				VC: "VC11898",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 246,
				Location: "Normal"
			},
			{
				"Sr. ": 230,
				"Member Name": "Muhammad Qasim",
				VC: "VC11596",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 247,
				Location: "Normal"
			},
			{
				"Sr. ": 231,
				"Member Name": "Abdul Raheem Hussain",
				VC: "VC11697",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 248,
				Location: "Normal"
			},
			{
				"Sr. ": 232,
				"Member Name": "Mian Waqar Ahmed",
				VC: "VC111183",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 249,
				Location: "Normal"
			},
			{
				"Sr. ": 233,
				"Member Name": "Muhammad Faraz Ul Haq",
				VC: "VC11273",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 250,
				Location: "Normal"
			},
			{
				"Sr. ": 234,
				"Member Name": "ALI Ahmad",
				VC: "VC01139",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 251,
				Location: "Normal"
			},
			{
				"Sr. ": 235,
				"Member Name": "Muhammad Adnan Haider",
				VC: "VC11159",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 252,
				Location: "Normal"
			},
			{
				"Sr. ": 236,
				"Member Name": "Shan Saleem",
				VC: "VC111402",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 253,
				Location: "Normal"
			},
			{
				"Sr. ": 237,
				"Member Name": "Zeeshan ALI",
				VC: "VC111036",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 254,
				Location: "Normal"
			},
			{
				"Sr. ": 238,
				"Member Name": "Qaisar Ashraf",
				VC: "VC111727",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 255,
				Location: "Normal"
			},
			{
				"Sr. ": 239,
				"Member Name": "Shahzad Ahmad Khan",
				VC: "VC111766",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 256,
				Location: "Normal"
			},
			{
				"Sr. ": 240,
				"Member Name": "Muhammad Asif Naeem",
				VC: "VC11373",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 257,
				Location: "Normal"
			},
			{
				"Sr. ": 241,
				"Member Name": "Muhammad Shafi",
				VC: "VC11403",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 258,
				Location: "Normal"
			},
			{
				"Sr. ": 242,
				"Member Name": "Syed Sajjad Hussain",
				VC: "VC11258",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 259,
				Location: "Normal"
			},
			{
				"Sr. ": 243,
				"Member Name": "Jawad Usman",
				VC: "VC111324",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 260,
				Location: "Corner"
			},
			{
				"Sr. ": 244,
				"Member Name": "Mushtaq Zauque Diamond",
				VC: "VC111693",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 261,
				Location: "Corner"
			},
			{
				"Sr. ": 245,
				"Member Name": "Muhammad Younas",
				VC: "VC111763",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 262,
				Location: "Normal"
			},
			{
				"Sr. ": 246,
				"Member Name": "Tasleem Kousar",
				VC: "VC111662",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 263,
				Location: "Normal"
			},
			{
				"Sr. ": 247,
				"Member Name": "Ghulam Mustafa Nayyer Alvi",
				VC: "VC111457",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 264,
				Location: "Normal"
			},
			{
				"Sr. ": 248,
				"Member Name": "Rafia Tabassum",
				VC: "VC111589",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 265,
				Location: "Normal"
			},
			{
				"Sr. ": 249,
				"Member Name": "Muhammad Munir Khan",
				VC: "VC11885",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 266,
				Location: "Normal"
			},
			{
				"Sr. ": 250,
				"Member Name": "Muhammad Munir Khan",
				VC: "VC11884",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 267,
				Location: "Normal"
			},
			{
				"Sr. ": 251,
				"Member Name": "Muhammad Touqeer Tariq",
				VC: "VC01153",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 268,
				Location: "Normal"
			},
			{
				"Sr. ": 252,
				"Member Name": "Tanveer Ahmad",
				VC: "VC111491",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 269,
				Location: "Normal"
			},
			{
				"Sr. ": 253,
				"Member Name": "Mah Noor Karim",
				VC: "VC11825",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 270,
				Location: "Normal"
			},
			{
				"Sr. ": 254,
				"Member Name": "Waqar Ahmad",
				VC: "VC11649",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 271,
				Location: "Normal"
			},
			{
				"Sr. ": 255,
				"Member Name": "Waqar Ahmad",
				VC: "VC11650",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 272,
				Location: "Normal"
			},
			{
				"Sr. ": 256,
				"Member Name": "Kiran Aftab",
				VC: "VC11643",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 273,
				Location: "Normal"
			},
			{
				"Sr. ": 257,
				"Member Name": "Haroon Mansha",
				VC: "VC11648",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "UMER",
				Plot: 274,
				Location: "Corner"
			},
			{
				"Sr. ": 258,
				"Member Name": "RIDA ASHFAQ",
				VC: "VC12757",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 1,
				Location: "Corner"
			},
			{
				"Sr. ": 259,
				"Member Name": "MIAN MOHAMMAD ASLAM",
				VC: "VC12213",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 2,
				Location: "Normal"
			},
			{
				"Sr. ": 260,
				"Member Name": "ZUBAIR AHMAD WASEEM",
				VC: "VC12110",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 3,
				Location: "Normal"
			},
			{
				"Sr. ": 261,
				"Member Name": "MUHAMMAD AWAIS",
				VC: "VC121223",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 4,
				Location: "Normal"
			},
			{
				"Sr. ": 262,
				"Member Name": "AHMAD WAQAR ",
				VC: "VC12871",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 5,
				Location: "Normal"
			},
			{
				"Sr. ": 263,
				"Member Name": "MAMOONA RIAZ",
				VC: "VC12769",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 6,
				Location: "Normal"
			},
			{
				"Sr. ": 264,
				"Member Name": "SABA BABAR ",
				VC: "VC12989",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 7,
				Location: "Normal"
			},
			{
				"Sr. ": 265,
				"Member Name": "AYESHA BIBI ",
				VC: "VC121439",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 8,
				Location: "Normal"
			},
			{
				"Sr. ": 266,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC121078",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 9,
				Location: "Normal"
			},
			{
				"Sr. ": 267,
				"Member Name": "AMIR SHAHZAD",
				VC: "VC12406",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 10,
				Location: "Normal"
			},
			{
				"Sr. ": 268,
				"Member Name": "MUHAMMAD WAQAS SABIR ",
				VC: "VC12633",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 11,
				Location: "Normal"
			},
			{
				"Sr. ": 269,
				"Member Name": "SAHJEED HUSSAIN",
				VC: "VC12886",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 12,
				Location: "Normal"
			},
			{
				"Sr. ": 270,
				"Member Name": "S. TAHIR SAJJAD BUKHARI",
				VC: "VC121430",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 13,
				Location: "Normal"
			},
			{
				"Sr. ": 271,
				"Member Name": "IFFAT ALIA",
				VC: "VC01284",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 14,
				Location: "Normal"
			},
			{
				"Sr. ": 272,
				"Member Name": "HUSNAIN RAZA",
				VC: "VC121304",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 15,
				Location: "Normal"
			},
			{
				"Sr. ": 273,
				"Member Name": "IMRAN AHMAD QURESHI",
				VC: "VC121397",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 16,
				Location: "Normal"
			},
			{
				"Sr. ": 274,
				"Member Name": "SAQIB ISRAR",
				VC: "VC01217",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 17,
				Location: "Normal"
			},
			{
				"Sr. ": 275,
				"Member Name": "IMRAN NAEEM",
				VC: "VC12684",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 18,
				Location: "Normal"
			},
			{
				"Sr. ": 276,
				"Member Name": "RANA HASSAN MUMTAZ",
				VC: "VC12304",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 19,
				Location: "FP"
			},
			{
				"Sr. ": 277,
				"Member Name": "HAMZAH RAAFEH KHANZADA ",
				VC: "VC121433",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 20,
				Location: "FP"
			},
			{
				"Sr. ": 278,
				"Member Name": "UMER FAROOQ MALIK",
				VC: "VC121138",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 21,
				Location: "FP"
			},
			{
				"Sr. ": 279,
				"Member Name": "ASHFAQ MAHMOOD",
				VC: "VC121083",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 22,
				Location: "FP"
			},
			{
				"Sr. ": 280,
				"Member Name": "MUHAMMAD HASSAN",
				VC: "VC121557",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 23,
				Location: "FP"
			},
			{
				"Sr. ": 281,
				"Member Name": "MUHAMMAD HASSAN",
				VC: "VC121558",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 24,
				Location: "Normal"
			},
			{
				"Sr. ": 282,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC121547",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 25,
				Location: "Normal"
			},
			{
				"Sr. ": 283,
				"Member Name": "MUKHTAR AHMAD",
				VC: "VC121416",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 26,
				Location: "Normal"
			},
			{
				"Sr. ": 284,
				"Member Name": "MADIHA BABAR",
				VC: "VC121458",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 27,
				Location: "Normal"
			},
			{
				"Sr. ": 285,
				"Member Name": "HAMZA MUKHTAR",
				VC: "VC12776",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 28,
				Location: "Normal"
			},
			{
				"Sr. ": 286,
				"Member Name": "MUHAMMAD SHAFIQUE ",
				VC: "VC12807",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 29,
				Location: "Normal"
			},
			{
				"Sr. ": 287,
				"Member Name": "AMJAD RASOOL AWAN",
				VC: "VC12726",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 30,
				Location: "Normal"
			},
			{
				"Sr. ": 288,
				"Member Name": "MUHAMMAD ZAHEER",
				VC: "VC01299",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 31,
				Location: "Normal"
			},
			{
				"Sr. ": 289,
				"Member Name": "MOHAMMAD ZAFAR IQBAL ",
				VC: "VC12586",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 32,
				Location: "Normal"
			},
			{
				"Sr. ": 290,
				"Member Name": "UMER SHEHZAD",
				VC: "VC12508",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 33,
				Location: "Normal"
			},
			{
				"Sr. ": 291,
				"Member Name": "MUHAMMAD SHAFIQUE ",
				VC: "VC12808",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 34,
				Location: "Normal"
			},
			{
				"Sr. ": 292,
				"Member Name": "ZULFIQAR ALI",
				VC: "VC121162",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 35,
				Location: "Normal"
			},
			{
				"Sr. ": 293,
				"Member Name": "FARHAN YOUSAF",
				VC: "VC121380",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 36,
				Location: "Normal"
			},
			{
				"Sr. ": 294,
				"Member Name": "NABEEL ANJUM",
				VC: "VC12160",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 37,
				Location: "Normal"
			},
			{
				"Sr. ": 295,
				"Member Name": "BUSHRA ALI",
				VC: "VC12217",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 38,
				Location: "Normal"
			},
			{
				"Sr. ": 296,
				"Member Name": "Syed Saqlain Raza Shah Naqvi (Dual Ownership)",
				VC: "VC12902",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 39,
				Location: "Corner"
			},
			{
				"Sr. ": 297,
				"Member Name": "M. FAWAD NASEEM ABBASI",
				VC: "VC01274",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 40,
				Location: "Normal"
			},
			{
				"Sr. ": 298,
				"Member Name": "MUHAMMAD SUFYAN ",
				VC: "VC12990",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 41,
				Location: "Normal"
			},
			{
				"Sr. ": 299,
				"Member Name": "ZEESHAN AFZAL",
				VC: "VC01281",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 42,
				Location: "Normal"
			},
			{
				"Sr. ": 300,
				"Member Name": "NAZIR AHMAD",
				VC: "VC121285",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 43,
				Location: "Normal"
			},
			{
				"Sr. ": 301,
				"Member Name": "NAIMA ARAB CHOUDHARY",
				VC: "VC121136",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 44,
				Location: "Normal"
			},
			{
				"Sr. ": 302,
				"Member Name": "NAZISH ZAFAR",
				VC: "VC121067",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 45,
				Location: "Normal"
			},
			{
				"Sr. ": 303,
				"Member Name": "SAIMA NOMAN",
				VC: "VC12724",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 46,
				Location: "Normal"
			},
			{
				"Sr. ": 304,
				"Member Name": "TAHIR RASHID",
				VC: "VC12686",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 47,
				Location: "Normal"
			},
			{
				"Sr. ": 305,
				"Member Name": "AMNA HASSAN",
				VC: "VC121166",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 48,
				Location: "Normal"
			},
			{
				"Sr. ": 306,
				"Member Name": "SYED AKHTAR HUSSAIN ZAIDI",
				VC: "VC12603",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 49,
				Location: "Normal"
			},
			{
				"Sr. ": 307,
				"Member Name": "SYED GHUFRAN AHMAD",
				VC: "VC121283",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 50,
				Location: "Normal"
			},
			{
				"Sr. ": 308,
				"Member Name": "SHAHID RASHEED",
				VC: "VC12593",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 51,
				Location: "Normal"
			},
			{
				"Sr. ": 309,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC121127",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 52,
				Location: "Normal"
			},
			{
				"Sr. ": 310,
				"Member Name": "MUHAMMAD SADIQ",
				VC: "VC121158",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 55,
				Location: "Normal"
			},
			{
				"Sr. ": 311,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC121126",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 56,
				Location: "Normal"
			},
			{
				"Sr. ": 312,
				"Member Name": "IMRAN AHMAD QURESHI",
				VC: "VC121396",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 57,
				Location: "Normal"
			},
			{
				"Sr. ": 313,
				"Member Name": "BADAR JAMAL",
				VC: "VC12437",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 58,
				Location: "Normal"
			},
			{
				"Sr. ": 314,
				"Member Name": "IQRA SARWAR",
				VC: "VC121532",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 59,
				Location: "Normal"
			},
			{
				"Sr. ": 315,
				"Member Name": "FARHAN RASHID",
				VC: "VC01269",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 60,
				Location: "Normal"
			},
			{
				"Sr. ": 316,
				"Member Name": "KINZA ARIF ",
				VC: "VC12276",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 61,
				Location: "Normal"
			},
			{
				"Sr. ": 317,
				"Member Name": "USMAN KHALID WARAICH ",
				VC: "VC12335",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 62,
				Location: "Normal"
			},
			{
				"Sr. ": 318,
				"Member Name": "SHAKEELA BASHARAT ",
				VC: "VC121429",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 63,
				Location: "Normal"
			},
			{
				"Sr. ": 319,
				"Member Name": "MALIK RIZWAN",
				VC: "VC121480",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 64,
				Location: "Normal"
			},
			{
				"Sr. ": 320,
				"Member Name": "NASEER AHMAD BUTT",
				VC: "VC121254",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 65,
				Location: "Normal"
			},
			{
				"Sr. ": 321,
				"Member Name": "RUSHNA SAFIA",
				VC: "VC121295",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 66,
				Location: "Normal"
			},
			{
				"Sr. ": 322,
				"Member Name": "MUHAMMAD WAQAS",
				VC: "VC121296",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 67,
				Location: "Normal"
			},
			{
				"Sr. ": 323,
				"Member Name": "SARFRAZ IQBAL",
				VC: "VC121184",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 68,
				Location: "Corner"
			},
			{
				"Sr. ": 324,
				"Member Name": "ABDUL GHAFFAR",
				VC: "VC121149",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 69,
				Location: "Corner"
			},
			{
				"Sr. ": 325,
				"Member Name": "QAMAR UN NISA",
				VC: "VC01293",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 70,
				Location: "Normal"
			},
			{
				"Sr. ": 326,
				"Member Name": "ABDULLAH RAAKEH KHANZADA ",
				VC: "VC121435",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 71,
				Location: "Normal"
			},
			{
				"Sr. ": 327,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC121548",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 72,
				Location: "Normal"
			},
			{
				"Sr. ": 328,
				"Member Name": "AHMAD BILAL",
				VC: "VC01214",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 73,
				Location: "Normal"
			},
			{
				"Sr. ": 329,
				"Member Name": "TAHIR RASHID",
				VC: "VC12687",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 74,
				Location: "Normal"
			},
			{
				"Sr. ": 330,
				"Member Name": "WAQAS AHMAD",
				VC: "VC01298",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 75,
				Location: "Normal"
			},
			{
				"Sr. ": 331,
				"Member Name": "MUHAMMAD HASEEB",
				VC: "VC121255",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 76,
				Location: "Normal"
			},
			{
				"Sr. ": 332,
				"Member Name": "TOOBA HASSAN",
				VC: "VC121522",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 77,
				Location: "Normal"
			},
			{
				"Sr. ": 333,
				"Member Name": "REHANA KAUSAR ",
				VC: "VC12946",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 78,
				Location: "Normal"
			},
			{
				"Sr. ": 334,
				"Member Name": "MUHAMMAD AHSAAN",
				VC: "VC121291",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 79,
				Location: "Normal"
			},
			{
				"Sr. ": 335,
				"Member Name": "BABER ALI",
				VC: "VC121133",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 80,
				Location: "Normal"
			},
			{
				"Sr. ": 336,
				"Member Name": "MUTAHAR AHMAD KHAN",
				VC: "VC12257",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 81,
				Location: "Normal"
			},
			{
				"Sr. ": 337,
				"Member Name": "ZEESHAN ALI ",
				VC: "VC12685",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 82,
				Location: "Normal"
			},
			{
				"Sr. ": 338,
				"Member Name": "MUHAMMAD SALIK TARIQ",
				VC: "VC12152",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 85,
				Location: "Normal"
			},
			{
				"Sr. ": 339,
				"Member Name": "FEHMIDA FAISAL",
				VC: "VC12641",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 86,
				Location: "Normal"
			},
			{
				"Sr. ": 340,
				"Member Name": "TAHIR RASHID",
				VC: "VC12689",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 87,
				Location: "Normal"
			},
			{
				"Sr. ": 341,
				"Member Name": "LUBNA WAHEED ",
				VC: "VC12297",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 88,
				Location: "Normal"
			},
			{
				"Sr. ": 342,
				"Member Name": "HAMID SHOAIB",
				VC: "VC121478",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 89,
				Location: "Normal"
			},
			{
				"Sr. ": 343,
				"Member Name": "ANUM KAMRAN",
				VC: "VC01246",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 90,
				Location: "Normal"
			},
			{
				"Sr. ": 344,
				"Member Name": "MUHAMMAD ADIL KHAN ",
				VC: "VC12981",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 91,
				Location: "Normal"
			},
			{
				"Sr. ": 345,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC121549",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 92,
				Location: "Normal"
			},
			{
				"Sr. ": 346,
				"Member Name": "SAQIB ISRAR",
				VC: "VC01216",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 93,
				Location: "Normal"
			},
			{
				"Sr. ": 347,
				"Member Name": "TOOBA HASSAN",
				VC: "VC121523",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 94,
				Location: "Normal"
			},
			{
				"Sr. ": 348,
				"Member Name": "AJMAL BUTT",
				VC: "VC12704",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 95,
				Location: "Normal"
			},
			{
				"Sr. ": 349,
				"Member Name": "SAEED AKRAM",
				VC: "VC121180",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 96,
				Location: "Normal"
			},
			{
				"Sr. ": 350,
				"Member Name": "HASSAN RIAZ",
				VC: "VC12132",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 97,
				Location: "Normal"
			},
			{
				"Sr. ": 351,
				"Member Name": "ZAFEER BASHIR",
				VC: "VC121051",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 98,
				Location: "Corner"
			},
			{
				"Sr. ": 352,
				"Member Name": "MUHAMMAD ASHRAF",
				VC: "VC12854",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 99,
				Location: "Normal"
			},
			{
				"Sr. ": 353,
				"Member Name": "QASIM ALI",
				VC: "VC12710",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 100,
				Location: "Normal"
			},
			{
				"Sr. ": 354,
				"Member Name": "MUHAMMAD ANEES ABBASI ",
				VC: "VC121437",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 101,
				Location: "Normal"
			},
			{
				"Sr. ": 355,
				"Member Name": "MUHAMMAD AKHTAR",
				VC: "VC121090",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 102,
				Location: "Normal"
			},
			{
				"Sr. ": 356,
				"Member Name": "SHAHEEN AKBAR",
				VC: "VC12651",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 103,
				Location: "Normal"
			},
			{
				"Sr. ": 357,
				"Member Name": "BILAL AHMED MIRZA",
				VC: "VC12106",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 104,
				Location: "Normal"
			},
			{
				"Sr. ": 358,
				"Member Name": "BUSHRA MAAHNOOR NAEEM",
				VC: "VC12575",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 105,
				Location: "Normal"
			},
			{
				"Sr. ": 359,
				"Member Name": "KHAWAR MAQBOOL",
				VC: "VC121141",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 106,
				Location: "Normal"
			},
			{
				"Sr. ": 360,
				"Member Name": "FAIZA ARSHID",
				VC: "VC121507",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 107,
				Location: "Normal"
			},
			{
				"Sr. ": 361,
				"Member Name": "SABRINA HUMAYUN",
				VC: "VC12411",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 108,
				Location: "Normal"
			},
			{
				"Sr. ": 362,
				"Member Name": "MUHAMMAD MAHROZ ",
				VC: "VC12186",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 109,
				Location: "Normal"
			},
			{
				"Sr. ": 363,
				"Member Name": "JAHANGEER",
				VC: "VC121225",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 110,
				Location: "Normal"
			},
			{
				"Sr. ": 364,
				"Member Name": "AAFIA BATOOL ",
				VC: "VC12867",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 111,
				Location: "Normal"
			},
			{
				"Sr. ": 365,
				"Member Name": "MUSHTAQ AHMAD",
				VC: "VC121554",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 112,
				Location: "Normal"
			},
			{
				"Sr. ": 366,
				"Member Name": "Durdana Sabahat",
				VC: "VC12511",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 113,
				Location: "FP"
			},
			{
				"Sr. ": 367,
				"Member Name": "Ahsan Ahmed",
				VC: "VC121770",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 114,
				Location: "FP"
			},
			{
				"Sr. ": 368,
				"Member Name": "Furqan Khan",
				VC: "VC121179",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 115,
				Location: "FP"
			},
			{
				"Sr. ": 369,
				"Member Name": "Salma Zafar",
				VC: "VC121185",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 116,
				Location: "FP"
			},
			{
				"Sr. ": 370,
				"Member Name": "Asma Ashiq",
				VC: "VC121197",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 117,
				Location: "FP"
			},
			{
				"Sr. ": 371,
				"Member Name": "Abeera Saad",
				VC: "VC121041",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 118,
				Location: "Corner"
			},
			{
				"Sr. ": 372,
				"Member Name": "Omer Zahid Sheikh",
				VC: "VC131593",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 119,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 373,
				"Member Name": "Shama Parveen",
				VC: "VC131609",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 120,
				Location: "FP"
			},
			{
				"Sr. ": 374,
				"Member Name": "Nasir ALI Khan",
				VC: "VC13175",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 121,
				Location: "FP"
			},
			{
				"Sr. ": 375,
				"Member Name": "Rizwana Shahbaz",
				VC: "VC13785",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 122,
				Location: "FP"
			},
			{
				"Sr. ": 376,
				"Member Name": "Tahira Kausar",
				VC: "VC13269",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 123,
				Location: "FP"
			},
			{
				"Sr. ": 377,
				"Member Name": "Syed Faraz Hassan Zaidi",
				VC: "VC13148",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 124,
				Location: "FP"
			},
			{
				"Sr. ": 378,
				"Member Name": "Habib Ullah",
				VC: "VC121093",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 138,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 379,
				"Member Name": "Wasim Qaiser",
				VC: "VC121722",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 139,
				Location: "FP"
			},
			{
				"Sr. ": 380,
				"Member Name": "SABA BABAR ",
				VC: "VC121227",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 140,
				Location: "FP"
			},
			{
				"Sr. ": 381,
				"Member Name": "ASJED RAUF ",
				VC: "VC12870",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 141,
				Location: "FP"
			},
			{
				"Sr. ": 382,
				"Member Name": "AFSHAN ARSHAD ",
				VC: "VC12235",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 142,
				Location: "FP"
			},
			{
				"Sr. ": 383,
				"Member Name": "NABEELA RIAZ",
				VC: "VC121169",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 143,
				Location: "FP"
			},
			{
				"Sr. ": 384,
				"Member Name": "SYED AKHTAR HUSSAIN ZAIDI",
				VC: "VC12604",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 144,
				Location: "FP"
			},
			{
				"Sr. ": 385,
				"Member Name": "UMER FAROOQ MALIK",
				VC: "VC121139",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 145,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 386,
				"Member Name": "FATIMA RIZWAN ",
				VC: "VC12196",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 146,
				Location: "Corner"
			},
			{
				"Sr. ": 387,
				"Member Name": "TAHIR RASHID",
				VC: "VC12690",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 147,
				Location: "Normal"
			},
			{
				"Sr. ": 388,
				"Member Name": "AHMAD BILAL",
				VC: "VC01215",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 148,
				Location: "Normal"
			},
			{
				"Sr. ": 389,
				"Member Name": "TAHIR RASHID",
				VC: "VC12688",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 149,
				Location: "Normal"
			},
			{
				"Sr. ": 390,
				"Member Name": "SHABANA YASMIN",
				VC: "VC01267",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 150,
				Location: "FP"
			},
			{
				"Sr. ": 391,
				"Member Name": "Muhammad Sameer Murad",
				VC: "VC121767",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 151,
				Location: "FP"
			},
			{
				"Sr. ": 392,
				"Member Name": "Ahsan Ahmed",
				VC: "VC121771",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 152,
				Location: "FP"
			},
			{
				"Sr. ": 393,
				"Member Name": "Shoukat ALI",
				VC: "VC01243",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 153,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 394,
				"Member Name": "Ghulam Mustafa",
				VC: "VC121798",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 154,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 395,
				"Member Name": "Muhammad Zubair",
				VC: "VC121256",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 155,
				Location: "FP"
			},
			{
				"Sr. ": 396,
				"Member Name": "MUHAMMAD NAEEM NASIR",
				VC: "VC121516",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 156,
				Location: "FP"
			},
			{
				"Sr. ": 397,
				"Member Name": "MUHAMMAD NAEEM NASIR",
				VC: "VC121515",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 157,
				Location: "FP"
			},
			{
				"Sr. ": 398,
				"Member Name": "UMER ZAHID",
				VC: "VC121769",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 158,
				Location: "Normal"
			},
			{
				"Sr. ": 399,
				"Member Name": "ADREES ARIF",
				VC: "VC121546",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 161,
				Location: "Corner"
			},
			{
				"Sr. ": 400,
				"Member Name": "MUHAMMAD YOUNAS",
				VC: "VC121157",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 162,
				Location: "Normal"
			},
			{
				"Sr. ": 401,
				"Member Name": "SHAHIDA PARVEEN",
				VC: "VC12103",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 163,
				Location: "Normal"
			},
			{
				"Sr. ": 402,
				"Member Name": "NASRIN BEGUM ",
				VC: "VC12187",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 164,
				Location: "Normal"
			},
			{
				"Sr. ": 403,
				"Member Name": "SYED IFTIKHAR BUKHARI",
				VC: "VC121134",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 165,
				Location: "Normal"
			},
			{
				"Sr. ": 404,
				"Member Name": "SAIMA NOMAN",
				VC: "VC12725",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 166,
				Location: "Normal"
			},
			{
				"Sr. ": 405,
				"Member Name": "MATLOOB AKRAM ",
				VC: "VC121322",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 167,
				Location: "Corner"
			},
			{
				"Sr. ": 406,
				"Member Name": "Muhammad Uzair Ahmed",
				VC: "VC111234",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 15,
				Location: "FP"
			},
			{
				"Sr. ": 407,
				"Member Name": "Muhammad Jahanzaib",
				VC: "VC111442",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 16,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 408,
				"Member Name": "Muhammad Ejaz Bashir",
				VC: "VC111794",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 107,
				Location: "Normal"
			},
			{
				"Sr. ": 409,
				"Member Name": "Mazhar Qayyum",
				VC: "VC111796",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 108,
				Location: "Normal"
			},
			{
				"Sr. ": 410,
				"Member Name": "Faiz Ullah",
				VC: "VC11836",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 117,
				Location: "Normal"
			},
			{
				"Sr. ": 411,
				"Member Name": "Faiz Ullah",
				VC: "VC11835",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 118,
				Location: "Normal"
			},
			{
				"Sr. ": 412,
				"Member Name": "Sumaira Saqib",
				VC: 111686,
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 130,
				Location: "FP"
			},
			{
				"Sr. ": 413,
				"Member Name": "Haroon Mansha",
				VC: "VC11647",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 131,
				Location: "FP"
			},
			{
				"Sr. ": 414,
				"Member Name": "Muhammad Ahmad",
				VC: "VC11646",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 132,
				Location: "Normal"
			},
			{
				"Sr. ": 415,
				"Member Name": "Kausar Parveen",
				VC: "VC01180",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 133,
				Location: "Normal"
			},
			{
				"Sr. ": 416,
				"Member Name": "Saira Chaudhry",
				VC: "VC111759",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 134,
				Location: "Normal"
			},
			{
				"Sr. ": 417,
				"Member Name": "Tazeem Asim",
				VC: "VC11418",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 135,
				Location: "Normal"
			},
			{
				"Sr. ": 418,
				"Member Name": "Nasreen Akhtar",
				VC: "VC111760",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 136,
				Location: "Normal"
			},
			{
				"Sr. ": 419,
				"Member Name": "Jamila Riaz",
				VC: "VC11826",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 137,
				Location: "Normal"
			},
			{
				"Sr. ": 420,
				"Member Name": "Syed Sajjad Hussain",
				VC: "VC11259",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 138,
				Location: "Normal"
			},
			{
				"Sr. ": 421,
				"Member Name": "Ahmed Bakhsh",
				VC: "VC111328",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 140,
				Location: "Corner"
			},
			{
				"Sr. ": 422,
				"Member Name": "Kaneezan Bibi",
				VC: "VC11889",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 141,
				Location: "Normal"
			},
			{
				"Sr. ": 423,
				"Member Name": "Waqas Majeed",
				VC: "VC111738",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 142,
				Location: "Normal"
			},
			{
				"Sr. ": 424,
				"Member Name": "Muhammad Aslam",
				VC: "VC11670",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 143,
				Location: "Normal"
			},
			{
				"Sr. ": 425,
				"Member Name": "Murtaza Masood",
				VC: "VC11719",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 144,
				Location: "Normal"
			},
			{
				"Sr. ": 426,
				"Member Name": "Hina Awais",
				VC: "VC11105",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 145,
				Location: "Normal"
			},
			{
				"Sr. ": 427,
				"Member Name": "Amjad Hussain",
				VC: "VC11812",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 146,
				Location: "Normal"
			},
			{
				"Sr. ": 428,
				"Member Name": "Muhammad Arslan",
				VC: "VC11552",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 147,
				Location: "Normal"
			},
			{
				"Sr. ": 429,
				"Member Name": "Sajid Munir",
				VC: "VC1741",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 148,
				Location: "Normal"
			},
			{
				"Sr. ": 430,
				"Member Name": "Syed Solat Abbas",
				VC: "VC111604",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 149,
				Location: "Normal"
			},
			{
				"Sr. ": 431,
				"Member Name": "Tahir Nazir",
				VC: "VC111583",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 150,
				Location: "Normal"
			},
			{
				"Sr. ": 432,
				"Member Name": "Fahmeeda Kausar",
				VC: "VC111585",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 160,
				Location: "Normal"
			},
			{
				"Sr. ": 433,
				"Member Name": "Muhammad Amin",
				VC: "VC11268",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 165,
				Location: "Corner"
			},
			{
				"Sr. ": 434,
				"Member Name": "Muhammad Nadeem Atif",
				VC: "VC11286",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 166,
				Location: "Normal"
			},
			{
				"Sr. ": 435,
				"Member Name": "Abdul Basit / Kashif Akhter",
				VC: "VC11900",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 167,
				Location: "Normal"
			},
			{
				"Sr. ": 436,
				"Member Name": "Muhammad Ishfaq",
				VC: "VC11282",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 168,
				Location: "Normal"
			},
			{
				"Sr. ": 437,
				"Member Name": "Eid Nazeer",
				VC: "VC11642",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 169,
				Location: "Normal"
			},
			{
				"Sr. ": 438,
				"Member Name": "Eid Nazeer",
				VC: "VC11912",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 170,
				Location: "Normal"
			},
			{
				"Sr. ": 439,
				"Member Name": "Umar Draz ALI",
				VC: "VC111675",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 171,
				Location: "Normal"
			},
			{
				"Sr. ": 440,
				"Member Name": "Sadia Umer",
				VC: "VC111357",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 172,
				Location: "Normal"
			},
			{
				"Sr. ": 441,
				"Member Name": "Kabsha Mahmood",
				VC: "VC111681",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 173,
				Location: "Normal"
			},
			{
				"Sr. ": 442,
				"Member Name": "Pir Muneeb Rehman",
				VC: "VC01151",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 174,
				Location: "Normal"
			},
			{
				"Sr. ": 443,
				"Member Name": "Majid Farooq",
				VC: "VC111605",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 175,
				Location: "Normal"
			},
			{
				"Sr. ": 444,
				"Member Name": "Sajjad Haider",
				VC: "VC11822",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 176,
				Location: "Normal"
			},
			{
				"Sr. ": 445,
				"Member Name": "Tariq Masih",
				VC: "VC111728",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 177,
				Location: "Normal"
			},
			{
				"Sr. ": 446,
				"Member Name": "Muhammad Moazzum Ul Ibad",
				VC: "VC11944",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 178,
				Location: "Normal"
			},
			{
				"Sr. ": 447,
				"Member Name": "Hamid ALI",
				VC: "VC111705",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 179,
				Location: "Normal"
			},
			{
				"Sr. ": 448,
				"Member Name": "Hamid ALI",
				VC: "VC111704",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 180,
				Location: "Normal"
			},
			{
				"Sr. ": 449,
				"Member Name": "Abdul Qayyum",
				VC: "VC111703",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 181,
				Location: "Corner"
			},
			{
				"Sr. ": 450,
				"Member Name": "Mubeen Ahmed",
				VC: "VC11318",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 1,
				Location: "Corner"
			},
			{
				"Sr. ": 451,
				"Member Name": "Wasim Abbasi",
				VC: "VC01136",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 2,
				Location: "Normal"
			},
			{
				"Sr. ": 452,
				"Member Name": "Abdul Basit",
				VC: "VC11906",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 3,
				Location: "Normal"
			},
			{
				"Sr. ": 453,
				"Member Name": "Ambreen Akhtar",
				VC: "VC11206",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 4,
				Location: "Normal"
			},
			{
				"Sr. ": 454,
				"Member Name": "Sidra Altaf",
				VC: "VC111553",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 5,
				Location: "Normal"
			},
			{
				"Sr. ": 455,
				"Member Name": "Jamil Ahmed",
				VC: "VC111272",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 6,
				Location: "Normal"
			},
			{
				"Sr. ": 456,
				"Member Name": "Muhammad Waqar Hussain",
				VC: "VC111140",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 7,
				Location: "Normal"
			},
			{
				"Sr. ": 457,
				"Member Name": "Kaneezan Bibi",
				VC: "VC11890",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 8,
				Location: "Normal"
			},
			{
				"Sr. ": 458,
				"Member Name": "Nazia Atiq",
				VC: "VC01120",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 9,
				Location: "Normal"
			},
			{
				"Sr. ": 459,
				"Member Name": "Muhammad Saeed",
				VC: "VC111075",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 10,
				Location: "Normal"
			},
			{
				"Sr. ": 460,
				"Member Name": "IfshaAkhlaq",
				VC: "VC111615",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 11,
				Location: "Normal"
			},
			{
				"Sr. ": 461,
				"Member Name": "Mahboob Ul Hassan",
				VC: "VC111680",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 12,
				Location: "Normal"
			},
			{
				"Sr. ": 462,
				"Member Name": "Hina Tayyab",
				VC: "VC111221",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 13,
				Location: "Normal"
			},
			{
				"Sr. ": 463,
				"Member Name": "Zohaib Raza",
				VC: "VC111601",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 14,
				Location: "Normal"
			},
			{
				"Sr. ": 464,
				"Member Name": "Khalil Ahmed",
				VC: "VC11846",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 15,
				Location: "Corner"
			},
			{
				"Sr. ": 465,
				"Member Name": "Aurang Zaib Sajjad",
				VC: "VC121732",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 16,
				Location: "Corner"
			},
			{
				"Sr. ": 466,
				"Member Name": "Ghulam Hussain",
				VC: "VC121073",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 17,
				Location: "Normal"
			},
			{
				"Sr. ": 467,
				"Member Name": "Madiha Babar",
				VC: "VC12617",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 18,
				Location: "Normal"
			},
			{
				"Sr. ": 468,
				"Member Name": "Muhammad Afzal",
				VC: "VC121538",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 19,
				Location: "Normal"
			},
			{
				"Sr. ": 469,
				"Member Name": "Muhammad Ahmad",
				VC: "VC12594",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 20,
				Location: "Normal"
			},
			{
				"Sr. ": 470,
				"Member Name": "Syed Saqlain Shan Naqvi",
				VC: "VC12595",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 21,
				Location: "Normal"
			},
			{
				"Sr. ": 471,
				"Member Name": "Muhammad Younas",
				VC: "VC121734",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 22,
				Location: "Normal"
			},
			{
				"Sr. ": 472,
				"Member Name": "Mian Zeeshan Meraj",
				VC: "VC121231",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 23,
				Location: "Normal"
			},
			{
				"Sr. ": 473,
				"Member Name": "Rizwan Kauser",
				VC: "VC12198",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 24,
				Location: "Normal"
			},
			{
				"Sr. ": 474,
				"Member Name": "Rizwana",
				VC: "VC12816",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 25,
				Location: "Normal"
			},
			{
				"Sr. ": 475,
				"Member Name": "Muhammad Anwar Ul Haque",
				VC: "VC12382",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 26,
				Location: "Normal"
			},
			{
				"Sr. ": 476,
				"Member Name": "Muhammad Anwar Ul Haque",
				VC: "VC12381",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 27,
				Location: "Normal"
			},
			{
				"Sr. ": 477,
				"Member Name": "ALI Afzal",
				VC: "VC121718",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 28,
				Location: "Normal"
			},
			{
				"Sr. ": 478,
				"Member Name": "Muhammad Shahbaz ALI",
				VC: "VC121725",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 29,
				Location: "Normal"
			},
			{
				"Sr. ": 479,
				"Member Name": "Tahir Masood Rana",
				VC: "VC12226",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 30,
				Location: "Normal"
			},
			{
				"Sr. ": 480,
				"Member Name": "Haroon Saeed",
				VC: "VC121399",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 31,
				Location: "FP"
			},
			{
				"Sr. ": 481,
				"Member Name": "Asghar ALI",
				VC: "VC12988",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 32,
				Location: "FP"
			},
			{
				"Sr. ": 482,
				"Member Name": "Amir Masood Rana",
				VC: "VC12320",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 33,
				Location: "FP"
			},
			{
				"Sr. ": 483,
				"Member Name": "Nadia Maqbool",
				VC: "VC121552",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 34,
				Location: "FP"
			},
			{
				"Sr. ": 484,
				"Member Name": "Muhammad Aqeel Rasheed",
				VC: "VC121673",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 35,
				Location: "FP"
			},
			{
				"Sr. ": 485,
				"Member Name": "Haziq Naeem",
				VC: "VC12702",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 36,
				Location: "FP"
			},
			{
				"Sr. ": 486,
				"Member Name": "Muhammad Fiaz",
				VC: "VC121054",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 37,
				Location: "FP"
			},
			{
				"Sr. ": 487,
				"Member Name": "Zafar ALI Khan",
				VC: "VC121621",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 38,
				Location: "FP"
			},
			{
				"Sr. ": 488,
				"Member Name": "Kashif Mehboob",
				VC: "VC121387",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 39,
				Location: "FP"
			},
			{
				"Sr. ": 489,
				"Member Name": "Muhammad Uzair Ahmed",
				VC: "VC121123",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 40,
				Location: "FP"
			},
			{
				"Sr. ": 490,
				"Member Name": "Muhammad Jahanzaib",
				VC: "VC121120",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 41,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 491,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121205",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 42,
				Location: "Corner"
			},
			{
				"Sr. ": 492,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121206",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 43,
				Location: "Normal"
			},
			{
				"Sr. ": 493,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121207",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 44,
				Location: "Normal"
			},
			{
				"Sr. ": 494,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121208",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 45,
				Location: "Normal"
			},
			{
				"Sr. ": 495,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121209",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 46,
				Location: "Normal"
			},
			{
				"Sr. ": 496,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121210",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 47,
				Location: "Normal"
			},
			{
				"Sr. ": 497,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121211",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 48,
				Location: "Normal"
			},
			{
				"Sr. ": 498,
				"Member Name": "Muhammad Tahir Nadeem",
				VC: "VC121088",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 49,
				Location: "Normal"
			},
			{
				"Sr. ": 499,
				"Member Name": "Nida Atif",
				VC: "VC121411",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 50,
				Location: "Normal"
			},
			{
				"Sr. ": 500,
				"Member Name": "Syed Shabbir Hussain Shah",
				VC: "VC121452",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 51,
				Location: "Normal"
			},
			{
				"Sr. ": 501,
				"Member Name": "Abdul Rauf",
				VC: "VC12496",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 52,
				Location: "Normal"
			},
			{
				"Sr. ": 502,
				"Member Name": "Muhammad Sharif",
				VC: "VC01244",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 53,
				Location: "Normal"
			},
			{
				"Sr. ": 503,
				"Member Name": "Abdul Wahab",
				VC: "VC01250",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 54,
				Location: "Normal"
			},
			{
				"Sr. ": 504,
				"Member Name": "Sundas ALI Malik",
				VC: "VC121602",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 55,
				Location: "Normal"
			},
			{
				"Sr. ": 505,
				"Member Name": "Miftah Ud Din",
				VC: "VC121595",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 56,
				Location: "Normal"
			},
			{
				"Sr. ": 506,
				"Member Name": "Ahsan Ullah",
				VC: "VC121586",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 57,
				Location: "Normal"
			},
			{
				"Sr. ": 507,
				"Member Name": "Muhammad Naeem Nasir",
				VC: "VC121519",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 58,
				Location: "Normal"
			},
			{
				"Sr. ": 508,
				"Member Name": "Muhammad Naeem Nasir",
				VC: "VC121518",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 59,
				Location: "Normal"
			},
			{
				"Sr. ": 509,
				"Member Name": "Muhammad Naeem Nasir",
				VC: "VC121517",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 60,
				Location: "Normal"
			},
			{
				"Sr. ": 510,
				"Member Name": "Fozia Ashfaq",
				VC: "VC12653",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 61,
				Location: "Normal"
			},
			{
				"Sr. ": 511,
				"Member Name": "Muhammad Qasim",
				VC: "VC12675",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 62,
				Location: "Normal"
			},
			{
				"Sr. ": 512,
				"Member Name": "Iram Hamayun",
				VC: "VC1747",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 63,
				Location: "Normal"
			},
			{
				"Sr. ": 513,
				"Member Name": "Iram Hamayun",
				VC: "VC1746",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 64,
				Location: "Normal"
			},
			{
				"Sr. ": 514,
				"Member Name": "Ahsan Shahzad Khan",
				VC: "VC121633",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 65,
				Location: "Normal"
			},
			{
				"Sr. ": 515,
				"Member Name": "Muhammad Waqas",
				VC: "VC121668",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 66,
				Location: "Normal"
			},
			{
				"Sr. ": 516,
				"Member Name": "Muhammad Azam",
				VC: "VC121667",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 67,
				Location: "Normal"
			},
			{
				"Sr. ": 517,
				"Member Name": "Nisar Ahmad",
				VC: "VC12942",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 68,
				Location: "Normal"
			},
			{
				"Sr. ": 518,
				"Member Name": "Syed Khuram ALI",
				VC: "VC12536",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 69,
				Location: "Corner"
			},
			{
				"Sr. ": 519,
				"Member Name": "Sajid ALI",
				VC: "VC121220",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 70,
				Location: "Corner"
			},
			{
				"Sr. ": 520,
				"Member Name": "Muhammad Iqbal Bhatti",
				VC: "VC121527",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 71,
				Location: "Normal"
			},
			{
				"Sr. ": 521,
				"Member Name": "Muhammad Iqbal Bhatti",
				VC: "VC121528",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 72,
				Location: "Normal"
			},
			{
				"Sr. ": 522,
				"Member Name": "Muhammad Rameez",
				VC: "VC01275",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 73,
				Location: "Normal"
			},
			{
				"Sr. ": 523,
				"Member Name": "Muhammad Yaser",
				VC: "VC121484",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 74,
				Location: "Normal"
			},
			{
				"Sr. ": 524,
				"Member Name": "Shahzad ALI",
				VC: "VC1757",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 75,
				Location: "Normal"
			},
			{
				"Sr. ": 525,
				"Member Name": "Saqib ALI",
				VC: "VC121776",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 76,
				Location: "Normal"
			},
			{
				"Sr. ": 526,
				"Member Name": "Muhammad Waqar",
				VC: "VC12759",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 77,
				Location: "Normal"
			},
			{
				"Sr. ": 527,
				"Member Name": "Farah Iqbal",
				VC: "VC121321",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 78,
				Location: "Normal"
			},
			{
				"Sr. ": 528,
				"Member Name": "Ayesha Irfan",
				VC: "VC12287",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 79,
				Location: "Normal"
			},
			{
				"Sr. ": 529,
				"Member Name": "Haseeb ALI",
				VC: "VC12260",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 80,
				Location: "Normal"
			},
			{
				"Sr. ": 530,
				"Member Name": "Moeed Ejaz Ghauree",
				VC: "VC12293",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 81,
				Location: "Normal"
			},
			{
				"Sr. ": 531,
				"Member Name": "Ahmed Zubair",
				VC: "VC121608",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 82,
				Location: "Normal"
			},
			{
				"Sr. ": 532,
				"Member Name": "Zishan Javed",
				VC: "VC12718",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 83,
				Location: "Normal"
			},
			{
				"Sr. ": 533,
				"Member Name": "Muhammad Saad Cheema",
				VC: "VC121580",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 84,
				Location: "Normal"
			},
			{
				"Sr. ": 534,
				"Member Name": "Zakariya Irshad",
				VC: "VC121027",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 85,
				Location: "Normal"
			},
			{
				"Sr. ": 535,
				"Member Name": "Ahsan Iqbal Bela",
				VC: "VC121147",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 86,
				Location: "Normal"
			},
			{
				"Sr. ": 536,
				"Member Name": "Shahid Ijaz",
				VC: "VC121436",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 87,
				Location: "Normal"
			},
			{
				"Sr. ": 537,
				"Member Name": "Muhammad Younas",
				VC: "VC121459",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 88,
				Location: "Normal"
			},
			{
				"Sr. ": 538,
				"Member Name": "Muneeb Awais Sheikh",
				VC: "VC12180",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 89,
				Location: "Normal"
			},
			{
				"Sr. ": 539,
				"Member Name": "Muhammad Ejaz Bashir / Mazhar Qayyum",
				VC: "VC121793",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 90,
				Location: "Normal"
			},
			{
				"Sr. ": 540,
				"Member Name": "Nasir Siddique",
				VC: "121530",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 91,
				Location: "Normal"
			},
			{
				"Sr. ": 541,
				"Member Name": "Zahid Nafeer",
				VC: "121050",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 92,
				Location: "Normal"
			},
			{
				"Sr. ": 542,
				"Member Name": "Syeda Gulshan Mubashir",
				VC: "VC1753",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 93,
				Location: "Corner"
			},
			{
				"Sr. ": 543,
				"Member Name": "Faisal Mehmood",
				VC: "VC12367",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 94,
				Location: "Corner"
			},
			{
				"Sr. ": 544,
				"Member Name": "Naqash Ahmad",
				VC: "VC12869",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 95,
				Location: "Normal"
			},
			{
				"Sr. ": 545,
				"Member Name": "Junaid ALI Suleri",
				VC: "VC121403",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 96,
				Location: "Normal"
			},
			{
				"Sr. ": 546,
				"Member Name": "Arif Mukhtar Rana",
				VC: "VC12305",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 97,
				Location: "Normal"
			},
			{
				"Sr. ": 547,
				"Member Name": "Farzana Munir Khan",
				VC: "VC121189",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 98,
				Location: "Normal"
			},
			{
				"Sr. ": 548,
				"Member Name": "Uzair Shafqat",
				VC: "VC12452",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 99,
				Location: "Normal"
			},
			{
				"Sr. ": 549,
				"Member Name": "Uzair Shafqat",
				VC: "VC12453",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 100,
				Location: "Normal"
			},
			{
				"Sr. ": 550,
				"Member Name": "Ayesha Saqib",
				VC: "VC121652",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 101,
				Location: "Normal"
			},
			{
				"Sr. ": 551,
				"Member Name": "Muhammad Raza Iqbal",
				VC: "VC12943",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 102,
				Location: "Normal"
			},
			{
				"Sr. ": 552,
				"Member Name": "Hafiz Rana Raheel Shafqat",
				VC: "VC00123",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 103,
				Location: "Normal"
			},
			{
				"Sr. ": 553,
				"Member Name": "Hafiz Muhammad Zain Zahid Butt",
				VC: "VC121627",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 104,
				Location: "Normal"
			},
			{
				"Sr. ": 554,
				"Member Name": "Umer Hassam",
				VC: "VC121400",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 105,
				Location: "Normal"
			},
			{
				"Sr. ": 555,
				"Member Name": "Adeela Kashif",
				VC: "VC121378",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 106,
				Location: "Normal"
			},
			{
				"Sr. ": 556,
				"Member Name": "Azher Tahir",
				VC: "VC121379",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 107,
				Location: "Normal"
			},
			{
				"Sr. ": 557,
				"Member Name": "Muhammad Jahangir Khan",
				VC: "VC12100",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 108,
				Location: "Normal"
			},
			{
				"Sr. ": 558,
				"Member Name": "Syed Mowahid Hussain",
				VC: "VC12104",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 109,
				Location: "Normal"
			},
			{
				"Sr. ": 559,
				"Member Name": "Sharafat ALI",
				VC: "VC121735",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 110,
				Location: "Normal"
			},
			{
				"Sr. ": 560,
				"Member Name": "Sheikh Muhammad Iqbal",
				VC: "VC12936",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 111,
				Location: "Normal"
			},
			{
				"Sr. ": 561,
				"Member Name": "Syeda Hina Fayyaz",
				VC: "VC121454",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 112,
				Location: "Normal"
			},
			{
				"Sr. ": 562,
				"Member Name": "Muhammad Zubair",
				VC: "VC121623",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 113,
				Location: "Normal"
			},
			{
				"Sr. ": 563,
				"Member Name": "Zeeshan Javed",
				VC: "VC12747",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 114,
				Location: "Normal"
			},
			{
				"Sr. ": 564,
				"Member Name": "Faiz Ullah",
				VC: "VC121431",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 115,
				Location: "Normal"
			},
			{
				"Sr. ": 565,
				"Member Name": "Syed Imran ALI",
				VC: "VC12551",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 116,
				Location: "Normal"
			},
			{
				"Sr. ": 566,
				"Member Name": "Syed Hussain ALI Rehmat",
				VC: "VC12535",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 117,
				Location: "Corner"
			},
			{
				"Sr. ": 567,
				"Member Name": "FAISAL SAMROZ HASHMI",
				VC: "VC271533",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 47,
				Location: "Normal"
			},
			{
				"Sr. ": 568,
				"Member Name": "MUHAMMAD ASIF SHARIF",
				VC: "VC271424",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 48,
				Location: "Normal"
			},
			{
				"Sr. ": 569,
				"Member Name": "MUHAMMAD AHSAAN",
				VC: "VC271269",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 49,
				Location: "Normal"
			},
			{
				"Sr. ": 570,
				"Member Name": "SHAIKH MUHAMMAD ZAHID",
				VC: "VC271525",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 50,
				Location: "Normal"
			},
			{
				"Sr. ": 571,
				"Member Name": "MUHAMMAD IMRAN SOHAIL",
				VC: "VC271344",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 51,
				Location: "Normal"
			},
			{
				"Sr. ": 572,
				"Member Name": "MUHAMMAD ALTAF",
				VC: "VC271406",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 52,
				Location: "Normal"
			},
			{
				"Sr. ": 573,
				"Member Name": "SABIR ALI",
				VC: "VC271186",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 53,
				Location: "Normal"
			},
			{
				"Sr. ": 574,
				"Member Name": "SAQIB ISRAR",
				VC: "VC271014",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 54,
				Location: "Normal"
			},
			{
				"Sr. ": 575,
				"Member Name": "TAHIRA ARSHAD",
				VC: "VC271060",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 55,
				Location: "Normal"
			},
			{
				"Sr. ": 576,
				"Member Name": "ABDUL REHMAN",
				VC: "VC271479",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 56,
				Location: "Normal"
			},
			{
				"Sr. ": 577,
				"Member Name": "MUHAMMAD JAHANZAIB",
				VC: "VC271091",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 57,
				Location: "Normal"
			},
			{
				"Sr. ": 578,
				"Member Name": "MUHAMMAD FAROOQ",
				VC: "VC271293",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 58,
				Location: "Normal"
			},
			{
				"Sr. ": 579,
				"Member Name": "Muhammad Ejaz Bashir",
				VC: "VC271792",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "73/1",
				Location: "Normal"
			},
			{
				"Sr. ": 580,
				"Member Name": "Mazhar Qayyum",
				VC: "VC271795",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "73/2",
				Location: "Normal"
			},
			{
				"Sr. ": 581,
				"Member Name": "Khurram Waheed",
				VC: "VC271712",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "87/1",
				Location: "Normal"
			},
			{
				"Sr. ": 582,
				"Member Name": "Jamila Akhtar",
				VC: "VC271649",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "88/2",
				Location: "Normal"
			},
			{
				"Sr. ": 583,
				"Member Name": "Naeem Butt",
				VC: "VC271144",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "89/1",
				Location: "Normal"
			},
			{
				"Sr. ": 584,
				"Member Name": "Mubasher Hussain",
				VC: "VC271699",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "89/2",
				Location: "Normal"
			},
			{
				"Sr. ": 585,
				"Member Name": "Mubasher Hussain",
				VC: "VC271698",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "90/1",
				Location: "Normal"
			},
			{
				"Sr. ": 586,
				"Member Name": "Mubasher Hussain",
				VC: "VC271697",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "90/2",
				Location: "Normal"
			},
			{
				"Sr. ": 587,
				"Member Name": "Mubasher Hussain",
				VC: "VC271696",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "90/3",
				Location: "Normal"
			},
			{
				"Sr. ": 588,
				"Member Name": "Mubasher Hussain",
				VC: "VC271695",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "90/4",
				Location: "Corner"
			},
			{
				"Sr. ": 589,
				"Member Name": "Syeda Rizwana Jafri",
				VC: "VC221637",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 91,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 590,
				"Member Name": "Khurram Zahid",
				VC: "VC22155",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 96,
				Location: "Normal"
			},
			{
				"Sr. ": 591,
				"Member Name": "Muhammad Nadeem",
				VC: "VC221779",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 100,
				Location: "Normal"
			},
			{
				"Sr. ": 592,
				"Member Name": "Rang Zaib",
				VC: "VC221780",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 101,
				Location: "Normal"
			},
			{
				"Sr. ": 593,
				"Member Name": "Arshman Asif",
				VC: "VC22538",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 103,
				Location: "Corner"
			},
			{
				"Sr. ": 594,
				"Member Name": "Muhammad Imran Saeed",
				VC: "VC22803",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 104,
				Location: "Normal"
			},
			{
				"Sr. ": 595,
				"Member Name": "Shaheen Shahid",
				VC: "VC221040",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 105,
				Location: "FP"
			},
			{
				"Sr. ": 596,
				"Member Name": "MUHAMMAD AMJAD KHAN",
				VC: "VC22777",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 106,
				Location: "FP"
			},
			{
				"Sr. ": 597,
				"Member Name": "AHMAD HASSAN",
				VC: "VC221446",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 107,
				Location: "FP"
			},
			{
				"Sr. ": 598,
				"Member Name": "ASHFAQ MAHMOOD",
				VC: "VC22758",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 108,
				Location: "FP"
			},
			{
				"Sr. ": 599,
				"Member Name": "KASHIF NOOR",
				VC: "VC22699",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 109,
				Location: "FP"
			},
			{
				"Sr. ": 600,
				"Member Name": "SAMINA KOUSAR",
				VC: "VC221500",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 110,
				Location: "FP"
			},
			{
				"Sr. ": 601,
				"Member Name": "MUHAMMAD ASIF",
				VC: "VC221445",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 111,
				Location: "FP"
			},
			{
				"Sr. ": 602,
				"Member Name": "AMIR SHAHZAD",
				VC: "VC00226",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 112,
				Location: "FP"
			},
			{
				"Sr. ": 603,
				"Member Name": "ABDUL SHAKOOR BHUTTA",
				VC: "VC22751",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 113,
				Location: "FP"
			},
			{
				"Sr. ": 604,
				"Member Name": "MAZHAR RAHIM ",
				VC: "VC221062",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 114,
				Location: "FP"
			},
			{
				"Sr. ": 605,
				"Member Name": "AADIL MANZOOR",
				VC: "VC221502",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 115,
				Location: "FP"
			},
			{
				"Sr. ": 606,
				"Member Name": "ZULFIQAR ALI",
				VC: "VC221163",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 116,
				Location: "FP"
			},
			{
				"Sr. ": 607,
				"Member Name": "Mian Amjad Iqbal",
				VC: "VC221663",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 117,
				Location: "FP"
			},
			{
				"Sr. ": 608,
				"Member Name": "Muhammad Yasin",
				VC: "VC02256",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 118,
				Location: "FP"
			},
			{
				"Sr. ": 609,
				"Member Name": "Chaudary Shahzad Anwar",
				VC: "VC221655",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 119,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 610,
				"Member Name": "Rizwan Akbar Bajwa",
				VC: 22749,
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 121,
				Location: "Normal"
			},
			{
				"Sr. ": 611,
				"Member Name": "Tahir Masood Rana",
				VC: "22225",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 122,
				Location: "Normal"
			},
			{
				"Sr. ": 612,
				"Member Name": "ALI Farrukh Islam",
				VC: "VC221736",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 123,
				Location: "Normal"
			},
			{
				"Sr. ": 613,
				"Member Name": "Saad Farooq",
				VC: "VC221192",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 124,
				Location: "Normal"
			},
			{
				"Sr. ": 614,
				"Member Name": "Mohammad Sharif",
				VC: "VC221778",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 145,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 615,
				"Member Name": "BUSHRA SHAHBAZ",
				VC: "VC221316",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 161,
				Location: "Normal"
			},
			{
				"Sr. ": 616,
				"Member Name": "MAHMOOD AHMAD ",
				VC: "VC22956",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 162,
				Location: "FP"
			},
			{
				"Sr. ": 617,
				"Member Name": "AASIA SALEEM BAIG",
				VC: "VC22350",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 163,
				Location: "FP"
			},
			{
				"Sr. ": 618,
				"Member Name": "SAHJEED HUSSAIN",
				VC: "VC22903",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 164,
				Location: "FP"
			},
			{
				"Sr. ": 619,
				"Member Name": "SAMINA KOUSAR",
				VC: "VC221499",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 165,
				Location: "FP"
			},
			{
				"Sr. ": 620,
				"Member Name": "MUHAMMAD YASIN",
				VC: "VC02255",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 166,
				Location: "FP"
			},
			{
				"Sr. ": 621,
				"Member Name": "SAMINA KOUSAR",
				VC: "VC221498",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 167,
				Location: "FP"
			},
			{
				"Sr. ": 622,
				"Member Name": "MOBEEN FAISAL ",
				VC: "VC22986",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 168,
				Location: "FP"
			},
			{
				"Sr. ": 623,
				"Member Name": "ADNAN SIDDIQ",
				VC: "VC221434",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 169,
				Location: "FP"
			},
			{
				"Sr. ": 624,
				"Member Name": "SAMINA KOUSAR",
				VC: "VC221497",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 170,
				Location: "FP"
			},
			{
				"Sr. ": 625,
				"Member Name": "AHMED HASSAN KHAN",
				VC: "VC221376",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 171,
				Location: "FP"
			},
			{
				"Sr. ": 626,
				"Member Name": "ZEESHAN JAVED",
				VC: "VC22746",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 172,
				Location: "FP"
			},
			{
				"Sr. ": 627,
				"Member Name": "Muhammad Abu Baker",
				VC: "VC22562",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 185,
				Location: "FP"
			},
			{
				"Sr. ": 628,
				"Member Name": "M. Jahanzaib",
				VC: "VC221092",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 93,
				Location: "FP"
			},
			{
				"Sr. ": 629,
				"Member Name": "M. Uzair Ahmed",
				VC: "VC221089",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 94,
				Location: "Normal"
			},
			{
				"Sr. ": 630,
				"Member Name": "Ahmad Ishaq",
				VC: "VC221764",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 95,
				Location: "Normal"
			}
		];
		try {
			const result = data.map(async (item) => {
				console.log(item["Plot"]);
				console.log(item.Block);

				const VC_NO = item["VC"];
				const booking = await Booking.findOne({
					where: { Reg_Code_Disply: VC_NO }
				});
				const block = await Block.findOne({ where: { Name: item.Block } });
				console.log(block.BLK_ID);
				if (booking) {
					// let unitObj = {
					// 	BK_ID: booking.BK_ID,
					// 	Unit_Code: item["Plot"],
					// 	Plot_No: item["Plot"],
					// 	UType_ID: booking.UType_ID,
					// 	PS_ID: booking.PS_ID,
					// 	MEMBER_ID: booking.MEMBER_ID,
					// 	MN_ID: booking.MN_ID,
					// 	BLK_ID: block.BLK_ID,
					// 	IsActive: 1
					// };
					// console.log(unitObj);
					// const updateUnit = await Unit.update(unitObj, { where: { ID: item["Plot"] } });

					const unit = await Unit.create({
						BK_ID: booking.BK_ID,
						Unit_Code: item["Plot"],
						Plot_No: item["Plot"],
						UType_ID: booking.UType_ID,
						PS_ID: booking.PS_ID,
						MEMBER_ID: booking.MEMBER_ID,
						MN_ID: booking.MN_ID,
						BLK_ID: block.BLK_ID,
						IsActive: 1
					});
					// let unit = await Unit.findOne({ where: { Plot_No: item["Plot"] } });
					await Booking.update({ Unit_ID: unit.ID }, { where: { BK_ID: booking.BK_ID } });
				}
			});

			// const result = data.map(async(item)=>{
			//   const VC_NO = item['VC No']
			//   const booking = await Booking.findOne({where: {Reg_Code_Disply: VC_NO}})
			//   const block = await Block.findOne({where: {Name: item.Block}})
			//  const unit =  await Unit.update({
			//   BLK_ID:  block.BLK_ID,
			// }, {where: {BK_ID: booking.BK_ID }})
			// // await Booking.update({Unit_ID: unit.ID}, {where: {BK_ID: booking.BK_ID}})
			// })

			//  const result =  await BookingService.generatePlotSizeData(data);
			// console.log("IIIIIIIIIIIIIIIIIIIIIII", result);
			res.status(200).json({
				status: 200,
				Message: "Updated Status SuccessFull",
				data: result
			});
		} catch (error) {
			// console.log("OOOOOOOOOOOOOOOOO", error);
			return next(error);
		}
	};
	static locationAssign = async (req, res, next) => {
		const data = [
			{
				"Sr. #": 1,
				"Member Name": "Ahsan Ahmed",
				VC: "VC111772",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				"Plot ": 7,
				Location: "Normal"
			},
			{
				"Sr. ": 2,
				"Member Name": "Umer Zahid",
				VC: "VC111773",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 10,
				Location: "Normal"
			},
			{
				"Sr. ": 3,
				"Member Name": "Muhammad Arif",
				VC: "VC11827",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 11,
				Location: "Normal"
			},
			{
				"Sr. ": 4,
				"Member Name": "Muhammad Javed",
				VC: "VC111314",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 12,
				Location: "Normal"
			},
			{
				"Sr. ": 5,
				"Member Name": "Rohail Angelo",
				VC: "VC121421",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 19,
				Location: "Normal"
			},
			{
				"Sr. ": 6,
				"Member Name": "Muhammad Mohsin",
				VC: "VC12372",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 20,
				Location: "Normal"
			},
			{
				"Sr. ": 7,
				"Member Name": "Amir Baig",
				VC: "VC12114",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 21,
				Location: "Normal"
			},
			{
				"Sr. ": 8,
				"Member Name": "Mir Maqsood Ul Rehman Hamdani",
				VC: "VC121070",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 22,
				Location: "Normal"
			},
			{
				"Sr. ": 9,
				"Member Name": "Nasir ALI Khan",
				VC: "VC12176",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 23,
				Location: "Normal"
			},
			{
				"Sr. ": 10,
				"Member Name": "Nasir ALI Khan",
				VC: "VC12177",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 24,
				Location: "Normal"
			},
			{
				"Sr. ": 11,
				"Member Name": "Nimra Khan",
				VC: "VC12184",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 25,
				Location: "Normal"
			},
			{
				"Sr. ": 12,
				"Member Name": "Mohammad ALI Khan",
				VC: "VC12182",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 26,
				Location: "Normal"
			},
			{
				"Sr. ": 13,
				"Member Name": "Haya Ghazali",
				VC: "VC121248",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 27,
				Location: "Normal"
			},
			{
				"Sr. ": 14,
				"Member Name": "NAZAM AMIN",
				VC: "VC121466",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 28,
				Location: "Normal"
			},
			{
				"Sr. ": 15,
				"Member Name": "Muhammad Awais Attari",
				VC: "VC121638",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 29,
				Location: "Normal"
			},
			{
				"Sr. ": 16,
				"Member Name": "Hassan Nawaz",
				VC: "VC12174",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla",
				Block: "Umer",
				Plot: 30,
				Location: "Corner"
			},
			{
				"Sr. ": 17,
				"Member Name": "MASOOD AKHTAR",
				VC: "VC111503",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 31,
				Location: "Normal"
			},
			{
				"Sr. ": 18,
				"Member Name": "ASIM BASHIR ",
				VC: "VC11137",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 32,
				Location: "Normal"
			},
			{
				"Sr. ": 19,
				"Member Name": "M. RASHID MAHMOOD ",
				VC: "VC11940",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 33,
				Location: "Normal"
			},
			{
				"Sr. ": 20,
				"Member Name": "MAHMOOD FATEH AHSAN",
				VC: "VC11102",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 34,
				Location: "Normal"
			},
			{
				"Sr. ": 21,
				"Member Name": "QASIM ALI",
				VC: "VC11709",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 35,
				Location: "Normal"
			},
			{
				"Sr. ": 22,
				"Member Name": "SANIA CHUDHARY",
				VC: "VC11878",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 36,
				Location: "Normal"
			},
			{
				"Sr. ": 23,
				"Member Name": "AZEEM UL REHMAN",
				VC: "VC111244",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 37,
				Location: "Normal"
			},
			{
				"Sr. ": 24,
				"Member Name": "SOHAIL LATIF",
				VC: "VC111401",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 38,
				Location: "Normal"
			},
			{
				"Sr. ": 25,
				"Member Name": "M. OMAR QURESHI",
				VC: "VC11365",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 39,
				Location: "Normal"
			},
			{
				"Sr. ": 26,
				"Member Name": "ANIQA MAHOOR",
				VC: "VC111213",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 40,
				Location: "Normal"
			},
			{
				"Sr. ": 27,
				"Member Name": "MIAN TANVEER BASHIR ",
				VC: "VC11266",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 41,
				Location: "Normal"
			},
			{
				"Sr. ": 28,
				"Member Name": "SADAF ZEESHAN",
				VC: "VC11668",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 42,
				Location: "Normal"
			},
			{
				"Sr. ": 29,
				"Member Name": "MUHAMMAD ASLAM ZAHID",
				VC: "VC111520",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 43,
				Location: "Normal"
			},
			{
				"Sr. ": 30,
				"Member Name": "AROOBA AZHAR ",
				VC: "VC11307",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 44,
				Location: "Normal"
			},
			{
				"Sr. ": 31,
				"Member Name": "SAFIA AFZAL",
				VC: "VC111330",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 45,
				Location: "Normal"
			},
			{
				"Sr. ": 32,
				"Member Name": "AWAIS TAUFIQ",
				VC: "VC111137",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 46,
				Location: "Normal"
			},
			{
				"Sr. ": 33,
				"Member Name": "MEHBOOB ELAHIE",
				VC: "VC111512",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 47,
				Location: "Normal"
			},
			{
				"Sr. ": 34,
				"Member Name": "FATIMA SABIR ",
				VC: "VC11780",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 48,
				Location: "Normal"
			},
			{
				"Sr. ": 35,
				"Member Name": "BILAL MEHMOOD ",
				VC: "VC111325",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 49,
				Location: "Normal"
			},
			{
				"Sr. ": 36,
				"Member Name": "SHAHZAD AHMAD CH.",
				VC: "VC11679",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 50,
				Location: "Normal"
			},
			{
				"Sr. ": 37,
				"Member Name": "MEHREEN AHMED ",
				VC: "VC11195",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 51,
				Location: "Normal"
			},
			{
				"Sr. ": 38,
				"Member Name": "MIZLA IFTIKHAR",
				VC: "VC111463",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 52,
				Location: "Normal"
			},
			{
				"Sr. ": 39,
				"Member Name": "MOHSIN MUKHTAR",
				VC: "VC111363",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 53,
				Location: "Normal"
			},
			{
				"Sr. ": 40,
				"Member Name": "MUHAMMAD SAAD TARIQ",
				VC: "VC11151",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 54,
				Location: "Normal"
			},
			{
				"Sr. ": 41,
				"Member Name": "SYEDA FARIDA BANO ",
				VC: "VC11874",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 55,
				Location: "Normal"
			},
			{
				"Sr. ": 42,
				"Member Name": "SYEDA FARIDA BANO ",
				VC: "VC11875",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 56,
				Location: "Normal"
			},
			{
				"Sr. ": 43,
				"Member Name": "AFSHAN ARSHAD ",
				VC: "VC11234",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 57,
				Location: "Normal"
			},
			{
				"Sr. ": 44,
				"Member Name": "BEENISH QASIM ",
				VC: "VC11674",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 58,
				Location: "Normal"
			},
			{
				"Sr. ": 45,
				"Member Name": "MUHAMMAD AWAIS ZIA",
				VC: "VC111202",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 59,
				Location: "Normal"
			},
			{
				"Sr. ": 46,
				"Member Name": "MUHAMMAD IMRAN ",
				VC: "VC11681",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 60,
				Location: "Normal"
			},
			{
				"Sr. ": 47,
				"Member Name": "FAISAL EJAZ",
				VC: "VC111081",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 61,
				Location: "Normal"
			},
			{
				"Sr. ": 48,
				"Member Name": "HAFIZ M. NAUMAN QURESHI",
				VC: "VC11737",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 62,
				Location: "Normal"
			},
			{
				"Sr. ": 49,
				"Member Name": "MUHAMMAD SHAFAQAT SAEED",
				VC: "VC111492",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 63,
				Location: "Normal"
			},
			{
				"Sr. ": 50,
				"Member Name": "NASIR ALI",
				VC: "VC11261",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 64,
				Location: "Normal"
			},
			{
				"Sr. ": 51,
				"Member Name": "ADNAN MANZOOR",
				VC: "VC111226",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 65,
				Location: "Normal"
			},
			{
				"Sr. ": 52,
				"Member Name": "MUHAMMAD ALI",
				VC: "VC111361",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 66,
				Location: "Normal"
			},
			{
				"Sr. ": 53,
				"Member Name": "MUHAMMAD ABU-BAKAR",
				VC: "VC111374",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 67,
				Location: "Normal"
			},
			{
				"Sr. ": 54,
				"Member Name": "MUHAMMAD YAQOOB",
				VC: "VC111175",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 68,
				Location: "Normal"
			},
			{
				"Sr. ": 55,
				"Member Name": "SOBIA MUHAMMAD IMRAN ",
				VC: "VC11840",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 69,
				Location: "Normal"
			},
			{
				"Sr. ": 56,
				"Member Name": "MIAN TANVEER BASHIR ",
				VC: "VC11265",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 70,
				Location: "Normal"
			},
			{
				"Sr. ": 57,
				"Member Name": "MASOOD AKHTAR",
				VC: "VC111504",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 71,
				Location: "Normal"
			},
			{
				"Sr. ": 58,
				"Member Name": "HABIB-UR-REHMAN",
				VC: "VC11275",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 72,
				Location: "Normal"
			},
			{
				"Sr. ": 59,
				"Member Name": "Samrooz Abbas",
				VC: "VC111571",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 73,
				Location: "Normal"
			},
			{
				"Sr. ": 60,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC11374",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 74,
				Location: "Normal"
			},
			{
				"Sr. ": 61,
				"Member Name": "SANAULLAH",
				VC: "VC111132",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 75,
				Location: "Normal"
			},
			{
				"Sr. ": 62,
				"Member Name": "MUKHTAR AHMAD",
				VC: "VC111417",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 76,
				Location: "Normal"
			},
			{
				"Sr. ": 63,
				"Member Name": "SANA HABIB",
				VC: "VC11443",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 77,
				Location: "Normal"
			},
			{
				"Sr. ": 64,
				"Member Name": "FIDA HUSSAIN ",
				VC: "VC111200",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 78,
				Location: "Normal"
			},
			{
				"Sr. ": 65,
				"Member Name": "AZRA ZIA",
				VC: "VC11433",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 79,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 66,
				"Member Name": "FARHAN RASHID",
				VC: "VC01170",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 80,
				Location: "Corner"
			},
			{
				"Sr. ": 67,
				"Member Name": "IMRAN NAEEM",
				VC: "VC11358",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 81,
				Location: "Normal"
			},
			{
				"Sr. ": 68,
				"Member Name": "TOQEER AHMAD ",
				VC: "VC11274",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 82,
				Location: "Normal"
			},
			{
				"Sr. ": 69,
				"Member Name": "WASIM ABBASI",
				VC: "VC01135",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 83,
				Location: "Normal"
			},
			{
				"Sr. ": 70,
				"Member Name": "M. WASEEM ANWAR ",
				VC: "VC11330",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 84,
				Location: "Normal"
			},
			{
				"Sr. ": 71,
				"Member Name": "SYED HASHIM ALI SHAH",
				VC: "VC111072",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 85,
				Location: "Normal"
			},
			{
				"Sr. ": 72,
				"Member Name": "MOHAMMAD EJAZ",
				VC: "VC11698",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 86,
				Location: "Normal"
			},
			{
				"Sr. ": 73,
				"Member Name": "ISHFAQ AHMAD",
				VC: "VC11752",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 87,
				Location: "Normal"
			},
			{
				"Sr. ": 74,
				"Member Name": "SHAHZAD AHMAD CH. ",
				VC: "VC11678",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 88,
				Location: "Normal"
			},
			{
				"Sr. ": 75,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11667",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 89,
				Location: "Normal"
			},
			{
				"Sr. ": 76,
				"Member Name": "RUBINA MAHBOOB",
				VC: "VC11635",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 90,
				Location: "Normal"
			},
			{
				"Sr. ": 77,
				"Member Name": "ABDUL QAYYUM",
				VC: "VC111372",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 91,
				Location: "Normal"
			},
			{
				"Sr. ": 78,
				"Member Name": "SYED NAZIR HASAN",
				VC: "VC11449",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 92,
				Location: "Normal"
			},
			{
				"Sr. ": 79,
				"Member Name": "SEYYAD ZISHAN ALI ",
				VC: "VC11209",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 93,
				Location: "Normal"
			},
			{
				"Sr. ": 80,
				"Member Name": "TAHIRA IMRAN",
				VC: "VC11355",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 94,
				Location: "Normal"
			},
			{
				"Sr. ": 81,
				"Member Name": "KHURRAM SHAHZAD",
				VC: "VC111086",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 95,
				Location: "Normal"
			},
			{
				"Sr. ": 82,
				"Member Name": "MUHAMMAD SHAFI",
				VC: "VC11404",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 96,
				Location: "Normal"
			},
			{
				"Sr. ": 83,
				"Member Name": "MUHAMMAD ALTAF",
				VC: "VC111405",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 97,
				Location: "Normal"
			},
			{
				"Sr. ": 84,
				"Member Name": "ATTA ULLAH",
				VC: "VC11386",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 98,
				Location: "Normal"
			},
			{
				"Sr. ": 85,
				"Member Name": "SAJID ALI",
				VC: "VC11391",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 99,
				Location: "Normal"
			},
			{
				"Sr. ": 86,
				"Member Name": "ARHAM IMRAN",
				VC: "VC11357",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 100,
				Location: "Normal"
			},
			{
				"Sr. ": 87,
				"Member Name": "MUBASHIR REHMAN",
				VC: "VC11713",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 101,
				Location: "Corner"
			},
			{
				"Sr. ": 88,
				"Member Name": "AKIF RASHEED",
				VC: "VC111250",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 102,
				Location: "Corner"
			},
			{
				"Sr. ": 89,
				"Member Name": "MUDASAR ALI",
				VC: "VC11385",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 103,
				Location: "Normal"
			},
			{
				"Sr. ": 90,
				"Member Name": "KASHIF ILYAS ",
				VC: "VC11716",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 104,
				Location: "Normal"
			},
			{
				"Sr. ": 91,
				"Member Name": "ASSIA TARIQ",
				VC: "VC11432",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 105,
				Location: "Normal"
			},
			{
				"Sr. ": 92,
				"Member Name": "M. FARHAN QURESHI",
				VC: "VC11738",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 106,
				Location: "Normal"
			},
			{
				"Sr. ": 93,
				"Member Name": "SHAGUFTA JABEEN",
				VC: "VC11735",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 107,
				Location: "Normal"
			},
			{
				"Sr. ": 94,
				"Member Name": "S TAHIR SAJJAD BOKHARI",
				VC: "VC01142",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 108,
				Location: "Normal"
			},
			{
				"Sr. ": 95,
				"Member Name": "SOBIA RIZWAN ",
				VC: "VC11204",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 109,
				Location: "Normal"
			},
			{
				"Sr. ": 96,
				"Member Name": "ZESHAN ALI ",
				VC: "VC11781",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 110,
				Location: "Normal"
			},
			{
				"Sr. ": 97,
				"Member Name": "SYED MASOOD ALI",
				VC: "VC11574",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 111,
				Location: "Normal"
			},
			{
				"Sr. ": 98,
				"Member Name": "SANIA CHUDHARY",
				VC: "VC11879",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 112,
				Location: "Normal"
			},
			{
				"Sr. ": 99,
				"Member Name": "SHAHBAZ ALI",
				VC: "VC111477",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 113,
				Location: "Normal"
			},
			{
				"Sr. ": 100,
				"Member Name": "MUHAMMAD MOHSIN BHATTI",
				VC: "VC111510",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 114,
				Location: "Normal"
			},
			{
				"Sr. ": 101,
				"Member Name": "IQBAL BASHIR",
				VC: "VC11602",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 115,
				Location: "Normal"
			},
			{
				"Sr. ": 102,
				"Member Name": "MUHAMMAD MOHSIN BHATTI",
				VC: "VC111514",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 116,
				Location: "Normal"
			},
			{
				"Sr. ": 103,
				"Member Name": "RIDA SHAKIL",
				VC: "VC111496",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 117,
				Location: "Normal"
			},
			{
				"Sr. ": 104,
				"Member Name": "MUHAMMAD KASHIF ",
				VC: "VC111017",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 118,
				Location: "Normal"
			},
			{
				"Sr. ": 105,
				"Member Name": "MUHAMMAD IMRAN",
				VC: "VC11881",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 119,
				Location: "Normal"
			},
			{
				"Sr. ": 106,
				"Member Name": "ATIF AKHTAR BHATTI ",
				VC: "VC11193",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 120,
				Location: "Normal"
			},
			{
				"Sr. ": 107,
				"Member Name": "UZAIR BIN IMRAN",
				VC: "VC11356",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 121,
				Location: "Corner"
			},
			{
				"Sr. ": 108,
				"Member Name": "IQRA SITAR",
				VC: "VC11314",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 122,
				Location: "Corner"
			},
			{
				"Sr. ": 109,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11664",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 123,
				Location: "Normal"
			},
			{
				"Sr. ": 110,
				"Member Name": "ASIM RASHEED",
				VC: "VC111257",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 124,
				Location: "Normal"
			},
			{
				"Sr. ": 111,
				"Member Name": "ZAIN UL ABIDEEN",
				VC: "VC111247",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 125,
				Location: "Normal"
			},
			{
				"Sr. ": 112,
				"Member Name": "RANA EJAZ AHMED",
				VC: "VC11194",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 126,
				Location: "Normal"
			},
			{
				"Sr. ": 113,
				"Member Name": "ABDUL REHMAN",
				VC: "VC111513",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 127,
				Location: "Normal"
			},
			{
				"Sr. ": 114,
				"Member Name": "SIDRA AMIR",
				VC: "VC111570",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 128,
				Location: "Normal"
			},
			{
				"Sr. ": 115,
				"Member Name": "USMAN AHMAD",
				VC: "VC111539",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 129,
				Location: "Normal"
			},
			{
				"Sr. ": 116,
				"Member Name": "ASIM RASHEED",
				VC: "VC111258",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 130,
				Location: "Normal"
			},
			{
				"Sr. ": 117,
				"Member Name": "RANA DILDAR AHMAD",
				VC: "VC11616",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 131,
				Location: "Normal"
			},
			{
				"Sr. ": 118,
				"Member Name": "BATOOL EJAZ",
				VC: "VC01137",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 132,
				Location: "Normal"
			},
			{
				"Sr. ": 119,
				"Member Name": "MUHAMMAD ADIL KHAN ",
				VC: "VC111039",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 133,
				Location: "FP"
			},
			{
				"Sr. ": 120,
				"Member Name": "NAVEED AHMED",
				VC: "VC01186",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 134,
				Location: "FP"
			},
			{
				"Sr. ": 121,
				"Member Name": "HAFSA ASHFAQ",
				VC: "VC11896",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 135,
				Location: "FP"
			},
			{
				"Sr. ": 122,
				"Member Name": "FAISAL WAHEED KHAN",
				VC: "VC11469",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 136,
				Location: "FP"
			},
			{
				"Sr. ": 123,
				"Member Name": "FAISAL WAHEED KHAN",
				VC: "VC11468",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 137,
				Location: "FP"
			},
			{
				"Sr. ": 124,
				"Member Name": "SALMA BIBI",
				VC: "VC111262",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 138,
				Location: "FP"
			},
			{
				"Sr. ": 125,
				"Member Name": "MARIYAM FAHAD",
				VC: "VC11694",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 139,
				Location: "FP"
			},
			{
				"Sr. ": 126,
				"Member Name": "SHUMAILA MOHSIN",
				VC: "VC111297",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 140,
				Location: "FP"
			},
			{
				"Sr. ": 127,
				"Member Name": "SAQIB LATIF",
				VC: "VC11696",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 141,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 128,
				"Member Name": "MUHAMMAD TAHIR BASHIR",
				VC: "VC111212",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 142,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 129,
				"Member Name": "MAHEEN IMRAN",
				VC: "VC11359",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 143,
				Location: "FP"
			},
			{
				"Sr. ": 130,
				"Member Name": "MUHAMMAD IMRAN",
				VC: "VC111135",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 144,
				Location: "FP"
			},
			{
				"Sr. ": 131,
				"Member Name": "BASHIR AHMAD",
				VC: "VC111215",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 145,
				Location: "FP"
			},
			{
				"Sr. ": 132,
				"Member Name": "FAHAD ISLAM",
				VC: "VC11140",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 146,
				Location: "FP"
			},
			{
				"Sr. ": 133,
				"Member Name": "MUHAMMAD MOON SHAHZAD",
				VC: "VC111506",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 147,
				Location: "FP"
			},
			{
				"Sr. ": 134,
				"Member Name": "TOOBA HASSAN",
				VC: "VC111524",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 148,
				Location: "FP"
			},
			{
				"Sr. ": 135,
				"Member Name": "SAIMA TARIQ",
				VC: "VC111263",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 149,
				Location: "Normal"
			},
			{
				"Sr. ": 136,
				"Member Name": "UMAIR SABIR",
				VC: "VC11671",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 150,
				Location: "Normal"
			},
			{
				"Sr. ": 137,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC11375",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 151,
				Location: "Normal"
			},
			{
				"Sr. ": 138,
				"Member Name": "MUHAMMAD AKRAM ",
				VC: "VC11631",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 152,
				Location: "Normal"
			},
			{
				"Sr. ": 139,
				"Member Name": "IJAZ AHMAD",
				VC: "VC11478",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 153,
				Location: "Normal"
			},
			{
				"Sr. ": 140,
				"Member Name": "MUHAMMAD AWAIS",
				VC: "VC11410",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 154,
				Location: "Normal"
			},
			{
				"Sr. ": 141,
				"Member Name": "ARSHAD JAVED",
				VC: "VC111203",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 155,
				Location: "Normal"
			},
			{
				"Sr. ": 142,
				"Member Name": "AQSA IZHAR",
				VC: "VC11436",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 156,
				Location: "Normal"
			},
			{
				"Sr. ": 143,
				"Member Name": "MUHAMMAD ADIL KHAN ",
				VC: "VC11980",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 157,
				Location: "Normal"
			},
			{
				"Sr. ": 144,
				"Member Name": "MARYUM MAHMOOD ",
				VC: "VC11153",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 158,
				Location: "Normal"
			},
			{
				"Sr. ": 145,
				"Member Name": "AYESHA AHMED ",
				VC: "VC11623",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 159,
				Location: "Normal"
			},
			{
				"Sr. ": 146,
				"Member Name": "MOUZAM JAVED ",
				VC: "VC11179",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 160,
				Location: "Normal"
			},
			{
				"Sr. ": 147,
				"Member Name": "FAISAL EJAZ",
				VC: "VC111082",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 161,
				Location: "Normal"
			},
			{
				"Sr. ": 148,
				"Member Name": "SOBIA NOUMAN",
				VC: "VC11789",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 162,
				Location: "Corner"
			},
			{
				"Sr. ": 149,
				"Member Name": "MUHAMMAD IMRAN",
				VC: "VC11882",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 163,
				Location: "Corner"
			},
			{
				"Sr. ": 150,
				"Member Name": "MUHAMMAD KAMRAN",
				VC: "VC111474",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 164,
				Location: "Normal"
			},
			{
				"Sr. ": 151,
				"Member Name": "MUHAMMAD KHALID ",
				VC: "VC11945",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 165,
				Location: "Normal"
			},
			{
				"Sr. ": 152,
				"Member Name": "MUHAMMAD JAVED",
				VC: "VC111505",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 166,
				Location: "Normal"
			},
			{
				"Sr. ": 153,
				"Member Name": "RANA HAFEEZ ULLAH",
				VC: "VC11431",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 167,
				Location: "Normal"
			},
			{
				"Sr. ": 154,
				"Member Name": "FATIMA AFZAAL",
				VC: "VC111229",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 168,
				Location: "Normal"
			},
			{
				"Sr. ": 155,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11665",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 169,
				Location: "Normal"
			},
			{
				"Sr. ": 156,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11666",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 170,
				Location: "Normal"
			},
			{
				"Sr. ": 157,
				"Member Name": "YASIR IQBAL",
				VC: "VC11390",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 171,
				Location: "Normal"
			},
			{
				"Sr. ": 158,
				"Member Name": "YASIR IQBAL",
				VC: "VC11388",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 172,
				Location: "Normal"
			},
			{
				"Sr. ": 159,
				"Member Name": "YASIR IQBAL",
				VC: "VC11389",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 173,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 160,
				"Member Name": "SYED KANWAL ZAIDI",
				VC: "VC11450",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 174,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 161,
				"Member Name": "MUHAMMAD SHAKEEL",
				VC: "VC11625",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 176,
				Location: "Normal"
			},
			{
				"Sr. ": 162,
				"Member Name": "AKIF RASHEED",
				VC: "VC111251",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 177,
				Location: "Normal"
			},
			{
				"Sr. ": 163,
				"Member Name": "SHAGUFTA JABEEN",
				VC: "VC11736",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 178,
				Location: "Normal"
			},
			{
				"Sr. ": 164,
				"Member Name": "HINA QAISER",
				VC: "VC11774",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 179,
				Location: "Normal"
			},
			{
				"Sr. ": 165,
				"Member Name": "BALAL AHMAD",
				VC: "VC11101",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 180,
				Location: "Normal"
			},
			{
				"Sr. ": 166,
				"Member Name": "SHAZIA TASNEEM",
				VC: "VC11348",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 181,
				Location: "Normal"
			},
			{
				"Sr. ": 167,
				"Member Name": "IZMA ANWAR",
				VC: "VC111085",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 182,
				Location: "Normal"
			},
			{
				"Sr. ": 168,
				"Member Name": "MUHAMMAD BASHIR ",
				VC: "VC11782",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 183,
				Location: "Normal"
			},
			{
				"Sr. ": 169,
				"Member Name": "M. AZEEM QURESHI",
				VC: "VC11351",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 184,
				Location: "Corner"
			},
			{
				"Sr. ": 170,
				"Member Name": "ZILE HUMA",
				VC: "VC111365",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 185,
				Location: "Corner"
			},
			{
				"Sr. ": 171,
				"Member Name": "MUHAMMAD BILAL",
				VC: "VC11408",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 186,
				Location: "Normal"
			},
			{
				"Sr. ": 172,
				"Member Name": "SHAHZADA ANJUM",
				VC: "VC11790",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 187,
				Location: "Normal"
			},
			{
				"Sr. ": 173,
				"Member Name": "MUHAMMAD ZEESHAN",
				VC: "VC11830",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 188,
				Location: "Normal"
			},
			{
				"Sr. ": 174,
				"Member Name": "MUHAMMAD NASIR",
				VC: "VC01168",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 189,
				Location: "Normal"
			},
			{
				"Sr. ": 175,
				"Member Name": "ROBINA SHAHEEN ",
				VC: "VC11663",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 190,
				Location: "Normal"
			},
			{
				"Sr. ": 176,
				"Member Name": "ZUHAIB KHALID",
				VC: "VC11228",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 191,
				Location: "Normal"
			},
			{
				"Sr. ": 177,
				"Member Name": "FATIMA HABIB",
				VC: "VC01178",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 192,
				Location: "Normal"
			},
			{
				"Sr. ": 178,
				"Member Name": "USMAN AHMAD",
				VC: "VC11772",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 193,
				Location: "Normal"
			},
			{
				"Sr. ": 179,
				"Member Name": "GHULAM ALI",
				VC: "VC111471",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 194,
				Location: "Normal"
			},
			{
				"Sr. ": 180,
				"Member Name": "SHAHZAD AHMAD CHAUDHARY ",
				VC: "VC11677",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 195,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 181,
				"Member Name": "AKIF RASHEED",
				VC: "VC111252",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 196,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 182,
				"Member Name": "BIBI RUKHSANA",
				VC: "VC111367",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 197,
				Location: "Normal"
			},
			{
				"Sr. ": 183,
				"Member Name": "ZULQARNAIN HABIB",
				VC: "VC111302",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 199,
				Location: "Normal"
			},
			{
				"Sr. ": 184,
				"Member Name": "KASHIF ILYAS ",
				VC: "VC11715",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 200,
				Location: "Normal"
			},
			{
				"Sr. ": 185,
				"Member Name": "KASHIF ILYAS ",
				VC: "VC11714",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 201,
				Location: "Normal"
			},
			{
				"Sr. ": 186,
				"Member Name": "ASAD TARIQ ",
				VC: "VC11158",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 202,
				Location: "Normal"
			},
			{
				"Sr. ": 187,
				"Member Name": "MUHAMMAD YOUNAS",
				VC: "VC111228",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 203,
				Location: "Normal"
			},
			{
				"Sr. ": 188,
				"Member Name": "AYESHA SAQIB",
				VC: "VC111315",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 204,
				Location: "Normal"
			},
			{
				"Sr. ": 189,
				"Member Name": "MUHAMMAD ARSLAN",
				VC: "VC111425",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 205,
				Location: "Corner"
			},
			{
				"Sr. ": 190,
				"Member Name": "JAVARIA SALEEM",
				VC: "VC111034",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 206,
				Location: "Corner"
			},
			{
				"Sr. ": 191,
				"Member Name": "TOOBA HASSAN",
				VC: "VC111521",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 207,
				Location: "Normal"
			},
			{
				"Sr. ": 192,
				"Member Name": "Maqsood Ahmad",
				VC: "VC111661",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 208,
				Location: "Normal"
			},
			{
				"Sr. ": 193,
				"Member Name": "Zukhruf Umair",
				VC: "VC11466",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 209,
				Location: "Normal"
			},
			{
				"Sr. ": 194,
				"Member Name": "SAJID MUNIR",
				VC: "VC111460",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 210,
				Location: "Normal"
			},
			{
				"Sr. ": 195,
				"Member Name": "SAJID MUNIR",
				VC: "VC111461",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 211,
				Location: "Normal"
			},
			{
				"Sr. ": 196,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC111543",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 212,
				Location: "Normal"
			},
			{
				"Sr. ": 197,
				"Member Name": "Samrooz Abbas",
				VC: "VC111572",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 213,
				Location: "Normal"
			},
			{
				"Sr. ": 198,
				"Member Name": "Murad ALI",
				VC: "VC11371",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 214,
				Location: "FP"
			},
			{
				"Sr. ": 199,
				"Member Name": "Ch. Sohil",
				VC: "VC11392",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 215,
				Location: "FP"
			},
			{
				"Sr. ": 200,
				"Member Name": "Ch. Sohil",
				VC: "VC11393",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 216,
				Location: "FP"
			},
			{
				"Sr. ": 201,
				"Member Name": "Ch. Sohil",
				VC: "VC11394",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 217,
				Location: "FP"
			},
			{
				"Sr. ": 202,
				"Member Name": "Ch. Sohil",
				VC: "VC11395",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 218,
				Location: "FP"
			},
			{
				"Sr. ": 203,
				"Member Name": "ALI Hamza",
				VC: "VC11398",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 219,
				Location: "FP"
			},
			{
				"Sr. ": 204,
				"Member Name": "ALI Hamza",
				VC: "VC11399",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 220,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 205,
				"Member Name": "ALI Hamza",
				VC: "VC11400",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 221,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 206,
				"Member Name": "ALI Hamza",
				VC: "VC11401",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 222,
				Location: "FP"
			},
			{
				"Sr. ": 207,
				"Member Name": "Kouser Parveen",
				VC: "VC11446",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 223,
				Location: "FP"
			},
			{
				"Sr. ": 208,
				"Member Name": "Muhammad Aslam Tabasum",
				VC: "VC11427",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 224,
				Location: "FP"
			},
			{
				"Sr. ": 209,
				"Member Name": "Fakhar Husnain",
				VC: "VC11473",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 225,
				Location: "FP"
			},
			{
				"Sr. ": 210,
				"Member Name": "Muhammad Umer ALI Usmani / Muhammad ALI",
				VC: "VC111774",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 226,
				Location: "FP"
			},
			{
				"Sr. ": 211,
				"Member Name": "Muhammad Javed",
				VC: "VC11396",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 227,
				Location: "FP"
			},
			{
				"Sr. ": 212,
				"Member Name": "Sameer Ahmad",
				VC: "VC1756",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 228,
				Location: "FP"
			},
			{
				"Sr. ": 213,
				"Member Name": "Zeeshan Nazir",
				VC: "VC11384",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 229,
				Location: "FP"
			},
			{
				"Sr. ": 214,
				"Member Name": "Muhammad Shafique",
				VC: "VC111791",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 230,
				Location: "Normal"
			},
			{
				"Sr. ": 215,
				"Member Name": "Nayab Imtiaz",
				VC: "VC111717",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 231,
				Location: "Normal"
			},
			{
				"Sr. ": 216,
				"Member Name": "Muhammad Iqbal",
				VC: "VC11918",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 232,
				Location: "Normal"
			},
			{
				"Sr. ": 217,
				"Member Name": "Faizan Tariq",
				VC: "VC111584",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 233,
				Location: "Normal"
			},
			{
				"Sr. ": 218,
				"Member Name": "SAJID ALI",
				VC: "VC111541",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 234,
				Location: "Normal"
			},
			{
				"Sr. ": 219,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC111545",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 235,
				Location: "Normal"
			},
			{
				"Sr. ": 220,
				"Member Name": "MUHAMMAD AMJAD",
				VC: "VC111555",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 236,
				Location: "Normal"
			},
			{
				"Sr. ": 221,
				"Member Name": "Muhammad Attique",
				VC: "VC11216",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 238,
				Location: "Normal"
			},
			{
				"Sr. ": 222,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC111542",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 239,
				Location: "Normal"
			},
			{
				"Sr. ": 223,
				"Member Name": "Kashif Raza",
				VC: "VC111426",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 240,
				Location: "Corner"
			},
			{
				"Sr. ": 224,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC111544",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 241,
				Location: "Corner"
			},
			{
				"Sr. ": 225,
				"Member Name": "Abdul Rehman",
				VC: "VC111660",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 242,
				Location: "Normal"
			},
			{
				"Sr. ": 226,
				"Member Name": "Nisha Uzair",
				VC: "VC01131",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 243,
				Location: "Normal"
			},
			{
				"Sr. ": 227,
				"Member Name": "Zeeshan Arif",
				VC: "VC111610",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 244,
				Location: "Normal"
			},
			{
				"Sr. ": 228,
				"Member Name": "Akbar ALI",
				VC: "VC111781",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 245,
				Location: "Normal"
			},
			{
				"Sr. ": 229,
				"Member Name": "Nadeem Ahmed",
				VC: "VC11898",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 246,
				Location: "Normal"
			},
			{
				"Sr. ": 230,
				"Member Name": "Muhammad Qasim",
				VC: "VC11596",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 247,
				Location: "Normal"
			},
			{
				"Sr. ": 231,
				"Member Name": "Abdul Raheem Hussain",
				VC: "VC11697",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 248,
				Location: "Normal"
			},
			{
				"Sr. ": 232,
				"Member Name": "Mian Waqar Ahmed",
				VC: "VC111183",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 249,
				Location: "Normal"
			},
			{
				"Sr. ": 233,
				"Member Name": "Muhammad Faraz Ul Haq",
				VC: "VC11273",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 250,
				Location: "Normal"
			},
			{
				"Sr. ": 234,
				"Member Name": "ALI Ahmad",
				VC: "VC01139",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 251,
				Location: "Normal"
			},
			{
				"Sr. ": 235,
				"Member Name": "Muhammad Adnan Haider",
				VC: "VC11159",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 252,
				Location: "Normal"
			},
			{
				"Sr. ": 236,
				"Member Name": "Shan Saleem",
				VC: "VC111402",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 253,
				Location: "Normal"
			},
			{
				"Sr. ": 237,
				"Member Name": "Zeeshan ALI",
				VC: "VC111036",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 254,
				Location: "Normal"
			},
			{
				"Sr. ": 238,
				"Member Name": "Qaisar Ashraf",
				VC: "VC111727",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 255,
				Location: "Normal"
			},
			{
				"Sr. ": 239,
				"Member Name": "Shahzad Ahmad Khan",
				VC: "VC111766",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 256,
				Location: "Normal"
			},
			{
				"Sr. ": 240,
				"Member Name": "Muhammad Asif Naeem",
				VC: "VC11373",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 257,
				Location: "Normal"
			},
			{
				"Sr. ": 241,
				"Member Name": "Muhammad Shafi",
				VC: "VC11403",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 258,
				Location: "Normal"
			},
			{
				"Sr. ": 242,
				"Member Name": "Syed Sajjad Hussain",
				VC: "VC11258",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 259,
				Location: "Normal"
			},
			{
				"Sr. ": 243,
				"Member Name": "Jawad USMAN",
				VC: "VC111324",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 260,
				Location: "Corner"
			},
			{
				"Sr. ": 244,
				"Member Name": "Mushtaq Zauque Diamond",
				VC: "VC111693",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 261,
				Location: "Corner"
			},
			{
				"Sr. ": 245,
				"Member Name": "Muhammad Younas",
				VC: "VC111763",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 262,
				Location: "Normal"
			},
			{
				"Sr. ": 246,
				"Member Name": "Tasleem Kousar",
				VC: "VC111662",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 263,
				Location: "Normal"
			},
			{
				"Sr. ": 247,
				"Member Name": "Ghulam Mustafa Nayyer Alvi",
				VC: "VC111457",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 264,
				Location: "Normal"
			},
			{
				"Sr. ": 248,
				"Member Name": "Rafia Tabassum",
				VC: "VC111589",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 265,
				Location: "Normal"
			},
			{
				"Sr. ": 249,
				"Member Name": "Muhammad Munir Khan",
				VC: "VC11885",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 266,
				Location: "Normal"
			},
			{
				"Sr. ": 250,
				"Member Name": "Muhammad Munir Khan",
				VC: "VC11884",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 267,
				Location: "Normal"
			},
			{
				"Sr. ": 251,
				"Member Name": "Muhammad Touqeer Tariq",
				VC: "VC01153",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 268,
				Location: "Normal"
			},
			{
				"Sr. ": 252,
				"Member Name": "Tanveer Ahmad",
				VC: "VC111491",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 269,
				Location: "Normal"
			},
			{
				"Sr. ": 253,
				"Member Name": "Mah Noor Karim",
				VC: "VC11825",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 270,
				Location: "Normal"
			},
			{
				"Sr. ": 254,
				"Member Name": "Waqar Ahmad",
				VC: "VC11649",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 271,
				Location: "Normal"
			},
			{
				"Sr. ": 255,
				"Member Name": "Waqar Ahmad",
				VC: "VC11650",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 272,
				Location: "Normal"
			},
			{
				"Sr. ": 256,
				"Member Name": "Kiran Aftab",
				VC: "VC11643",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 273,
				Location: "Normal"
			},
			{
				"Sr. ": 257,
				"Member Name": "Haroon Mansha",
				VC: "VC11648",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "Umer",
				Plot: 274,
				Location: "Corner"
			},
			{
				"Sr. ": 258,
				"Member Name": "RIDA ASHFAQ",
				VC: "VC12757",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 1,
				Location: "Corner"
			},
			{
				"Sr. ": 259,
				"Member Name": "MIAN MOHAMMAD ASLAM",
				VC: "VC12213",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 2,
				Location: "Normal"
			},
			{
				"Sr. ": 260,
				"Member Name": "ZUBAIR AHMAD WASEEM",
				VC: "VC12110",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 3,
				Location: "Normal"
			},
			{
				"Sr. ": 261,
				"Member Name": "MUHAMMAD AWAIS",
				VC: "VC121223",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 4,
				Location: "Normal"
			},
			{
				"Sr. ": 262,
				"Member Name": "AHMAD WAQAR ",
				VC: "VC12871",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 5,
				Location: "Normal"
			},
			{
				"Sr. ": 263,
				"Member Name": "MAMOONA RIAZ",
				VC: "VC12769",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 6,
				Location: "Normal"
			},
			{
				"Sr. ": 264,
				"Member Name": "SABA BABAR ",
				VC: "VC12989",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 7,
				Location: "Normal"
			},
			{
				"Sr. ": 265,
				"Member Name": "AYESHA BIBI ",
				VC: "VC121439",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 8,
				Location: "Normal"
			},
			{
				"Sr. ": 266,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC121078",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 9,
				Location: "Normal"
			},
			{
				"Sr. ": 267,
				"Member Name": "AMIR SHAHZAD",
				VC: "VC12406",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 10,
				Location: "Normal"
			},
			{
				"Sr. ": 268,
				"Member Name": "MUHAMMAD WAQAS SABIR ",
				VC: "VC12633",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 11,
				Location: "Normal"
			},
			{
				"Sr. ": 269,
				"Member Name": "SAHJEED HUSSAIN",
				VC: "VC12886",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 12,
				Location: "Normal"
			},
			{
				"Sr. ": 270,
				"Member Name": "S. TAHIR SAJJAD BUKHARI",
				VC: "VC121430",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 13,
				Location: "Normal"
			},
			{
				"Sr. ": 271,
				"Member Name": "IFFAT ALIA",
				VC: "VC01284",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 14,
				Location: "Normal"
			},
			{
				"Sr. ": 272,
				"Member Name": "HUSNAIN RAZA",
				VC: "VC121304",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 15,
				Location: "Normal"
			},
			{
				"Sr. ": 273,
				"Member Name": "IMRAN AHMAD QURESHI",
				VC: "VC121397",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 16,
				Location: "Normal"
			},
			{
				"Sr. ": 274,
				"Member Name": "SAQIB ISRAR",
				VC: "VC01217",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 17,
				Location: "Normal"
			},
			{
				"Sr. ": 275,
				"Member Name": "IMRAN NAEEM",
				VC: "VC12684",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 18,
				Location: "Normal"
			},
			{
				"Sr. ": 276,
				"Member Name": "RANA HASSAN MUMTAZ",
				VC: "VC12304",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 19,
				Location: "FP"
			},
			{
				"Sr. ": 277,
				"Member Name": "HAMZAH RAAFEH KHANZADA ",
				VC: "VC121433",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 20,
				Location: "FP"
			},
			{
				"Sr. ": 278,
				"Member Name": "UMER FAROOQ MALIK",
				VC: "VC121138",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 21,
				Location: "FP"
			},
			{
				"Sr. ": 279,
				"Member Name": "ASHFAQ MAHMOOD",
				VC: "VC121083",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 22,
				Location: "FP"
			},
			{
				"Sr. ": 280,
				"Member Name": "MUHAMMAD HASSAN",
				VC: "VC121557",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 23,
				Location: "FP"
			},
			{
				"Sr. ": 281,
				"Member Name": "MUHAMMAD HASSAN",
				VC: "VC121558",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 24,
				Location: "Normal"
			},
			{
				"Sr. ": 282,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC121547",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 25,
				Location: "Normal"
			},
			{
				"Sr. ": 283,
				"Member Name": "MUKHTAR AHMAD",
				VC: "VC121416",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 26,
				Location: "Normal"
			},
			{
				"Sr. ": 284,
				"Member Name": "MADIHA BABAR",
				VC: "VC121458",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 27,
				Location: "Normal"
			},
			{
				"Sr. ": 285,
				"Member Name": "HAMZA MUKHTAR",
				VC: "VC12776",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 28,
				Location: "Normal"
			},
			{
				"Sr. ": 286,
				"Member Name": "MUHAMMAD SHAFIQUE ",
				VC: "VC12807",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 29,
				Location: "Normal"
			},
			{
				"Sr. ": 287,
				"Member Name": "AMJAD RASOOL AWAN",
				VC: "VC12726",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 30,
				Location: "Normal"
			},
			{
				"Sr. ": 288,
				"Member Name": "MUHAMMAD ZAHEER",
				VC: "VC01299",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 31,
				Location: "Normal"
			},
			{
				"Sr. ": 289,
				"Member Name": "MOHAMMAD ZAFAR IQBAL ",
				VC: "VC12586",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 32,
				Location: "Normal"
			},
			{
				"Sr. ": 290,
				"Member Name": "UMER SHEHZAD",
				VC: "VC12508",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 33,
				Location: "Normal"
			},
			{
				"Sr. ": 291,
				"Member Name": "MUHAMMAD SHAFIQUE ",
				VC: "VC12808",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 34,
				Location: "Normal"
			},
			{
				"Sr. ": 292,
				"Member Name": "ZULFIQAR ALI",
				VC: "VC121162",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 35,
				Location: "Normal"
			},
			{
				"Sr. ": 293,
				"Member Name": "FARHAN YOUSAF",
				VC: "VC121380",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 36,
				Location: "Normal"
			},
			{
				"Sr. ": 294,
				"Member Name": "NABEEL ANJUM",
				VC: "VC12160",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 37,
				Location: "Normal"
			},
			{
				"Sr. ": 295,
				"Member Name": "BUSHRA ALI",
				VC: "VC12217",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 38,
				Location: "Normal"
			},
			{
				"Sr. ": 296,
				"Member Name": "Syed Saqlain Raza Shah Naqvi (Dual Ownership)",
				VC: "VC12902",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 39,
				Location: "Corner"
			},
			{
				"Sr. ": 297,
				"Member Name": "M. FAWAD NASEEM ABBASI",
				VC: "VC01274",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 40,
				Location: "Normal"
			},
			{
				"Sr. ": 298,
				"Member Name": "MUHAMMAD SUFYAN ",
				VC: "VC12990",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 41,
				Location: "Normal"
			},
			{
				"Sr. ": 299,
				"Member Name": "ZEESHAN AFZAL",
				VC: "VC01281",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 42,
				Location: "Normal"
			},
			{
				"Sr. ": 300,
				"Member Name": "NAZIR AHMAD",
				VC: "VC121285",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 43,
				Location: "Normal"
			},
			{
				"Sr. ": 301,
				"Member Name": "NAIMA ARAB CHOUDHARY",
				VC: "VC121136",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 44,
				Location: "Normal"
			},
			{
				"Sr. ": 302,
				"Member Name": "NAZISH ZAFAR",
				VC: "VC121067",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 45,
				Location: "Normal"
			},
			{
				"Sr. ": 303,
				"Member Name": "SAIMA NOMAN",
				VC: "VC12724",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 46,
				Location: "Normal"
			},
			{
				"Sr. ": 304,
				"Member Name": "TAHIR RASHID",
				VC: "VC12686",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 47,
				Location: "Normal"
			},
			{
				"Sr. ": 305,
				"Member Name": "AMNA HASSAN",
				VC: "VC121166",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 48,
				Location: "Normal"
			},
			{
				"Sr. ": 306,
				"Member Name": "SYED AKHTAR HUSSAIN ZAIDI",
				VC: "VC12603",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 49,
				Location: "Normal"
			},
			{
				"Sr. ": 307,
				"Member Name": "SYED GHUFRAN AHMAD",
				VC: "VC121283",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 50,
				Location: "Normal"
			},
			{
				"Sr. ": 308,
				"Member Name": "SHAHID RASHEED",
				VC: "VC12593",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 51,
				Location: "Normal"
			},
			{
				"Sr. ": 309,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC121127",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 52,
				Location: "Normal"
			},
			{
				"Sr. ": 310,
				"Member Name": "MUHAMMAD SADIQ",
				VC: "VC121158",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 55,
				Location: "Normal"
			},
			{
				"Sr. ": 311,
				"Member Name": "MUHAMMAD AHMAD ZAIB",
				VC: "VC121126",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 56,
				Location: "Normal"
			},
			{
				"Sr. ": 312,
				"Member Name": "IMRAN AHMAD QURESHI",
				VC: "VC121396",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 57,
				Location: "Normal"
			},
			{
				"Sr. ": 313,
				"Member Name": "BADAR JAMAL",
				VC: "VC12437",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 58,
				Location: "Normal"
			},
			{
				"Sr. ": 314,
				"Member Name": "IQRA SARWAR",
				VC: "VC121532",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 59,
				Location: "Normal"
			},
			{
				"Sr. ": 315,
				"Member Name": "FARHAN RASHID",
				VC: "VC01269",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 60,
				Location: "Normal"
			},
			{
				"Sr. ": 316,
				"Member Name": "KINZA ARIF ",
				VC: "VC12276",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 61,
				Location: "Normal"
			},
			{
				"Sr. ": 317,
				"Member Name": "USMAN KHALID WARAICH ",
				VC: "VC12335",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 62,
				Location: "Normal"
			},
			{
				"Sr. ": 318,
				"Member Name": "SHAKEELA BASHARAT ",
				VC: "VC121429",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 63,
				Location: "Normal"
			},
			{
				"Sr. ": 319,
				"Member Name": "MALIK RIZWAN",
				VC: "VC121480",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 64,
				Location: "Normal"
			},
			{
				"Sr. ": 320,
				"Member Name": "NASEER AHMAD BUTT",
				VC: "VC121254",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 65,
				Location: "Normal"
			},
			{
				"Sr. ": 321,
				"Member Name": "RUSHNA SAFIA",
				VC: "VC121295",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 66,
				Location: "Normal"
			},
			{
				"Sr. ": 322,
				"Member Name": "MUHAMMAD WAQAS",
				VC: "VC121296",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 67,
				Location: "Normal"
			},
			{
				"Sr. ": 323,
				"Member Name": "SARFRAZ IQBAL",
				VC: "VC121184",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 68,
				Location: "Corner"
			},
			{
				"Sr. ": 324,
				"Member Name": "ABDUL GHAFFAR",
				VC: "VC121149",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 69,
				Location: "Corner"
			},
			{
				"Sr. ": 325,
				"Member Name": "QAMAR UN NISA",
				VC: "VC01293",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 70,
				Location: "Normal"
			},
			{
				"Sr. ": 326,
				"Member Name": "ABDULLAH RAAKEH KHANZADA ",
				VC: "VC121435",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 71,
				Location: "Normal"
			},
			{
				"Sr. ": 327,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC121548",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 72,
				Location: "Normal"
			},
			{
				"Sr. ": 328,
				"Member Name": "AHMAD BILAL",
				VC: "VC01214",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 73,
				Location: "Normal"
			},
			{
				"Sr. ": 329,
				"Member Name": "TAHIR RASHID",
				VC: "VC12687",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 74,
				Location: "Normal"
			},
			{
				"Sr. ": 330,
				"Member Name": "WAQAS AHMAD",
				VC: "VC01298",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 75,
				Location: "Normal"
			},
			{
				"Sr. ": 331,
				"Member Name": "MUHAMMAD HASEEB",
				VC: "VC121255",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 76,
				Location: "Normal"
			},
			{
				"Sr. ": 332,
				"Member Name": "TOOBA HASSAN",
				VC: "VC121522",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 77,
				Location: "Normal"
			},
			{
				"Sr. ": 333,
				"Member Name": "REHANA KAUSAR ",
				VC: "VC12946",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 78,
				Location: "Normal"
			},
			{
				"Sr. ": 334,
				"Member Name": "MUHAMMAD AHSAAN",
				VC: "VC121291",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 79,
				Location: "Normal"
			},
			{
				"Sr. ": 335,
				"Member Name": "BABER ALI",
				VC: "VC121133",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 80,
				Location: "Normal"
			},
			{
				"Sr. ": 336,
				"Member Name": "MUTAHAR AHMAD KHAN",
				VC: "VC12257",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 81,
				Location: "Normal"
			},
			{
				"Sr. ": 337,
				"Member Name": "ZEESHAN ALI ",
				VC: "VC12685",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 82,
				Location: "Normal"
			},
			{
				"Sr. ": 338,
				"Member Name": "MUHAMMAD SALIK TARIQ",
				VC: "VC12152",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 85,
				Location: "Normal"
			},
			{
				"Sr. ": 339,
				"Member Name": "FEHMIDA FAISAL",
				VC: "VC12641",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 86,
				Location: "Normal"
			},
			{
				"Sr. ": 340,
				"Member Name": "TAHIR RASHID",
				VC: "VC12689",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 87,
				Location: "Normal"
			},
			{
				"Sr. ": 341,
				"Member Name": "LUBNA WAHEED ",
				VC: "VC12297",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 88,
				Location: "Normal"
			},
			{
				"Sr. ": 342,
				"Member Name": "HAMID SHOAIB",
				VC: "VC121478",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 89,
				Location: "Normal"
			},
			{
				"Sr. ": 343,
				"Member Name": "ANUM KAMRAN",
				VC: "VC01246",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 90,
				Location: "Normal"
			},
			{
				"Sr. ": 344,
				"Member Name": "MUHAMMAD ADIL KHAN ",
				VC: "VC12981",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 91,
				Location: "Normal"
			},
			{
				"Sr. ": 345,
				"Member Name": "MEHBOOB UL HASSAN",
				VC: "VC121549",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 92,
				Location: "Normal"
			},
			{
				"Sr. ": 346,
				"Member Name": "SAQIB ISRAR",
				VC: "VC01216",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 93,
				Location: "Normal"
			},
			{
				"Sr. ": 347,
				"Member Name": "TOOBA HASSAN",
				VC: "VC121523",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 94,
				Location: "Normal"
			},
			{
				"Sr. ": 348,
				"Member Name": "AJMAL BUTT",
				VC: "VC12704",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 95,
				Location: "Normal"
			},
			{
				"Sr. ": 349,
				"Member Name": "SAEED AKRAM",
				VC: "VC121180",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 96,
				Location: "Normal"
			},
			{
				"Sr. ": 350,
				"Member Name": "HASSAN RIAZ",
				VC: "VC12132",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 97,
				Location: "Normal"
			},
			{
				"Sr. ": 351,
				"Member Name": "ZAFEER BASHIR",
				VC: "VC121051",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 98,
				Location: "Corner"
			},
			{
				"Sr. ": 352,
				"Member Name": "MUHAMMAD ASHRAF",
				VC: "VC12854",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 99,
				Location: "Normal"
			},
			{
				"Sr. ": 353,
				"Member Name": "QASIM ALI",
				VC: "VC12710",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 100,
				Location: "Normal"
			},
			{
				"Sr. ": 354,
				"Member Name": "MUHAMMAD ANEES ABBASI ",
				VC: "VC121437",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 101,
				Location: "Normal"
			},
			{
				"Sr. ": 355,
				"Member Name": "MUHAMMAD AKHTAR",
				VC: "VC121090",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 102,
				Location: "Normal"
			},
			{
				"Sr. ": 356,
				"Member Name": "SHAHEEN AKBAR",
				VC: "VC12651",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 103,
				Location: "Normal"
			},
			{
				"Sr. ": 357,
				"Member Name": "BILAL AHMED MIRZA",
				VC: "VC12106",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 104,
				Location: "Normal"
			},
			{
				"Sr. ": 358,
				"Member Name": "BUSHRA MAAHNOOR NAEEM",
				VC: "VC12575",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 105,
				Location: "Normal"
			},
			{
				"Sr. ": 359,
				"Member Name": "KHAWAR MAQBOOL",
				VC: "VC121141",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 106,
				Location: "Normal"
			},
			{
				"Sr. ": 360,
				"Member Name": "FAIZA ARSHID",
				VC: "VC121507",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 107,
				Location: "Normal"
			},
			{
				"Sr. ": 361,
				"Member Name": "SABRINA HUMAYUN",
				VC: "VC12411",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 108,
				Location: "Normal"
			},
			{
				"Sr. ": 362,
				"Member Name": "MUHAMMAD MAHROZ ",
				VC: "VC12186",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 109,
				Location: "Normal"
			},
			{
				"Sr. ": 363,
				"Member Name": "JAHANGEER",
				VC: "VC121225",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 110,
				Location: "Normal"
			},
			{
				"Sr. ": 364,
				"Member Name": "AAFIA BATOOL ",
				VC: "VC12867",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 111,
				Location: "Normal"
			},
			{
				"Sr. ": 365,
				"Member Name": "MUSHTAQ AHMAD",
				VC: "VC121554",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 112,
				Location: "Normal"
			},
			{
				"Sr. ": 366,
				"Member Name": "Durdana Sabahat",
				VC: "VC12511",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 113,
				Location: "FP"
			},
			{
				"Sr. ": 367,
				"Member Name": "Ahsan Ahmed",
				VC: "VC121770",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 114,
				Location: "FP"
			},
			{
				"Sr. ": 368,
				"Member Name": "Furqan Khan",
				VC: "VC121179",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 115,
				Location: "FP"
			},
			{
				"Sr. ": 369,
				"Member Name": "Salma Zafar",
				VC: "VC121185",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 116,
				Location: "FP"
			},
			{
				"Sr. ": 370,
				"Member Name": "Asma Ashiq",
				VC: "VC121197",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 117,
				Location: "FP"
			},
			{
				"Sr. ": 371,
				"Member Name": "Abeera Saad",
				VC: "VC121041",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 118,
				Location: "Corner"
			},
			{
				"Sr. ": 372,
				"Member Name": "Omer Zahid Sheikh",
				VC: "VC131593",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 119,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 373,
				"Member Name": "Shama Parveen",
				VC: "VC131609",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 120,
				Location: "FP"
			},
			{
				"Sr. ": 374,
				"Member Name": "Nasir ALI Khan",
				VC: "VC13175",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 121,
				Location: "FP"
			},
			{
				"Sr. ": 375,
				"Member Name": "Rizwana Shahbaz",
				VC: "VC13785",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 122,
				Location: "FP"
			},
			{
				"Sr. ": 376,
				"Member Name": "Tahira Kausar",
				VC: "VC13269",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 123,
				Location: "FP"
			},
			{
				"Sr. ": 377,
				"Member Name": "Syed Faraz Hassan Zaidi",
				VC: "VC13148",
				Category: "Residential",
				"Size (Marlas)": "10 Marla",
				Block: "TOUHEED",
				Plot: 124,
				Location: "FP"
			},
			{
				"Sr. ": 378,
				"Member Name": "Habib Ullah",
				VC: "VC121093",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 138,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 379,
				"Member Name": "Wasim Qaiser",
				VC: "VC121722",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 139,
				Location: "FP"
			},
			{
				"Sr. ": 380,
				"Member Name": "SABA BABAR ",
				VC: "VC121227",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 140,
				Location: "FP"
			},
			{
				"Sr. ": 381,
				"Member Name": "ASJED RAUF ",
				VC: "VC12870",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 141,
				Location: "FP"
			},
			{
				"Sr. ": 382,
				"Member Name": "AFSHAN ARSHAD ",
				VC: "VC12235",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 142,
				Location: "FP"
			},
			{
				"Sr. ": 383,
				"Member Name": "NABEELA RIAZ",
				VC: "VC121169",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 143,
				Location: "FP"
			},
			{
				"Sr. ": 384,
				"Member Name": "SYED AKHTAR HUSSAIN ZAIDI",
				VC: "VC12604",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 144,
				Location: "FP"
			},
			{
				"Sr. ": 385,
				"Member Name": "UMER FAROOQ MALIK",
				VC: "VC121139",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 145,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 386,
				"Member Name": "FATIMA RIZWAN ",
				VC: "VC12196",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 146,
				Location: "Corner"
			},
			{
				"Sr. ": 387,
				"Member Name": "TAHIR RASHID",
				VC: "VC12690",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 147,
				Location: "Normal"
			},
			{
				"Sr. ": 388,
				"Member Name": "AHMAD BILAL",
				VC: "VC01215",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 148,
				Location: "Normal"
			},
			{
				"Sr. ": 389,
				"Member Name": "TAHIR RASHID",
				VC: "VC12688",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 149,
				Location: "Normal"
			},
			{
				"Sr. ": 390,
				"Member Name": "SHABANA YASMIN",
				VC: "VC01267",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 150,
				Location: "FP"
			},
			{
				"Sr. ": 391,
				"Member Name": "Muhammad Sameer Murad",
				VC: "VC121767",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 151,
				Location: "FP"
			},
			{
				"Sr. ": 392,
				"Member Name": "Ahsan Ahmed",
				VC: "VC121771",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 152,
				Location: "FP"
			},
			{
				"Sr. ": 393,
				"Member Name": "Shoukat ALI",
				VC: "VC01243",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 153,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 394,
				"Member Name": "Ghulam Mustafa",
				VC: "VC121798",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 154,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 395,
				"Member Name": "Muhammad Zubair",
				VC: "VC121256",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 155,
				Location: "FP"
			},
			{
				"Sr. ": 396,
				"Member Name": "MUHAMMAD NAEEM NASIR",
				VC: "VC121516",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 156,
				Location: "FP"
			},
			{
				"Sr. ": 397,
				"Member Name": "MUHAMMAD NAEEM NASIR",
				VC: "VC121515",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 157,
				Location: "FP"
			},
			{
				"Sr. ": 398,
				"Member Name": "UMER ZAHID",
				VC: "VC121769",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 158,
				Location: "Normal"
			},
			{
				"Sr. ": 399,
				"Member Name": "ADREES ARIF",
				VC: "VC121546",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 161,
				Location: "Corner"
			},
			{
				"Sr. ": 400,
				"Member Name": "MUHAMMAD YOUNAS",
				VC: "VC121157",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 162,
				Location: "Normal"
			},
			{
				"Sr. ": 401,
				"Member Name": "SHAHIDA PARVEEN",
				VC: "VC12103",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 163,
				Location: "Normal"
			},
			{
				"Sr. ": 402,
				"Member Name": "NASRIN BEGUM ",
				VC: "VC12187",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 164,
				Location: "Normal"
			},
			{
				"Sr. ": 403,
				"Member Name": "SYED IFTIKHAR BUKHARI",
				VC: "VC121134",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 165,
				Location: "Normal"
			},
			{
				"Sr. ": 404,
				"Member Name": "SAIMA NOMAN",
				VC: "VC12725",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 166,
				Location: "Normal"
			},
			{
				"Sr. ": 405,
				"Member Name": "MATLOOB AKRAM ",
				VC: "VC121322",
				Category: "Residential",
				"Size (Marlas)": "5 Marla",
				Block: "TOUHEED",
				Plot: 167,
				Location: "Corner"
			},
			{
				"Sr. ": 406,
				"Member Name": "Muhammad Uzair Ahmed",
				VC: "VC111234",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 15,
				Location: "FP"
			},
			{
				"Sr. ": 407,
				"Member Name": "Muhammad Jahanzaib",
				VC: "VC111442",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 16,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 408,
				"Member Name": "Muhammad Ejaz Bashir",
				VC: "VC111794",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 107,
				Location: "Normal"
			},
			{
				"Sr. ": 409,
				"Member Name": "Mazhar Qayyum",
				VC: "VC111796",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 108,
				Location: "Normal"
			},
			{
				"Sr. ": 410,
				"Member Name": "Faiz Ullah",
				VC: "VC11836",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 117,
				Location: "Normal"
			},
			{
				"Sr. ": 411,
				"Member Name": "Faiz Ullah",
				VC: "VC11835",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 118,
				Location: "Normal"
			},
			{
				"Sr. ": 412,
				"Member Name": "Sumaira Saqib",
				VC: 111686,
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 130,
				Location: "FP"
			},
			{
				"Sr. ": 413,
				"Member Name": "Haroon Mansha",
				VC: "VC11647",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 131,
				Location: "FP"
			},
			{
				"Sr. ": 414,
				"Member Name": "Muhammad Ahmad",
				VC: "VC11646",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 132,
				Location: "Normal"
			},
			{
				"Sr. ": 415,
				"Member Name": "Kausar Parveen",
				VC: "VC01180",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 133,
				Location: "Normal"
			},
			{
				"Sr. ": 416,
				"Member Name": "Saira Chaudhry",
				VC: "VC111759",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 134,
				Location: "Normal"
			},
			{
				"Sr. ": 417,
				"Member Name": "Tazeem Asim",
				VC: "VC11418",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 135,
				Location: "Normal"
			},
			{
				"Sr. ": 418,
				"Member Name": "Nasreen Akhtar",
				VC: "VC111760",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 136,
				Location: "Normal"
			},
			{
				"Sr. ": 419,
				"Member Name": "Jamila Riaz",
				VC: "VC11826",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 137,
				Location: "Normal"
			},
			{
				"Sr. ": 420,
				"Member Name": "Syed Sajjad Hussain",
				VC: "VC11259",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 138,
				Location: "Normal"
			},
			{
				"Sr. ": 421,
				"Member Name": "Ahmed Bakhsh",
				VC: "VC111328",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 140,
				Location: "Corner"
			},
			{
				"Sr. ": 422,
				"Member Name": "Kaneezan Bibi",
				VC: "VC11889",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 141,
				Location: "Normal"
			},
			{
				"Sr. ": 423,
				"Member Name": "Waqas Majeed",
				VC: "VC111738",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 142,
				Location: "Normal"
			},
			{
				"Sr. ": 424,
				"Member Name": "Muhammad Aslam",
				VC: "VC11670",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 143,
				Location: "Normal"
			},
			{
				"Sr. ": 425,
				"Member Name": "Murtaza Masood",
				VC: "VC11719",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 144,
				Location: "Normal"
			},
			{
				"Sr. ": 426,
				"Member Name": "Hina Awais",
				VC: "VC11105",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 145,
				Location: "Normal"
			},
			{
				"Sr. ": 427,
				"Member Name": "Amjad Hussain",
				VC: "VC11812",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 146,
				Location: "Normal"
			},
			{
				"Sr. ": 428,
				"Member Name": "Muhammad Arslan",
				VC: "VC11552",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 147,
				Location: "Normal"
			},
			{
				"Sr. ": 429,
				"Member Name": "Sajid Munir",
				VC: "VC1741",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 148,
				Location: "Normal"
			},
			{
				"Sr. ": 430,
				"Member Name": "Syed Solat Abbas",
				VC: "VC111604",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 149,
				Location: "Normal"
			},
			{
				"Sr. ": 431,
				"Member Name": "Tahir Nazir",
				VC: "VC111583",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 150,
				Location: "Normal"
			},
			{
				"Sr. ": 432,
				"Member Name": "Fahmeeda Kausar",
				VC: "VC111585",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 160,
				Location: "Normal"
			},
			{
				"Sr. ": 433,
				"Member Name": "Muhammad Amin",
				VC: "VC11268",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 165,
				Location: "Corner"
			},
			{
				"Sr. ": 434,
				"Member Name": "Muhammad Nadeem Atif",
				VC: "VC11286",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 166,
				Location: "Normal"
			},
			{
				"Sr. ": 435,
				"Member Name": "Abdul Basit / Kashif Akhter",
				VC: "VC11900",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 167,
				Location: "Normal"
			},
			{
				"Sr. ": 436,
				"Member Name": "Muhammad Ishfaq",
				VC: "VC11282",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 168,
				Location: "Normal"
			},
			{
				"Sr. ": 437,
				"Member Name": "Eid Nazeer",
				VC: "VC11642",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 169,
				Location: "Normal"
			},
			{
				"Sr. ": 438,
				"Member Name": "Eid Nazeer",
				VC: "VC11912",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 170,
				Location: "Normal"
			},
			{
				"Sr. ": 439,
				"Member Name": "Umar Draz ALI",
				VC: "VC111675",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 171,
				Location: "Normal"
			},
			{
				"Sr. ": 440,
				"Member Name": "Sadia Umer",
				VC: "VC111357",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 172,
				Location: "Normal"
			},
			{
				"Sr. ": 441,
				"Member Name": "Kabsha Mahmood",
				VC: "VC111681",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 173,
				Location: "Normal"
			},
			{
				"Sr. ": 442,
				"Member Name": "Pir Muneeb Rehman",
				VC: "VC01151",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 174,
				Location: "Normal"
			},
			{
				"Sr. ": 443,
				"Member Name": "Majid Farooq",
				VC: "VC111605",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 175,
				Location: "Normal"
			},
			{
				"Sr. ": 444,
				"Member Name": "Sajjad Haider",
				VC: "VC11822",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 176,
				Location: "Normal"
			},
			{
				"Sr. ": 445,
				"Member Name": "Tariq Masih",
				VC: "VC111728",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 177,
				Location: "Normal"
			},
			{
				"Sr. ": 446,
				"Member Name": "Muhammad Moazzum Ul Ibad",
				VC: "VC11944",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 178,
				Location: "Normal"
			},
			{
				"Sr. ": 447,
				"Member Name": "Hamid ALI",
				VC: "VC111705",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 179,
				Location: "Normal"
			},
			{
				"Sr. ": 448,
				"Member Name": "Hamid ALI",
				VC: "VC111704",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 180,
				Location: "Normal"
			},
			{
				"Sr. ": 449,
				"Member Name": "Abdul Qayyum",
				VC: "VC111703",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla",
				Block: "USMAN",
				Plot: 181,
				Location: "Corner"
			},
			{
				"Sr. ": 450,
				"Member Name": "Mubeen Ahmed",
				VC: "VC11318",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 1,
				Location: "Corner"
			},
			{
				"Sr. ": 451,
				"Member Name": "Wasim Abbasi",
				VC: "VC01136",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 2,
				Location: "Normal"
			},
			{
				"Sr. ": 452,
				"Member Name": "Abdul Basit",
				VC: "VC11906",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 3,
				Location: "Normal"
			},
			{
				"Sr. ": 453,
				"Member Name": "Ambreen Akhtar",
				VC: "VC11206",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 4,
				Location: "Normal"
			},
			{
				"Sr. ": 454,
				"Member Name": "Sidra Altaf",
				VC: "VC111553",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 5,
				Location: "Normal"
			},
			{
				"Sr. ": 455,
				"Member Name": "Jamil Ahmed",
				VC: "VC111272",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 6,
				Location: "Normal"
			},
			{
				"Sr. ": 456,
				"Member Name": "Muhammad Waqar Hussain",
				VC: "VC111140",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 7,
				Location: "Normal"
			},
			{
				"Sr. ": 457,
				"Member Name": "Kaneezan Bibi",
				VC: "VC11890",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 8,
				Location: "Normal"
			},
			{
				"Sr. ": 458,
				"Member Name": "Nazia Atiq",
				VC: "VC01120",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 9,
				Location: "Normal"
			},
			{
				"Sr. ": 459,
				"Member Name": "Muhammad Saeed",
				VC: "VC111075",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 10,
				Location: "Normal"
			},
			{
				"Sr. ": 460,
				"Member Name": "IfshaAkhlaq",
				VC: "VC111615",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 11,
				Location: "Normal"
			},
			{
				"Sr. ": 461,
				"Member Name": "Mahboob Ul Hassan",
				VC: "VC111680",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 12,
				Location: "Normal"
			},
			{
				"Sr. ": 462,
				"Member Name": "Hina Tayyab",
				VC: "VC111221",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 13,
				Location: "Normal"
			},
			{
				"Sr. ": 463,
				"Member Name": "Zohaib Raza",
				VC: "VC111601",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 14,
				Location: "Normal"
			},
			{
				"Sr. ": 464,
				"Member Name": "Khalil Ahmed",
				VC: "VC11846",
				Category: "Residential ",
				"Size (Marlas)": "3 Marla ",
				Block: "ALI",
				Plot: 15,
				Location: "Corner"
			},
			{
				"Sr. ": 465,
				"Member Name": "Aurang Zaib Sajjad",
				VC: "VC121732",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 16,
				Location: "Corner"
			},
			{
				"Sr. ": 466,
				"Member Name": "Ghulam Hussain",
				VC: "VC121073",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 17,
				Location: "Normal"
			},
			{
				"Sr. ": 467,
				"Member Name": "Madiha Babar",
				VC: "VC12617",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 18,
				Location: "Normal"
			},
			{
				"Sr. ": 468,
				"Member Name": "Muhammad Afzal",
				VC: "VC121538",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 19,
				Location: "Normal"
			},
			{
				"Sr. ": 469,
				"Member Name": "Muhammad Ahmad",
				VC: "VC12594",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 20,
				Location: "Normal"
			},
			{
				"Sr. ": 470,
				"Member Name": "Syed Saqlain Shan Naqvi",
				VC: "VC12595",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 21,
				Location: "Normal"
			},
			{
				"Sr. ": 471,
				"Member Name": "Muhammad Younas",
				VC: "VC121734",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 22,
				Location: "Normal"
			},
			{
				"Sr. ": 472,
				"Member Name": "Mian Zeeshan Meraj",
				VC: "VC121231",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 23,
				Location: "Normal"
			},
			{
				"Sr. ": 473,
				"Member Name": "Rizwan Kauser",
				VC: "VC12198",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 24,
				Location: "Normal"
			},
			{
				"Sr. ": 474,
				"Member Name": "Rizwana",
				VC: "VC12816",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 25,
				Location: "Normal"
			},
			{
				"Sr. ": 475,
				"Member Name": "Muhammad Anwar Ul Haque",
				VC: "VC12382",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 26,
				Location: "Normal"
			},
			{
				"Sr. ": 476,
				"Member Name": "Muhammad Anwar Ul Haque",
				VC: "VC12381",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 27,
				Location: "Normal"
			},
			{
				"Sr. ": 477,
				"Member Name": "ALI Afzal",
				VC: "VC121718",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 28,
				Location: "Normal"
			},
			{
				"Sr. ": 478,
				"Member Name": "Muhammad Shahbaz ALI",
				VC: "VC121725",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 29,
				Location: "Normal"
			},
			{
				"Sr. ": 479,
				"Member Name": "Tahir Masood Rana",
				VC: "VC12226",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 30,
				Location: "Normal"
			},
			{
				"Sr. ": 480,
				"Member Name": "Haroon Saeed",
				VC: "VC121399",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 31,
				Location: "FP"
			},
			{
				"Sr. ": 481,
				"Member Name": "Asghar ALI",
				VC: "VC12988",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 32,
				Location: "FP"
			},
			{
				"Sr. ": 482,
				"Member Name": "Amir Masood Rana",
				VC: "VC12320",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 33,
				Location: "FP"
			},
			{
				"Sr. ": 483,
				"Member Name": "Nadia Maqbool",
				VC: "VC121552",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 34,
				Location: "FP"
			},
			{
				"Sr. ": 484,
				"Member Name": "Muhammad Aqeel Rasheed",
				VC: "VC121673",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 35,
				Location: "FP"
			},
			{
				"Sr. ": 485,
				"Member Name": "Haziq Naeem",
				VC: "VC12702",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 36,
				Location: "FP"
			},
			{
				"Sr. ": 486,
				"Member Name": "Muhammad Fiaz",
				VC: "VC121054",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 37,
				Location: "FP"
			},
			{
				"Sr. ": 487,
				"Member Name": "Zafar ALI Khan",
				VC: "VC121621",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 38,
				Location: "FP"
			},
			{
				"Sr. ": 488,
				"Member Name": "Kashif Mehboob",
				VC: "VC121387",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 39,
				Location: "FP"
			},
			{
				"Sr. ": 489,
				"Member Name": "Muhammad Uzair Ahmed",
				VC: "VC121123",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 40,
				Location: "FP"
			},
			{
				"Sr. ": 490,
				"Member Name": "Muhammad Jahanzaib",
				VC: "VC121120",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 41,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 491,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121205",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 42,
				Location: "Corner"
			},
			{
				"Sr. ": 492,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121206",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 43,
				Location: "Normal"
			},
			{
				"Sr. ": 493,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121207",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 44,
				Location: "Normal"
			},
			{
				"Sr. ": 494,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121208",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 45,
				Location: "Normal"
			},
			{
				"Sr. ": 495,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121209",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 46,
				Location: "Normal"
			},
			{
				"Sr. ": 496,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121210",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 47,
				Location: "Normal"
			},
			{
				"Sr. ": 497,
				"Member Name": "Malik Tanveer Ahmad",
				VC: "VC121211",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 48,
				Location: "Normal"
			},
			{
				"Sr. ": 498,
				"Member Name": "Muhammad Tahir Nadeem",
				VC: "VC121088",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 49,
				Location: "Normal"
			},
			{
				"Sr. ": 499,
				"Member Name": "Nida Atif",
				VC: "VC121411",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 50,
				Location: "Normal"
			},
			{
				"Sr. ": 500,
				"Member Name": "Syed Shabbir Hussain Shah",
				VC: "VC121452",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 51,
				Location: "Normal"
			},
			{
				"Sr. ": 501,
				"Member Name": "Abdul Rauf",
				VC: "VC12496",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 52,
				Location: "Normal"
			},
			{
				"Sr. ": 502,
				"Member Name": "Muhammad Sharif",
				VC: "VC01244",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 53,
				Location: "Normal"
			},
			{
				"Sr. ": 503,
				"Member Name": "Abdul Wahab",
				VC: "VC01250",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 54,
				Location: "Normal"
			},
			{
				"Sr. ": 504,
				"Member Name": "Sundas ALI Malik",
				VC: "VC121602",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 55,
				Location: "Normal"
			},
			{
				"Sr. ": 505,
				"Member Name": "Miftah Ud Din",
				VC: "VC121595",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 56,
				Location: "Normal"
			},
			{
				"Sr. ": 506,
				"Member Name": "Ahsan Ullah",
				VC: "VC121586",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 57,
				Location: "Normal"
			},
			{
				"Sr. ": 507,
				"Member Name": "Muhammad Naeem Nasir",
				VC: "VC121519",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 58,
				Location: "Normal"
			},
			{
				"Sr. ": 508,
				"Member Name": "Muhammad Naeem Nasir",
				VC: "VC121518",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 59,
				Location: "Normal"
			},
			{
				"Sr. ": 509,
				"Member Name": "Muhammad Naeem Nasir",
				VC: "VC121517",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 60,
				Location: "Normal"
			},
			{
				"Sr. ": 510,
				"Member Name": "Fozia Ashfaq",
				VC: "VC12653",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 61,
				Location: "Normal"
			},
			{
				"Sr. ": 511,
				"Member Name": "Muhammad Qasim",
				VC: "VC12675",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 62,
				Location: "Normal"
			},
			{
				"Sr. ": 512,
				"Member Name": "Iram Hamayun",
				VC: "VC1747",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 63,
				Location: "Normal"
			},
			{
				"Sr. ": 513,
				"Member Name": "Iram Hamayun",
				VC: "VC1746",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 64,
				Location: "Normal"
			},
			{
				"Sr. ": 514,
				"Member Name": "Ahsan Shahzad Khan",
				VC: "VC121633",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 65,
				Location: "Normal"
			},
			{
				"Sr. ": 515,
				"Member Name": "Muhammad Waqas",
				VC: "VC121668",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 66,
				Location: "Normal"
			},
			{
				"Sr. ": 516,
				"Member Name": "Muhammad Azam",
				VC: "VC121667",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 67,
				Location: "Normal"
			},
			{
				"Sr. ": 517,
				"Member Name": "Nisar Ahmad",
				VC: "VC12942",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 68,
				Location: "Normal"
			},
			{
				"Sr. ": 518,
				"Member Name": "Syed Khuram ALI",
				VC: "VC12536",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 69,
				Location: "Corner"
			},
			{
				"Sr. ": 519,
				"Member Name": "Sajid ALI",
				VC: "VC121220",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 70,
				Location: "Corner"
			},
			{
				"Sr. ": 520,
				"Member Name": "Muhammad Iqbal Bhatti",
				VC: "VC121527",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 71,
				Location: "Normal"
			},
			{
				"Sr. ": 521,
				"Member Name": "Muhammad Iqbal Bhatti",
				VC: "VC121528",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 72,
				Location: "Normal"
			},
			{
				"Sr. ": 522,
				"Member Name": "Muhammad Rameez",
				VC: "VC01275",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 73,
				Location: "Normal"
			},
			{
				"Sr. ": 523,
				"Member Name": "Muhammad Yaser",
				VC: "VC121484",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 74,
				Location: "Normal"
			},
			{
				"Sr. ": 524,
				"Member Name": "Shahzad ALI",
				VC: "VC1757",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 75,
				Location: "Normal"
			},
			{
				"Sr. ": 525,
				"Member Name": "Saqib ALI",
				VC: "VC121776",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 76,
				Location: "Normal"
			},
			{
				"Sr. ": 526,
				"Member Name": "Muhammad Waqar",
				VC: "VC12759",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 77,
				Location: "Normal"
			},
			{
				"Sr. ": 527,
				"Member Name": "Farah Iqbal",
				VC: "VC121321",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 78,
				Location: "Normal"
			},
			{
				"Sr. ": 528,
				"Member Name": "Ayesha Irfan",
				VC: "VC12287",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 79,
				Location: "Normal"
			},
			{
				"Sr. ": 529,
				"Member Name": "Haseeb ALI",
				VC: "VC12260",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 80,
				Location: "Normal"
			},
			{
				"Sr. ": 530,
				"Member Name": "Moeed Ejaz Ghauree",
				VC: "VC12293",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 81,
				Location: "Normal"
			},
			{
				"Sr. ": 531,
				"Member Name": "Ahmed Zubair",
				VC: "VC121608",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 82,
				Location: "Normal"
			},
			{
				"Sr. ": 532,
				"Member Name": "Zishan Javed",
				VC: "VC12718",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 83,
				Location: "Normal"
			},
			{
				"Sr. ": 533,
				"Member Name": "Muhammad Saad Cheema",
				VC: "VC121580",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 84,
				Location: "Normal"
			},
			{
				"Sr. ": 534,
				"Member Name": "Zakariya Irshad",
				VC: "VC121027",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 85,
				Location: "Normal"
			},
			{
				"Sr. ": 535,
				"Member Name": "Ahsan Iqbal Bela",
				VC: "VC121147",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 86,
				Location: "Normal"
			},
			{
				"Sr. ": 536,
				"Member Name": "Shahid Ijaz",
				VC: "VC121436",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 87,
				Location: "Normal"
			},
			{
				"Sr. ": 537,
				"Member Name": "Muhammad Younas",
				VC: "VC121459",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 88,
				Location: "Normal"
			},
			{
				"Sr. ": 538,
				"Member Name": "Muneeb Awais Sheikh",
				VC: "VC12180",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 89,
				Location: "Normal"
			},
			{
				"Sr. ": 539,
				"Member Name": "Muhammad Ejaz Bashir / Mazhar Qayyum",
				VC: "VC121793",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 90,
				Location: "Normal"
			},
			{
				"Sr. ": 540,
				"Member Name": "Nasir Siddique",
				VC: "121530",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 91,
				Location: "Normal"
			},
			{
				"Sr. ": 541,
				"Member Name": "Zahid Nafeer",
				VC: "121050",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 92,
				Location: "Normal"
			},
			{
				"Sr. ": 542,
				"Member Name": "Syeda Gulshan Mubashir",
				VC: "VC1753",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 93,
				Location: "Corner"
			},
			{
				"Sr. ": 543,
				"Member Name": "Faisal Mehmood",
				VC: "VC12367",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 94,
				Location: "Corner"
			},
			{
				"Sr. ": 544,
				"Member Name": "Naqash Ahmad",
				VC: "VC12869",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 95,
				Location: "Normal"
			},
			{
				"Sr. ": 545,
				"Member Name": "Junaid ALI Suleri",
				VC: "VC121403",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 96,
				Location: "Normal"
			},
			{
				"Sr. ": 546,
				"Member Name": "Arif Mukhtar Rana",
				VC: "VC12305",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 97,
				Location: "Normal"
			},
			{
				"Sr. ": 547,
				"Member Name": "Farzana Munir Khan",
				VC: "VC121189",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 98,
				Location: "Normal"
			},
			{
				"Sr. ": 548,
				"Member Name": "Uzair Shafqat",
				VC: "VC12452",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 99,
				Location: "Normal"
			},
			{
				"Sr. ": 549,
				"Member Name": "Uzair Shafqat",
				VC: "VC12453",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 100,
				Location: "Normal"
			},
			{
				"Sr. ": 550,
				"Member Name": "Ayesha Saqib",
				VC: "VC121652",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 101,
				Location: "Normal"
			},
			{
				"Sr. ": 551,
				"Member Name": "Muhammad Raza Iqbal",
				VC: "VC12943",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 102,
				Location: "Normal"
			},
			{
				"Sr. ": 552,
				"Member Name": "Hafiz Rana Raheel Shafqat",
				VC: "VC00123",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 103,
				Location: "Normal"
			},
			{
				"Sr. ": 553,
				"Member Name": "Hafiz Muhammad Zain Zahid Butt",
				VC: "VC121627",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 104,
				Location: "Normal"
			},
			{
				"Sr. ": 554,
				"Member Name": "Umer Hassam",
				VC: "VC121400",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 105,
				Location: "Normal"
			},
			{
				"Sr. ": 555,
				"Member Name": "Adeela Kashif",
				VC: "VC121378",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 106,
				Location: "Normal"
			},
			{
				"Sr. ": 556,
				"Member Name": "Azher Tahir",
				VC: "VC121379",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 107,
				Location: "Normal"
			},
			{
				"Sr. ": 557,
				"Member Name": "Muhammad Jahangir Khan",
				VC: "VC12100",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 108,
				Location: "Normal"
			},
			{
				"Sr. ": 558,
				"Member Name": "Syed Mowahid Hussain",
				VC: "VC12104",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 109,
				Location: "Normal"
			},
			{
				"Sr. ": 559,
				"Member Name": "Sharafat ALI",
				VC: "VC121735",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 110,
				Location: "Normal"
			},
			{
				"Sr. ": 560,
				"Member Name": "Sheikh Muhammad Iqbal",
				VC: "VC12936",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 111,
				Location: "Normal"
			},
			{
				"Sr. ": 561,
				"Member Name": "Syeda Hina Fayyaz",
				VC: "VC121454",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 112,
				Location: "Normal"
			},
			{
				"Sr. ": 562,
				"Member Name": "Muhammad Zubair",
				VC: "VC121623",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 113,
				Location: "Normal"
			},
			{
				"Sr. ": 563,
				"Member Name": "Zeeshan Javed",
				VC: "VC12747",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 114,
				Location: "Normal"
			},
			{
				"Sr. ": 564,
				"Member Name": "Faiz Ullah",
				VC: "VC121431",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 115,
				Location: "Normal"
			},
			{
				"Sr. ": 565,
				"Member Name": "Syed Imran ALI",
				VC: "VC12551",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 116,
				Location: "Normal"
			},
			{
				"Sr. ": 566,
				"Member Name": "Syed Hussain ALI Rehmat",
				VC: "VC12535",
				Category: "Residential ",
				"Size (Marlas)": "5 Marla ",
				Block: "ALI",
				Plot: 117,
				Location: "Corner"
			},
			{
				"Sr. ": 567,
				"Member Name": "FAISAL SAMROZ HASHMI",
				VC: "VC271533",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 47,
				Location: "Normal"
			},
			{
				"Sr. ": 568,
				"Member Name": "MUHAMMAD ASIF SHARIF",
				VC: "VC271424",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 48,
				Location: "Normal"
			},
			{
				"Sr. ": 569,
				"Member Name": "MUHAMMAD AHSAAN",
				VC: "VC271269",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 49,
				Location: "Normal"
			},
			{
				"Sr. ": 570,
				"Member Name": "SHAIKH MUHAMMAD ZAHID",
				VC: "VC271525",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 50,
				Location: "Normal"
			},
			{
				"Sr. ": 571,
				"Member Name": "MUHAMMAD IMRAN SOHAIL",
				VC: "VC271344",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 51,
				Location: "Normal"
			},
			{
				"Sr. ": 572,
				"Member Name": "MUHAMMAD ALTAF",
				VC: "VC271406",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 52,
				Location: "Normal"
			},
			{
				"Sr. ": 573,
				"Member Name": "SABIR ALI",
				VC: "VC271186",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 53,
				Location: "Normal"
			},
			{
				"Sr. ": 574,
				"Member Name": "SAQIB ISRAR",
				VC: "VC271014",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 54,
				Location: "Normal"
			},
			{
				"Sr. ": 575,
				"Member Name": "TAHIRA ARSHAD",
				VC: "VC271060",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 55,
				Location: "Normal"
			},
			{
				"Sr. ": 576,
				"Member Name": "ABDUL REHMAN",
				VC: "VC271479",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 56,
				Location: "Normal"
			},
			{
				"Sr. ": 577,
				"Member Name": "MUHAMMAD JAHANZAIB",
				VC: "VC271091",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 57,
				Location: "Normal"
			},
			{
				"Sr. ": 578,
				"Member Name": "MUHAMMAD FAROOQ",
				VC: "VC271293",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: 58,
				Location: "Normal"
			},
			{
				"Sr. ": 579,
				"Member Name": "Muhammad Ejaz Bashir",
				VC: "VC271792",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "73/1",
				Location: "Normal"
			},
			{
				"Sr. ": 580,
				"Member Name": "Mazhar Qayyum",
				VC: "VC271795",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "73/2",
				Location: "Normal"
			},
			{
				"Sr. ": 581,
				"Member Name": "Khurram Waheed",
				VC: "VC271712",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "87/1",
				Location: "Normal"
			},
			{
				"Sr. ": 582,
				"Member Name": "Jamila Akhtar",
				VC: "VC271649",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "88/2",
				Location: "Normal"
			},
			{
				"Sr. ": 583,
				"Member Name": "Naeem Butt",
				VC: "VC271144",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "89/1",
				Location: "Normal"
			},
			{
				"Sr. ": 584,
				"Member Name": "Mubasher Hussain",
				VC: "VC271699",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "89/2",
				Location: "Normal"
			},
			{
				"Sr. ": 585,
				"Member Name": "Mubasher Hussain",
				VC: "VC271698",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "90/1",
				Location: "Normal"
			},
			{
				"Sr. ": 586,
				"Member Name": "Mubasher Hussain",
				VC: "VC271697",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "90/2",
				Location: "Normal"
			},
			{
				"Sr. ": 587,
				"Member Name": "Mubasher Hussain",
				VC: "VC271696",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "90/3",
				Location: "Normal"
			},
			{
				"Sr. ": 588,
				"Member Name": "Mubasher Hussain",
				VC: "VC271695",
				Category: "Commercial",
				"Size (Marlas)": "2 Marla",
				Block: "CCA",
				Plot: "90/4",
				Location: "Corner"
			},
			{
				"Sr. ": 589,
				"Member Name": "Syeda Rizwana Jafri",
				VC: "VC221637",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 91,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 590,
				"Member Name": "Khurram Zahid",
				VC: "VC22155",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 96,
				Location: "Normal"
			},
			{
				"Sr. ": 591,
				"Member Name": "Muhammad Nadeem",
				VC: "VC221779",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 100,
				Location: "Normal"
			},
			{
				"Sr. ": 592,
				"Member Name": "Rang Zaib",
				VC: "VC221780",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 101,
				Location: "Normal"
			},
			{
				"Sr. ": 593,
				"Member Name": "Arshman Asif",
				VC: "VC22538",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 103,
				Location: "Corner"
			},
			{
				"Sr. ": 594,
				"Member Name": "Muhammad Imran Saeed",
				VC: "VC22803",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 104,
				Location: "Normal"
			},
			{
				"Sr. ": 595,
				"Member Name": "Shaheen Shahid",
				VC: "VC221040",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 105,
				Location: "FP"
			},
			{
				"Sr. ": 596,
				"Member Name": "MUHAMMAD AMJAD KHAN",
				VC: "VC22777",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 106,
				Location: "FP"
			},
			{
				"Sr. ": 597,
				"Member Name": "AHMAD HASSAN",
				VC: "VC221446",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 107,
				Location: "FP"
			},
			{
				"Sr. ": 598,
				"Member Name": "ASHFAQ MAHMOOD",
				VC: "VC22758",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 108,
				Location: "FP"
			},
			{
				"Sr. ": 599,
				"Member Name": "KASHIF NOOR",
				VC: "VC22699",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 109,
				Location: "FP"
			},
			{
				"Sr. ": 600,
				"Member Name": "SAMINA KOUSAR",
				VC: "VC221500",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 110,
				Location: "FP"
			},
			{
				"Sr. ": 601,
				"Member Name": "MUHAMMAD ASIF",
				VC: "VC221445",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 111,
				Location: "FP"
			},
			{
				"Sr. ": 602,
				"Member Name": "AMIR SHAHZAD",
				VC: "VC00226",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 112,
				Location: "FP"
			},
			{
				"Sr. ": 603,
				"Member Name": "ABDUL SHAKOOR BHUTTA",
				VC: "VC22751",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 113,
				Location: "FP"
			},
			{
				"Sr. ": 604,
				"Member Name": "MAZHAR RAHIM ",
				VC: "VC221062",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 114,
				Location: "FP"
			},
			{
				"Sr. ": 605,
				"Member Name": "AADIL MANZOOR",
				VC: "VC221502",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 115,
				Location: "FP"
			},
			{
				"Sr. ": 606,
				"Member Name": "ZULFIQAR ALI",
				VC: "VC221163",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 116,
				Location: "FP"
			},
			{
				"Sr. ": 607,
				"Member Name": "Mian Amjad Iqbal",
				VC: "VC221663",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 117,
				Location: "FP"
			},
			{
				"Sr. ": 608,
				"Member Name": "Muhammad Yasin",
				VC: "VC02256",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 118,
				Location: "FP"
			},
			{
				"Sr. ": 609,
				"Member Name": "Chaudary Shahzad Anwar",
				VC: "VC221655",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 119,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 610,
				"Member Name": "Rizwan Akbar Bajwa",
				VC: 22749,
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 121,
				Location: "Normal"
			},
			{
				"Sr. ": 611,
				"Member Name": "Tahir Masood Rana",
				VC: "22225",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 122,
				Location: "Normal"
			},
			{
				"Sr. ": 612,
				"Member Name": "ALI Farrukh Islam",
				VC: "VC221736",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 123,
				Location: "Normal"
			},
			{
				"Sr. ": 613,
				"Member Name": "Saad Farooq",
				VC: "VC221192",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 124,
				Location: "Normal"
			},
			{
				"Sr. ": 614,
				"Member Name": "Mohammad Sharif",
				VC: "VC221778",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 145,
				Location: "Corner + FP"
			},
			{
				"Sr. ": 615,
				"Member Name": "BUSHRA SHAHBAZ",
				VC: "VC221316",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 161,
				Location: "Normal"
			},
			{
				"Sr. ": 616,
				"Member Name": "MAHMOOD AHMAD ",
				VC: "VC22956",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 162,
				Location: "FP"
			},
			{
				"Sr. ": 617,
				"Member Name": "AASIA SALEEM BAIG",
				VC: "VC22350",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 163,
				Location: "FP"
			},
			{
				"Sr. ": 618,
				"Member Name": "SAHJEED HUSSAIN",
				VC: "VC22903",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 164,
				Location: "FP"
			},
			{
				"Sr. ": 619,
				"Member Name": "SAMINA KOUSAR",
				VC: "VC221499",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 165,
				Location: "FP"
			},
			{
				"Sr. ": 620,
				"Member Name": "MUHAMMAD YASIN",
				VC: "VC02255",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 166,
				Location: "FP"
			},
			{
				"Sr. ": 621,
				"Member Name": "SAMINA KOUSAR",
				VC: "VC221498",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 167,
				Location: "FP"
			},
			{
				"Sr. ": 622,
				"Member Name": "MOBEEN FAISAL ",
				VC: "VC22986",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 168,
				Location: "FP"
			},
			{
				"Sr. ": 623,
				"Member Name": "ADNAN SIDDIQ",
				VC: "VC221434",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 169,
				Location: "FP"
			},
			{
				"Sr. ": 624,
				"Member Name": "SAMINA KOUSAR",
				VC: "VC221497",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 170,
				Location: "FP"
			},
			{
				"Sr. ": 625,
				"Member Name": "AHMED HASSAN KHAN",
				VC: "VC221376",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 171,
				Location: "FP"
			},
			{
				"Sr. ": 626,
				"Member Name": "ZEESHAN JAVED",
				VC: "VC22746",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 172,
				Location: "FP"
			},
			{
				"Sr. ": 627,
				"Member Name": "Muhammad Abu Baker",
				VC: "VC22562",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 185,
				Location: "FP"
			},
			{
				"Sr. ": 628,
				"Member Name": "M. Jahanzaib",
				VC: "VC221092",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 93,
				Location: "FP"
			},
			{
				"Sr. ": 629,
				"Member Name": "M. Uzair Ahmed",
				VC: "VC221089",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 94,
				Location: "Normal"
			},
			{
				"Sr. ": 630,
				"Member Name": "Ahmad Ishaq",
				VC: "VC221764",
				Category: "Commercial",
				"Size (Marlas)": "5 Marla",
				Block: "CCA",
				Plot: 95,
				Location: "Normal"
			}
		];

		let arr = [];
		try {
			const result = data.map(async (item) => {
				const location = item["Location"];
				const VC_NO = item["VC"];
				console.log(VC_NO);
				console.log(location);
				// res.status(200).json({ status: 200,Message:"Updated Status SuccessFullyyyyyyy" , data: {VC_NO, location} });
				const myLocation = await MYLocation.findOne({
					where: { Plot_Location: location }
				});
				const booking = await Booking.update(
					{ Location_ID: myLocation.Location_ID },
					{ where: { Reg_Code_Disply: VC_NO } }
				);
				//   const block = await Block.findOne({where: {Name: item.Block}})
				//  const unit =  await Unit.update({
				//   BLK_ID:  block.BLK_ID,
				// }, {where: {BK_ID: booking.BK_ID }})
				// await Booking.update({Unit_ID: unit.ID}, {where: {BK_ID: booking.BK_ID}})
				arr.push({
					location: myLocation,
					location: location,
					VC_NO: VC_NO
				});
			});

			//  const result =  await BookingService.generatePlotSizeData(data);
			// console.log("IIIIIIIIIIIIIIIIIIIIIII", result);
			res.status(200).json({
				status: 200,
				Message: "Updated Status SuccessFull",
				data: arr
			});
		} catch (error) {
			// console.log("OOOOOOOOOOOOOOOOO", error);
			return next(error);
		}
	};
	static updateBookingInstallmentStatus = async (req, res, next) => {
		try {
			const exist = await BookingInstallmentDetails.findAll({ where: { InsType_ID: 1 } });
			if (exist.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			const result = await BookingInstallmentDetails.update({ Status: true }, { where: { InsType_ID: 1 } });

			res.status(200).json({
				status: 200,
				message: "BookingInstallmentDetails update successfully",
				"Updated BookingInstallmentDetails": result
			});
		} catch (error) {
			console.log("error: ", error);
			return next(error);
		}
	};
	static bookingScriptRun = async (req, res, next) => {
		try {
			const { allMonths, tenMonths, error } = await BookingService.checkConsecutiveTenMonthUnpaidInstallments();
			// return res.status(200).json({error, allMonths})
			// const distinctBK_IDs = await Booking.findAll({
			//   include: [
			//     { as: "Member", model: Member },
			//     { as: "MemNominee", model: MemNominee },
			//     { as: "UnitType", model: UnitType },
			//     { as: "PlotSize", model: PlotSize },
			//     { as: "PaymentPlan", model: PaymentPlan },
			//     { as: "UnitNature", model: UnitNature },
			//     { as: "Sector", model: Sector },
			//     { as: "Phase", model: Phase },
			//     { as: "User", model: User },
			//   ],

			//   // attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("BK_ID")), "BK_ID"]],
			// });
			if (!allMonths) {
				return res.status(500).json({ error });
			}

			const allMonthsData = allMonths.reduce((acc, obj) => {
				const key = `${obj.PlotSize.Name}_${obj.UnitType.Name}`;

				// If the key doesn't exist in the accumulator, create an array for it
				if (!acc[key]) {
					acc[key] = [];
					// { items: [], count: 0 };
				}

				// Push the current object to the 'items' array for the given key
				acc[key].push(obj);

				// Increment the count for the given key
				// acc[key].count++;

				return acc;
			}, {});
			// return res.status(200).json({
			//   sizeWise

			//   })
			const tenMonthsData = tenMonths.reduce((acc, obj) => {
				const key = `${obj.PlotSize.Name}_${obj.UnitType.Name}`;

				// If the key doesn't exist in the accumulator, create an array for it
				if (!acc[key]) {
					acc[key] = { items: [], count: 0 };
				}

				// Push the current object to the 'items' array for the given key
				acc[key].items.push(obj);

				// Increment the count for the given key
				acc[key].count++;

				return acc;
			}, {});

			res.status(200).json({
				allMonthsData,
				tenMonthsData
			});
		} catch (error) {
			console.error("Error in downloadCsvController:", error);
			res.status(500).json({ error: error });
		}
	};
}

// export default BookingController;
module.exports = BookingController;
