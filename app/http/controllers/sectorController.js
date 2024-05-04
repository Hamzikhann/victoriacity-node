const { Sector, Phase } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class SectorController {

    static create = async (req, res, next) => {

        const { PHS_ID, NAME, ABBRE, IsActive } = req.body
        if (!(PHS_ID && NAME && ABBRE)) {
            return next(CustomErrorHandler.wrongCredentials('All fields are required!'))
        }

        try {
            const exist = await Sector.findOne({ where: { NAME: NAME } })
            if (exist) {
                return next(CustomErrorHandler.alreadyExist())
            }
            const createSector = new Sector({
                PHS_ID, NAME, ABBRE, IsActive
            })

            await createSector.save();

            res.status(200).json({
                "status": 200,
                "message": "Add Sector successfully",
                "Sector": createSector,
            });

        } catch (error) {
            return next(error);
        }
    }
    // SEARCH Sector BY ID
    static getSectorById = async (req, res, next) => {
        const SectorId = req.query.id
        try {
            const SectorById = await Sector.findOne({ include: { as: 'Phase', model: Phase }, where: { SECT_ID: SectorId } })
            if (!SectorById) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                status: 200 ,
                "message": "get Sector successfully",
                "Sector": SectorById
            })
        } catch (error) {
            return next(error)
        }
    }
    // SEARCH Sector BY PHS ID
    static getSectorByPhsId = async (req, res, next) => {
        const phaseId = req.query.id
        try {
            const SectorById = await Sector.findAll({ include: { as: 'Phase', model: Phase }, where: { PHS_ID: phaseId } })
            if (!SectorById) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                status: 200 ,
                "message": "get Sector successfully",
                "Sectors": SectorById
            })
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE Sectors
    static get = async (req, res, next) => {
        const page = (parseInt(req.query.page)-1) || 0
        const limit = parseInt(req.query.limit) || 25
        try {
            const { count, rows } = await Sector.findAndCountAll({
                include: { as: 'Phase', model: Phase },
                offset: limit * page,
                limit: limit,
                order: [["createdAt", "DESC"]]
            });

            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            return res.status(200).json({
                status: 200 ,
                "message": "Get all Sector Successfully",
                "Sectors": rows,
                totalPage: (Math.ceil(count / limit)+1),
                page,
                limit
            })
        } catch (error) {
            return next(error)
        }
    }
    ///UPDATE Sector
    static update = async (req, res, next) => {
        const sectorId = req.query.id
        let result;
        try {
            const exist = await Sector.findOne({ where: { SECT_ID: sectorId } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            result = await Sector.update(req.body, { where: { SECT_ID: sectorId }, returning: true })
            res.status(200).json({
                status: 200 ,
                "message": " Sector  updated successfully",
                "Updated Sector": result
            })
        } catch (error) {
            return next(error)
        }
    }
    /////Delete SectorIssue 

    static delete = async (req, res,next) => {
        const { id } = req.query;
        try {
            const exist = await Sector.findOne({ where: { SECT_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const data = await Sector.destroy({ where: { SECT_ID: id } });
            res.status(200).json({
                "status": 200,
                "message": "Sector Deleted successfully",
                "Deleted Sector": data
            })
        } catch (error) {
            return next(error)
        }
    }

}

// export default SectorController;   
module.exports = SectorController
