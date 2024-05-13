const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const AssetType = require("../../models/AssetType.js");
dotenv.config();
class AssetTypeController {
	static addAssetType = async (req, res, next) => {
		const { name, status } = req.body;
		//    console.log({name,status});
		if (name && status) {
			try {
				const createAssetType = new AssetType({
					name: name,
					status: status
				});

				await createAssetType.save();

				res.status(200).send({
					status: 200,
					message: "Add AssetType successfully",
					AssetTypes: createAssetType
				});
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Add AssetType"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "All fields are required"
			});
		}
	};
	// //SEARCH Asset Type BY ID
	static getAssetTypeById = async (req, res, next) => {
		const asetTypeId = req.query.id;
		// console.log(req.query)
		try {
			const asetTypeById = await AssetType.findAll({ where: { id: asetTypeId } });
			if (asetTypeById.length > 0) {
				res.status(200).send({
					status: 200,
					message: "get AssetType successfully",
					AssetType: asetTypeById
				});
			} else {
				res.status(400).send({
					status: 404,
					message: "No AssetType Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE PROJECTS
	static getAllAssetType = async (req, res) => {
		const allAssetType = await AssetType.findAll({ order: [["createdAt", "DESC"]] });

		if (allAssetType !== null) {
			res.status(200).send({
				status: 200,
				message: "Get all AssetType successfully",
				AssetType: allAssetType
			});
		} else {
			res.status(200).send({
				status: 404,
				message: "No AssetType present"
			});
		}
	};
	///UPDATE PROJECT
	static updateAssetType = async (req, res, next) => {
		const { name, status } = req.body;
		const asetTypeId = req.query.id;
		try {
			const result = await AssetType.findAll({ where: { id: asetTypeId } });

			if (result) {
				const asetTypeById = await AssetType.update(
					{
						name: name,
						status: status
					},
					{ where: { id: asetTypeId } }
				);

				res.status(200).send({
					status: 200,
					message: " AssetType updated successfully",
					AssetType: asetTypeById
				});
			} else {
				res.status(200).send({
					status: 200,
					message: "No AssetType Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	/////Delete AssetType

	static deleteAssetType = async (req, res) => {
		const asetTypeId = req.query.id;
		if (asetTypeId) {
			try {
				const result = await AssetType.findAll({ where: { id: asetTypeId } });

				if (result.length > 0) {
					AssetType.destroy({
						where: {
							id: asetTypeId
						}
					});

					res.status(200).send({
						status: 200,
						message: "AssetType Deleted successfully",
						"Deleted AssetType": result
					});
				} else {
					res.status(400).send({
						status: 404,
						message: "AssetType not found"
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Deleted AssetType"
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

// export default AssetTypeController;
module.exports = AssetTypeController;
