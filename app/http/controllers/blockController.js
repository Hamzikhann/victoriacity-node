const CustomErrorHandler = require("../../services/CustomErrorHandler");
const { Block, Sector } = require("../../models");

class BlockController {
	static create = async (req, res, next) => {
		const { Name, Status, SECT_ID } = req.body;
		// console.log(Name, Status)
		if (!(Name && SECT_ID)) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}

		try {
			const exist = await Block.findOne({ where: { Name: Name } });
			if (exist) {
				return next(CustomErrorHandler.alreadyExist());
			}
			const createBlock = new Block({
				Name,
				Status,
				SECT_ID
			});

			await createBlock.save();

			res.status(200).json({
				status: 200,
				message: "Add Block successfully",
				block: createBlock
			});
		} catch (error) {
			return next(error);
		}
	};
	// SEARCH Block BY ID
	static getBlockById = async (req, res, next) => {
		const blockId = req.query.id;
		// console.log("Aaaa", req.query.id)
		try {
			const block = await Block.findOne({ where: { BLK_ID: blockId } });
			if (!block) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			res.status(200).json({
				status: 200,
				message: "get block successfully",
				block: block
			});
		} catch (error) {
			return next(error);
		}
	};

	// SEARCH Block BY Sec ID
	static getBlockBySecId = async (req, res, next) => {
		const sectId = req.query.id;
		// console.log("Aaaa", req.query.id)
		try {
			const block = await Block.findAll({ where: { SECT_ID: sectId } });
			// if (!block) {
			//     return next(CustomErrorHandler.notFound('Data not found!'))
			// }

			res.status(200).json({
				status: 200,
				message: "get block successfully",
				Blocks: block
			});
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE Blocks
	static get = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		try {
			const { count, rows } = await Block.findAndCountAll({
				include: { as: "Sector", model: Sector },
				offset: limit * page,
				limit: limit,
				order: [["createdAt", "DESC"]]
			});

			if (rows.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all Block Successfully",
				Blocks: rows,
				totalPage: Math.ceil(count / limit) + 1,
				page,
				limit
			});
		} catch (error) {
			return next(error);
		}
	};
	///UPDATE Block
	static update = async (req, res, next) => {
		const blockId = req.query.id;
		let result;
		try {
			const exist = await Block.findOne({ where: { BLK_ID: blockId } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			result = await Block.update(req.body, { where: { BLK_ID: blockId }, returning: true });
			res.status(200).json({
				status: 200,
				message: " Block  updated successfully",
				"Updated Block": result
			});
		} catch (error) {
			return next(error);
		}
	};
	/////Delete BlockIssue

	static delete = async (req, res, next) => {
		const { id } = req.query;
		try {
			const exist = await Block.findOne({ where: { BLK_ID: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const data = await Block.destroy({ where: { BLK_ID: id } });
			res.status(200).json({
				status: 200,
				message: "Block Deleted successfully",
				"Deleted Block": data
			});
		} catch (error) {
			return next(error);
		}
	};
}

//export default BlockController;
module.exports = BlockController;
