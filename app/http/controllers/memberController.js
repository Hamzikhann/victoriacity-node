// import Member from "../../models/Member.js";
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv';

const { Member, MemNominee, TRSRequest } = require("../../models/index.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const { Op } = require("sequelize");
const memberAddress = require("../../models/MemberAddress.js");

dotenv.config();

class MemberController {
	static addMember = async (req, res, next) => {
		console.log("hello");
		const {
			Mem_Reg_Code,
			BuyerName,
			BuyerContact,
			BuyerAddress,
			BuyerCNIC,
			FathersName,
			PermanantAddress,
			DOB,
			Email,
			Relation,
			Rmarks,
			IsActive,
			BuyerSecondContact,
			TRSR_ID,
			memberType
		} = req.body;
		console.log(
			Mem_Reg_Code,
			BuyerName,
			BuyerContact,
			BuyerAddress,
			BuyerCNIC,
			FathersName,
			PermanantAddress,
			DOB,
			Email,
			Relation,
			Rmarks,
			IsActive
		);

		let Image = "";
		if (req.file) {
			Image = req.file.filename;
		}
		console.log("Image", Image);
		if (
			!(
				Mem_Reg_Code &&
				BuyerName &&
				BuyerContact &&
				BuyerAddress &&
				BuyerCNIC &&
				FathersName &&
				PermanantAddress &&
				DOB &&
				Email &&
				Relation &&
				Rmarks &&
				IsActive
			)
		) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}
		try {
			const addMember = await Member.create({
				Mem_Reg_Code: null,
				BuyerName,
				BuyerContact,
				BuyerAddress,
				BuyerCNIC,
				FathersName,
				PermanantAddress,
				DOB,
				Email,
				Relation,
				Rmarks,
				Image,
				IsActive,
				BuyerSecondContact
			});

			if (TRSR_ID) {
				const search = await TRSRequest.findAll({ where: { TRSR_ID: TRSR_ID } });

				if (search.length <= 0) {
					return res.status(404).json({ Message: "NO Transfer Request Available against TRSR_ID" });
				}

				const TRSRequestInstance = search[0]; // Assuming the first result is the one you want to update

				if (memberType == 1) {
					await TRSRequest.update({ BUYER_MEMBER_ID: addMember.MEMBER_ID }, { where: { TRSR_ID: TRSR_ID } });
				}
				if (memberType == 2) {
					await TRSRequest.update({ BUYER_SECOND_MEMBER_ID: addMember.MEMBER_ID }, { where: { TRSR_ID: TRSR_ID } });
				}
			}

			if (!addMember) {
				return next(CustomErrorHandler.alreadyExist());
			}

			res.status(200).json({
				status: 200,
				message: "Add Member successfully",
				Member: addMember
			});
		} catch (error) {
			return next(error);
		}
	};

	// Search Member by Id
	static getMemberById = async (req, res, next) => {
		console.log("helo");
		const MemberId = req.query.id;

		try {
			const member = await Member.findOne({
				include: [{ as: "Member_Adress", model: memberAddress }],
				where: { MEMBER_ID: MemberId }
			});
			if (!member) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			res.status(200).json({
				status: 200,
				message: "get member successfully",
				Member: member
			});
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE Member
	static getAllMember = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		try {
			const { count, rows } = await Member.findAndCountAll({
				offset: limit * page,
				limit: limit,
				order: [["createdAt", "DESC"]],
				include: [{ as: "Member_Adress", model: memberAddress }]
			});

			if (rows.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all Member Successfully",
				member: rows,
				totalPage: Math.ceil(count / limit) + 1,
				page,
				limit
			});
		} catch (error) {
			return next(error);
		}
	};
	// Delete Member

	static deleteMember = async (req, res, next) => {
		const { id } = req.query;

		try {
			const exist = await Member.findOne({ where: { MEMBER_ID: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const data = await Member.destroy({ where: { MEMBER_ID: id } });
			res.status(200).json({
				status: 200,
				message: "Member Deleted successfully",
				"Deleted Member": data
			});
		} catch (error) {
			return next(error);
		}
	};
	// Update Member

	static updateMember = async (req, res, next) => {
		const MemberId = req.query.id;
		try {
			const exist = await Member.findOne({ where: { MEMBER_ID: MemberId } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const result = await Member.update(req.body, { where: { MEMBER_ID: MemberId }, returning: true });
			res.status(200).json({
				status: 200,
				message: " Member  updated successfully",
				"Updated Member": result
			});
		} catch (error) {
			return next(error);
		}
	};

	static getMemberByName = async (req, res, next) => {
		console.log("hello");
		const { search } = req.query;
		console.log("ooooooooooooooooooo", search);
		if (!search) {
			return res.status(400).json({ status: 400, message: "Name required" });
		}
		try {
			const members = await Member.findAll({
				where: {
					BuyerName: {
						[Op.like]: `%${search}%`
					}
				},
				order: [["MEMBER_ID", "DESC"]],
				limit: 20
			});

			if (members.length === 0) {
				return next(CustomErrorHandler.notFound("No matching users found!"));
			}

			res.status(200).json({
				status: 200,
				message: "Get members successfully",
				blocks: members
			});
		} catch (error) {
			return next(error);
		}
	};
	static getMemberByCNIC = async (req, res, next) => {
		console.log("hello");
		const { search } = req.query;
		if (!search) {
			return res.status(400).json({ status: 400, message: "CNIC required" });
		}
		try {
			const members = await Member.findAll({
				where: {
					BuyerCNIC: {
						[Op.like]: `%${search}%`
					}
				},
				order: [["MEMBER_ID", "DESC"]],
				limit: 20
			});

			if (members.length === 0) {
				return next(CustomErrorHandler.notFound("No matching users found!"));
			}

			res.status(200).json({
				status: 200,
				message: "Get members successfully",
				blocks: members
			});
		} catch (error) {
			return next(error);
		}
	};

	////////////

	static getMembersByNomineeid = async (req, res) => {
		const { id } = req.query;
		try {
			const nominees = await MemNominee.findAll({
				where: {
					MEMBER_ID: id
				}
			});

			if (nominees.length === 0) {
				return res.status(404).json({ error: "Nominee not found" });
			}
			const memberIds = nominees.map((nominee) => nominee.MEMBER_ID);
			const members = await Member.findAll({
				where: {
					MEMBER_ID: memberIds
				}
			});
			res.json(members);
		} catch (error) {
			console.error("Error retrieving members:", error);
			res.status(500).json({ error: error });
		}
	};

	static getNomineesByMemId = async (req, res) => {
		const { id } = req.query;
		try {
			const nominees = await MemNominee.findAll({
				where: {
					MEMBER_ID: id
				}
			});

			if (nominees.length === 0) {
				return res.status(404).json({ error: "Nominee not found" });
			}

			res.json(nominees);
		} catch (error) {
			console.error("Error retrieving members:", error);
			res.status(500).json({ error: error });
		}
	};
}

// export default MemberController
module.exports = MemberController;
