const fs = require("fs");
const path = require("path");
const file_Transfer = require("../../models/FileTransferDummy.js");
// const TRSRequest = require('../../models/TRS_Request_Mst.js');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../../models/User.js");
const {
	MemNominee,
	TRSRequest,
	Voucher,
	BookingInstallmentDetails,
	Booking,
	Sequelize,
	InstallmentReceipts
} = require("../../models/index.js");
const pdfGenerator = require("../../services/PdfGenerator.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const FileService = require("../../services/FileService.js");

dotenv.config();
class FileTransferDummyController {
	static addfileTransfer = async (req, res, next) => {
		const {
			TRSR_ID,
			USER_ID,
			MN_ID,
			Booking_Temp,
			Unit_Temp,
			Secondary_Member_ID,
			MEMBER_ID,
			BK_ID,
			BUYER_MEMBER_ID,
			BUYER_MEMBER_NOMINEE_ID,
			Seller_Image,
			Buyer_Image,
			Combine_Image
		} = req.body;

		let seller_Image = "";
		let buyer_Image = "";
		let combine_Image = "";

		try {
			if (Seller_Image) {
				seller_Image = await FileService.storegeImage(Seller_Image, BK_ID);
			}
			if (Buyer_Image) {
				buyer_Image = await FileService.storegeImage(Buyer_Image, BK_ID);
			}
			if (Combine_Image) {
				combine_Image = await FileService.storegeImage(Combine_Image, BK_ID);
			}

			const createfileTransfer = new file_Transfer({
				BK_ID: BK_ID,
				User_ID: USER_ID,
				Nominee_ID: BUYER_MEMBER_NOMINEE_ID,
				Nominee_Temp_ID: MN_ID,
				Booking_Temp: Booking_Temp,
				Unit_Temp: Unit_Temp,
				Member_ID: BUYER_MEMBER_ID,
				Member_Temp_ID: MEMBER_ID,
				Secondary_Member_ID: Secondary_Member_ID == "undefined" ? 0 : Secondary_Member_ID,
				Seller_Image: seller_Image,
				Buyer_Image: buyer_Image,
				Combine_Image: combine_Image,
				TRSR_ID: TRSR_ID
			});

			await createfileTransfer.save();

			if (TRSR_ID) {
				await TRSRequest.update({ status: 4 }, { where: { TRSR_ID: TRSR_ID } });
				await Booking.update(
					{ MEMBER_ID: BUYER_MEMBER_ID, MN_ID: BUYER_MEMBER_NOMINEE_ID },
					{ where: { BK_ID: BK_ID } }
				);

				// await BookingInstallmentDetails.update(
				//   { MEMBER_ID: BUYER_MEMBER_ID },
				//   { where: { BK_ID: BK_ID, IsCompleted: null, Installment_Paid: 0 } }
				// );

				const allBookingDetails = await BookingInstallmentDetails.findAll({ where: { BK_ID: BK_ID } });

				const allBookingInstallmentReceipts = await InstallmentReceipts.findAll({ where: { BK_ID: BK_ID } });

				for (let k = 0; k < allBookingDetails.length; k++) {
					const bInstallments = allBookingInstallmentReceipts.filter(
						(it) => it.BKI_DETAIL_ID == allBookingDetails[k].BKI_DETAIL_ID
					);

					if (bInstallments.length > 0) {
						let sumPaid = 0;
						let remaining = allBookingDetails[k].Installment_Due;
						for (let j = 0; j < bInstallments.length; j++) {
							sumPaid += +bInstallments[j].Installment_Paid;
						}

						remaining = remaining - sumPaid;

						if (remaining > 0) {
							await BookingInstallmentDetails.update(
								{ MEMBER_ID: BUYER_MEMBER_ID },
								{
									where: {
										BK_ID: BK_ID,
										BKI_DETAIL_ID: allBookingDetails[k].BKI_DETAIL_ID
									}
								}
							);
						}
					} else {
						await BookingInstallmentDetails.update(
							{ MEMBER_ID: BUYER_MEMBER_ID },
							{
								where: {
									BK_ID: BK_ID,
									BKI_DETAIL_ID: allBookingDetails[k].BKI_DETAIL_ID
								}
							}
						);
					}
				}
			}

			res.status(200).send({
				status: 200,
				message: "Add fileTransfer successfully",
				fileTransfer: createfileTransfer
			});
		} catch (error) {
			console.log(error);
			res.status(500).send({
				status: 500,
				error: error,
				// error1: error,
				message: "Unable to Add fileTransfer"
			});
		}
	};

	static getAllFileTransfer = async (req, res) => {
		const fileId = await file_Transfer.findAll();
		try {
			if (fileId !== null) {
				return res.status(200).send({
					status: 200,
					message: "Get all Files Dummies successfully",
					Data: fileId
				});
			} else {
				return res.status(200).send({
					status: 200,
					message: "No Files Dummy present"
				});
			}
		} catch (error) {
			console.log(error);
			res.status(500).send({
				status: 500,
				error: error,
				message: "Unable to Get fileTransfer"
			});
		}
	};
	static getFileTransferById = async (req, res, next) => {
		const ID = req.query.id;
		try {
			const fileId = await file_Transfer.findAll({ where: { id: ID } });

			if (fileId.length >= 1) {
				return res.status(200).send({
					status: 200,
					message: "get File successfully",
					Date: fileId
				});
			} else {
				return res.status(400).send({
					status: 400,
					message: "No File against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	static deleteFileTransfer = async (req, res) => {
		const ID = req.query.id;
		if (ID) {
			try {
				const fileId = await file_Transfer.findAll({ where: { id: ID } });

				if (fileId.length > 0) {
					file_Transfer.destroy({
						where: {
							id: ID
						}
					});
					return res.status(200).send({
						status: 200,
						message: "File Deleted SuccessFull"
					});
				} else {
					return res.status(400).send({
						status: 200,
						message: "File not found"
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Deleted File"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "ID IS REQUIRED"
			});
		}
	};

	static transferEventPdf = async (req, res, next) => {
		const { id } = req.query;
		try {
			const TRSData = await TRSRequest.findOne({ where: { TRSR_ID: id } });
			const { count, rows } = await file_Transfer.findAndCountAll({
				where: { TRSR_ID: id },
				row: true
			});

			if (rows.length == 0) {
				return next(CustomErrorHandler.notFound("Data not found1!"));
			}
			const file = rows[0];
			if (!file) {
				return next(CustomErrorHandler.notFound("Data not found2!"));
			}
			file.toJSON();
			// rows.toJSON();
			const userobj = await User.findOne({ where: { id: req.user.id } });
			const pdf = await pdfGenerator.transferEventCapture(file, rows, TRSData, userobj);
			return res.status(200).json({
				status: 200,
				message: "Get transfer event capture Report Successfully",
				rows: rows,
				file: { url: `${process.env.APP_URL}/${pdf}` }
			});
		} catch (error) {
			return next(error);
		}
	};
}

module.exports = FileTransferDummyController;
