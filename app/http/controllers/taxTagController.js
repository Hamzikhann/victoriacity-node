const CustomErrorHandler = require("../../services/CustomErrorHandler");
const { TaxTag } = require("../../models");

class TaxTagController {
	static create = async (req, res, next) => {
		const { Name } = req.body;
		// console.log(Name)
		if (!Name) {
			return next(CustomErrorHandler.wrongCredentials("Name is required!"));
		}
		try {
			const taxTag = new TaxTag({
				Name
			});

			await taxTag.save();

			res.status(200).json({
				status: 200,
				message: "Add TaxTag successfully",
				taxTag: taxTag
			});
		} catch (error) {
			return next(error);
		}
	};
	// SEARCH TaxTag BY ID
	static getTaxTagById = async (req, res, next) => {
		const taxTagId = req.query.id;
		try {
			const taxTag = await TaxTag.findOne({ where: { TT_ID: taxTagId } });
			if (!taxTag) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			res.status(200).json({
				status: 200,
				message: "get taxTag successfully",
				taxTag: taxTag
			});
		} catch (error) {
			return next(error);
		}
	};

	// GET ALL AVAILABLE TaxTags
	static get = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		try {
			const { count, rows } = await TaxTag.findAndCountAll({
				offset: limit * page,
				limit: limit,
				order: [["createdAt", "DESC"]]
			});

			if (rows.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all TaxTag Successfully",
				TaxTags: rows,
				totalPage: Math.ceil(count / limit) + 1,
				page,
				limit
			});
		} catch (error) {
			return next(error);
		}
	};
	///UPDATE TaxTag
	static update = async (req, res, next) => {
		const taxTagId = req.query.id;
		let result;
		try {
			const exist = await TaxTag.findOne({ where: { TT_ID: taxTagId } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			result = await TaxTag.update(req.body, { where: { TT_ID: taxTagId }, returning: true });
			res.status(200).json({
				status: 200,
				message: " TaxTag  updated successfully",
				"Updated TaxTag": result
			});
		} catch (error) {
			return next(error);
		}
	};
	/////Delete TaxTagIssue

	static delete = async (req, res, next) => {
		const { id } = req.query;
		try {
			const exist = await TaxTag.findOne({ where: { TT_ID: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const data = await TaxTag.destroy({ where: { TT_ID: id } });
			res.status(200).json({
				status: 200,
				message: "TaxTag Deleted successfully",
				"Deleted TaxTag": data
			});
		} catch (error) {
			return next(error);
		}
	};
}

//export default TaxTagController;
module.exports = TaxTagController;
