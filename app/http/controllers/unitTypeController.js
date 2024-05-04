const { UnitType } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class UnitTypeController {

    static create = async (req, res, next) => {
        const { Name, Abbrev, Status } = req.body

        if (!(Name && Abbrev)) {
            return next(
                CustomErrorHandler.wrongCredentials("All fields are required!")
            );
        }
        try {
            const exist = await UnitType.findOne({ where: { Name: Name } })
            if (exist) {
                return next(CustomErrorHandler.alreadyExist())
            }

            const createUnitType = new UnitType({
                Name: Name,
                Abbrev: Abbrev,
                Status: Status
            })

            await createUnitType.save();
            res.status(200).json({
                "status": 200,
                "message": "Add UnitType successfully",
                "UnitType": createUnitType,
            });
        } catch (error) {
            return next(error);
        }

    }

    // SEARCH UnitType BY ID
    static getUnitTypeById = async (req, res, next) => {
        const UnitTypeId = req.query.id
        try {
            const unitTypes = await UnitType.findOne({ where: { UType_ID: UnitTypeId } })
            if (!unitTypes) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                "status": 200,
                "message": "get unitType successfully",
                "unitType": unitTypes
            })

        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE UnitTypes
    static get = async (req, res, next) => {
        const page = (parseInt(req.query.page)-1) || 0
        const limit = parseInt(req.query.limit) || 25
        try {
            const { count, rows } = await UnitType.findAndCountAll({
                offset: limit * page,
                limit: limit,
                order: [["createdAt", "DESC"]]
            });

            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            return res.status(200).json({
                status: 200,
                message: "Get all UnitType Successfully",
                unitType: rows,
                totalPage: (Math.ceil(count / limit)+1),
                page,
                limit
            });
        } catch (error) {
            return next(error)
        }
    }
    ///UPDATE UnitType
    static update = async (req, res, next) => {
        const unitTypeId = req.query.id
        let result;
        try {
            const exist = await UnitType.findOne({ where: { UType_ID: unitTypeId } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            result = await UnitType.update(req.body, { where: { UType_ID: unitTypeId }, returning: true })
            res.status(200).json({
                "status": 200,
                "message": " UnitType updated successfully",
                "Updated UnitType": result
            })
        } catch (error) {
            return next(error)
        }

    }
    /////Delete UnitTypeIssue 

    static delete = async (req, res) => {
        const { id } = req.query;
        try {
            const exist = await UnitType.findOne({ where: { UType_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const data = await UnitType.destroy({ where: { UType_ID: id } });
            res.status(200).json({
                "status": 200,
                "message": "UnitType Deleted successfully",
                "Deleted UnitType": data
            })
        } catch (error) {
            return next(error)
        }
    }

}

module.exports = UnitTypeController
