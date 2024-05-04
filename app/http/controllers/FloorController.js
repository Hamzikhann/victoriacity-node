const { Floor } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class FloorController {

    static addFloor = async (req, res, next) => {

        Nominee_ID
        if (!(Name && Abbrev)) {
            return next(
                CustomErrorHandler.wrongCredentials("All fields are required!")
            );
        }
        try {
            const [row, created] = await Floor.findOrCreate({
                where: { Name: Name }, defaults: {
                    Name, Abbrev, IsActive
                }
            })
            if (!created) {
                return next(CustomErrorHandler.alreadyExist())
            }
            res.status(200).json({
                "status": 200,
                "message": "Add Floor successfully",
                "floor": row,
            });

        } catch (error) {
            return next(error);
        }
    }
    // SEARCH Floor BY ID
    static getFloorById = async (req, res, next) => {
        const FloorId = req.query.id;

        try {
            const floorById = await Floor.findByPk(FloorId);

            if (!floorById) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                "status": 200,
                "message": "get floor successfully",
                "floor": floorById
            })
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE Floors
    static getAllFloor = async (req, res, next) => {
        const page = (parseInt(req.query.page)-1) || 0
        const limit = parseInt(req.query.limit) || 25
        try {
            const { count, rows } = await Floor.findAndCountAll({
                offset: limit * page,
                limit: limit,
                order: [["createdAt", "DESC"]]
            });
            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                "status": 200,
                "message": "Get all Floor Successfully",
                "floors": rows,
                totalPage: (Math.ceil(count / limit)+1),
                page,
                limit
            })
        } catch (error) {
            return next(error);
        }
    }
    ///UPDATE Floor
    static updateFloor = async (req, res, next) => {
        const floorId = req.query.id
        try {
            const exist = await Floor.findOne({ where: { FL_ID: floorId } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const result = await Floor.update(req.body, { where: { FL_ID: floorId } })
            res.status(200).json({
                "status": 200,
                "message": " Floor  updated successfully",
                "Updated Floor": result
            })

        } catch (error) {
            return next(error)
        }
    }
    /////Delete FloorIssue 

    static deleteFloor = async (req, res) => {
        const { id } = req.query;
        try {
            const exist = await Floor.findOne({ where: { FL_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }

            const result = await Floor.destroy({ where: { FL_ID: id }, returning: true });
            res.status(200).json({
                "status": 200,
                "message": "Floor Deleted successfully",
                "Deleted Floor": result
            })
        } catch (error) {
            return next(error)
        }

    }
}

// export default FloorController;  
module.exports = FloorController
