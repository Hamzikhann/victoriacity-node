// const { CallPage } = require("twilio/lib/rest/api/v2010/account/call.js");
const UserGroup = require("../../models/User_Group.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const GroupMenu = require("../../models/GroupMenu.js");

class UserGroupController {
	static create = async (req, res, next) => {
		const { GROUP_NAME, GROUP_DESCRIPTION, menus } = req.body;

		if (!GROUP_NAME) {
			return next(CustomErrorHandler.wrongCredentials("All fields are required!"));
		}
		try {
			const createUserGroup = await UserGroup.create({
				GROUP_NAME: GROUP_NAME,
				GROUP_DESCRIPTION: GROUP_DESCRIPTION
			});
			createUserGroup.toJSON();
			if (createUserGroup) {
				menus.map(async (item) => {
					await GroupMenu.create({
						Group_ID: createUserGroup.Group_ID,
						Menu_ID: item,
						Read: 1,
						Write: 1
					});
				});
			}
			res.status(200).json({
				status: 200,
				message: "Add UserGroup successfully",
				UserGroup: createUserGroup
			});
		} catch (error) {
			return next(error);
		}
	};

	// SEARCH UserGroup BY ID
	static getUserGroupById = async (req, res, next) => {
		const UserGroupId = req.query.id;
		try {
			const UserGroups = await UserGroup.findOne({
				where: { Group_ID: UserGroupId }
			});
			if (!UserGroups) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			res.status(200).json({
				status: 200,
				message: "get UserGroup successfully",
				UserGroup: UserGroups
			});
		} catch (error) {
			return next(error);
		}
	};
	// GET ALL AVAILABLE UserGroups
	static get = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		try {
			const { count, rows } = await UserGroup.findAndCountAll({
				offset: limit * page,
				limit: limit,
				order: [["createdAt", "DESC"]]
			});

			if (rows.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all UserGroup Successfully",
				UserGroup: rows,
				totalPage: Math.ceil(count / limit) + 1,
				page,
				limit
			});
		} catch (error) {
			return next(error);
		}
	};
	///UPDATE UserGroup
	static update = async (req, res, next) => {
		const UserGroupId = req.query.id;
		let result;
		try {
			const exist = await UserGroup.findOne({
				where: { Group_ID: UserGroupId }
			});
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			result = await UserGroup.update(req.body, {
				where: { Group_ID: UserGroupId },
				returning: true
			});
			res.status(200).json({
				status: 200,
				message: " UserGroup updated successfully",
				"Updated UserGroup": result
			});
		} catch (error) {
			return next(error);
		}
	};
	/////Delete UserGroupIssue

	static delete = async (req, res, next) => {
		const { id } = req.query;
		try {
			const exist = await UserGroup.findOne({ where: { Group_ID: id } });
			if (!exist) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			const data = await UserGroup.destroy({ where: { Group_ID: id } });
			return res.status(200).json({
				status: 200,
				message: "UserGroup Deleted successfully",
				"Deleted UserGroup": data
			});
		} catch (error) {
			return next(error);
		}
	};
}

module.exports = UserGroupController;
