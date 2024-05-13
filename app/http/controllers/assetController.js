const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Asset = require("../../models/Asset");
const AssetType = require("../../models/AssetType");
const employeeAsset = require("../../models/EmployeeAsset");
dotenv.config();

class AssetController {
	static addAsset = async (req, res, next) => {
		const { name, type, model, description, expiryDate, quantity, addedDate, brand } = req.body;
		if (name && type && model && description && expiryDate && quantity && addedDate) {
			const result = await AssetType.findAll({ where: { id: type } });
			const AssetValidation = await Asset.findAll({ where: { name: name, model: model } });
			if (AssetValidation.length <= 0) {
				if (result.length > 0) {
					// console.log({
					//     name, type, model, description, expiryDate, quantity, addedDate, brand,
					// });
					try {
						const createAsset = new Asset({
							name: name,
							type: type,
							model: model,
							description: description,
							expiryDate: expiryDate,
							quantity: quantity,
							addedDate: addedDate,
							brand: brand
						});

						await createAsset.save();

						res.status(200).send({
							status: 200,
							message: "Add Asset successfully",
							Assets: createAsset
						});
					} catch (error) {
						error;
						res.status(400).send({
							status: 400,
							message: "Unable to Add Asset"
						});
					}
				} else {
					res.status(400).send({
						status: 400,
						message: "No Asset Type Found"
					});
				}
			} else {
				return res.status(400).send({
					status: 400,
					message: "Asset Already Exist"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "All fields are required"
			});
		}
	};
	// //SEARCH Asset BY ID
	static getAssetById = async (req, res, next) => {
		const asetId = req.query.id;
		// console.log("quu", req.query);
		try {
			const asetById = await Asset.findAll({ include: [{ as: "AssetType", model: AssetType }], where: { id: asetId } });
			if (asetById.length > 0) {
				res.status(200).send({
					status: 200,
					message: "get Asset successfully",
					Asset: asetById
				});
			} else {
				res.status(400).send({
					status: 404,
					message: "No Asset Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};

	static getAssetByEmployeeId = async (req, res, next) => {
		const employeeId = req.query.emId;
		// console.log(req.query);
		try {
			const asetById = await employeeAsset.findAll({
				include: [{ as: "AssetType", model: AssetType }],
				where: { employeeId: employeeId }
			});
			if (asetById.length > 0) {
				res.status(200).send({
					status: 200,
					message: "get Asset successfully",
					Asset: asetById
				});
			} else {
				res.status(400).send({
					status: 404,
					message: "No Asset Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE AssetS
	static getAllAsset = async (req, res) => {
		const allAsset = await Asset.findAll({
			order: [["createdAt", "DESC"]],
			include: [{ as: "AssetType", model: AssetType }]
		});
		// console.log("called");
		if (allAsset !== null) {
			res.status(200).send({
				status: 200,
				message: "Get all Asset successfully",
				Asset: allAsset
			});
		} else {
			res.status(200).send({
				status: 404,
				message: "No Asset present"
			});
		}
	};
	///UPDATE Asset
	static updateAsset = async (req, res, next) => {
		const { name, type, model, description, expiryDate, quantity, addedDate, brand } = req.body;
		const asetId = req.query.id;
		try {
			const result = await Asset.findAll({ where: { id: asetId } });

			if (result) {
				const asetById = await Asset.update(
					{
						name: name,
						type: type,
						model: model,
						description: description,
						expiryDate: expiryDate,
						quantity: quantity,
						addedDate: addedDate,
						brand: brand
					},
					{ where: { id: asetId } }
				);

				res.status(200).send({
					status: 200,
					message: " Asset updated successfully",
					Asset: asetById
				});
			} else {
				res.status(200).send({
					status: 200,
					message: "No Asset Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	/////Delete Asset

	static deleteAsset = async (req, res) => {
		const asetId = req.query.id;
		if (asetId) {
			try {
				const result = await Asset.findAll({ where: { id: asetId } });

				if (result.length > 0) {
					Asset.destroy({
						where: {
							id: asetId
						}
					});

					res.status(200).send({
						status: 200,
						message: "Asset Deleted successfully",
						"Deleted Asset": result
					});
				} else {
					res.status(400).send({
						status: 404,
						message: "Asset not found"
					});
				}
			} catch (error) {
				// console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Deleted Asset"
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

// export default AssetController;
module.exports = AssetController;
