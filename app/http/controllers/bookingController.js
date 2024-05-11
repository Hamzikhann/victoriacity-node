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
	MYLocation
} = require("../../models/index.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const pdfGenerator = require("../../services/PdfGenerator.js");
const UserRole = require("../../models/UserRole");
const User = require("../../models/User");
const Settings = require("../../models/Settings.js");
const AccountTransaction = require("../../models/AccountTransaction.js");
const { Op, Sequelize } = require("sequelize");
const BookingService = require("../../services/BookingService.js");

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
			console.log("RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", responce);
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
				if (amount > totalRemaining && BKI_DETAIL_IDS.length == 1) {
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
					console.log("BookingInstallmentDetailNextO", BookingInstallmentDetailNextO);

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

						console.log("BookingInstallmentDetailNextO -- DONE ", "DONE");
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
				console.log("myDate myDate myDate myDate", myDate);
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
						status = false;
					} else if (i == No_Of_Installments + 3 + ByAnnual_TimePeriod) {
						type = "Ballot";
						amount = Ballot_Amt;
						instType = 3;
						status = false;
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
					console.log("Dueeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee DATEEEEEEEEEEE", dueDate);
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

					if (ppObj && ppObj.DC_START_DATE && ppObj.IncludeDC == 1) {
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
		console.log("hello");

		const BookingId = req.query.id;
		try {
			const exist = await Booking.findOne({ where: { BK_ID: BookingId } });
			console.log(exist, "assssssssssssssssssssssssss");
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
			console.log("error: ", error);
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

		if (typeof vcNo != "undefined" && vcNo != null) {
			id = (await Booking.findOne({ where: { Reg_Code_Disply: vcNo } })).BK_ID;
		}

		try {
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
			console.log(booking);

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
			console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQ", TRSR_ID, userId);
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
				Sr: 1,
				Block: "Touheed",
				Category: "Residential",
				Size: "5 Marla",
				Plot: 156,
				ClientName: "Muhammad Naeem Nasir",
				Registration: "VC121516"
			},
			{
				Sr: 2,
				Block: "Umer",
				Category: "Residential",
				Size: "3 Marla",
				Plot: 12,
				ClientName: "Muhammad Javed",
				Registration: "VC111314"
			},
			{
				Sr: 3,
				Block: "Ali",
				Category: "Residential",
				Size: "5 Marla",
				Plot: 51,
				ClientName: "Syed Shabbir Hussain Shah",
				Registration: "VC121452"
			},
			{
				Sr: 4,
				Block: "CCA",
				Category: "Commercial",
				Size: "5 Marla",
				Plot: 185,
				ClientName: "Muhammad Abu Bakar",
				Registration: "VC22562"
			},
			{
				Sr: 5,
				Block: "Ali",
				Category: "Residential",
				Size: "5 Marla",
				Plot: 52,
				ClientName: "Abdul Rauf",
				Registration: "VC12496"
			}
		];

		try {
			data.map(async (item, i) => {
				// console.log('PPPPPPPPPPPPPp',item)

				const file = await Booking.findOne({
					where: { Reg_Code_Disply: item.Registration },
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

				const userobj = await User.findOne({ where: { id: req.user.id } });
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
			console.log("IIIIIIIIIIIIIIIIIIIIIIIII", result);
			res.status(200).json({
				status: 200,
				Message: "Updated Status SuccessFull",
				data: result
			});
		} catch (error) {
			console.log("OOOOOOOOOOOOOOOOO", error);
			return next(error);
		}
	};

	static plotNumberAllot = async (req, res, next) => {
		const data = [
			{
				"Sr. #": 1,
				Block: "Touheed",
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 152,
				"Client Name": "Ahsan Ahmed",
				"VC No": "VC121771"
			},
			{
				"Sr. #": 2,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 31,
				Block: "Umer",
				"Client Name": "MASOOD AKHTAR",
				"VC No": "VC111503"
			},
			{
				"Sr. #": 3,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 32,
				Block: "Umer",
				"Client Name": "ASIM BASHIR ",
				"VC No": "VC11137"
			},
			{
				"Sr. #": 4,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 33,
				Block: "Umer",
				"Client Name": "M. RASHID MAHMOOD ",
				"VC No": "VC11940"
			},
			{
				"Sr. #": 5,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 34,
				Block: "Umer",
				"Client Name": "MAHMOOD FATEH AHSAN",
				"VC No": "VC11102"
			},
			{
				"Sr. #": 6,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 35,
				Block: "Umer",
				"Client Name": "QASIM ALI",
				"VC No": "VC11709"
			},
			{
				"Sr. #": 7,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 36,
				Block: "Umer",
				"Client Name": "SANIA CHUDHARY",
				"VC No": "VC11878"
			},
			{
				"Sr. #": 8,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 37,
				Block: "Umer",
				"Client Name": "AZEEM UL REHMAN",
				"VC No": "VC111244"
			},
			{
				"Sr. #": 9,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 38,
				Block: "Umer",
				"Client Name": "SOHAIL LATIF",
				"VC No": "VC111401"
			},
			{
				"Sr. #": 10,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 39,
				Block: "Umer",
				"Client Name": "M. OMAR QURESHI",
				"VC No": "VC11365"
			},
			{
				"Sr. #": 11,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 40,
				Block: "Umer",
				"Client Name": "ANIQA MAHOOR",
				"VC No": "VC111213"
			},
			{
				"Sr. #": 12,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 41,
				Block: "Umer",
				"Client Name": "MIAN TANVEER BASHIR ",
				"VC No": "VC11266"
			},
			{
				"Sr. #": 13,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 42,
				Block: "Umer",
				"Client Name": "SADAF ZEESHAN",
				"VC No": "VC11668"
			},
			{
				"Sr. #": 14,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 43,
				Block: "Umer",
				"Client Name": "MUHAMMAD ASLAM ZAHID",
				"VC No": "VC111520"
			},
			{
				"Sr. #": 15,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 44,
				Block: "Umer",
				"Client Name": "AROOBA AZHAR ",
				"VC No": "VC11307"
			},
			{
				"Sr. #": 16,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 45,
				Block: "Umer",
				"Client Name": "SAFIA AFZAL",
				"VC No": "VC111330"
			},
			{
				"Sr. #": 17,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 46,
				Block: "Umer",
				"Client Name": "AWAIS TAUFIQ",
				"VC No": "VC111137"
			},
			{
				"Sr. #": 18,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 47,
				Block: "Umer",
				"Client Name": "MEHBOOB ELAHIE",
				"VC No": "VC111512"
			},
			{
				"Sr. #": 19,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 48,
				Block: "Umer",
				"Client Name": "FATIMA SABIR ",
				"VC No": "VC11780"
			},
			{
				"Sr. #": 20,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 49,
				Block: "Umer",
				"Client Name": "BILalMEHMOOD ",
				"VC No": "VC111325"
			},
			{
				"Sr. #": 21,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 50,
				Block: "Umer",
				"Client Name": "SHAHZAD AHMAD CH.",
				"VC No": "VC11679"
			},
			{
				"Sr. #": 22,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 51,
				Block: "Umer",
				"Client Name": "MEHREEN AHMED ",
				"VC No": "VC11195"
			},
			{
				"Sr. #": 23,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 52,
				Block: "Umer",
				"Client Name": "MIZLA IFTIKHAR",
				"VC No": "VC111463"
			},
			{
				"Sr. #": 24,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 53,
				Block: "Umer",
				"Client Name": "MOHSIN MUKHTAR",
				"VC No": "VC111363"
			},
			{
				"Sr. #": 25,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 54,
				Block: "Umer",
				"Client Name": "MUHAMMAD SAAD TARIQ",
				"VC No": "VC11151"
			},
			{
				"Sr. #": 26,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 55,
				Block: "Umer",
				"Client Name": "SYEDA FARIDA BANO ",
				"VC No": "VC11874"
			},
			{
				"Sr. #": 27,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 56,
				Block: "Umer",
				"Client Name": "SYEDA FARIDA BANO ",
				"VC No": "VC11875"
			},
			{
				"Sr. #": 28,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 57,
				Block: "Umer",
				"Client Name": "AFSHAN ARSHAD ",
				"VC No": "VC11234"
			},
			{
				"Sr. #": 29,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 58,
				Block: "Umer",
				"Client Name": "BEENISH QASIM ",
				"VC No": "VC11674"
			},
			{
				"Sr. #": 30,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 59,
				Block: "Umer",
				"Client Name": "MUHAMMAD AWAIS ZIA",
				"VC No": "VC111202"
			},
			{
				"Sr. #": 31,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 60,
				Block: "Umer",
				"Client Name": "MUHAMMAD IMRAN ",
				"VC No": "VC11681"
			},
			{
				"Sr. #": 32,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 61,
				Block: "Umer",
				"Client Name": "FAISalEJAZ",
				"VC No": "VC111081"
			},
			{
				"Sr. #": 33,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 62,
				Block: "Umer",
				"Client Name": "HAFIZ M. NAUMAN QURESHI",
				"VC No": "VC11737"
			},
			{
				"Sr. #": 34,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 63,
				Block: "Umer",
				"Client Name": "MUHAMMAD SHAFAQAT SAEED",
				"VC No": "VC111492"
			},
			{
				"Sr. #": 35,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 64,
				Block: "Umer",
				"Client Name": "NASIR ALI",
				"VC No": "VC11261"
			},
			{
				"Sr. #": 36,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 65,
				Block: "Umer",
				"Client Name": "ADNAN MANZOOR",
				"VC No": "VC111226"
			},
			{
				"Sr. #": 37,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 66,
				Block: "Umer",
				"Client Name": "MUHAMMAD ALI",
				"VC No": "VC111361"
			},
			{
				"Sr. #": 38,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 67,
				Block: "Umer",
				"Client Name": "MUHAMMAD ABU-BAKAR",
				"VC No": "VC111374"
			},
			{
				"Sr. #": 39,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 68,
				Block: "Umer",
				"Client Name": "MUHAMMAD YAQOOB",
				"VC No": "VC111175"
			},
			{
				"Sr. #": 40,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 69,
				Block: "Umer",
				"Client Name": "SOBIA MUHAMMAD IMRAN ",
				"VC No": "VC11840"
			},
			{
				"Sr. #": 41,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 70,
				Block: "Umer",
				"Client Name": "MIAN TANVEER BASHIR ",
				"VC No": "VC11265"
			},
			{
				"Sr. #": 42,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 71,
				Block: "Umer",
				"Client Name": "MASOOD AKHTAR",
				"VC No": "VC111504"
			},
			{
				"Sr. #": 43,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 72,
				Block: "Umer",
				"Client Name": "HABIB-UR-REHMAN",
				"VC No": "VC11275"
			},
			{
				"Sr. #": 44,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 74,
				Block: "Umer",
				"Client Name": "MUHAMMAD AHMAD ZAIB",
				"VC No": "VC11374"
			},
			{
				"Sr. #": 45,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 75,
				Block: "Umer",
				"Client Name": "SANAULLAH",
				"VC No": "VC111132"
			},
			{
				"Sr. #": 46,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 76,
				Block: "Umer",
				"Client Name": "MUKHTAR AHMAD",
				"VC No": "VC111417"
			},
			{
				"Sr. #": 47,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 77,
				Block: "Umer",
				"Client Name": "SANA HABIB",
				"VC No": "VC11443"
			},
			{
				"Sr. #": 48,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 78,
				Block: "Umer",
				"Client Name": "FIDA HUSSAIN ",
				"VC No": "VC111200"
			},
			{
				"Sr. #": 49,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 79,
				Block: "Umer",
				"Client Name": "AZRA ZIA",
				"VC No": "VC11433"
			},
			{
				"Sr. #": 50,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 80,
				Block: "Umer",
				"Client Name": "FARHAN RASHID",
				"VC No": "VC01170"
			},
			{
				"Sr. #": 51,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 81,
				Block: "Umer",
				"Client Name": "IMRAN NAEEM",
				"VC No": "VC11358"
			},
			{
				"Sr. #": 52,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 82,
				Block: "Umer",
				"Client Name": "TOQEER AHMAD ",
				"VC No": "VC11274"
			},
			{
				"Sr. #": 53,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 83,
				Block: "Umer",
				"Client Name": "WASIM ABBASI",
				"VC No": "VC01135"
			},
			{
				"Sr. #": 54,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 84,
				Block: "Umer",
				"Client Name": "M. WASEEM ANWAR ",
				"VC No": "VC11330"
			},
			{
				"Sr. #": 55,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 85,
				Block: "Umer",
				"Client Name": "SYED HASHIM ALI SHAH",
				"VC No": "VC111072"
			},
			{
				"Sr. #": 56,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 86,
				Block: "Umer",
				"Client Name": "MOHAMMAD EJAZ",
				"VC No": "VC11698"
			},
			{
				"Sr. #": 57,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 87,
				Block: "Umer",
				"Client Name": "ISHFAQ AHMAD",
				"VC No": "VC11752"
			},
			{
				"Sr. #": 58,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 88,
				Block: "Umer",
				"Client Name": "SHAHZAD AHMAD CH. ",
				"VC No": "VC11678"
			},
			{
				"Sr. #": 59,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 89,
				Block: "Umer",
				"Client Name": "ROBINA SHAHEEN ",
				"VC No": "VC11667"
			},
			{
				"Sr. #": 60,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 90,
				Block: "Umer",
				"Client Name": "RUBINA MAHBOOB",
				"VC No": "VC11635"
			},
			{
				"Sr. #": 61,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 91,
				Block: "Umer",
				"Client Name": "ABDUL QAYYUM",
				"VC No": "VC111372"
			},
			{
				"Sr. #": 62,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 92,
				Block: "Umer",
				"Client Name": "SYED NAZIR HASAN",
				"VC No": "VC11449"
			},
			{
				"Sr. #": 63,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 93,
				Block: "Umer",
				"Client Name": "SEYYAD ZISHAN ALI ",
				"VC No": "VC11209"
			},
			{
				"Sr. #": 64,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 94,
				Block: "Umer",
				"Client Name": "TAHIRA IMRAN",
				"VC No": "VC11355"
			},
			{
				"Sr. #": 65,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 95,
				Block: "Umer",
				"Client Name": "KHURRAM SHAHZAD",
				"VC No": "VC111086"
			},
			{
				"Sr. #": 66,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 96,
				Block: "Umer",
				"Client Name": "MUHAMMAD SHAFI",
				"VC No": "VC11404"
			},
			{
				"Sr. #": 67,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 97,
				Block: "Umer",
				"Client Name": "MUHAMMAD ALTAF",
				"VC No": "VC111405"
			},
			{
				"Sr. #": 68,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 98,
				Block: "Umer",
				"Client Name": "ATTA ULLAH",
				"VC No": "VC11386"
			},
			{
				"Sr. #": 69,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 99,
				Block: "Umer",
				"Client Name": "SAJID ALI",
				"VC No": "VC11391"
			},
			{
				"Sr. #": 70,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 100,
				Block: "Umer",
				"Client Name": "ARHAM IMRAN",
				"VC No": "VC11357"
			},
			{
				"Sr. #": 71,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 101,
				Block: "Umer",
				"Client Name": "MUBASHIR REHMAN",
				"VC No": "VC11713"
			},
			{
				"Sr. #": 72,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 102,
				Block: "Umer",
				"Client Name": "AKIF RASHEED",
				"VC No": "VC111250"
			},
			{
				"Sr. #": 73,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 103,
				Block: "Umer",
				"Client Name": "MUDASAR ALI",
				"VC No": "VC11385"
			},
			{
				"Sr. #": 74,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 104,
				Block: "Umer",
				"Client Name": "KASHIF ILYAS ",
				"VC No": "VC11716"
			},
			{
				"Sr. #": 75,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 105,
				Block: "Umer",
				"Client Name": "ASSIA TARIQ",
				"VC No": "VC11432"
			},
			{
				"Sr. #": 76,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 106,
				Block: "Umer",
				"Client Name": "M. FARHAN QURESHI",
				"VC No": "VC11738"
			},
			{
				"Sr. #": 77,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 107,
				Block: "Umer",
				"Client Name": "SHAGUFTA JABEEN",
				"VC No": "VC11735"
			},
			{
				"Sr. #": 78,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 108,
				Block: "Umer",
				"Client Name": "S TAHIR SAJJAD BOKHARI",
				"VC No": "VC01142"
			},
			{
				"Sr. #": 79,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 109,
				Block: "Umer",
				"Client Name": "SOBIA RIZWAN ",
				"VC No": "VC11204"
			},
			{
				"Sr. #": 80,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 110,
				Block: "Umer",
				"Client Name": "ZESHAN ALI ",
				"VC No": "VC11781"
			},
			{
				"Sr. #": 81,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 111,
				Block: "Umer",
				"Client Name": "SYED MASOOD ALI",
				"VC No": "VC11574"
			},
			{
				"Sr. #": 82,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 112,
				Block: "Umer",
				"Client Name": "SANIA CHUDHARY",
				"VC No": "VC11879"
			},
			{
				"Sr. #": 83,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 113,
				Block: "Umer",
				"Client Name": "SHAHBAZ ALI",
				"VC No": "VC111477"
			},
			{
				"Sr. #": 84,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 114,
				Block: "Umer",
				"Client Name": "MUHAMMAD MOHSIN BHATTI",
				"VC No": "VC111510"
			},
			{
				"Sr. #": 85,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 115,
				Block: "Umer",
				"Client Name": "IQBalBASHIR",
				"VC No": "VC11602"
			},
			{
				"Sr. #": 86,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 116,
				Block: "Umer",
				"Client Name": "MUHAMMAD MOHSIN BHATTI",
				"VC No": "VC111514"
			},
			{
				"Sr. #": 87,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 117,
				Block: "Umer",
				"Client Name": "RIDA SHAKIL",
				"VC No": "VC111496"
			},
			{
				"Sr. #": 88,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 118,
				Block: "Umer",
				"Client Name": "MUHAMMAD KASHIF ",
				"VC No": "VC111017"
			},
			{
				"Sr. #": 89,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 119,
				Block: "Umer",
				"Client Name": "MUHAMMAD IMRAN",
				"VC No": "VC11881"
			},
			{
				"Sr. #": 90,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 120,
				Block: "Umer",
				"Client Name": "ATIF AKHTAR BHATTI ",
				"VC No": "VC11193"
			},
			{
				"Sr. #": 91,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 121,
				Block: "Umer",
				"Client Name": "UZAIR BIN IMRAN",
				"VC No": "VC11356"
			},
			{
				"Sr. #": 92,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 122,
				Block: "Umer",
				"Client Name": "IQRA SITAR",
				"VC No": "VC11314"
			},
			{
				"Sr. #": 93,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 123,
				Block: "Umer",
				"Client Name": "ROBINA SHAHEEN ",
				"VC No": "VC11664"
			},
			{
				"Sr. #": 94,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 124,
				Block: "Umer",
				"Client Name": "ASIM RASHEED",
				"VC No": "VC111257"
			},
			{
				"Sr. #": 95,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 125,
				Block: "Umer",
				"Client Name": "ZAIN UL ABIDEEN",
				"VC No": "VC111247"
			},
			{
				"Sr. #": 96,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 126,
				Block: "Umer",
				"Client Name": "RANA EJAZ AHMED",
				"VC No": "VC11194"
			},
			{
				"Sr. #": 97,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 127,
				Block: "Umer",
				"Client Name": "ABDUL REHMAN",
				"VC No": "VC111513"
			},
			{
				"Sr. #": 98,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 128,
				Block: "Umer",
				"Client Name": "SIDRA AMIR",
				"VC No": "VC111570"
			},
			{
				"Sr. #": 99,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 129,
				Block: "Umer",
				"Client Name": "USMAN AHMAD",
				"VC No": "VC111539"
			},
			{
				"Sr. #": 100,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 130,
				Block: "Umer",
				"Client Name": "ASIM RASHEED",
				"VC No": "VC111258"
			},
			{
				"Sr. #": 101,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 131,
				Block: "Umer",
				"Client Name": "RANA DILDAR AHMAD",
				"VC No": "VC11616"
			},
			{
				"Sr. #": 102,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 132,
				Block: "Umer",
				"Client Name": "BATOOL EJAZ",
				"VC No": "VC01137"
			},
			{
				"Sr. #": 103,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 133,
				Block: "Umer",
				"Client Name": "MUHAMMAD ADIL KHAN ",
				"VC No": "VC111039"
			},
			{
				"Sr. #": 104,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 134,
				Block: "Umer",
				"Client Name": "NAVEED AHMED",
				"VC No": "VC01186"
			},
			{
				"Sr. #": 105,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 135,
				Block: "Umer",
				"Client Name": "HAFSA ASHFAQ",
				"VC No": "VC11896"
			},
			{
				"Sr. #": 106,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 136,
				Block: "Umer",
				"Client Name": "FAISalWAHEED KHAN",
				"VC No": "VC11469"
			},
			{
				"Sr. #": 107,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 137,
				Block: "Umer",
				"Client Name": "FAISalWAHEED KHAN",
				"VC No": "VC11468"
			},
			{
				"Sr. #": 108,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 138,
				Block: "Umer",
				"Client Name": "SALMA BIBI",
				"VC No": "VC111262"
			},
			{
				"Sr. #": 109,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 139,
				Block: "Umer",
				"Client Name": "MARIYAM FAHAD",
				"VC No": "VC11694"
			},
			{
				"Sr. #": 110,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 140,
				Block: "Umer",
				"Client Name": "SHUMAILA MOHSIN",
				"VC No": "VC111297"
			},
			{
				"Sr. #": 111,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 141,
				Block: "Umer",
				"Client Name": "SAQIB LATIF",
				"VC No": "VC11696"
			},
			{
				"Sr. #": 112,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 142,
				Block: "Umer",
				"Client Name": "MUHAMMAD TAHIR BASHIR",
				"VC No": "VC111212"
			},
			{
				"Sr. #": 113,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 143,
				Block: "Umer",
				"Client Name": "MAHEEN IMRAN",
				"VC No": "VC11359"
			},
			{
				"Sr. #": 114,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 144,
				Block: "Umer",
				"Client Name": "MUHAMMAD IMRAN",
				"VC No": "VC111135"
			},
			{
				"Sr. #": 115,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 145,
				Block: "Umer",
				"Client Name": "BASHIR AHMAD",
				"VC No": "VC111215"
			},
			{
				"Sr. #": 116,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 146,
				Block: "Umer",
				"Client Name": "FAHAD ISLAM",
				"VC No": "VC11140"
			},
			{
				"Sr. #": 117,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 147,
				Block: "Umer",
				"Client Name": "MUHAMMAD MOON SHAHZAD",
				"VC No": "VC111506"
			},
			{
				"Sr. #": 118,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 148,
				Block: "Umer",
				"Client Name": "TOOBA HASSAN",
				"VC No": "VC111524"
			},
			{
				"Sr. #": 119,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 149,
				Block: "Umer",
				"Client Name": "SAIMA TARIQ",
				"VC No": "VC111263"
			},
			{
				"Sr. #": 120,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 150,
				Block: "Umer",
				"Client Name": "UMAIR SABIR",
				"VC No": "VC11671"
			},
			{
				"Sr. #": 121,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 151,
				Block: "Umer",
				"Client Name": "MUHAMMAD AHMAD ZAIB",
				"VC No": "VC11375"
			},
			{
				"Sr. #": 122,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 152,
				Block: "Umer",
				"Client Name": "MUHAMMAD AKRAM ",
				"VC No": "VC11631"
			},
			{
				"Sr. #": 123,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 153,
				Block: "Umer",
				"Client Name": "IJAZ AHMAD",
				"VC No": "VC11478"
			},
			{
				"Sr. #": 124,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 154,
				Block: "Umer",
				"Client Name": "MUHAMMAD AWAIS",
				"VC No": "VC11410"
			},
			{
				"Sr. #": 125,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 155,
				Block: "Umer",
				"Client Name": "ARSHAD JAVED",
				"VC No": "VC111203"
			},
			{
				"Sr. #": 126,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 156,
				Block: "Umer",
				"Client Name": "AQSA IZHAR",
				"VC No": "VC11436"
			},
			{
				"Sr. #": 127,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 157,
				Block: "Umer",
				"Client Name": "MUHAMMAD ADIL KHAN ",
				"VC No": "VC11980"
			},
			{
				"Sr. #": 128,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 158,
				Block: "Umer",
				"Client Name": "MARYUM MAHMOOD ",
				"VC No": "VC11153"
			},
			{
				"Sr. #": 129,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 159,
				Block: "Umer",
				"Client Name": "AYESHA AHMED ",
				"VC No": "VC11623"
			},
			{
				"Sr. #": 130,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 160,
				Block: "Umer",
				"Client Name": "MOUZAM JAVED ",
				"VC No": "VC11179"
			},
			{
				"Sr. #": 131,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 161,
				Block: "Umer",
				"Client Name": "FAISalEJAZ",
				"VC No": "VC111082"
			},
			{
				"Sr. #": 132,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 162,
				Block: "Umer",
				"Client Name": "SOBIA NOUMAN",
				"VC No": "VC11789"
			},
			{
				"Sr. #": 133,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 163,
				Block: "Umer",
				"Client Name": "MUHAMMAD IMRAN",
				"VC No": "VC11882"
			},
			{
				"Sr. #": 134,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 164,
				Block: "Umer",
				"Client Name": "MUHAMMAD KAMRAN",
				"VC No": "VC111474"
			},
			{
				"Sr. #": 135,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 165,
				Block: "Umer",
				"Client Name": "MUHAMMAD KHALID ",
				"VC No": "VC11945"
			},
			{
				"Sr. #": 136,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 166,
				Block: "Umer",
				"Client Name": "MUHAMMAD JAVED",
				"VC No": "VC111505"
			},
			{
				"Sr. #": 137,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 167,
				Block: "Umer",
				"Client Name": "RANA HAFEEZ ULLAH",
				"VC No": "VC11431"
			},
			{
				"Sr. #": 138,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 168,
				Block: "Umer",
				"Client Name": "FATIMA AFZAAL",
				"VC No": "VC111229"
			},
			{
				"Sr. #": 139,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 169,
				Block: "Umer",
				"Client Name": "ROBINA SHAHEEN ",
				"VC No": "VC11665"
			},
			{
				"Sr. #": 140,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 170,
				Block: "Umer",
				"Client Name": "ROBINA SHAHEEN ",
				"VC No": "VC11666"
			},
			{
				"Sr. #": 141,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 171,
				Block: "Umer",
				"Client Name": "YASIR IQBAL",
				"VC No": "VC11390"
			},
			{
				"Sr. #": 142,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 172,
				Block: "Umer",
				"Client Name": "YASIR IQBAL",
				"VC No": "VC11388"
			},
			{
				"Sr. #": 143,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 173,
				Block: "Umer",
				"Client Name": "YASIR IQBAL",
				"VC No": "VC11389"
			},
			{
				"Sr. #": 144,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 174,
				Block: "Umer",
				"Client Name": "SYED KANWalZAIDI",
				"VC No": "VC11450"
			},
			{
				"Sr. #": 145,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 176,
				Block: "Umer",
				"Client Name": "MUHAMMAD SHAKEEL",
				"VC No": "VC11625"
			},
			{
				"Sr. #": 146,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 177,
				Block: "Umer",
				"Client Name": "AKIF RASHEED",
				"VC No": "VC111251"
			},
			{
				"Sr. #": 147,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 178,
				Block: "Umer",
				"Client Name": "SHAGUFTA JABEEN",
				"VC No": "VC11736"
			},
			{
				"Sr. #": 148,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 179,
				Block: "Umer",
				"Client Name": "HINA QAISER",
				"VC No": "VC11774"
			},
			{
				"Sr. #": 149,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 180,
				Block: "Umer",
				"Client Name": "BALalAHMAD",
				"VC No": "VC11101"
			},
			{
				"Sr. #": 150,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 181,
				Block: "Umer",
				"Client Name": "SHAZIA TASNEEM",
				"VC No": "VC11348"
			},
			{
				"Sr. #": 151,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 182,
				Block: "Umer",
				"Client Name": "IZMA ANWAR",
				"VC No": "VC111085"
			},
			{
				"Sr. #": 152,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 183,
				Block: "Umer",
				"Client Name": "MUHAMMAD BASHIR ",
				"VC No": "VC11782"
			},
			{
				"Sr. #": 153,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 184,
				Block: "Umer",
				"Client Name": "M. AZEEM QURESHI",
				"VC No": "VC11351"
			},
			{
				"Sr. #": 154,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 185,
				Block: "Umer",
				"Client Name": "ZILE HUMA",
				"VC No": "VC111365"
			},
			{
				"Sr. #": 155,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 186,
				Block: "Umer",
				"Client Name": "MUHAMMAD BILAL",
				"VC No": "VC11408"
			},
			{
				"Sr. #": 156,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 187,
				Block: "Umer",
				"Client Name": "SHAHZADA ANJUM",
				"VC No": "VC11790"
			},
			{
				"Sr. #": 157,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 188,
				Block: "Umer",
				"Client Name": "MUHAMMAD ZEESHAN",
				"VC No": "VC11830"
			},
			{
				"Sr. #": 158,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 189,
				Block: "Umer",
				"Client Name": "MUHAMMAD NASIR",
				"VC No": "VC01168"
			},
			{
				"Sr. #": 159,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 190,
				Block: "Umer",
				"Client Name": "ROBINA SHAHEEN ",
				"VC No": "VC11663"
			},
			{
				"Sr. #": 160,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 191,
				Block: "Umer",
				"Client Name": "ZUHAIB KHALID",
				"VC No": "VC11228"
			},
			{
				"Sr. #": 161,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 192,
				Block: "Umer",
				"Client Name": "FATIMA HABIB",
				"VC No": "VC01178"
			},
			{
				"Sr. #": 162,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 193,
				Block: "Umer",
				"Client Name": "USMAN AHMAD",
				"VC No": "VC11772"
			},
			{
				"Sr. #": 163,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 194,
				Block: "Umer",
				"Client Name": "GHULAM ALI",
				"VC No": "VC111471"
			},
			{
				"Sr. #": 164,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 195,
				Block: "Umer",
				"Client Name": "SHAHZAD AHMAD CHAUDHARY ",
				"VC No": "VC11677"
			},
			{
				"Sr. #": 165,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 196,
				Block: "Umer",
				"Client Name": "AKIF RASHEED",
				"VC No": "VC111252"
			},
			{
				"Sr. #": 166,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 197,
				Block: "Umer",
				"Client Name": "BIBI RUKHSANA",
				"VC No": "VC111367"
			},
			{
				"Sr. #": 167,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 199,
				Block: "Umer",
				"Client Name": "ZULQARNAIN HABIB",
				"VC No": "VC111302"
			},
			{
				"Sr. #": 168,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 200,
				Block: "Umer",
				"Client Name": "KASHIF ILYAS ",
				"VC No": "VC11715"
			},
			{
				"Sr. #": 169,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 201,
				Block: "Umer",
				"Client Name": "KASHIF ILYAS ",
				"VC No": "VC11714"
			},
			{
				"Sr. #": 170,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 202,
				Block: "Umer",
				"Client Name": "ASAD TARIQ ",
				"VC No": "VC11158"
			},
			{
				"Sr. #": 171,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 203,
				Block: "Umer",
				"Client Name": "MUHAMMAD YOUNAS",
				"VC No": "VC111228"
			},
			{
				"Sr. #": 172,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 204,
				Block: "Umer",
				"Client Name": "AYESHA SAQIB",
				"VC No": "VC111315"
			},
			{
				"Sr. #": 173,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 205,
				Block: "Umer",
				"Client Name": "MUHAMMAD ARSLAN",
				"VC No": "VC111425"
			},
			{
				"Sr. #": 174,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 206,
				Block: "Umer",
				"Client Name": "JAVARIA SALEEM",
				"VC No": "VC111034"
			},
			{
				"Sr. #": 175,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 207,
				Block: "Umer",
				"Client Name": "TOOBA HASSAN",
				"VC No": "VC111521"
			},
			{
				"Sr. #": 176,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 208,
				Block: "Umer",
				"Client Name": "Maqsood Ahmad",
				"VC No": "VC111661"
			},
			{
				"Sr. #": 177,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 209,
				Block: "Umer",
				"Client Name": "Zukhruf Umair",
				"VC No": "VC11466"
			},
			{
				"Sr. #": 178,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 210,
				Block: "Umer",
				"Client Name": "SAJID MUNIR",
				"VC No": "VC111460"
			},
			{
				"Sr. #": 179,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 211,
				Block: "Umer",
				"Client Name": "SAJID MUNIR",
				"VC No": "VC111461"
			},
			{
				"Sr. #": 180,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 212,
				Block: "Umer",
				"Client Name": "MEHBOOB UL HASSAN",
				"VC No": "VC111543"
			},
			{
				"Sr. #": 181,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 234,
				Block: "Umer",
				"Client Name": "SAJID ALI",
				"VC No": "VC111541"
			},
			{
				"Sr. #": 182,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 235,
				Block: "Umer",
				"Client Name": "MEHBOOB UL HASSAN",
				"VC No": "VC111545"
			},
			{
				"Sr. #": 183,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 236,
				Block: "Umer",
				"Client Name": "MUHAMMAD AMJAD",
				"VC No": "VC111555"
			},
			{
				"Sr. #": 184,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 239,
				Block: "Umer",
				"Client Name": "MEHBOOB UL HASSAN",
				"VC No": "VC111542"
			},
			{
				"Sr. #": 185,
				Category: "Residential",
				Size: "3 Marla ",
				"Plot No": 241,
				Block: "Umer",
				"Client Name": "MEHBOOB UL HASSAN",
				"VC No": "VC111544"
			},
			{
				"Sr. #": 186,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 1,
				Block: "Touheed",
				"Client Name": "RIDA ASHFAQ",
				"VC No": "VC12757"
			},
			{
				"Sr. #": 187,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 2,
				Block: "Touheed",
				"Client Name": "MIAN MOHAMMAD ASLAM",
				"VC No": "VC12213"
			},
			{
				"Sr. #": 188,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 3,
				Block: "Touheed",
				"Client Name": "ZUBAIR AHMAD WASEEM",
				"VC No": "VC12110"
			},
			{
				"Sr. #": 189,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 4,
				Block: "Touheed",
				"Client Name": "MUHAMMAD AWAIS",
				"VC No": "VC121223"
			},
			{
				"Sr. #": 190,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 5,
				Block: "Touheed",
				"Client Name": "AHMAD WAQAR ",
				"VC No": "VC12871"
			},
			{
				"Sr. #": 191,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 6,
				Block: "Touheed",
				"Client Name": "MAMOONA RIAZ",
				"VC No": "VC12769"
			},
			{
				"Sr. #": 192,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 7,
				Block: "Touheed",
				"Client Name": "SABA BABAR ",
				"VC No": "VC12989"
			},
			{
				"Sr. #": 193,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 8,
				Block: "Touheed",
				"Client Name": "AYESHA BIBI ",
				"VC No": "VC121439"
			},
			{
				"Sr. #": 194,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 9,
				Block: "Touheed",
				"Client Name": "MUHAMMAD AHMAD ZAIB",
				"VC No": "VC121078"
			},
			{
				"Sr. #": 195,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 10,
				Block: "Touheed",
				"Client Name": "AMIR SHAHZAD",
				"VC No": "VC12406"
			},
			{
				"Sr. #": 196,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 11,
				Block: "Touheed",
				"Client Name": "MUHAMMAD WAQAS SABIR ",
				"VC No": "VC12633"
			},
			{
				"Sr. #": 197,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 12,
				Block: "Touheed",
				"Client Name": "SAHJEED HUSSAIN",
				"VC No": "VC12886"
			},
			{
				"Sr. #": 198,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 13,
				Block: "Touheed",
				"Client Name": "HAMZAH RAAFEH KHANZADA ",
				"VC No": "VC121433"
			},
			{
				"Sr. #": 199,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 14,
				Block: "Touheed",
				"Client Name": "IFFAT ALIA",
				"VC No": "VC01284"
			},
			{
				"Sr. #": 200,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 15,
				Block: "Touheed",
				"Client Name": "HUSNAIN RAZA",
				"VC No": "VC121304"
			},
			{
				"Sr. #": 201,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 16,
				Block: "Touheed",
				"Client Name": "IMRAN AHMAD QURESHI",
				"VC No": "VC121397"
			},
			{
				"Sr. #": 202,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 17,
				Block: "Touheed",
				"Client Name": "SAQIB ISRAR",
				"VC No": "VC01217"
			},
			{
				"Sr. #": 203,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 18,
				Block: "Touheed",
				"Client Name": "IMRAN NAEEM",
				"VC No": "VC12684"
			},
			{
				"Sr. #": 204,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 19,
				Block: "Touheed",
				"Client Name": "RANA HASSAN MUMTAZ",
				"VC No": "VC12304"
			},
			{
				"Sr. #": 205,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 20,
				Block: "Touheed",
				"Client Name": "S. TAHIR SAJJAD BUKHARI",
				"VC No": "VC121430"
			},
			{
				"Sr. #": 206,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 21,
				Block: "Touheed",
				"Client Name": "UMER FAROOQ MALIK",
				"VC No": "VC121138"
			},
			{
				"Sr. #": 207,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 22,
				Block: "Touheed",
				"Client Name": "ASHFAQ MAHMOOD",
				"VC No": "VC121083"
			},
			{
				"Sr. #": 208,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 23,
				Block: "Touheed",
				"Client Name": "MUHAMMAD HASSAN",
				"VC No": "VC121557"
			},
			{
				"Sr. #": 209,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 24,
				Block: "Touheed",
				"Client Name": "MUHAMMAD HASSAN",
				"VC No": "VC121558"
			},
			{
				"Sr. #": 210,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 25,
				Block: "Touheed",
				"Client Name": "MEHBOOB UL HASSAN",
				"VC No": "VC121547"
			},
			{
				"Sr. #": 211,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 26,
				Block: "Touheed",
				"Client Name": "MUKHTAR AHMAD",
				"VC No": "VC121416"
			},
			{
				"Sr. #": 212,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 27,
				Block: "Touheed",
				"Client Name": "MADIHA BABAR",
				"VC No": "VC121458"
			},
			{
				"Sr. #": 213,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 28,
				Block: "Touheed",
				"Client Name": "HAMZA MUKHTAR",
				"VC No": "VC12776"
			},
			{
				"Sr. #": 214,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 29,
				Block: "Touheed",
				"Client Name": "MUHAMMAD SHAFIQUE ",
				"VC No": "VC12807"
			},
			{
				"Sr. #": 215,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 30,
				Block: "Touheed",
				"Client Name": "AMJAD RASOOL AWAN",
				"VC No": "VC12726"
			},
			{
				"Sr. #": 216,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 31,
				Block: "Touheed",
				"Client Name": "MUHAMMAD ZAHEER",
				"VC No": "VC01299"
			},
			{
				"Sr. #": 217,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 32,
				Block: "Touheed",
				"Client Name": "MOHAMMAD ZAFAR IQBal",
				"VC No": "VC12586"
			},
			{
				"Sr. #": 218,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 33,
				Block: "Touheed",
				"Client Name": "UMER SHEHZAD",
				"VC No": "VC12508"
			},
			{
				"Sr. #": 219,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 34,
				Block: "Touheed",
				"Client Name": "MUHAMMAD SHAFIQUE ",
				"VC No": "VC12808"
			},
			{
				"Sr. #": 220,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 35,
				Block: "Touheed",
				"Client Name": "ZULFIQAR ALI",
				"VC No": "VC121162"
			},
			{
				"Sr. #": 221,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 36,
				Block: "Touheed",
				"Client Name": "FARHAN YOUSAF",
				"VC No": "VC121380"
			},
			{
				"Sr. #": 222,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 37,
				Block: "Touheed",
				"Client Name": "NABEEL ANJUM",
				"VC No": "VC12160"
			},
			{
				"Sr. #": 223,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 38,
				Block: "Touheed",
				"Client Name": "BUSHRA ALI",
				"VC No": "VC12217"
			},
			{
				"Sr. #": 224,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 39,
				Block: "Touheed",
				"Client Name": "BILalAHMAD",
				"VC No": "VC121526"
			},
			{
				"Sr. #": 225,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 40,
				Block: "Touheed",
				"Client Name": "M. FAWAD NASEEM ABBASI",
				"VC No": "VC01274"
			},
			{
				"Sr. #": 226,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 41,
				Block: "Touheed",
				"Client Name": "MUHAMMAD SUFYAN ",
				"VC No": "VC12990"
			},
			{
				"Sr. #": 227,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 42,
				Block: "Touheed",
				"Client Name": "ZEESHAN AFZAL",
				"VC No": "VC01281"
			},
			{
				"Sr. #": 228,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 43,
				Block: "Touheed",
				"Client Name": "NAZIR AHMAD",
				"VC No": "VC121285"
			},
			{
				"Sr. #": 229,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 44,
				Block: "Touheed",
				"Client Name": "NAIMA ARAB CHOUDHARY",
				"VC No": "VC121136"
			},
			{
				"Sr. #": 230,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 45,
				Block: "Touheed",
				"Client Name": "NAZISH ZAFAR",
				"VC No": "VC121067"
			},
			{
				"Sr. #": 231,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 46,
				Block: "Touheed",
				"Client Name": "SAIMA NOMAN",
				"VC No": "VC12724"
			},
			{
				"Sr. #": 232,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 47,
				Block: "Touheed",
				"Client Name": "TAHIR RASHID",
				"VC No": "VC12686"
			},
			{
				"Sr. #": 233,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 48,
				Block: "Touheed",
				"Client Name": "AMNA HASSAN",
				"VC No": "VC121166"
			},
			{
				"Sr. #": 234,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 49,
				Block: "Touheed",
				"Client Name": "SYED AKHTAR HUSSAIN ZAIDI",
				"VC No": "VC12603"
			},
			{
				"Sr. #": 235,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 50,
				Block: "Touheed",
				"Client Name": "SYED GHUFRAN AHMAD",
				"VC No": "VC121283"
			},
			{
				"Sr. #": 236,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 51,
				Block: "Touheed",
				"Client Name": "SHAHID RASHEED",
				"VC No": "VC12593"
			},
			{
				"Sr. #": 237,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 52,
				Block: "Touheed",
				"Client Name": "MUHAMMAD AHMAD ZAIB",
				"VC No": "VC121127"
			},
			{
				"Sr. #": 238,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 55,
				Block: "Touheed",
				"Client Name": "MUHAMMAD SADIQ",
				"VC No": "VC121158"
			},
			{
				"Sr. #": 239,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 56,
				Block: "Touheed",
				"Client Name": "MUHAMMAD AHMAD ZAIB",
				"VC No": "VC121126"
			},
			{
				"Sr. #": 240,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 57,
				Block: "Touheed",
				"Client Name": "IMRAN AHMAD QURESHI",
				"VC No": "VC121396"
			},
			{
				"Sr. #": 241,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 58,
				Block: "Touheed",
				"Client Name": "BADAR JAMAL",
				"VC No": "VC12437"
			},
			{
				"Sr. #": 242,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 59,
				Block: "Touheed",
				"Client Name": "IQRA SARWAR",
				"VC No": "VC121532"
			},
			{
				"Sr. #": 243,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 60,
				Block: "Touheed",
				"Client Name": "FARHAN RASHID",
				"VC No": "VC01269"
			},
			{
				"Sr. #": 244,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 61,
				Block: "Touheed",
				"Client Name": "KINZA ARIF ",
				"VC No": "VC12276"
			},
			{
				"Sr. #": 245,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 62,
				Block: "Touheed",
				"Client Name": "USMAN KHALID WARAICH ",
				"VC No": "VC12335"
			},
			{
				"Sr. #": 246,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 63,
				Block: "Touheed",
				"Client Name": "SHAKEELA BASHARAT ",
				"VC No": "VC121429"
			},
			{
				"Sr. #": 247,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 64,
				Block: "Touheed",
				"Client Name": "MALIK RIZWAN",
				"VC No": "VC121480"
			},
			{
				"Sr. #": 248,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 65,
				Block: "Touheed",
				"Client Name": "NASEER AHMAD BUTT",
				"VC No": "VC121254"
			},
			{
				"Sr. #": 249,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 66,
				Block: "Touheed",
				"Client Name": "RUSHNA SAFIA",
				"VC No": "VC121295"
			},
			{
				"Sr. #": 250,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 67,
				Block: "Touheed",
				"Client Name": "MUHAMMAD WAQAS",
				"VC No": "VC121296"
			},
			{
				"Sr. #": 251,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 68,
				Block: "Touheed",
				"Client Name": "SARFRAZ IQBAL",
				"VC No": "VC121184"
			},
			{
				"Sr. #": 252,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 69,
				Block: "Touheed",
				"Client Name": "ABDUL GHAFFAR",
				"VC No": "VC121149"
			},
			{
				"Sr. #": 253,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 70,
				Block: "Touheed",
				"Client Name": "QAMAR UN NISA",
				"VC No": "VC01293"
			},
			{
				"Sr. #": 254,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 71,
				Block: "Touheed",
				"Client Name": "ABDULLAH RAAKEH KHANZADA ",
				"VC No": "VC121435"
			},
			{
				"Sr. #": 255,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 72,
				Block: "Touheed",
				"Client Name": "MEHBOOB UL HASSAN",
				"VC No": "VC121548"
			},
			{
				"Sr. #": 256,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 73,
				Block: "Touheed",
				"Client Name": "AHMAD BILAL",
				"VC No": "VC01214"
			},
			{
				"Sr. #": 257,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 74,
				Block: "Touheed",
				"Client Name": "TAHIR RASHID",
				"VC No": "VC12687"
			},
			{
				"Sr. #": 258,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 75,
				Block: "Touheed",
				"Client Name": "WAQAS AHMAD",
				"VC No": "VC01298"
			},
			{
				"Sr. #": 259,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 76,
				Block: "Touheed",
				"Client Name": "MUHAMMAD HASEEB",
				"VC No": "VC121255"
			},
			{
				"Sr. #": 260,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 77,
				Block: "Touheed",
				"Client Name": "TOOBA HASSAN",
				"VC No": "VC121522"
			},
			{
				"Sr. #": 261,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 78,
				Block: "Touheed",
				"Client Name": "REHANA KAUSAR ",
				"VC No": "VC12946"
			},
			{
				"Sr. #": 262,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 79,
				Block: "Touheed",
				"Client Name": "MUHAMMAD AHSAAN",
				"VC No": "VC121291"
			},
			{
				"Sr. #": 263,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 80,
				Block: "Touheed",
				"Client Name": "BABER ALI",
				"VC No": "VC121133"
			},
			{
				"Sr. #": 264,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 81,
				Block: "Touheed",
				"Client Name": "MUTAHAR AHMAD KHAN",
				"VC No": "VC12257"
			},
			{
				"Sr. #": 265,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 82,
				Block: "Touheed",
				"Client Name": "ZEESHAN ALI ",
				"VC No": "VC12685"
			},
			{
				"Sr. #": 266,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 85,
				Block: "Touheed",
				"Client Name": "MUHAMMAD SALIK TARIQ",
				"VC No": "VC12152"
			},
			{
				"Sr. #": 267,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 86,
				Block: "Touheed",
				"Client Name": "FEHMIDA FAISAL",
				"VC No": "VC12641"
			},
			{
				"Sr. #": 268,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 87,
				Block: "Touheed",
				"Client Name": "TAHIR RASHID",
				"VC No": "VC12689"
			},
			{
				"Sr. #": 269,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 88,
				Block: "Touheed",
				"Client Name": "LUBNA WAHEED ",
				"VC No": "VC12297"
			},
			{
				"Sr. #": 270,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 89,
				Block: "Touheed",
				"Client Name": "HAMID SHOAIB",
				"VC No": "VC121478"
			},
			{
				"Sr. #": 271,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 90,
				Block: "Touheed",
				"Client Name": "ANUM KAMRAN",
				"VC No": "VC01246"
			},
			{
				"Sr. #": 272,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 91,
				Block: "Touheed",
				"Client Name": "MUHAMMAD ADIL KHAN ",
				"VC No": "VC12981"
			},
			{
				"Sr. #": 273,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 92,
				Block: "Touheed",
				"Client Name": "MEHBOOB UL HASSAN",
				"VC No": "VC121549"
			},
			{
				"Sr. #": 274,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 93,
				Block: "Touheed",
				"Client Name": "SAQIB ISRAR",
				"VC No": "VC01216"
			},
			{
				"Sr. #": 275,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 94,
				Block: "Touheed",
				"Client Name": "TOOBA HASSAN",
				"VC No": "VC121523"
			},
			{
				"Sr. #": 276,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 95,
				Block: "Touheed",
				"Client Name": "AJMalBUTT",
				"VC No": "VC12704"
			},
			{
				"Sr. #": 277,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 96,
				Block: "Touheed",
				"Client Name": "SAEED AKRAM",
				"VC No": "VC121180"
			},
			{
				"Sr. #": 278,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 97,
				Block: "Touheed",
				"Client Name": "HASSAN RIAZ",
				"VC No": "VC12132"
			},
			{
				"Sr. #": 279,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 98,
				Block: "Touheed",
				"Client Name": "ZAFEER BASHIR",
				"VC No": "VC121051"
			},
			{
				"Sr. #": 280,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 99,
				Block: "Touheed",
				"Client Name": "MUHAMMAD ASHRAF",
				"VC No": "VC12854"
			},
			{
				"Sr. #": 281,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 100,
				Block: "Touheed",
				"Client Name": "QASIM ALI",
				"VC No": "VC12710"
			},
			{
				"Sr. #": 282,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 101,
				Block: "Touheed",
				"Client Name": "MUHAMMAD ANEES ABBASI ",
				"VC No": "VC121437"
			},
			{
				"Sr. #": 283,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 102,
				Block: "Touheed",
				"Client Name": "MUHAMMAD AKHTAR",
				"VC No": "VC121090"
			},
			{
				"Sr. #": 284,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 103,
				Block: "Touheed",
				"Client Name": "SHAHEEN AKBAR",
				"VC No": "VC12651"
			},
			{
				"Sr. #": 285,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 104,
				Block: "Touheed",
				"Client Name": "BILalAHMED MIRZA",
				"VC No": "VC12106"
			},
			{
				"Sr. #": 286,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 105,
				Block: "Touheed",
				"Client Name": "BUSHRA MAAHNOOR NAEEM",
				"VC No": "VC12575"
			},
			{
				"Sr. #": 287,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 106,
				Block: "Touheed",
				"Client Name": "KHAWAR MAQBOOL",
				"VC No": "VC121141"
			},
			{
				"Sr. #": 288,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 107,
				Block: "Touheed",
				"Client Name": "FAIZA ARSHID",
				"VC No": "VC121507"
			},
			{
				"Sr. #": 289,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 108,
				Block: "Touheed",
				"Client Name": "SABRINA HUMAYUN",
				"VC No": "VC12411"
			},
			{
				"Sr. #": 290,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 109,
				Block: "Touheed",
				"Client Name": "MUHAMMAD MAHROZ ",
				"VC No": "VC12186"
			},
			{
				"Sr. #": 291,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 110,
				Block: "Touheed",
				"Client Name": "JAHANGEER",
				"VC No": "VC121225"
			},
			{
				"Sr. #": 292,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 111,
				Block: "Touheed",
				"Client Name": "AAFIA BATOOL ",
				"VC No": "VC12867"
			},
			{
				"Sr. #": 293,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 112,
				Block: "Touheed",
				"Client Name": "MUSHTAQ AHMAD",
				"VC No": "VC121554"
			},
			{
				"Sr. #": 294,
				Category: "Residential",
				Size: "10 Marla",
				"Plot No": 119,
				Block: "Touheed",
				"Client Name": "Omer Zahid Sheikh",
				"VC No": "VC131593"
			},
			{
				"Sr. #": 295,
				Category: "Residential",
				Size: "10 Marla",
				"Plot No": 120,
				Block: "Touheed",
				"Client Name": "Shama Parveen",
				"VC No": "VC131609"
			},
			{
				"Sr. #": 296,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 140,
				Block: "Touheed",
				"Client Name": "SABA BABAR ",
				"VC No": "VC121227"
			},
			{
				"Sr. #": 297,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 141,
				Block: "Touheed",
				"Client Name": "ASJED RAUF ",
				"VC No": "VC12870"
			},
			{
				"Sr. #": 298,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 142,
				Block: "Touheed",
				"Client Name": "AFSHAN ARSHAD ",
				"VC No": "VC12235"
			},
			{
				"Sr. #": 299,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 143,
				Block: "Touheed",
				"Client Name": "NABEELA RIAZ",
				"VC No": "VC121169"
			},
			{
				"Sr. #": 300,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 144,
				Block: "Touheed",
				"Client Name": "SYED AKHTAR HUSSAIN ZAIDI",
				"VC No": "VC12604"
			},
			{
				"Sr. #": 301,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 145,
				Block: "Touheed",
				"Client Name": "UMER FAROOQ MALIK",
				"VC No": "VC121139"
			},
			{
				"Sr. #": 302,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 146,
				Block: "Touheed",
				"Client Name": "FATIMA RIZWAN ",
				"VC No": "VC12196"
			},
			{
				"Sr. #": 303,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 147,
				Block: "Touheed",
				"Client Name": "TAHIR RASHID",
				"VC No": "VC12690"
			},
			{
				"Sr. #": 304,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 148,
				Block: "Touheed",
				"Client Name": "AHMAD BILAL",
				"VC No": "VC01215"
			},
			{
				"Sr. #": 305,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 149,
				Block: "Touheed",
				"Client Name": "TAHIR RASHID",
				"VC No": "VC12688"
			},
			{
				"Sr. #": 306,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 150,
				Block: "Touheed",
				"Client Name": "SHABANA YASMIN",
				"VC No": "VC01267"
			},
			{
				"Sr. #": 307,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 161,
				Block: "Touheed",
				"Client Name": "ADREES ARIF",
				"VC No": "VC121546"
			},
			{
				"Sr. #": 308,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 162,
				Block: "Touheed",
				"Client Name": "MUHAMMAD YOUNAS",
				"VC No": "VC121157"
			},
			{
				"Sr. #": 309,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 163,
				Block: "Touheed",
				"Client Name": "SHAHIDA PARVEEN",
				"VC No": "VC12103"
			},
			{
				"Sr. #": 310,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 164,
				Block: "Touheed",
				"Client Name": "NASRIN BEGUM ",
				"VC No": "VC12187"
			},
			{
				"Sr. #": 311,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 165,
				Block: "Touheed",
				"Client Name": "SYED IFTIKHAR BUKHARI",
				"VC No": "VC121134"
			},
			{
				"Sr. #": 312,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 166,
				Block: "Touheed",
				"Client Name": "SAIMA NOMAN",
				"VC No": "VC12725"
			},
			{
				"Sr. #": 313,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 167,
				Block: "Touheed",
				"Client Name": "MATLOOB AKRAM ",
				"VC No": "VC121322"
			},
			{
				"Sr. #": 314,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 47,
				Block: "CCA",
				"Client Name": "FAISalSAMROZ HASHMI",
				"VC No": "VC271533"
			},
			{
				"Sr. #": 315,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 48,
				Block: "CCA",
				"Client Name": "MUHAMMAD ASIF SHARIF",
				"VC No": "VC271424"
			},
			{
				"Sr. #": 316,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 49,
				Block: "CCA",
				"Client Name": "MUHAMMAD AHSAAN",
				"VC No": "VC271269"
			},
			{
				"Sr. #": 317,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 50,
				Block: "CCA",
				"Client Name": "SHAIKH MUHAMMAD ZAHID",
				"VC No": "VC271525"
			},
			{
				"Sr. #": 318,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 51,
				Block: "CCA",
				"Client Name": "MUHAMMAD IMRAN SOHAIL",
				"VC No": "VC271344"
			},
			{
				"Sr. #": 319,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 52,
				Block: "CCA",
				"Client Name": "MUHAMMAD ALTAF",
				"VC No": "VC271406"
			},
			{
				"Sr. #": 320,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 53,
				Block: "CCA",
				"Client Name": "SABIR ALI",
				"VC No": "VC271186"
			},
			{
				"Sr. #": 321,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 54,
				Block: "CCA",
				"Client Name": "SAQIB ISRAR",
				"VC No": "VC271014"
			},
			{
				"Sr. #": 322,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 55,
				Block: "CCA",
				"Client Name": "TAHIRA ARSHAD",
				"VC No": "VC271060"
			},
			{
				"Sr. #": 323,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 56,
				Block: "CCA",
				"Client Name": "ABDUL REHMAN",
				"VC No": "VC271479"
			},
			{
				"Sr. #": 324,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 57,
				Block: "CCA",
				"Client Name": "MUHAMMAD JAHANZAIB",
				"VC No": "VC271091"
			},
			{
				"Sr. #": 325,
				Category: "Commercial",
				Size: "2 Marla",
				"Plot No": 58,
				Block: "CCA",
				"Client Name": "MUHAMMAD FAROOQ",
				"VC No": "VC271293"
			},
			{
				"Sr. #": 326,
				Category: "Commercial",
				Size: "2.5 Marla",
				"Plot No": "87/1",
				Block: "CCA",
				"Client Name": "Khurram Waheed",
				"VC No": "VC271712"
			},
			{
				"Sr. #": 327,
				Category: "Commercial",
				Size: "2.5 Marla",
				"Plot No": "88/2",
				Block: "CCA",
				"Client Name": "Jamila Akhtar",
				"VC No": "VC271649"
			},
			{
				"Sr. #": 328,
				Category: "Commercial",
				Size: "2.5 Marla",
				"Plot No": "89/1",
				Block: "CCA",
				"Client Name": "Naeem Butt",
				"VC No": "VC271144"
			},
			{
				"Sr. #": 329,
				Category: "Commercial",
				Size: "2.5 Marla",
				"Plot No": "89/2",
				Block: "CCA",
				"Client Name": "Mubasher Hussain",
				"VC No": "VC271699"
			},
			{
				"Sr. #": 330,
				Category: "Commercial",
				Size: "2.5 Marla",
				"Plot No": "90/1",
				Block: "CCA",
				"Client Name": "Mubasher Hussain",
				"VC No": "VC271698"
			},
			{
				"Sr. #": 331,
				Category: "Commercial",
				Size: "2.5 Marla",
				"Plot No": "90/2",
				Block: "CCA",
				"Client Name": "Mubasher Hussain",
				"VC No": "VC271697"
			},
			{
				"Sr. #": 332,
				Category: "Commercial",
				Size: "2.5 Marla",
				"Plot No": "90/3",
				Block: "CCA",
				"Client Name": "Mubasher Hussain",
				"VC No": "VC271696"
			},
			{
				"Sr. #": 333,
				Category: "Commercial",
				Size: "2.5 Marla",
				"Plot No": "90/4",
				Block: "CCA",
				"Client Name": "Mubasher Hussain",
				"VC No": "VC271695"
			},
			{
				"Sr. #": 334,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 91,
				Block: "CCA",
				"Client Name": "Syeda Rizwana Jafri",
				"VC No": "VC221637"
			},
			{
				"Sr. #": 335,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 103,
				Block: "CCA",
				"Client Name": "Arshman Asif",
				"VC No": "VC22538"
			},
			{
				"Sr. #": 336,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 104,
				Block: "CCA",
				"Client Name": "Muhammad Imran Saeed",
				"VC No": "VC22803"
			},
			{
				"Sr. #": 337,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 105,
				Block: "CCA",
				"Client Name": "Shaheen Shahid",
				"VC No": "VC221040"
			},
			{
				"Sr. #": 338,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 106,
				Block: "CCA",
				"Client Name": "MUHAMMAD AMJAD KHAN",
				"VC No": "VC22777"
			},
			{
				"Sr. #": 339,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 107,
				Block: "CCA",
				"Client Name": "AHMAD HASSAN",
				"VC No": "VC221446"
			},
			{
				"Sr. #": 340,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 108,
				Block: "CCA",
				"Client Name": "ASHFAQ MAHMOOD",
				"VC No": "VC22758"
			},
			{
				"Sr. #": 341,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 109,
				Block: "CCA",
				"Client Name": "KASHIF NOOR",
				"VC No": "VC22699"
			},
			{
				"Sr. #": 342,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 110,
				Block: "CCA",
				"Client Name": "SAMINA KOUSAR",
				"VC No": "VC221500"
			},
			{
				"Sr. #": 343,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 111,
				Block: "CCA",
				"Client Name": "MUHAMMAD ASIF",
				"VC No": "VC221445"
			},
			{
				"Sr. #": 344,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 112,
				Block: "CCA",
				"Client Name": "AMIR SHAHZAD",
				"VC No": "VC00226"
			},
			{
				"Sr. #": 345,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 113,
				Block: "CCA",
				"Client Name": "ABDUL SHAKOOR BHUTTA",
				"VC No": "VC22751"
			},
			{
				"Sr. #": 346,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 114,
				Block: "CCA",
				"Client Name": "MAZHAR RAHIM ",
				"VC No": "VC221062"
			},
			{
				"Sr. #": 347,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 115,
				Block: "CCA",
				"Client Name": "AADIL MANZOOR",
				"VC No": "VC221502"
			},
			{
				"Sr. #": 348,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 116,
				Block: "CCA",
				"Client Name": "ZULFIQAR ALI",
				"VC No": "VC221163"
			},
			{
				"Sr. #": 349,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 117,
				Block: "CCA",
				"Client Name": "Mian Amjad Iqbal",
				"VC No": "VC221663"
			},
			{
				"Sr. #": 350,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 118,
				Block: "CCA",
				"Client Name": "Muhammad Yasin",
				"VC No": "VC02256"
			},
			{
				"Sr. #": 351,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 119,
				Block: "CCA",
				"Client Name": "Chaudary Shahzad Anwar",
				"VC No": "VC221655"
			},
			{
				"Sr. #": 352,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 161,
				Block: "CCA",
				"Client Name": "BUSHRA SHAHBAZ",
				"VC No": "VC221316"
			},
			{
				"Sr. #": 353,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 162,
				Block: "CCA",
				"Client Name": "MAHMOOD AHMAD ",
				"VC No": "VC22956"
			},
			{
				"Sr. #": 354,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 163,
				Block: "CCA",
				"Client Name": "AASIA SALEEM BAIG",
				"VC No": "VC22350"
			},
			{
				"Sr. #": 355,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 164,
				Block: "CCA",
				"Client Name": "SAHJEED HUSSAIN",
				"VC No": "VC22903"
			},
			{
				"Sr. #": 356,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 165,
				Block: "CCA",
				"Client Name": "SAMINA KOUSAR",
				"VC No": "VC221499"
			},
			{
				"Sr. #": 357,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 166,
				Block: "CCA",
				"Client Name": "MUHAMMAD YASIN",
				"VC No": "VC02255"
			},
			{
				"Sr. #": 358,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 167,
				Block: "CCA",
				"Client Name": "SAMINA KOUSAR",
				"VC No": "VC221498"
			},
			{
				"Sr. #": 359,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 168,
				Block: "CCA",
				"Client Name": "MOBEEN FAISal",
				"VC No": "VC22986"
			},
			{
				"Sr. #": 360,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 169,
				Block: "CCA",
				"Client Name": "ADNAN SIDDIQ",
				"VC No": "VC221434"
			},
			{
				"Sr. #": 361,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 170,
				Block: "CCA",
				"Client Name": "SAMINA KOUSAR",
				"VC No": "VC221497"
			},
			{
				"Sr. #": 362,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 171,
				Block: "CCA",
				"Client Name": "AHMED HASSAN KHAN",
				"VC No": "VC221376"
			},
			{
				"Sr. #": 363,
				Category: "Commercial",
				Size: "5 Marla",
				"Plot No": 172,
				Block: "CCA",
				"Client Name": "ZEESHAN JAVED",
				"VC No": "VC22746"
			},
			{
				"Sr. #": 364,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 117,
				Block: "Usman",
				"Client Name": "Faiz Ullah",
				"VC No": "VC11836"
			},
			{
				"Sr. #": 365,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 118,
				Block: "Usman",
				"Client Name": "Faiz Ullah",
				"VC No": "VC11835"
			},
			{
				"Sr. #": 366,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 140,
				Block: "Usman",
				"Client Name": "Ahmed Bakhsh",
				"VC No": "VC111328"
			},
			{
				"Sr. #": 367,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 141,
				Block: "Usman",
				"Client Name": "Kaneezan Bibi",
				"VC No": "VC11889"
			},
			{
				"Sr. #": 368,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 142,
				Block: "Usman",
				"Client Name": "Waqas Majeed",
				"VC No": "VC111738"
			},
			{
				"Sr. #": 369,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 143,
				Block: "Usman",
				"Client Name": "Muhammad Aslam",
				"VC No": "VC11670"
			},
			{
				"Sr. #": 370,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 144,
				Block: "Usman",
				"Client Name": "Murtaza Masood",
				"VC No": "VC11719"
			},
			{
				"Sr. #": 371,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 147,
				Block: "Usman",
				"Client Name": "Muhammad Arslan",
				"VC No": "VC11552"
			},
			{
				"Sr. #": 372,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 148,
				Block: "Usman",
				"Client Name": "Sajid Munir",
				"VC No": "VC1741"
			},
			{
				"Sr. #": 373,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 149,
				Block: "Usman",
				"Client Name": "Syed Solat Abbas",
				"VC No": "VC111604"
			},
			{
				"Sr. #": 374,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 150,
				Block: "Usman",
				"Client Name": "Tahir Nazir",
				"VC No": "VC111583"
			},
			{
				"Sr. #": 375,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 160,
				Block: "Usman",
				"Client Name": "Fahmeeda Kausar",
				"VC No": "VC111585"
			},
			{
				"Sr. #": 376,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 165,
				Block: "Usman",
				"Client Name": "Muhammad Amin",
				"VC No": "VC11268"
			},
			{
				"Sr. #": 377,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 166,
				Block: "Usman",
				"Client Name": "Muhammad Nadeem Atif",
				"VC No": "VC11286"
			},
			{
				"Sr. #": 378,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 167,
				Block: "Usman",
				"Client Name": "Muhammad Abid Nadeem",
				"VC No": "VC11900"
			},
			{
				"Sr. #": 379,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 168,
				Block: "Usman",
				"Client Name": "Muhammad Ishfaq",
				"VC No": "VC11282"
			},
			{
				"Sr. #": 380,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 169,
				Block: "Usman",
				"Client Name": "Eid Nazeer",
				"VC No": "VC11642"
			},
			{
				"Sr. #": 381,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 170,
				Block: "Usman",
				"Client Name": "Eid Nazeer",
				"VC No": "VC11912"
			},
			{
				"Sr. #": 382,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 171,
				Block: "Usman",
				"Client Name": "Umar Draz Ali",
				"VC No": "VC111675"
			},
			{
				"Sr. #": 383,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 172,
				Block: "Usman",
				"Client Name": "Sadia Umer",
				"VC No": "VC111357"
			},
			{
				"Sr. #": 384,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 173,
				Block: "Usman",
				"Client Name": "Kabsha Mahmood",
				"VC No": "VC111681"
			},
			{
				"Sr. #": 385,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 174,
				Block: "Usman",
				"Client Name": "Pir Muneeb Rehman",
				"VC No": "VC01151"
			},
			{
				"Sr. #": 386,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 175,
				Block: "Usman",
				"Client Name": "Majid Farooq",
				"VC No": "VC111605"
			},
			{
				"Sr. #": 387,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 176,
				Block: "Usman",
				"Client Name": "Sajjad Haider",
				"VC No": "VC11822"
			},
			{
				"Sr. #": 388,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 177,
				Block: "Usman",
				"Client Name": "Tariq Masih",
				"VC No": "VC111728"
			},
			{
				"Sr. #": 389,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 178,
				Block: "Usman",
				"Client Name": "Muhammad Moazzum Ul Ibad",
				"VC No": "VC11944"
			},
			{
				"Sr. #": 390,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 179,
				Block: "Usman",
				"Client Name": "Hamid Ali",
				"VC No": "VC111705"
			},
			{
				"Sr. #": 391,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 180,
				Block: "Usman",
				"Client Name": "Hamid Ali",
				"VC No": "VC111704"
			},
			{
				"Sr. #": 392,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 181,
				Block: "Usman",
				"Client Name": "Abdul Qayyum",
				"VC No": "VC111703"
			},
			{
				"Sr. #": 393,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 1,
				Block: "Ali",
				"Client Name": "Mubeen Ahmed",
				"VC No": "VC11318"
			},
			{
				"Sr. #": 394,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 2,
				Block: "Ali",
				"Client Name": "Wasim Abbasi",
				"VC No": "VC01136"
			},
			{
				"Sr. #": 395,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 3,
				Block: "Ali",
				"Client Name": "Abdul Basit",
				"VC No": "VC11906"
			},
			{
				"Sr. #": 396,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 4,
				Block: "Ali",
				"Client Name": "Ambreen Akhtar",
				"VC No": "VC11206"
			},
			{
				"Sr. #": 397,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 5,
				Block: "Ali",
				"Client Name": "Sidra Altaf",
				"VC No": "VC111553"
			},
			{
				"Sr. #": 398,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 6,
				Block: "Ali",
				"Client Name": "Jamil Ahmed",
				"VC No": "VC111272"
			},
			{
				"Sr. #": 399,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 7,
				Block: "Ali",
				"Client Name": "Muhammad Waqar Hussain",
				"VC No": "VC111140"
			},
			{
				"Sr. #": 400,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 8,
				Block: "Ali",
				"Client Name": "Kaneezan Bibi",
				"VC No": "VC11890"
			},
			{
				"Sr. #": 401,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 9,
				Block: "Ali",
				"Client Name": "Nazia Atiq",
				"VC No": "VC01120"
			},
			{
				"Sr. #": 402,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 10,
				Block: "Ali",
				"Client Name": "Muhammad Saeed",
				"VC No": "VC111075"
			},
			{
				"Sr. #": 403,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 11,
				Block: "Ali",
				"Client Name": "IfshaAkhlaq",
				"VC No": "VC111615"
			},
			{
				"Sr. #": 404,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 12,
				Block: "Ali",
				"Client Name": "Mahboob Ul Hassan",
				"VC No": "VC111680"
			},
			{
				"Sr. #": 405,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 13,
				Block: "Ali",
				"Client Name": "Hina Tayyab",
				"VC No": "VC111221"
			},
			{
				"Sr. #": 406,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 14,
				Block: "Ali",
				"Client Name": "Zohaib Raza",
				"VC No": "VC111601"
			},
			{
				"Sr. #": 407,
				Category: "Residential",
				Size: "3 Marla",
				"Plot No": 15,
				Block: "Ali",
				"Client Name": "Khalil Ahmed",
				"VC No": "VC11846"
			},
			{
				"Sr. #": 408,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 16,
				Block: "Ali",
				"Client Name": "Aurang Zaib Sajjad",
				"VC No": "VC121732"
			},
			{
				"Sr. #": 409,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 17,
				Block: "Ali",
				"Client Name": "Ghulam Hussain",
				"VC No": "VC121073"
			},
			{
				"Sr. #": 410,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 18,
				Block: "Ali",
				"Client Name": "Madiha Babar",
				"VC No": "VC12617"
			},
			{
				"Sr. #": 411,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 19,
				Block: "Ali",
				"Client Name": "Muhammad Afzal",
				"VC No": "VC121538"
			},
			{
				"Sr. #": 412,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 20,
				Block: "Ali",
				"Client Name": "Muhammad Ahmad",
				"VC No": "VC12594"
			},
			{
				"Sr. #": 413,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 21,
				Block: "Ali",
				"Client Name": "Syed Saqlain Shan Naqvi",
				"VC No": "VC12595"
			},
			{
				"Sr. #": 414,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 22,
				Block: "Ali",
				"Client Name": "Muhammad Younas",
				"VC No": "VC121734"
			},
			{
				"Sr. #": 415,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 23,
				Block: "Ali",
				"Client Name": "Mian Zeeshan Meraj",
				"VC No": "VC121231"
			},
			{
				"Sr. #": 416,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 24,
				Block: "Ali",
				"Client Name": "Rizwan Kauser",
				"VC No": "VC12198"
			},
			{
				"Sr. #": 417,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 25,
				Block: "Ali",
				"Client Name": "Rizwana",
				"VC No": "VC12816"
			},
			{
				"Sr. #": 418,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 26,
				Block: "Ali",
				"Client Name": "Muhammad Anwar Ul Haque",
				"VC No": "VC12382"
			},
			{
				"Sr. #": 419,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 27,
				Block: "Ali",
				"Client Name": "Muhammad Anwar Ul Haque",
				"VC No": "VC12381"
			},
			{
				"Sr. #": 420,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 28,
				Block: "Ali",
				"Client Name": "Ali Afzal",
				"VC No": "VC121718"
			},
			{
				"Sr. #": 421,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 29,
				Block: "Ali",
				"Client Name": "Muhammad Shahbaz Ali",
				"VC No": "VC121725"
			},
			{
				"Sr. #": 422,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 55,
				Block: "Ali",
				"Client Name": "Sundas Ali Malik",
				"VC No": "VC121602"
			},
			{
				"Sr. #": 423,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 56,
				Block: "Ali",
				"Client Name": "Miftah Ud Din",
				"VC No": "VC121595"
			},
			{
				"Sr. #": 424,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 57,
				Block: "Ali",
				"Client Name": "Ahsan Ullah",
				"VC No": "VC121586"
			},
			{
				"Sr. #": 425,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 58,
				Block: "Ali",
				"Client Name": "Muhammad Naeem Nasir",
				"VC No": "VC121519"
			},
			{
				"Sr. #": 426,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 59,
				Block: "Ali",
				"Client Name": "Muhammad Naeem Nasir",
				"VC No": "VC121518"
			},
			{
				"Sr. #": 427,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 60,
				Block: "Ali",
				"Client Name": "Muhammad Naeem Nasir",
				"VC No": "VC121517"
			},
			{
				"Sr. #": 428,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 61,
				Block: "Ali",
				"Client Name": "Fozia Ashfaq",
				"VC No": "VC12653"
			},
			{
				"Sr. #": 429,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 62,
				Block: "Ali",
				"Client Name": "Muhammad Qasim",
				"VC No": "VC12675"
			},
			{
				"Sr. #": 430,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 63,
				Block: "Ali",
				"Client Name": "Iram Hamayun",
				"VC No": "VC1747"
			},
			{
				"Sr. #": 431,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 64,
				Block: "Ali",
				"Client Name": "Iram Hamayun",
				"VC No": "VC1746"
			},
			{
				"Sr. #": 432,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 65,
				Block: "Ali",
				"Client Name": "Ahsan Shahzad Khan",
				"VC No": "VC121633"
			},
			{
				"Sr. #": 433,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 66,
				Block: "Ali",
				"Client Name": "Muhammad Waqas",
				"VC No": "VC121668"
			},
			{
				"Sr. #": 434,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 67,
				Block: "Ali",
				"Client Name": "Muhammad Azam",
				"VC No": "VC121667"
			},
			{
				"Sr. #": 435,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 68,
				Block: "Ali",
				"Client Name": "Nisar Ahmad",
				"VC No": "VC12942"
			},
			{
				"Sr. #": 436,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 69,
				Block: "Ali",
				"Client Name": "Syed Khuram Ali",
				"VC No": "VC12536"
			},
			{
				"Sr. #": 437,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 94,
				Block: "Ali",
				"Client Name": "FaisalMehmood",
				"VC No": "VC12367"
			},
			{
				"Sr. #": 438,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 95,
				Block: "Ali",
				"Client Name": "Naqash Ahmad",
				"VC No": "VC12869"
			},
			{
				"Sr. #": 439,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 96,
				Block: "Ali",
				"Client Name": "Junaid Ali Suleri",
				"VC No": "VC121403"
			},
			{
				"Sr. #": 440,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 97,
				Block: "Ali",
				"Client Name": "Arif Mukhtar Rana",
				"VC No": "VC12305"
			},
			{
				"Sr. #": 441,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 98,
				Block: "Ali",
				"Client Name": "Farzana Munir Khan",
				"VC No": "VC121189"
			},
			{
				"Sr. #": 442,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 99,
				Block: "Ali",
				"Client Name": "Uzair Shafqat",
				"VC No": "VC12452"
			},
			{
				"Sr. #": 443,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 100,
				Block: "Ali",
				"Client Name": "Uzair Shafqat",
				"VC No": "VC12453"
			},
			{
				"Sr. #": 444,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 101,
				Block: "Ali",
				"Client Name": "Ayesha Saqib",
				"VC No": "VC121652"
			},
			{
				"Sr. #": 445,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 102,
				Block: "Ali",
				"Client Name": "Muhammad Raza Iqbal",
				"VC No": "VC12943"
			},
			{
				"Sr. #": 446,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 103,
				Block: "Ali",
				"Client Name": "Hafiz Rana Raheel Shafqat",
				"VC No": "VC00123"
			},
			{
				"Sr. #": 447,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 104,
				Block: "Ali",
				"Client Name": "Hafiz Muhammad Zain Zahid Butt",
				"VC No": "VC121627"
			},
			{
				"Sr. #": 448,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 105,
				Block: "Ali",
				"Client Name": "Umer Hassam",
				"VC No": "VC121400"
			},
			{
				"Sr. #": 449,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 106,
				Block: "Ali",
				"Client Name": "Adeela Kashif",
				"VC No": "VC121378"
			},
			{
				"Sr. #": 450,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 107,
				Block: "Ali",
				"Client Name": "Azher Tahir",
				"VC No": "VC121379"
			},
			{
				"Sr. #": 451,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 108,
				Block: "Ali",
				"Client Name": "Muhammad Jahangir Khan",
				"VC No": "VC12100"
			},
			{
				"Sr. #": 452,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 109,
				Block: "Ali",
				"Client Name": "Syed Mowahid Hussain",
				"VC No": "VC12104"
			},
			{
				"Sr. #": 453,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 110,
				Block: "Ali",
				"Client Name": "Sharafat Ali",
				"VC No": "VC121735"
			},
			{
				"Sr. #": 454,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 111,
				Block: "Ali",
				"Client Name": "Sheikh Muhammad Iqbal",
				"VC No": "VC12936"
			},
			{
				"Sr. #": 455,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 112,
				Block: "Ali",
				"Client Name": "Syeda Hina Fayyaz",
				"VC No": "VC121454"
			},
			{
				"Sr. #": 456,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 113,
				Block: "Ali",
				"Client Name": "Muhammad Zubair",
				"VC No": "VC121623"
			},
			{
				"Sr. #": 457,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 114,
				Block: "Ali",
				"Client Name": "Zeeshan Javed",
				"VC No": "VC12747"
			},
			{
				"Sr. #": 458,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 115,
				Block: "Ali",
				"Client Name": "Faiz Ullah",
				"VC No": "VC121431"
			},
			{
				"Sr. #": 459,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 116,
				Block: "Ali",
				"Client Name": "Syed Imran Ali",
				"VC No": "VC12551"
			},
			{
				"Sr. #": 460,
				Category: "Residential",
				Size: "5 Marla",
				"Plot No": 117,
				Block: "Ali",
				"Client Name": "Syed Hussain Ali Rehmat",
				"VC No": "VC12535"
			}
		];

		try {
			const result = data.map(async (item) => {
				const VC_NO = item["VC No"];
				const booking = await Booking.findOne({
					where: { Reg_Code_Disply: VC_NO }
				});
				const block = await Block.findOne({ where: { Name: item.Block } });

				const unit = await Unit.create({
					BK_ID: booking.BK_ID,
					Unit_Code: item["Plot No"],
					Plot_No: item["Plot No"],
					UType_ID: booking.UType_ID,
					PS_ID: booking.PS_ID,
					MEMBER_ID: booking.MEMBER_ID,
					MN_ID: booking.MN_ID,
					BLK_ID: block.BLK_ID,
					IsActive: 1
				});
				await Booking.update({ Unit_ID: unit.ID }, { where: { BK_ID: booking.BK_ID } });
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
			console.log("IIIIIIIIIIIIIIIIIIIIIII", result);
			res.status(200).json({
				status: 200,
				Message: "Updated Status SuccessFull",
				data: result
			});
		} catch (error) {
			console.log("OOOOOOOOOOOOOOOOO", error);
			return next(error);
		}
	};
	static locationAssign = async (req, res, next) => {
		const data = [
			{
				"Sr. #": 1,
				"Plot #": 1,
				Location: "Corner",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "RIDA ASHFAQ",
				Registration: "VC12757"
			},
			{
				"Sr. #": 2,
				"Plot #": 2,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MIAN MOHAMMAD ASLAM",
				Registration: "VC12213"
			},
			{
				"Sr. #": 3,
				"Plot #": 3,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ZUBAIR AHMAD WASEEM",
				Registration: "VC12110"
			},
			{
				"Sr. #": 4,
				"Plot #": 4,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD AWAIS",
				Registration: "VC121223"
			},
			{
				"Sr. #": 5,
				"Plot #": 5,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AHMAD WAQAR ",
				Registration: "VC12871"
			},
			{
				"Sr. #": 6,
				"Plot #": 6,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MAMOONA RIAZ",
				Registration: "VC12769"
			},
			{
				"Sr. #": 7,
				"Plot #": 7,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SABA BABAR ",
				Registration: "VC12989"
			},
			{
				"Sr. #": 8,
				"Plot #": 8,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AYESHA BIBI ",
				Registration: "VC121439"
			},
			{
				"Sr. #": 9,
				"Plot #": 9,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD AHMAD ZAIB",
				Registration: "VC121078"
			},
			{
				"Sr. #": 10,
				"Plot #": 10,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AMIR SHAHZAD",
				Registration: "VC12406"
			},
			{
				"Sr. #": 11,
				"Plot #": 11,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD WAQAS SABIR ",
				Registration: "VC12633"
			},
			{
				"Sr. #": 12,
				"Plot #": 12,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SAHJEED HUSSAIN",
				Registration: "VC12886"
			},
			{
				"Sr. #": 13,
				"Plot #": 13,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "HAMZAH RAAFEH KHANZADA ",
				Registration: "VC121433"
			},
			{
				"Sr. #": 14,
				"Plot #": 14,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "IFFAT ALIA",
				Registration: "VC01284"
			},
			{
				"Sr. #": 15,
				"Plot #": 15,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "HUSNAIN RAZA",
				Registration: "VC121304"
			},
			{
				"Sr. #": 16,
				"Plot #": 16,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "IMRAN AHMAD QURESHI",
				Registration: "VC121397"
			},
			{
				"Sr. #": 17,
				"Plot #": 17,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SAQIB ISRAR",
				Registration: "VC01217"
			},
			{
				"Sr. #": 18,
				"Plot #": 18,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "IMRAN NAEEM",
				Registration: "VC12684"
			},
			{
				"Sr. #": 19,
				"Plot #": 19,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "RANA HASSAN MUMTAZ",
				Registration: "VC12304"
			},
			{
				"Sr. #": 20,
				"Plot #": 20,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "S. TAHIR SAJJAD BUKHARI",
				Registration: "VC121430"
			},
			{
				"Sr. #": 21,
				"Plot #": 21,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "UMER FAROOQ MALIK",
				Registration: "VC121138"
			},
			{
				"Sr. #": 22,
				"Plot #": 22,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ASHFAQ MAHMOOD",
				Registration: "VC121083"
			},
			{
				"Sr. #": 23,
				"Plot #": 23,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD HASSAN",
				Registration: "VC121557"
			},
			{
				"Sr. #": 24,
				"Plot #": 24,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD HASSAN",
				Registration: "VC121558"
			},
			{
				"Sr. #": 25,
				"Plot #": 25,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MEHBOOB UL HASSAN",
				Registration: "VC121547"
			},
			{
				"Sr. #": 26,
				"Plot #": 26,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUKHTAR AHMAD",
				Registration: "VC121416"
			},
			{
				"Sr. #": 27,
				"Plot #": 27,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MADIHA BABAR",
				Registration: "VC121458"
			},
			{
				"Sr. #": 28,
				"Plot #": 28,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "HAMZA MUKHTAR",
				Registration: "VC12776"
			},
			{
				"Sr. #": 29,
				"Plot #": 29,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD SHAFIQUE ",
				Registration: "VC12807"
			},
			{
				"Sr. #": 30,
				"Plot #": 30,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AMJAD RASOOL AWAN",
				Registration: "VC12726"
			},
			{
				"Sr. #": 31,
				"Plot #": 31,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD ZAHEER",
				Registration: "VC01299"
			},
			{
				"Sr. #": 32,
				"Plot #": 32,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MOHAMMAD ZAFAR IQBAL ",
				Registration: "VC12586"
			},
			{
				"Sr. #": 33,
				"Plot #": 33,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "UMER SHEHZAD",
				Registration: "VC12508"
			},
			{
				"Sr. #": 34,
				"Plot #": 34,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD SHAFIQUE ",
				Registration: "VC12808"
			},
			{
				"Sr. #": 35,
				"Plot #": 35,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ZULFIQAR ALI",
				Registration: "VC121162"
			},
			{
				"Sr. #": 36,
				"Plot #": 36,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "FARHAN YOUSAF",
				Registration: "VC121380"
			},
			{
				"Sr. #": 37,
				"Plot #": 37,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "NABEEL ANJUM",
				Registration: "VC12160"
			},
			{
				"Sr. #": 38,
				"Plot #": 38,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "BUSHRA ALI",
				Registration: "VC12217"
			},
			{
				"Sr. #": 39,
				"Plot #": 39,
				Location: "Corner",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "BILAL AHMAD",
				Registration: "VC121526"
			},
			{
				"Sr. #": 40,
				"Plot #": 40,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "M. FAWAD NASEEM ABBASI",
				Registration: "VC01274"
			},
			{
				"Sr. #": 41,
				"Plot #": 41,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD SUFYAN ",
				Registration: "VC12990"
			},
			{
				"Sr. #": 42,
				"Plot #": 42,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ZEESHAN AFZAL",
				Registration: "VC01281"
			},
			{
				"Sr. #": 43,
				"Plot #": 43,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "NAZIR AHMAD",
				Registration: "VC121285"
			},
			{
				"Sr. #": 44,
				"Plot #": 44,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "NAIMA ARAB CHOUDHARY",
				Registration: "VC121136"
			},
			{
				"Sr. #": 45,
				"Plot #": 45,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "NAZISH ZAFAR",
				Registration: "VC121067"
			},
			{
				"Sr. #": 46,
				"Plot #": 46,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SAIMA NOMAN",
				Registration: "VC12724"
			},
			{
				"Sr. #": 47,
				"Plot #": 47,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "TAHIR RASHID",
				Registration: "VC12686"
			},
			{
				"Sr. #": 48,
				"Plot #": 48,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AMNA HASSAN",
				Registration: "VC121166"
			},
			{
				"Sr. #": 49,
				"Plot #": 49,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SYED AKHTAR HUSSAIN ZAIDI",
				Registration: "VC12603"
			},
			{
				"Sr. #": 50,
				"Plot #": 50,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SYED GHUFRAN AHMAD",
				Registration: "VC121283"
			},
			{
				"Sr. #": 51,
				"Plot #": 51,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SHAHID RASHEED",
				Registration: "VC12593"
			},
			{
				"Sr. #": 52,
				"Plot #": 52,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD AHMAD ZAIB",
				Registration: "VC121127"
			},
			{
				"Sr. #": 55,
				"Plot #": 55,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD SADIQ",
				Registration: "VC121158"
			},
			{
				"Sr. #": 56,
				"Plot #": 56,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD AHMAD ZAIB",
				Registration: "VC121126"
			},
			{
				"Sr. #": 57,
				"Plot #": 57,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "IMRAN AHMAD QURESHI",
				Registration: "VC121396"
			},
			{
				"Sr. #": 58,
				"Plot #": 58,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "BADAR JAMAL",
				Registration: "VC12437"
			},
			{
				"Sr. #": 59,
				"Plot #": 59,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "IQRA SARWAR",
				Registration: "VC121532"
			},
			{
				"Sr. #": 60,
				"Plot #": 60,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "FARHAN RASHID",
				Registration: "VC01269"
			},
			{
				"Sr. #": 61,
				"Plot #": 61,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "KINZA ARIF ",
				Registration: "VC12276"
			},
			{
				"Sr. #": 62,
				"Plot #": 62,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "USMAN KHALID WARAICH ",
				Registration: "VC12335"
			},
			{
				"Sr. #": 63,
				"Plot #": 63,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SHAKEELA BASHARAT ",
				Registration: "VC121429"
			},
			{
				"Sr. #": 64,
				"Plot #": 64,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MALIK RIZWAN",
				Registration: "VC121480"
			},
			{
				"Sr. #": 65,
				"Plot #": 65,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "NASEER AHMAD BUTT",
				Registration: "VC121254"
			},
			{
				"Sr. #": 66,
				"Plot #": 66,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "RUSHNA SAFIA",
				Registration: "VC121295"
			},
			{
				"Sr. #": 67,
				"Plot #": 67,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD WAQAS",
				Registration: "VC121296"
			},
			{
				"Sr. #": 68,
				"Plot #": 68,
				Location: "Corner",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SARFRAZ IQBAL",
				Registration: "VC121184"
			},
			{
				"Sr. #": 69,
				"Plot #": 69,
				Location: "Corner",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ABDUL GHAFFAR",
				Registration: "VC121149"
			},
			{
				"Sr. #": 70,
				"Plot #": 70,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "QAMAR UN NISA",
				Registration: "VC01293"
			},
			{
				"Sr. #": 71,
				"Plot #": 71,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ABDULLAH RAAKEH KHANZADA ",
				Registration: "VC121435"
			},
			{
				"Sr. #": 72,
				"Plot #": 72,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MEHBOOB UL HASSAN",
				Registration: "VC121548"
			},
			{
				"Sr. #": 73,
				"Plot #": 73,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AHMAD BILAL",
				Registration: "VC01214"
			},
			{
				"Sr. #": 74,
				"Plot #": 74,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "TAHIR RASHID",
				Registration: "VC12687"
			},
			{
				"Sr. #": 75,
				"Plot #": 75,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "WAQAS AHMAD",
				Registration: "VC01298"
			},
			{
				"Sr. #": 76,
				"Plot #": 76,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD HASEEB",
				Registration: "VC121255"
			},
			{
				"Sr. #": 77,
				"Plot #": 77,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "TOOBA HASSAN",
				Registration: "VC121522"
			},
			{
				"Sr. #": 78,
				"Plot #": 78,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "REHANA KAUSAR ",
				Registration: "VC12946"
			},
			{
				"Sr. #": 79,
				"Plot #": 79,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD AHSAAN",
				Registration: "VC121291"
			},
			{
				"Sr. #": 80,
				"Plot #": 80,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "BABER ALI",
				Registration: "VC121133"
			},
			{
				"Sr. #": 81,
				"Plot #": 81,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUTAHAR AHMAD KHAN",
				Registration: "VC12257"
			},
			{
				"Sr. #": 82,
				"Plot #": 82,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ZEESHAN ALI ",
				Registration: "VC12685"
			},
			{
				"Sr. #": 85,
				"Plot #": 85,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD SALIK TARIQ",
				Registration: "VC12152"
			},
			{
				"Sr. #": 86,
				"Plot #": 86,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "FEHMIDA FAISAL",
				Registration: "VC12641"
			},
			{
				"Sr. #": 87,
				"Plot #": 87,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "TAHIR RASHID",
				Registration: "VC12689"
			},
			{
				"Sr. #": 88,
				"Plot #": 88,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "LUBNA WAHEED ",
				Registration: "VC12297"
			},
			{
				"Sr. #": 89,
				"Plot #": 89,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "HAMID SHOAIB",
				Registration: "VC121478"
			},
			{
				"Sr. #": 90,
				"Plot #": 90,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ANUM KAMRAN",
				Registration: "VC01246"
			},
			{
				"Sr. #": 91,
				"Plot #": 91,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD ADIL KHAN ",
				Registration: "VC12981"
			},
			{
				"Sr. #": 92,
				"Plot #": 92,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MEHBOOB UL HASSAN",
				Registration: "VC121549"
			},
			{
				"Sr. #": 93,
				"Plot #": 93,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SAQIB ISRAR",
				Registration: "VC01216"
			},
			{
				"Sr. #": 94,
				"Plot #": 94,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "TOOBA HASSAN",
				Registration: "VC121523"
			},
			{
				"Sr. #": 95,
				"Plot #": 95,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AJMAL BUTT",
				Registration: "VC12704"
			},
			{
				"Sr. #": 96,
				"Plot #": 96,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SAEED AKRAM",
				Registration: "VC121180"
			},
			{
				"Sr. #": 97,
				"Plot #": 97,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "HASSAN RIAZ",
				Registration: "VC12132"
			},
			{
				"Sr. #": 98,
				"Plot #": 98,
				Location: "Corner",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ZAFEER BASHIR",
				Registration: "VC121051"
			},
			{
				"Sr. #": 99,
				"Plot #": 99,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD ASHRAF",
				Registration: "VC12854"
			},
			{
				"Sr. #": 100,
				"Plot #": 100,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "QASIM ALI",
				Registration: "VC12710"
			},
			{
				"Sr. #": 101,
				"Plot #": 101,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD ANEES ABBASI ",
				Registration: "VC121437"
			},
			{
				"Sr. #": 102,
				"Plot #": 102,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD AKHTAR",
				Registration: "VC121090"
			},
			{
				"Sr. #": 103,
				"Plot #": 103,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SHAHEEN AKBAR",
				Registration: "VC12651"
			},
			{
				"Sr. #": 104,
				"Plot #": 104,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "BILAL AHMED MIRZA",
				Registration: "VC12106"
			},
			{
				"Sr. #": 105,
				"Plot #": 105,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "BUSHRA MAAHNOOR NAEEM",
				Registration: "VC12575"
			},
			{
				"Sr. #": 106,
				"Plot #": 106,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "KHAWAR MAQBOOL",
				Registration: "VC121141"
			},
			{
				"Sr. #": 107,
				"Plot #": 107,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "FAIZA ARSHID",
				Registration: "VC121507"
			},
			{
				"Sr. #": 108,
				"Plot #": 108,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SABRINA HUMAYUN",
				Registration: "VC12411"
			},
			{
				"Sr. #": 109,
				"Plot #": 109,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD MAHROZ ",
				Registration: "VC12186"
			},
			{
				"Sr. #": 110,
				"Plot #": 110,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "JAHANGEER",
				Registration: "VC121225"
			},
			{
				"Sr. #": 111,
				"Plot #": 111,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AAFIA BATOOL ",
				Registration: "VC12867"
			},
			{
				"Sr. #": 112,
				"Plot #": 112,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUSHTAQ AHMAD",
				Registration: "VC121554"
			},
			{
				"Sr. #": 119,
				"Plot #": 119,
				Location: "Corner + FP",
				"Category ": "Residential",
				Size: "10 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Omer Zahid Sheikh",
				Registration: "VC131593"
			},
			{
				"Sr. #": 120,
				"Plot #": 120,
				Location: "FP",
				"Category ": "Residential",
				Size: "10 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Shama Parveen",
				Registration: "VC131609"
			},
			{
				"Sr. #": 140,
				"Plot #": 140,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SABA BABAR ",
				Registration: "VC121227"
			},
			{
				"Sr. #": 141,
				"Plot #": 141,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ASJED RAUF ",
				Registration: "VC12870"
			},
			{
				"Sr. #": 142,
				"Plot #": 142,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AFSHAN ARSHAD ",
				Registration: "VC12235"
			},
			{
				"Sr. #": 143,
				"Plot #": 143,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "NABEELA RIAZ",
				Registration: "VC121169"
			},
			{
				"Sr. #": 144,
				"Plot #": 144,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SYED AKHTAR HUSSAIN ZAIDI",
				Registration: "VC12604"
			},
			{
				"Sr. #": 145,
				"Plot #": 145,
				Location: "Corner + FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "UMER FAROOQ MALIK",
				Registration: "VC121139"
			},
			{
				"Sr. #": 146,
				"Plot #": 146,
				Location: "Corner",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "FATIMA RIZWAN ",
				Registration: "VC12196"
			},
			{
				"Sr. #": 147,
				"Plot #": 147,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "TAHIR RASHID",
				Registration: "VC12690"
			},
			{
				"Sr. #": 148,
				"Plot #": 148,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "AHMAD BILAL",
				Registration: "VC01215"
			},
			{
				"Sr. #": 149,
				"Plot #": 149,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "TAHIR RASHID",
				Registration: "VC12688"
			},
			{
				"Sr. #": 150,
				"Plot #": 150,
				Location: "FP",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SHABANA YASMIN",
				Registration: "VC01267"
			},
			{
				"Sr. #": 161,
				"Plot #": 161,
				Location: "Corner",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "ADREES ARIF",
				Registration: "VC121546"
			},
			{
				"Sr. #": 162,
				"Plot #": 162,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MUHAMMAD YOUNAS",
				Registration: "VC121157"
			},
			{
				"Sr. #": 163,
				"Plot #": 163,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SHAHIDA PARVEEN",
				Registration: "VC12103"
			},
			{
				"Sr. #": 164,
				"Plot #": 164,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "NASRIN BEGUM ",
				Registration: "VC12187"
			},
			{
				"Sr. #": 165,
				"Plot #": 165,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SYED IFTIKHAR BUKHARI",
				Registration: "VC121134"
			},
			{
				"Sr. #": 166,
				"Plot #": 166,
				Location: "Normal",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "SAIMA NOMAN",
				Registration: "VC12725"
			},
			{
				"Sr. #": 167,
				"Plot #": 167,
				Location: "Corner",
				"Category ": "Residential",
				Size: "5 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "1st Ballot",
				"Client Name": "MATLOOB AKRAM ",
				Registration: "VC121322"
			},
			{
				"Sr. #": 117,
				"Plot #": 117,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Faiz Ullah",
				Registration: "VC11836"
			},
			{
				"Sr. #": 118,
				"Plot #": 118,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Faiz Ullah",
				Registration: "VC11835"
			},
			{
				"Sr. #": 140,
				"Plot #": 140,
				Location: "Corner",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"Client Name": "Ahmed Bakhsh",
				Registration: "VC111328"
			},
			{
				"Sr. #": 141,
				"Plot #": 141,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"Client Name": "Kaneezan Bibi",
				Registration: "VC11889"
			},
			{
				"Sr. #": 142,
				"Plot #": 142,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"Client Name": "Waqas Majeed",
				Registration: "VC111738"
			},
			{
				"Sr. #": 143,
				"Plot #": 143,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"Client Name": "Muhammad Aslam",
				Registration: "VC11670"
			},
			{
				"Sr. #": 144,
				"Plot #": 144,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"Client Name": "Murtaza Masood",
				Registration: "VC11719"
			},
			{
				"Sr. #": 147,
				"Plot #": 147,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Arslan",
				Registration: "VC11552"
			},
			{
				"Sr. #": 148,
				"Plot #": 148,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Sajid Munir",
				Registration: "VC1741"
			},
			{
				"Sr. #": 149,
				"Plot #": 149,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Syed Solat Abbas",
				Registration: "VC111604"
			},
			{
				"Sr. #": 150,
				"Plot #": 150,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Tahir Nazir",
				Registration: "VC111583"
			},
			{
				"Sr. #": 160,
				"Plot #": 160,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Fahmeeda Kausar",
				Registration: "VC111585"
			},
			{
				"Sr. #": 165,
				"Plot #": 165,
				Location: "Corner",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Amin",
				Registration: "VC11268"
			},
			{
				"Sr. #": 166,
				"Plot #": 166,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Nadeem Atif",
				Registration: "VC11286"
			},
			{
				"Sr. #": 167,
				"Plot #": 167,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Abdul Basit / Kashif Akhter",
				Registration: "VC11900"
			},
			{
				"Sr. #": 168,
				"Plot #": 168,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Ishfaq",
				Registration: "VC11282"
			},
			{
				"Sr. #": 169,
				"Plot #": 169,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Eid Nazeer",
				Registration: "VC11642"
			},
			{
				"Sr. #": 170,
				"Plot #": 170,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Eid Nazeer",
				Registration: "VC11912"
			},
			{
				"Sr. #": 171,
				"Plot #": 171,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Umar Draz Ali",
				Registration: "VC111675"
			},
			{
				"Sr. #": 172,
				"Plot #": 172,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Sadia Umer",
				Registration: "VC111357"
			},
			{
				"Sr. #": 173,
				"Plot #": 173,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Kabsha Mahmood",
				Registration: "VC111681"
			},
			{
				"Sr. #": 174,
				"Plot #": 174,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Pir Muneeb Rehman",
				Registration: "VC01151"
			},
			{
				"Sr. #": 175,
				"Plot #": 175,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Majid Farooq",
				Registration: "VC111605"
			},
			{
				"Sr. #": 176,
				"Plot #": 176,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Sajjad Haider",
				Registration: "VC11822"
			},
			{
				"Sr. #": 177,
				"Plot #": 177,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Tariq Masih",
				Registration: "VC111728"
			},
			{
				"Sr. #": 178,
				"Plot #": 178,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Moazzum Ul Ibad",
				Registration: "VC11944"
			},
			{
				"Sr. #": 179,
				"Plot #": 179,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Hamid Ali",
				Registration: "VC111705"
			},
			{
				"Sr. #": 180,
				"Plot #": 180,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Hamid Ali",
				Registration: "VC111704"
			},
			{
				"Sr. #": 181,
				"Plot #": 181,
				Location: "Corner",
				"Category ": "Residential ",
				Size: "3 Marla",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Abdul Qayyum",
				Registration: "VC111703"
			},
			{
				"Sr. #": 1,
				"Plot #": 1,
				Location: "Corner",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Mubeen Ahmed",
				Registration: "VC11318"
			},
			{
				"Sr. #": 2,
				"Plot #": 2,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Wasim Abbasi",
				Registration: "VC01136"
			},
			{
				"Sr. #": 3,
				"Plot #": 3,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Abdul Basit",
				Registration: "VC11906"
			},
			{
				"Sr. #": 4,
				"Plot #": 4,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Ambreen Akhtar",
				Registration: "VC11206"
			},
			{
				"Sr. #": 5,
				"Plot #": 5,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Sidra Altaf",
				Registration: "VC111553"
			},
			{
				"Sr. #": 6,
				"Plot #": 6,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Jamil Ahmed",
				Registration: "VC111272"
			},
			{
				"Sr. #": 7,
				"Plot #": 7,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Waqar Hussain",
				Registration: "VC111140"
			},
			{
				"Sr. #": 8,
				"Plot #": 8,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Kaneezan Bibi",
				Registration: "VC11890"
			},
			{
				"Sr. #": 9,
				"Plot #": 9,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Nazia Atiq",
				Registration: "VC01120"
			},
			{
				"Sr. #": 10,
				"Plot #": 10,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Saeed",
				Registration: "VC111075"
			},
			{
				"Sr. #": 11,
				"Plot #": 11,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "IfshaAkhlaq",
				Registration: "VC111615"
			},
			{
				"Sr. #": 12,
				"Plot #": 12,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Mahboob Ul Hassan",
				Registration: "VC111680"
			},
			{
				"Sr. #": 13,
				"Plot #": 13,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Hina Tayyab",
				Registration: "VC111221"
			},
			{
				"Sr. #": 14,
				"Plot #": 14,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Zohaib Raza",
				Registration: "VC111601"
			},
			{
				"Sr. #": 15,
				"Plot #": 15,
				Location: "Corner",
				"Category ": "Residential ",
				Size: "3 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Khalil Ahmed",
				Registration: "VC11846"
			},
			{
				"Sr. #": 16,
				"Plot #": 16,
				Location: "Corner",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Aurang Zaib Sajjad",
				Registration: "VC121732"
			},
			{
				"Sr. #": 17,
				"Plot #": 17,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Ghulam Hussain",
				Registration: "VC121073"
			},
			{
				"Sr. #": 18,
				"Plot #": 18,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Madiha Babar",
				Registration: "VC12617"
			},
			{
				"Sr. #": 19,
				"Plot #": 19,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Afzal",
				Registration: "VC121538"
			},
			{
				"Sr. #": 20,
				"Plot #": 20,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Ahmad",
				Registration: "VC12594"
			},
			{
				"Sr. #": 21,
				"Plot #": 21,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Syed Saqlain Shan Naqvi",
				Registration: "VC12595"
			},
			{
				"Sr. #": 22,
				"Plot #": 22,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Younas",
				Registration: "VC121734"
			},
			{
				"Sr. #": 23,
				"Plot #": 23,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Mian Zeeshan Meraj",
				Registration: "VC121231"
			},
			{
				"Sr. #": 24,
				"Plot #": 24,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Rizwan Kauser",
				Registration: "VC12198"
			},
			{
				"Sr. #": 25,
				"Plot #": 25,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Rizwana",
				Registration: "VC12816"
			},
			{
				"Sr. #": 26,
				"Plot #": 26,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Anwar Ul Haque",
				Registration: "VC12382"
			},
			{
				"Sr. #": 27,
				"Plot #": 27,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Anwar Ul Haque",
				Registration: "VC12381"
			},
			{
				"Sr. #": 28,
				"Plot #": 28,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Ali Afzal",
				Registration: "VC121718"
			},
			{
				"Sr. #": 29,
				"Plot #": 29,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Shahbaz Ali",
				Registration: "VC121725"
			},
			{
				"Sr. #": 55,
				"Plot #": 55,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Sundas Ali Malik",
				Registration: "VC121602"
			},
			{
				"Sr. #": 56,
				"Plot #": 56,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Miftah Ud Din",
				Registration: "VC121595"
			},
			{
				"Sr. #": 57,
				"Plot #": 57,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Ahsan Ullah",
				Registration: "VC121586"
			},
			{
				"Sr. #": 58,
				"Plot #": 58,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Naeem Nasir",
				Registration: "VC121519"
			},
			{
				"Sr. #": 59,
				"Plot #": 59,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Naeem Nasir",
				Registration: "VC121518"
			},
			{
				"Sr. #": 60,
				"Plot #": 60,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Naeem Nasir",
				Registration: "VC121517"
			},
			{
				"Sr. #": 61,
				"Plot #": 61,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Fozia Ashfaq",
				Registration: "VC12653"
			},
			{
				"Sr. #": 62,
				"Plot #": 62,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Qasim",
				Registration: "VC12675"
			},
			{
				"Sr. #": 63,
				"Plot #": 63,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Iram Hamayun",
				Registration: "VC1747"
			},
			{
				"Sr. #": 64,
				"Plot #": 64,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Iram Hamayun",
				Registration: "VC1746"
			},
			{
				"Sr. #": 65,
				"Plot #": 65,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Ahsan Shahzad Khan",
				Registration: "VC121633"
			},
			{
				"Sr. #": 66,
				"Plot #": 66,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Waqas",
				Registration: "VC121668"
			},
			{
				"Sr. #": 67,
				"Plot #": 67,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Azam",
				Registration: "VC121667"
			},
			{
				"Sr. #": 68,
				"Plot #": 68,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Nisar Ahmad",
				Registration: "VC12942"
			},
			{
				"Sr. #": 69,
				"Plot #": 69,
				Location: "Corner",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Syed Khuram Ali",
				Registration: "VC12536"
			},
			{
				"Sr. #": 94,
				"Plot #": 94,
				Location: "Corner",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Faisal Mehmood",
				Registration: "VC12367"
			},
			{
				"Sr. #": 95,
				"Plot #": 95,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Naqash Ahmad",
				Registration: "VC12869"
			},
			{
				"Sr. #": 96,
				"Plot #": 96,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Junaid Ali Suleri",
				Registration: "VC121403"
			},
			{
				"Sr. #": 97,
				"Plot #": 97,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Arif Mukhtar Rana",
				Registration: "VC12305"
			},
			{
				"Sr. #": 98,
				"Plot #": 98,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Farzana Munir Khan",
				Registration: "VC121189"
			},
			{
				"Sr. #": 99,
				"Plot #": 99,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Uzair Shafqat",
				Registration: "VC12452"
			},
			{
				"Sr. #": 100,
				"Plot #": 100,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Uzair Shafqat",
				Registration: "VC12453"
			},
			{
				"Sr. #": 101,
				"Plot #": 101,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Ayesha Saqib",
				Registration: "VC121652"
			},
			{
				"Sr. #": 102,
				"Plot #": 102,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Raza Iqbal",
				Registration: "VC12943"
			},
			{
				"Sr. #": 103,
				"Plot #": 103,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Hafiz Rana Raheel Shafqat",
				Registration: "VC00123"
			},
			{
				"Sr. #": 104,
				"Plot #": 104,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Hafiz Muhammad Zain Zahid Butt",
				Registration: "VC121627"
			},
			{
				"Sr. #": 105,
				"Plot #": 105,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Umer Hassam",
				Registration: "VC121400"
			},
			{
				"Sr. #": 106,
				"Plot #": 106,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Adeela Kashif",
				Registration: "VC121378"
			},
			{
				"Sr. #": 107,
				"Plot #": 107,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Azher Tahir",
				Registration: "VC121379"
			},
			{
				"Sr. #": 108,
				"Plot #": 108,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Jahangir Khan",
				Registration: "VC12100"
			},
			{
				"Sr. #": 109,
				"Plot #": 109,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Syed Mowahid Hussain",
				Registration: "VC12104"
			},
			{
				"Sr. #": 110,
				"Plot #": 110,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Sharafat Ali",
				Registration: "VC121735"
			},
			{
				"Sr. #": 111,
				"Plot #": 111,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Sheikh Muhammad Iqbal",
				Registration: "VC12936"
			},
			{
				"Sr. #": 112,
				"Plot #": 112,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Syeda Hina Fayyaz",
				Registration: "VC121454"
			},
			{
				"Sr. #": 113,
				"Plot #": 113,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Muhammad Zubair",
				Registration: "VC121623"
			},
			{
				"Sr. #": 114,
				"Plot #": 114,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Zeeshan Javed",
				Registration: "VC12747"
			},
			{
				"Sr. #": 115,
				"Plot #": 115,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Faiz Ullah",
				Registration: "VC121431"
			},
			{
				"Sr. #": 116,
				"Plot #": 116,
				Location: "Normal",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Syed Imran Ali",
				Registration: "VC12551"
			},
			{
				"Sr. #": 117,
				"Plot #": 117,
				Location: "Corner",
				"Category ": "Residential ",
				Size: "5 Marla ",
				"Allotted / Vacant": "ALLOTTED",
				"1st / 2nd Ballot": "2nd Ballot",
				"Client Name": "Syed Hussain Ali Rehmat",
				Registration: "VC12535"
			},
			{
				"Sr. #": 1,
				"Plot #": 47,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "FAISAL SAMROZ HASHMI",
				Registration: "VC271533"
			},
			{
				"Sr. #": 2,
				"Plot #": 48,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "MUHAMMAD ASIF SHARIF",
				Registration: "VC271534"
			},
			{
				"Sr. #": 3,
				"Plot #": 49,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "MUHAMMAD AHSAAN",
				Registration: "VC271535"
			},
			{
				"Sr. #": 4,
				"Plot #": 50,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "SHAIKH MUHAMMAD ZAHID",
				Registration: "VC271536"
			},
			{
				"Sr. #": 5,
				"Plot #": 51,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "MUHAMMAD IMRAN SOHAIL",
				Registration: "VC271537"
			},
			{
				"Sr. #": 6,
				"Plot #": 52,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "MUHAMMAD ALTAF",
				Registration: "VC271538"
			},
			{
				"Sr. #": 7,
				"Plot #": 53,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "SABIR ALI",
				Registration: "VC271539"
			},
			{
				"Sr. #": 8,
				"Plot #": 54,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "SAQIB ISRAR",
				Registration: "VC271540"
			},
			{
				"Sr. #": 9,
				"Plot #": 55,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "TAHIRA ARSHAD",
				Registration: "VC271541"
			},
			{
				"Sr. #": 10,
				"Plot #": 56,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "ABDUL REHMAN",
				Registration: "VC271542"
			},
			{
				"Sr. #": 11,
				"Plot #": 57,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "MUHAMMAD JAHANZAIB",
				Registration: "VC271543"
			},
			{
				"Sr. #": 12,
				"Plot #": 58,
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "1st Ballot",
				"Allotted / Vacant": "MUHAMMAD FAROOQ",
				Registration: "VC271544"
			},
			{
				"Sr. #": 57,
				"Plot #": "87/1",
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "2nd Ballot",
				"Allotted / Vacant": "Khurram Waheed",
				Registration: "VC271545"
			},
			{
				"Sr. #": 60,
				"Plot #": "88/2",
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "2nd Ballot",
				"Allotted / Vacant": "Jamila Akhtar",
				Registration: "VC271546"
			},
			{
				"Sr. #": 61,
				"Plot #": "89/1",
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "2nd Ballot",
				"Allotted / Vacant": "Naeem Butt",
				Registration: "VC271547"
			},
			{
				"Sr. #": 62,
				"Plot #": "89/2",
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "2nd Ballot",
				"Allotted / Vacant": "Mubasher Hussain",
				Registration: "VC271548"
			},
			{
				"Sr. #": 63,
				"Plot #": "90/1",
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "2nd Ballot",
				"Allotted / Vacant": "Mubasher Hussain",
				Registration: "VC271549"
			},
			{
				"Sr. #": 64,
				"Plot #": "90/2",
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "2nd Ballot",
				"Allotted / Vacant": "Mubasher Hussain",
				Registration: "VC271550"
			},
			{
				"Sr. #": 65,
				"Plot #": "90/3",
				Location: "Normal",
				"Category ": "ALLOTTED",
				Size: "2nd Ballot",
				"Allotted / Vacant": "Mubasher Hussain",
				Registration: "VC271551"
			},
			{
				"Sr. #": 66,
				"Plot #": "90/4",
				Location: "Corner",
				"Category ": "ALLOTTED",
				Size: "2nd Ballot",
				"Allotted / Vacant": "Mubasher Hussain",
				Registration: "VC271552"
			}
		];
		let arr = [];
		try {
			const result = data.map(async (item) => {
				const location = item["Location"];
				const VC_NO = item["Registration"];
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
			console.log("IIIIIIIIIIIIIIIIIIIIIII", result);
			res.status(200).json({
				status: 200,
				Message: "Updated Status SuccessFull",
				data: arr
			});
		} catch (error) {
			console.log("OOOOOOOOOOOOOOOOO", error);
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
