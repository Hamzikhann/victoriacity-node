const {
	FileSubmission,
	FileSubmissionDetail,
	OpenFile,
	UnitType,
	PlotSize,
	Phase,
	PaymentPlan,
	Sector,
	Block,
	UnitNature,
	InstallmentReceipts,
	Booking
} = require("../../models");
const User = require("../../models/User");
const UserRole = require("../../models/UserRole");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const { createPaymentPlan } = require("../../services/FileService");
const { Op } = require("sequelize");
const pdfGenerator = require("../../services/PdfGenerator");

class FileSubmissionController {
	static create = async (req, res, next) => {
		let {
			Name,
			FatherName,
			SecondFatherName,
			SecondName,
			CNIC,
			Mobile,
			Remarks,
			FileSub_Fee_Amt,
			USER_ID,
			Is_APProved,
			OF_ID,
			SRForm_No,
			Form_Code,
			Form_Codes,
			UType_ID,
			PS_ID,
			Doc_Delivery_Date
		} = req.body;

		USER_ID = req.user.id;

		if (!(Name && CNIC && Mobile && USER_ID && OF_ID && SRForm_No && Form_Code && UType_ID && Doc_Delivery_Date)) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}

		try {
			let maxId = await FileSubmission.max("FSRC_ID");
			const [row, created] = await FileSubmission.findOrCreate({
				where: { FSRC_Code: ++maxId || 1 },
				defaults: {
					Name,
					FatherName,
					SecondFatherName,
					SecondName,
					CNIC,
					Mobile,
					Remarks,
					FileSub_Fee_Amt,
					USER_ID,
					Doc_Delivery_Date,
					DD_Time: Doc_Delivery_Date.split("T")[1],
					Is_APProved
				}
			});

			row.toJSON();

			for (var i = 0; i < Form_Codes.length; i++) {
				if (created) {
					let maxDetailId = await FileSubmissionDetail.max("FSRC_DETAIL_ID");
					// console.log('PS_ID',PS_ID);
					/*const [, created] = */
					await FileSubmissionDetail.findOrCreate({
						where: { FSRC_DETAIL_ID: ++maxDetailId || 1 },
						defaults: {
							OF_ID: Form_Codes[i].OF_ID,
							FSRC_ID: row.FSRC_ID,
							SRForm_No: Form_Codes[i].formNo,
							Form_Code: Form_Codes[i].formCode,
							UType_ID: Form_Codes[i].UType_ID,
							PS_ID: Form_Codes[i].plotSizeId,
							USER_ID,
							IsBooked: 0
						}
					});

					// console.log("created456", created);
					// if (!created) {
					//     return next(CustomErrorHandler.alreadyExist());
					// }

					// console.log("created456789", created);
					if (created) {
						OpenFile.update(
							{ LAST_Verified: Date.now(), Verify_Count: 1 },
							{ where: { SRForm_No: Form_Codes[i].formNo }, returning: true }
						);
						//  const formArr = await createPaymentPlan({ USER_ID, OF_ID });
						//  console.log("result",formArr)
						// await InstallmentReceipts.bulkCreate(formArr);
					}
				} else {
					// return next(CustomErrorHandler.alreadyExist());
				}
			}

			return res.status(200).json({
				status: 200,
				message: "File Submitted successfully",
				data: row
			});
		} catch (error) {
			return next(error);
		}
	};
	// SEARCH file BY ID
	static getFileSubById = async (req, res, next) => {
		const fileId = req.query.id;

		try {
			const file = await FileSubmission.findByPk(fileId, {
				include: [{ as: "User", model: User }]
			});
			if (!file) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get File Submission successfully",
				file: file
			});
		} catch (error) {
			return next(error);
		}
	};

	static getFileSubDelById = async (req, res, next) => {
		const fileId = req.query.id;

		try {
			const file = await FileSubmissionDetail.findByPk(fileId, {
				include: [
					{ as: "User", model: User },
					{ as: "FileSubmission", model: FileSubmission },
					{ as: "OpenFile", model: OpenFile },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize }
				]
			});

			if (!file) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get File Submission successfully",
				file: file
			});
		} catch (error) {
			return next(error);
		}
	};

	static getFileSubDelByFormNo = async (req, res, next) => {
		const code = req.query.code;

		try {
			const file = await FileSubmissionDetail.findOne({
				include: [
					{ as: "User", model: User },
					{ as: "FileSubmission", model: FileSubmission },
					{
						as: "OpenFile",
						model: OpenFile,
						include: [
							{ as: "Phase", model: Phase },
							{ as: "PaymentPlan", model: PaymentPlan },
							{ as: "Sector", model: Sector },
							{ as: "Block", model: Block },
							{ as: "UnitNature", model: UnitNature }
						]
					},
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize }
				],
				where: { Form_Code: code }
			});

			if (!file) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			if (file.IsBooked == 1) {
				return next(CustomErrorHandler.alreadyExist("Already booked file!"));
			}

			let maxId = await Booking.max("BK_Reg_Code");
			maxId = maxId + 1;

			return res.status(200).json({
				status: 200,
				message: "Get File Submission successfully",
				file: file,
				maxRegCode: file ? "VC" + file.UType_ID + "" + file.PS_ID + maxId : "VC" + maxId
			});
		} catch (error) {
			return next(error);
		}
	};
	static getFilterFileSub = async (req, res, next) => {
		const SRForm_No = req.query.SRForm_No;
		const Name = req.query.Name;
		const CNIC = req.query.CNIC;

		try {
			const file = await FileSubmissionDetail.findAll({
				include: [
					{ as: "User", model: User },
					{ as: "FileSubmission", model: FileSubmission },
					{
						as: "OpenFile",
						model: OpenFile,
						include: [
							{ as: "Phase", model: Phase },
							{ as: "PaymentPlan", model: PaymentPlan },
							{ as: "Sector", model: Sector },
							{ as: "Block", model: Block },
							{ as: "UnitNature", model: UnitNature }
						]
					},
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize }
				],
				where: {
					[Op.or]: [
						{ "$FileSubmission.CNIC$": { [Op.like]: `%${CNIC}%` } }, // Search by CNIC in the 'FileSubmission' model
						{ "$FileSubmission.Name$": { [Op.like]: `%${Name}%` } }, // Search by Name in the 'FileSubmission' model
						{ SRForm_No: { [Op.like]: `%${SRForm_No}%` } } // Search by SRForm_No in the 'FileSubmissionDetails' model
					]
				}
				///
			});

			if (!file) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get File Submission successfully",
				file: file
			});
		} catch (error) {
			return next(error);
		}
	};

	static getAllFileSubDel = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		try {
			const { count, rows } = await FileSubmissionDetail.findAndCountAll({
				include: [
					{ as: "User", model: User },
					{ as: "FileSubmission", model: FileSubmission },
					{ as: "OpenFile", model: OpenFile },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize }
				],
				offset: limit * page,
				limit: limit
			});

			if (!rows) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get Files Submission Detail successfully",
				file: rows,
				totalRecords: count,
				totalPage: Math.ceil(count / limit) + 1,
				page,
				limit
			});
		} catch (error) {
			return next(error);
		}
	};

	// GET ALL AVAILABLE fileS
	static get = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		const FSRC_Code = req.query.FSRC_Code;
		const Name = req.query.Name;
		const CNIC = req.query.CNIC;

		try {
			if (!FSRC_Code && !Name && !CNIC) {
				let where = { IsDeleted: 0 };
				const userId = req.user.id;
				const role = req.user.role;
				const roleName = await UserRole.findAll({ where: { id: role } });

				if (roleName.length > 0 && roleName[0].name !== "Admin" && roleName[0].name !== "Partner") {
					where = { IsDeleted: 0, USER_ID: userId };
				}

				const { count, rows } = await FileSubmission.findAndCountAll({
					include: [{ as: "User", model: User }],
					where: where,
					offset: limit * page,
					limit: limit,
					order: [["FSRC_ID", "DESC"]]
				});

				if (rows.length === 0) {
					return next(CustomErrorHandler.notFound("Data not found!"));
				}
				return res.status(200).json({
					status: 200,
					message: "Get All Files Submission successfully",
					file: rows,

					totalPage: Math.ceil(count / limit) + 1,
					totalRecords: count,
					page,
					limit
				});
			} else {
				const file = await FileSubmission.findAll({
					include: [
						{ as: "User", model: User }
						// { as: 'FileSubmissionDetail', model: FileSubmissionDetail }
					],
					where: {
						[Op.or]: [
							{
								[Op.and]: [
									{ CNIC: { [Op.like]: `%${CNIC || ""}%` } }, // Search by CNIC in the 'FileSubmission' model
									{ Name: { [Op.like]: `%${Name || ""}%` } }, // Search by Name in the 'FileSubmission' model
									{ FSRC_Code: { [Op.like]: `%${FSRC_Code || ""}%` } } // Search by SRForm_No in the 'FileSubmissionDetails' model
								]
							}
							// Sequelize.literal('(CASE WHEN CNIC IS NOT NULL THEN 1 WHEN Name IS NOT NULL THEN 1 WHEN FSRC_Code IS NOT NULL THEN 1 ELSE 0 END) = 1')
						]
					}
				});

				if (!file) {
					return next(CustomErrorHandler.notFound("Data not found!"));
				}
				return res.status(200).json({
					status: 200,
					message: "Get File Submission successfully",
					file: file
				});
			}
		} catch (error) {
			return next(error);
		}
	};

	///UPDATE file
	static update = async (req, res, next) => {
		const fileId = req.query.id;
		let result;
		try {
			const exist = await FileSubmission.findOne({
				where: { FSRC_ID: fileId }
			});
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			result = await FileSubmission.update(
				{ ...req.body, LAST_UPDATE: Date.now() },
				{ where: { FSRC_ID: fileId }, returning: true }
			);
			res.status(200).json({
				status: 200,
				message: " File Submission updated successfully",
				"Updated File": result
			});
		} catch (error) {
			return next(error);
		}
	};
	/////Delete FileIssue
	static deleteFile = async (req, res, next) => {
		const { id } = req.query;
		let data;
		try {
			const exist = await FileSubmission.findOne({ where: { FSRC_ID: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			if (!exist.IsDeleted) {
				data = await FileSubmission.update({ IsDeleted: 1 }, { where: { FSRC_ID: id }, returning: true });
			}
			res.status(200).json({
				status: 200,
				message: "File Submission Deleted successfully",
				"Deleted File": data
			});
		} catch (error) {
			return next(error);
		}
	};

	static createSubReceipt = async (req, res, next) => {
		const id = req.query.id;

		const userId = req.user.id;

		try {
			const { count, rows } = await FileSubmissionDetail.findAndCountAll({
				include: [
					{ as: "User", model: User },
					{ as: "FileSubmission", model: FileSubmission },
					{
						as: "OpenFile",
						model: OpenFile,
						include: [
							{ as: "Phase", model: Phase },
							{ as: "PaymentPlan", model: PaymentPlan },
							{ as: "Sector", model: Sector },
							{ as: "Block", model: Block },
							{ as: "UnitNature", model: UnitNature }
						]
					},
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize }
				],
				where: { FSRC_ID: id },
				row: true
			});
			console.log(rows.length);
			if (rows.length == 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			const file = rows[0];
			console.log(file);

			if (!file) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			file.toJSON();
			// rows.toJSON();

			const pdf = await pdfGenerator.FileReceiptGenerator(file, rows);

			return res.status(200).json({
				status: 200,
				message: "Get File details successfully",
				rows: rows,
				file: { url: `${process.env.APP_URL}/${pdf}` }
			});
		} catch (error) {
			return next(error);
		}
	};
}

module.exports = FileSubmissionController;
