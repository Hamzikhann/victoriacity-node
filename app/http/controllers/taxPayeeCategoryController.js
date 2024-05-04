const CustomErrorHandler = require("../../services/CustomErrorHandler")
const { TaxPayeeCategory } = require("../../models")

class TaxPayeeController {

    static create = async (req, res, next) => {

        const { Name } = req.body
        console.log(Name)
        if (!(Name )) {
            return next(CustomErrorHandler.wrongCredentials('Name is required!'))
        }
        try {   
            const taxPayee = new TaxPayeeCategory({
                Name
            })

            await taxPayee.save();

            res.status(200).json({
                "status": 200,
                "message": "Add TaxPayeeCategory successfully",
                "taxPayee": taxPayee,
            });

        } catch (error) {
            return next(error);
        }

    }
    // SEARCH TaxPayeeCategory BY ID
    static getTaxPayeeCategoryById = async (req, res, next) => {
        const taxPayeeId = req.query.id
        try {
            const taxPayee = await TaxPayeeCategory.findOne({ where: { TPC_ID: taxPayeeId } })
            if (!taxPayee) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                "status": 200,
                "message": "get taxPayee successfully",
                "taxPayee": taxPayee
            })
        } catch (error) {
            return next(error)
        }
    }

    // GET ALL AVAILABLE TaxPayeeCategorys
    static get = async (req, res, next) => {
        const page = (parseInt(req.query.page)-1) || 0
        const limit = parseInt(req.query.limit) || 25
        try {
            const { count, rows } = await TaxPayeeCategory.findAndCountAll({
                offset: limit * page,
                limit: limit,
                order: [["createdAt", "DESC"]]
            });

            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            return res.status(200).json({
                "status": 200,
                "message": "Get all TaxPayeeCategory Successfully",
                "TaxPayeeCategorys": rows,
                totalPage: (Math.ceil(count / limit)+1),
                page,
                limit
            })
        } catch (error) {
            return next(error)
        }
    }
    ///UPDATE TaxPayeeCategory
    static update = async (req, res, next) => {
        const taxPayeeId = req.query.id
        let result;
        try {
            const exist = await TaxPayeeCategory.findOne({ where: { TPC_ID: taxPayeeId } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            result = await TaxPayeeCategory.update(req.body, { where: { TPC_ID: taxPayeeId }, returning: true })
            res.status(200).json({
                "status": 200,
                "message": " TaxPayeeCategory  updated successfully",
                "Updated TaxPayeeCategory": result
            })
        } catch (error) {
            return next(error)
        }
    }
    /////Delete TaxPayeeCategoryIssue 

    static delete = async (req, res, next) => {
        const { id } = req.query;
        try {
            const exist = await TaxPayeeCategory.findOne({ where: { TPC_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const data = await TaxPayeeCategory.destroy({ where: { TPC_ID: id } });
            res.status(200).json({
                "status": 200,
                "message": "TaxPayeeCategory Deleted successfully",
                "Deleted TaxPayeeCategory": data
            })
        } catch (error) {
            return next(error)
        }
    }

}

//export default TaxPayeeCategoryController;   
module.exports = TaxPayeeController
