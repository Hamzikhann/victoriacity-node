const User = require("../../models/User.js");
// const BookingInstallmentDetail = require("../../models/index.js");
const dotenv = require("dotenv");
const {
	Booking,
	Member,
	BookingInstallmentDetails,
	InstallmentReceipts,
	Restorationfee,
	Payment_Mode,
	UnitType,
	PlotSize
} = require("../../models/index.js");

const { Op } = require("sequelize");
dotenv.config();
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const pdfGenerator = require("../../services/PdfGenerator.js");

exports.create = async (req, res, next) => {
	try {
		let amount = req.body.amount;
		let bkid = req.body.BK_ID;
		let paidAt = new Date().toISOString().split("T")[0];

		let restoratioFeeObj = {
			amount: amount,
			BK_ID: bkid,
			paidAt: paidAt
		};

		let findRestoration = await Restorationfee.findOne({ where: { BK_ID: bkid } });

		if (!findRestoration) {
			if (restoratioFeeObj.amount && restoratioFeeObj.BK_ID && restoratioFeeObj.paidAt) {
				let findBooking = await Booking.findOne({ where: { BK_ID: bkid } });

				if (findBooking) {
					Restorationfee.create(restoratioFeeObj)
						.then(async (response) => {
							if (response) {
								// let updateBooking = await Booking.update({ Status: "Active" }, { where: { BK_ID: bkid } });
								let receipt_head = "Restoration Fee";

								let findBooking = await Booking.findAll({
									include: [
										{ as: "Restorationfee", model: Restorationfee, where: { BK_ID: bkid } },
										{ as: "UnitType", model: UnitType },
										{ as: "PlotSize", model: PlotSize },
										{ as: "Member", model: Member }
									]
								});
								console.log(findBooking);
								const pdfBody = {
									totalSurcharge: amount,
									remainingSurcharge: 0,
									paidSurcharge: amount,
									paidAt: paidAt,
									BK_ID: bkid,
									unitType: findBooking[0].UnitType.Name,
									plotSize: findBooking[0].PlotSize.Name,
									member: findBooking[0].Member.BuyerName,
									vcno: findBooking[0].Reg_Code_Disply
								};
								console.log("PDFFFFFFF", pdfBody);

								let pdf = await pdfGenerator.RestorationFeeGenerator(pdfBody, findBooking, receipt_head);

								res
									.send({
										message: "Restoration Fee Added",
										data: findBooking,
										file: { url: `${process.env.APP_URL}/${pdf}` }
									})
									.status(200);
							}
						})
						.catch((err) => {
							res.status(500).send({
								message: err.message || "Some error occurred."
							});
						});
				} else {
					res.status(404).send({
						message: "Booking Not found"
					});
				}
			} else {
				res.send({ message: "Fields are missing" }).status(400);
			}
		} else {
			res.send({ message: "Restoration Fee Already Paid" });
		}
	} catch (error) {
		return next(error);
	}
};

exports.list = async (req, res, next) => {
	try {
		Restorationfee.findAll({
			include: [{ as: "Booking", model: Booking, include: [{ as: "Member", model: Member }] }]
		})
			.then((response) => {
				if (response) {
					res.send({ message: "Restoration List Fetched", data: response });
				} else {
					res.send({ message: "No Data Found" });
				}
			})
			.catch((err) => {
				res.status(500).send({
					message: err.message || "Some error occurred."
				});
			});
	} catch (error) {
		return next(error);
	}
};

exports.detail = async (req, res, next) => {
	try {
		let id = req.body.id;
	} catch (error) {
		return next(error);
	}
};

exports.genratePdf = async (req, res) => {
	try {
		const { id, bkid } = req.body;

		const findBookingDetails = await Restorationfee.findAll({
			where: { id: id, BK_ID: bkid },
			include: [
				{
					model: Booking,
					as: "Booking",
					include: [
						{ as: "UnitType", model: UnitType },
						{ as: "PlotSize", model: PlotSize },
						{ as: "Member", model: Member }
					]
				}
			]
		});

		let receipt_head = "Restoration Fee";

		const pdfBody = {
			totalSurcharge: findBookingDetails[0].amount,
			remainingSurcharge: 0,
			paidSurcharge: findBookingDetails[0].amount,
			paidAt: findBookingDetails[0].paidAt,
			BK_ID: findBookingDetails[0].BK_ID,
			unitType: findBookingDetails[0].Booking.UnitType.Name,
			plotSize: findBookingDetails[0].Booking.PlotSize.Name,
			member: findBookingDetails[0].Booking.Member.BuyerName,
			vcno: findBookingDetails[0].Booking.Reg_Code_Disply
		};

		let pdf = await pdfGenerator.RestorationFeeGenerator(pdfBody, findBookingDetails, receipt_head);

		return res.status(200).json({
			status: 200,
			message: "Surcharge found successfully",
			file: { url: `${process.env.APP_URL}/${pdf}` }
		});
	} catch (error) {
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
