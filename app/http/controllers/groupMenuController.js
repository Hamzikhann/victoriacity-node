// const { CallPage } = require("twilio/lib/rest/api/v2010/account/call.js");
const GroupMenu = require("../../models/GroupMenu");
const User_Group = require("../../models/User_Group");
const Menu = require("../../models/Menu");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");

class GroupMenuController {
	static create = async (req, res, next) => {
		const { Group_ID, Menu_ID, Read, Write } = req.body;

		if (!(Group_ID && Menu_ID)) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}
		const Group = await User_Group.findAll({ where: { Group_ID: Group_ID } });
		const Menues = await Menu.findAll({ where: { Menu_ID: Menu_ID } });

		if (Group.length <= 0) {
			return next(CustomErrorHandler.wrongCredentials("Group Not Available against Group_ID"));
		}

		if (Menues.length <= 0) {
			return next(CustomErrorHandler.wrongCredentials("Menu Not Available against Menue_ID"));
		}
		try {
			const createGroupMenu = new GroupMenu({
				Group_ID: Group_ID,
				Menu_ID: Menu_ID,
				Read: Read,
				Write: Write
			});

			await createGroupMenu.save();
			res.status(200).json({
				status: 200,
				message: "Add GroupMenu successfully",
				GroupMenu: createGroupMenu
			});
		} catch (error) {
			return next(error);
		}
	};

	// SEARCH GroupMenu BY ID
	static getGroupMenuById = async (req, res, next) => {
		const GroupMenuId = req.query.id;
		try {
			const GroupMenus = await GroupMenu.findOne({
				include: [
					{ as: "Groups", model: User_Group },
					{ as: "Menus", model: Menu }
				],
				where: { Group_ID: GroupMenuId }
			});
			if (!GroupMenus) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			res.status(200).json({
				status: 200,
				message: "get GroupMenu successfully",
				GroupMenu: GroupMenus
			});
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE GroupMenus
	static get = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		try {
			const { count, rows } = await GroupMenu.findAndCountAll({
				include: [
					{ as: "Groups", model: User_Group },
					{ as: "Menus", model: Menu }
				],
				offset: limit * page,
				limit: limit,
				order: [["createdAt", "DESC"]]
			});

			if (rows.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all GroupMenu Successfully",
				GroupMenu: rows,
				totalPage: Math.ceil(count / limit) + 1,
				page,
				limit
			});
		} catch (error) {
			return next(error);
		}
	};

	///UPDATE GroupMenu
	static update = async (req, res, next) => {
		const GroupMenuId = req.query.id;
		let result;
		try {
			const exist = await GroupMenu.findOne({ where: { id: GroupMenuId } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			result = await GroupMenu.update(req.body, { where: { id: GroupMenuId }, returning: true });
			res.status(200).json({
				status: 200,
				message: " GroupMenu updated successfully",
				"Updated GroupMenu": result
			});
		} catch (error) {
			return next(error);
		}
	};

	/////Delete GroupMenuIssue
	static delete = async (req, res, next) => {
		const { id } = req.query;
		try {
			const exist = await GroupMenu.findOne({ where: { id: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const data = await GroupMenu.destroy({ where: { id: id } });
			return res.status(200).json({
				status: 200,
				message: "GroupMenu Deleted successfully",
				"Deleted GroupMenu": data
			});
		} catch (error) {
			return next(error);
		}
	};
}

module.exports = GroupMenuController;
