const { PlotSize } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class PlotSizeController {

    static create = async (req, res, next) => {
        const { Name, Size_Marla, Size_SQF, IsActive } = req.body;
        if (!(Name && Size_Marla && Size_SQF)) {
            return next(CustomErrorHandler.wrongCredentials('All fields are required!'))
        }
        try {
            const exist = await PlotSize.findOne({ where: { Name: Name } })
            if (exist) {
                return next(CustomErrorHandler.alreadyExist())
            }
            const createPlotSize = new PlotSize({
                Name, Size_Marla, Size_SQF, IsActive
            })

            await createPlotSize.save();

            res.status(200).json({
                "status": 200,
                "message": "Add PlotSize successfully",
                "PlotSize": createPlotSize,
            });

        } catch (error) {
            return next(error);
        }
    }
    // SEARCH PlotSize BY ID
    static getPlotSizeById = async (req, res, next) => {
        const PlotSizeId = req.query.id
        try {
            const PlotSizeById = await PlotSize.findOne({ where: { PS_ID: PlotSizeId } })
            if (!PlotSizeById) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                status: 200 ,
                "message": "get unitType successfully",
                "unitType": PlotSizeById
            })

        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE PlotSizes
    static get = async (req, res, next) => {
        const page = (parseInt(req.query.page)-1) || 0
        const limit = parseInt(req.query.limit) || 25
        try {
            const { count, rows } = await PlotSize.findAndCountAll({
                offset: limit * page,
                limit: limit,
                order: [["createdAt", "DESC"]]
            });

            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            return res.status(200).json({
                status: 200 ,
                "message": "Get all PlotSize Successfully",
                "PlotSizes": rows,
                totalPage: (Math.ceil(count / limit)+1),
                page,
                limit
            })
        } catch (error) {
            return next(error)
        }
    }
    ///UPDATE PlotSize
    static update = async (req, res, next) => {
        const plotSizeId = req.query.id
        let result;
        try {
            const exist = await PlotSize.findOne({ where: { PS_ID: plotSizeId } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            result = await PlotSize.update(req.body, { where: { PS_ID: plotSizeId }, returning: true })
            res.status(200).json({
                status: 200 ,
                "message": " PlotSize  updated successfully",
                "Updated PlotSize": result
            })
        } catch (error) {
            return next(error)
        }
    }
    /////Delete PlotSizeIssue 

    static delete = async (req, res) => {
        const { id } = req.query;
        try {
            const exist = await PlotSize.findOne({ where: { PS_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const data = await PlotSize.destroy({ where: { PS_ID: id } });
            res.status(200).json({
                "status": 200,
                "message": "PlotSize Deleted successfully",
                "Deleted PlotSize": data
            })
        } catch (error) {
            return next(error)
        }
    }
}

// export default PlotSizeController;  
module.exports = PlotSizeController
