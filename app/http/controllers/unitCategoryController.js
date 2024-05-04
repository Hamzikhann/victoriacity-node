const { UnitCategory } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class UnitCategoryController {

    static addUnitCategory = async (req, res, next) => {
        
        const { CAT_Name, Abbrev, Status } = req.body;
        if (!(CAT_Name && Abbrev)) {
            return next(CustomErrorHandler.wrongCredentials("All fields are required!"))
        }
        try {
            const [row, created] = await UnitCategory.findOrCreate({
                where: { CAT_Name }, 
                defaults: {
                    Abbrev,
                    Status
                }
            });
            if (!created) {
                return next(CustomErrorHandler.alreadyExist());
            }
            res.status(200).json({
                "status": 200,
                "message": "Add Unit Category successfully",
                "UnitCategory": row,
            });
        } catch (error) {
            return next(error)
        }

    }
    // SEARCH UnitCategory BY ID
    static getUnitCategoryById = async (req, res, next) => {
        const UnitCategoryId = req.query.id

        try {
            const unitCategory = await UnitCategory.findOne({ where: { CAT_ID: UnitCategoryId } })
            if (!unitCategory) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                "status": 200,
                "message": "get unit Category successfully",
                "unitCategory": unitCategory
            })

        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE UnitCategorys
    static getAllUnitCategory = async (req, res, next) => {
        const page = (parseInt(req.query.page)-1) || 0
        const limit = parseInt(req.query.limit) || 25
        try {
            const { count, rows } = await UnitCategory.findAndCountAll({
                offset: limit * page,
                limit: limit,
                order: [["createdAt", "DESC"]],
                where:{ IsDeleted: 0 }
            });
            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                "status": 200,
                "message": "Get all UnitCategory Successfully",
                "UnitCategorys": rows,
                totalPage: (Math.ceil(count / limit)+1),
                page,
                limit
            })
        } catch (error) {
            return next(error);
        }
    }
    ///UPDATE UnitCategory
    static updateUnitCategory = async (req, res, next) => {
        const unitCategoryId = req.query.id
        try {
            const exist = await UnitCategory.findOne({ where: { CAT_ID: unitCategoryId } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }

            const result = await UnitCategory.update(req.body, { where: { CAT_ID: unitCategoryId }, returning: true })
            res.status(200).json({
                "status": 200,
                "message": " Unit Category updated successfully",
                "Updated UnitCategory": result
            })

        } catch (error) {
            return next(error)
        }
    }
    /////Delete UnitCategoryIssue 

    static deleteUnitCategory = async (req, res,next) => {
        const { id } = req.query;
        
        try {
            const exist = await UnitCategory.findOne({ where: { CAT_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const result = await UnitCategory.update({ IsDeleted: 1 }, { where: { CAT_ID: id }, returning: true })
            res.status(200).json({
                "status": 200,
                "message": "Unit Category Deleted successfully",
                "Deleted UnitCategory": result
            })

        } catch (error) {
            return next(error)
        }

    }
}

// export default UnitCategoryController;   
module.exports = UnitCategoryController
