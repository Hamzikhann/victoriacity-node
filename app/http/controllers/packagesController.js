const {
	PaymentPlan,

	UnitType,
	PlotSize,
	sequelize
} = require("../../models/index.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const pdfGenerator = require("../../services/PdfGenerator.js");

class PackagesController {
	static addPackage = async (req, res, next) => {
		const {
			Name,
			Auto_Name,
			Type,
			INS_Start_Date,
			PS_ID,
			UType_ID,
			Total_Amt,
			Advance_Amt,
			TotalRemainNet_Amt,
			Ballot_Amt,
			Possession_Amt,
			ByAnnual_Charges,
			ByAnnual_TimePeriod,
			InstallmentAmount,
			No_Of_Installments,
			Plan_Years,
			USER_ID,
			IsActive,
			DC_START_DATE,
			DC_NO_OF_INSTALLMENT,
			DC_INSTALLMENT_AMOUNT,
			DC_TOTAL_AMOUNT,
			downPayment,
			IncludeDC,
			IncludeLC
		} = req.body;

		if (
			!(
				Name &&
				Auto_Name &&
				INS_Start_Date &&
				PS_ID &&
				UType_ID &&
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
				USER_ID
			)
		) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}
		// try {
		let maxId = await PaymentPlan.max("PP_ID");
		const [row, created] = await PaymentPlan.findOrCreate({
			where: { PP_Code: ++maxId || 1 },
			defaults: {
				Name: Name,
				Auto_Name: Auto_Name,
				INS_Start_Date: INS_Start_Date,
				PS_ID: PS_ID,
				UType_ID: UType_ID,
				Type: Type,
				Total_Amt: Total_Amt,
				Advance_Amt: Advance_Amt,
				TotalRemainNet_Amt: TotalRemainNet_Amt,
				Ballot_Amt: Ballot_Amt,
				Possession_Amt: Possession_Amt,
				ByAnnual_Charges: ByAnnual_Charges,
				ByAnnual_TimePeriod: ByAnnual_TimePeriod,
				InstallmentAmount: InstallmentAmount,
				No_Of_Installments,
				Plan_Years,
				DC_START_DATE,
				DC_NO_OF_INSTALLMENT,
				DC_INSTALLMENT_AMOUNT,
				DC_TOTAL_AMOUNT,
				USER_ID,
				IsActive,
				downPayment,
				IncludeDC,
				IncludeLC
			}
		});
		if (!created) {
			return next(CustomErrorHandler.alreadyExist());
		}

		res.status(200).send({
			status: 200,
			message: "Add Package successfully",
			Package: row
		});
		// } catch (error) {
		//   return next(error);
		// }
	};
	// SEARCH Package BY ID
	static getPackageById = async (req, res, next) => {
		const PackageId = req.query.id;

		// console.log(PackageId);
		// try {
		const PackageById = await PaymentPlan.findAll({
			include: [
				{ as: "PlotSize", model: PlotSize },
				{ as: "UnitType", model: UnitType }
			],
			where: { PP_ID: PackageId }
		});
		if (PackageById.length > 0) {
			res.status(200).send({
				status: 200,
				message: "get Package successfully",
				Package: PackageById
			});
		} else {
			res.status(400).send({
				status: 404,
				message: "No Package Found against id"
			});
		}
		// } catch (error) {
		//     return next(error)
		// }
	};
	// GET ALL AVAILABLE Packages
	static getAllPackages = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		try {
			const { count, rows } = await PaymentPlan.findAndCountAll({
				include: [
					{ as: "PlotSize", model: PlotSize },
					{ as: "UnitType", model: UnitType }
				],
				offset: limit * page,
				limit: limit,
				order: [["createdAt", "DESC"]]
			});
			if (!(rows.length > 0)) {
				return next(CustomErrorHandler.notFound("Payment Plans not found!"));
			}
			res.status(200).send({
				status: 200,
				message: "Get all Package Successfully",
				Packages: rows,
				totalPage: Math.ceil(count / limit) + 1,
				page,
				limit
			});
		} catch (error) {
			return next(error);
		}
	};
	///UPDATE Package
	static updatePackage = async (req, res, next) => {
		const {
			PP_Code,
			Name,
			Auto_Name,
			INS_Start_Date,
			PS_ID,
			Type,
			UType_ID,
			Total_Amt,
			Advance_Amt,
			TotalRemainNet_Amt,
			Ballot_Amt,
			Possession_Amt,
			ByAnnual_Charges,
			ByAnnual_TimePeriod,
			InstallmentAmount,
			DC_START_DATE,
			DC_NO_OF_INSTALLMENT,
			DC_INSTALLMENT_AMOUNT,
			DC_TOTAL_AMOUNT,
			IsActive,
			downPayment,
			IncludeDC,
			IncludeLC
		} = req.body;

		const PackageId = req.query.id;
		try {
			const result = await PaymentPlan.findAll({ where: { PP_ID: PackageId } });

			if (result) {
				const PackageById = await PaymentPlan.update(
					{
						PP_Code: PP_Code,
						Name: Name,
						Auto_Name: Auto_Name,
						INS_Start_Date: INS_Start_Date,
						PS_ID: PS_ID,
						UType_ID: UType_ID,
						Total_Amt: Total_Amt,
						Type: Type,
						Advance_Amt: Advance_Amt,
						TotalRemainNet_Amt: TotalRemainNet_Amt,
						Ballot_Amt: Ballot_Amt,
						Possession_Amt: Possession_Amt,
						ByAnnual_Charges: ByAnnual_Charges,
						ByAnnual_TimePeriod: ByAnnual_TimePeriod,
						InstallmentAmount: InstallmentAmount,
						DC_START_DATE,
						DC_NO_OF_INSTALLMENT,
						DC_INSTALLMENT_AMOUNT,
						DC_TOTAL_AMOUNT,
						IsActive: IsActive,
						downPayment,
						IncludeDC,
						IncludeLC
					},
					{ where: { PP_ID: PackageId } }
				);

				res.status(200).send({
					status: 200,
					message: " Package  updated successfully",
					"Updated Package": PackageById
				});
			} else {
				res.status(200).send({
					status: 200,
					message: "No Package Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	/////Delete Package

	static deletePackage = async (req, res) => {
		const { id } = req.query;

		if (id) {
			try {
				const result = await PaymentPlan.findAll({ where: { PP_ID: id } });

				if (result.length > 0) {
					PaymentPlan.destroy({
						where: {
							PP_ID: id
						}
					});

					res.status(200).send({
						status: 200,
						message: "Package Deleted successfully",
						"Deleted Package": result
					});
				} else {
					res.status(400).send({
						status: 404,
						message: "Package not found"
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Deleted Package"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "ID IS REQUIRED"
			});
		}
	};
}

// export default PackageController;
module.exports = PackagesController;
