const { Phase } = require("../../models")
const CustomErrorHandler = require("../../services/CustomErrorHandler")

class PhaseController {

    static create = async (req, res, next) => {
        const { NAME, ABBRE, IsActive } = req.body
        if (!(NAME && ABBRE )) {
            return next(CustomErrorHandler.wrongCredentials('All fields are required!'))
        }
        try {
            const exist = await Phase.findOne({ where: { NAME: NAME } })
            if (exist) {
                return next(CustomErrorHandler.alreadyExist())
            }

            const phase = new Phase({
                NAME, ABBRE, IsActive
            })

            await phase.save();
            res.status(200).json({
                "status": 200,
                "message": "Add Phase successfully",
                "Phase": phase,
            });
        } catch (error) {
            return next(error);
        }

    }
    // SEARCH Phase BY ID
    static getPhaseById = async (req, res, next) => {
        const PhaseId = req.query.id
        try {
            const PhaseById = await Phase.findOne({ where: { PHS_ID: PhaseId } })
            if (!PhaseById) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }

            res.status(200).json({
                status: 200 ,
                "message": "get Phase successfully",
                "Phase": PhaseById
            })
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE Phases
    static get = async (req, res, next) => {
        const page = (parseInt(req.query.page)-1) || 0
        const limit = parseInt(req.query.limit) || 25
        try {
            const { count, rows } = await Phase.findAndCountAll({
                offset: limit * page,
                limit: limit,
                order: [["createdAt", "DESC"]]
            });

            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            return res.status(200).json({
                status: 200 ,
                "message": "Get all Phase Successfully",
                "Phases": rows,
                totalPage: (Math.ceil(count / limit)+1),
                page,
                limit
            })
        } catch (error) {
            return next(error)
        }
    }
    ///UPDATE Phase
    static update = async (req, res, next) => {
        const PhaseId = req.query.id
        let result;
        try {
            const exist = await Phase.findOne({ where: { PHS_ID: PhaseId } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            result = await Phase.update(req.body, { where: { PHS_ID: PhaseId }, returning: true })
            res.status(200).json({
                status: 200 ,
                "message": " Phase  updated successfully",
                "Updated Phase": result
            })
        } catch (error) {
            return next(error)
        }
    }
    /////Delete PhaseIssue 

    static delete = async (req, res, next) => {
        const { id } = req.query;
        try {
            const exist = await Phase.findOne({ where: { PHS_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const data = await Phase.destroy({ where: { PHS_ID: id } });
            res.status(200).json({
                "status": 200,
                "message": "Phase Deleted successfully",
                "Deleted Phase": data
            })
        } catch (error) {
            return next(error)
        }
    }

}

// export default PhaseController;   
module.exports = PhaseController
