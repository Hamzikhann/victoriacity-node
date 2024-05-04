// const { CallPage } = require("twilio/lib/rest/api/v2010/account/call.js");
const Menu = require("../../models/Menu");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");

class MenuController {
	// GET ALL AVAILABLE Menus
	static get = async (req, res, next) => {
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 25;
		try {
			const { count, rows } = await Menu.findAndCountAll({
				offset: limit * page,
				limit: limit,
				order: [["createdAt", "DESC"]]
			});

			if (rows.length === 0) {
				return next(CustomErrorHandler.notFound("Data not found!"));
			}
			return res.status(200).json({
				status: 200,
				message: "Get all Menu Successfully",
				Menu: rows,
				totalPage: Math.ceil(count / limit) + 1,
				page,
				limit
			});
		} catch (error) {
			return next(error);
		}
	};

	// ///UPDATE Menu
	// static update = async (req, res, next) => {
	//     const MenuId = req.query.id
	//     let result;
	//     try {
	//         const exist = await Menu.findOne({ where: { Menu_ID: MenuId } })
	//         if (!exist) {
	//             return next(CustomErrorHandler.notFound("Data not found!"))
	//         }
	//         result = await Menu.update(req.body, { where: { Menu_ID: MenuId }, returning: true })
	//         res.status(200).json({
	//             "status": 200,
	//             "message": " Menu updated successfully",
	//             "Updated Menu": result
	//         })
	//     } catch (error) {
	//         return next(error)
	//     }

	// }
	// /////Delete MenuIssue

	// static delete = async (req, res,next) => {
	//     const { id } = req.query;
	//     try {
	//         const exist = await Menu.findOne({ where: { Menu_ID: id } })
	//         if (!exist) {
	//             return next(CustomErrorHandler.notFound("Data not found!"))
	//         }
	//         const data = await Menu.destroy({ where: { Menu_ID: id } });
	//        return res.status(200).json({
	//             "status": 200,
	//             "message": "Menu Deleted successfully",
	//             "Deleted Menu": data
	//         })
	//     } catch (error) {
	//         return next(error)
	//     }
	// }
	// static create = async (req, res, next) => {
	//     const {Title,Is_Deleted,Path } = req.body

	//     if (!( Title)) {
	//         return next(
	//             CustomErrorHandler.wrongCredentials("All fields are required!")
	//         );
	//     }
	//     try {

	//         const createMenu = new Menu({
	//             Title: Title,
	//             Is_Deleted: Is_Deleted,
	//             Path:Path
	//         })

	//         await createMenu.save();
	//         res.status(200).json({
	//             "status": 200,
	//             "message": "Add Menu successfully",
	//             "Menu": createMenu,
	//         });
	//     } catch (error) {
	//         return next(error);
	//     }

	// }

	// // SEARCH Menu BY ID
	// static getMenuById = async (req, res, next) => {
	//     const MenuId = req.query.id
	//     try {
	//         const Menus = await Menu.findOne({ where: { Menu_ID: MenuId } })
	//         if (!Menus) {
	//             return next(CustomErrorHandler.notFound('Data not found!'))
	//         }
	//         res.status(200).json({
	//             "status": 200,
	//             "message": "get Menu successfully",
	//             "Menu": Menus
	//         })

	//     } catch (error) {
	//         return next(error)
	//     }
	// }
}

module.exports = MenuController;
