const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const UnvarifiedTransactions = require("../../models/UnVarifiedTransactions.js");

dotenv.config();

class UnvarifiedTransactionController {
	static addUnvarifiedTransaction = async (req, res, next) => {
		const { payeeName, bookingRegNo, recieptHead, paymentMode, amount, instrumentNo, instrumentDate } = req.body;
		// console.log({payeeName,bookingRegNo,recieptHead,paymentMode,amount,instrumentNo,instrumentDate});
		if (payeeName && bookingRegNo && recieptHead && paymentMode && amount && instrumentNo && instrumentDate) {
			try {
				const createUnvarifiedTransaction = new UnvarifiedTransactions({
					payeeName: payeeName,
					bookingRegNo: bookingRegNo,
					recieptHead: recieptHead,
					paymentMode: paymentMode,
					amount: amount,
					instrumentNo: instrumentNo,
					instrumentDate: instrumentDate
				});

				await createUnvarifiedTransaction.save();

				res.status(200).send({
					status: 200,
					message: "Add UnVarifiedTransaction successfully",
					UnvarifiedTransaction: createUnvarifiedTransaction
				});
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Add UnVarifiedTransaction"
				});
			}
		} else {
			res.status(400).send({
				status: 400,
				message: "All fields are required"
			});
		}
	};
	// SEARCH UnvarifiedTransaction BY ID
	static getUnVarifiedTransactionById = async (req, res, next) => {
		const UnVarifiedTransactionId = req.query.id;
		// console.log(req.query)
		// try {
		const UnVarifiedTransactionById = await UnvarifiedTransactions.findAll({ where: { id: UnVarifiedTransactionId } });
		if (UnVarifiedTransactionById.length > 0) {
			res.status(200).send({
				status: 200,
				message: "get UnvarifiedTransaction successfully",
				UnVarifiedTransaction: UnVarifiedTransactionById
			});
		} else {
			res.status(400).send({
				status: 404,
				message: "No UnVarifiedTransaction Found against id"
			});
		}
		// } catch (error) {
		//     return next(error)
		// }
	};
	// GET ALL AVAILABLE UnvarifiedTransactions
	static getAllUnvarifiedTransactions = async (req, res) => {
		const allUnvarifiedTransactions = await UnvarifiedTransactions.findAll();

		if (allUnvarifiedTransactions.length > 0) {
			res.status(200).send({
				status: 200,
				message: "Get all UnvarifiedTransaction Successfully",
				UnvarifiedTransactions: allUnvarifiedTransactions
			});
		} else {
			res.status(404).send({
				status: 404,
				message: "No UnvarifiedTransaction Found"
			});
		}
	};
	///UPDATE UnvarifiedTransaction
	static updateUnvarifiedTransaction = async (req, res, next) => {
		const { payeeName, bookingRegNo, recieptHead, paymentMode, amount, instrumentNo, instrumentDate } = req.body;
		const UnvarifiedTransactionId = req.query.id;
		try {
			const result = await UnvarifiedTransactions.findAll({ where: { id: UnvarifiedTransactionId } });

			if (result) {
				const UnvarifiedTransactionById = await UnvarifiedTransactions.update(
					{
						payeeName: payeeName,
						bookingRegNo: bookingRegNo,
						recieptHead: recieptHead,
						paymentMode: paymentMode,
						amount: amount,
						instrumentNo: instrumentNo,
						instrumentDate: instrumentDate
					},
					{ where: { id: UnvarifiedTransactionId } }
				);

				res.status(200).send({
					status: 200,
					message: " UnvarifiedTransaction  updated successfully",
					"Updated UnvarifiedTransaction": result
				});
			} else {
				res.status(200).send({
					status: 200,
					message: "No UnvarifiedTransaction Found against id"
				});
			}
		} catch (error) {
			return next(error);
		}
	};
	/////Delete UnvarifiedTransaction

	static deleteUnvarifiedTransaction = async (req, res) => {
		const { id } = req.query;

		if (id) {
			try {
				const result = await UnvarifiedTransactions.findAll({ where: { id: id } });

				if (result.length > 0) {
					UnvarifiedTransactions.destroy({
						where: {
							id: id
						}
					});

					res.status(200).send({
						status: 200,
						message: "UnvarifiedTransaction Deleted successfully",
						"Deleted UnvarifiedTransaction": result
					});
				} else {
					res.status(400).send({
						status: 404,
						message: "UnvarifiedTransaction not found"
					});
				}
			} catch (error) {
				console.log(error);
				res.status(400).send({
					status: 400,
					message: "Unable to Deleted UnvarifiedTransaction"
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

module.exports = UnvarifiedTransactionController;
