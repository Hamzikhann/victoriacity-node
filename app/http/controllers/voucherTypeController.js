const { VoucherType } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class VoucherTypeController {
	static create = async (req, res, next) => {
		const { Vouch_Type_NAME, Descrip } = req.body;
		if (!(Vouch_Type_NAME && Descrip)) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}
		try {
			const exist = await VoucherType.findOne({ where: { Vouch_Type_NAME: Vouch_Type_NAME } });
			if (exist) {
				return next(CustomErrorHandler.alreadyExist());
			}

			const voucherType = new VoucherType({
				Vouch_Type_NAME,
				Descrip
			});

			await voucherType.save();
			res.status(200).json({
				status: 200,
				message: "Add VoucherType successfully",
				VoucherType: voucherType
			});
		} catch (error) {
			return next(error);
		}
	};
	// SEARCH Phase BY ID
	static getVoucherTypeById = async (req, res, next) => {
		const id = req.query.id;
		try {
			const voucherTypeId = await VoucherType.findOne({ where: { Vouch_Type_ID: id } });
			if (!voucherTypeId) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}

			res.status(200).json({
				status: 200,
				message: "get voucherType successfully",
				voucherType: voucherTypeId
			});
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE Phases
	static get = async (req, res, next) => {
		try {
			const voucherType = await VoucherType.findAll();

			if (voucherType.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all voucherType Successfully",
				VoucherType: voucherType
			});
		} catch (error) {
			return next(error);
		}
	};
	///UPDATE Phase
	static update = async (req, res, next) => {
		const { id } = req.query;
		// console.log(id)
		let result;
		try {
			const exist = await VoucherType.findOne({ where: { Vouch_Type_ID: id } });
			// console.log(exist)
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			result = await VoucherType.update(req.body, { where: { Vouch_Type_ID: id }, returning: true });
			res.status(200).json({
				status: 200,
				message: " VoucherType  updated successfully",
				"Updated voucherType": result
			});
		} catch (error) {
			return next(error);
		}
	};
	/////Delete PhaseIssue

	static delete = async (req, res, next) => {
		const { id } = req.query;
		try {
			const exist = await VoucherType.findOne({ where: { Vouch_Type_ID: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const data = await VoucherType.destroy({ where: { PHS_ID: id } });
			res.status(200).json({
				status: 200,
				message: "VoucherType Deleted successfully",
				"Deleted VoucherType": data
			});
		} catch (error) {
			return next(error);
		}
	};
}

// export default PhaseController;
module.exports = VoucherTypeController;
