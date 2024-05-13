const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { Unit, Block, UnitType, PlotSize, Member, MemNominee, Street } = require("../../models/index.js");

const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const { Op } = require("sequelize");

dotenv.config();

class UnitController {
	static addUnit = async (req, res, next) => {
		// console.log("hello");

		const {
			NameAddress,
			AreaMeasure,
			MeterRef_No,
			BK_ID,
			ST_ID,
			FL_ID,
			UType_ID,
			PS_ID,
			CAT_ID,
			MEMBER_ID,
			MN_ID,
			IsActive,
			IsAvailable,
			IsPossession
		} = req.body;

		if (!(NameAddress && AreaMeasure && MeterRef_No && BK_ID && ST_ID && UType_ID && PS_ID && MEMBER_ID && MN_ID)) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}
		try {
			const createUnit = new Unit({
				NameAddress,
				AreaMeasure,
				MeterRef_No,
				BK_ID,
				ST_ID,
				UType_ID,
				PS_ID,
				MEMBER_ID,
				MN_ID,
				IsActive,
				IsPossession
			});

			await createUnit.save();

			res.status(200).send({
				status: 200,
				message: "Add Unit successfully",
				Unit: createUnit
			});
		} catch (error) {
			return next(error);
		}
	};
	// SEARCH Unit BY ID
	static getUnitById = async (req, res, next) => {
		const UnitId = req.query.id;
		try {
			const unit = await Unit.findOne({
				include: [
					{ as: "Block", model: Block },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "Street", model: Street }
				],
				where: { ID: UnitId }
			});
			if (!unit) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			res.status(200).json({
				status: 200,
				message: "get unit successfully",
				unit: unit
			});
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE Units
	static getAllUnit = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		try {
			const { count, rows } = await Unit.findAndCountAll({
				include: [
					{ as: "Block", model: Block },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "Street", model: Street }
				],
				where: { IsDeleted: 0 },
				offset: limit * page,
				limit: limit,
				order: [["createdAt", "DESC"]]
			});

			if (rows.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all unit Successfully",
				Units: rows,
				totalPage: Math.ceil(count / limit) + 1,
				page,
				limit
			});
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE Units
	static getAllUnits = async (req, res, next) => {
		try {
			const units = await Unit.findAll({
				include: [
					{ as: "Block", model: Block },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "Street", model: Street }
				],
				where: { IsDeleted: 0 },
				order: [["createdAt", "DESC"]]
			});

			if (units.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all unit Successfully",
				Units: units
			});
		} catch (error) {
			return next(error);
		}
	};
	///UPDATE Unit
	static updateUnit = async (req, res, next) => {
		const UnitId = req.query.id;
		try {
			const exist = await Unit.findOne({ where: { ID: UnitId } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const result = await Unit.update(req.body, { where: { ID: UnitId }, returning: true });
			res.status(200).json({
				status: 200,
				message: " Unit  updated successfully",
				"Updated Unit": result
			});
		} catch (error) {
			return next(error);
		}
	};
	/////Delete Unit

	static deleteUnit = async (req, res, next) => {
		const { id } = req.query;

		try {
			const exist = await Unit.findOne({ where: { ID: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const data = await Unit.update({ IsDeleted: 1 }, { where: { ID: id } });
			res.status(200).json({
				status: 200,
				message: "Unit Deleted successfully",
				"Deleted Unit": data
			});
		} catch (error) {
			return next(error);
		}
	};

	static createUnitForPlot = async (req, res, next) => {
		try {
			const { unitName, BLK_ID, UType_ID, Plot_No, PS_ID } = req.body;
			// console.log("DATA",req.body)
			if (!(BLK_ID && UType_ID && Plot_No && PS_ID)) {
				return res.status(400).json({ status: 400, Message: "All feilds are Required" });
			}
			const createUnit = await Unit.create({
				NameAddress: unitName,
				BLK_ID: BLK_ID,
				UType_ID: UType_ID,
				Plot_No: Plot_No,
				PS_ID: PS_ID
			});
			return res.status(200).json({
				status: 200,
				Message: "Fetch Data Successfully",
				data: createUnit
			});
		} catch (error) {
			next(error);
		}
	};
	static unitFilters = async (req, res, next) => {
		const { BLK_ID, UType_ID, PS_ID } = req.query;

		if (!req.query) {
			return next(CustomErrorHandler.notFound("At least one field is required"));
		}
		try {
			let filter = {};

			if (BLK_ID) {
				filter.BLK_ID = parseInt(BLK_ID, 10);
			}

			if (UType_ID) {
				filter.UType_ID = parseInt(UType_ID, 10);
			}

			if (PS_ID) {
				filter.PS_ID = parseInt(PS_ID, 10);
			}

			let data = await Unit.findAll({
				include: [
					{ as: "Block", model: Block },
					{ as: "UnitType", model: UnitType },
					{ as: "PlotSize", model: PlotSize },
					{ as: "Member", model: Member },
					{ as: "MemNominee", model: MemNominee },
					{ as: "Street", model: Street }
				],
				where: {
					[Op.or]: [filter]
				}
			});

			if (data.length <= 0) {
				return next(CustomErrorHandler.notFound("Data not found"));
			}

			return res.status(200).json({
				status: 200,
				message: "Get Booking successfully",
				data: data
			});
		} catch (error) {
			return next(error);
		}
	};
}

// export default UnitController;
module.exports = UnitController;
