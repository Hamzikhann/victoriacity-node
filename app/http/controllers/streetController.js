
const { Street } = require("../../models/index.js")
const CustomErrorHandler = require("../../services/CustomErrorHandler.js")



class StreetController {

    static addStreet = async (req, res, next) => {
        console.log("hellosssss")

        const { ST_Code, Name, IsActive } = req.body
        console.log(ST_Code, Name)
        if (!(ST_Code && Name)) {
            return next(CustomErrorHandler.wrongCredentials('All fields are required!'))
        }

        try {

            const [row, created] = await Street.findOrCreate({
                where: { Name: Name },
                defaults: {
                    ST_Code,
                    IsActive
                }
            })
            if (!created) {
                return next(CustomErrorHandler.alreadyExist())
            }

            res.status(200).json({
                "status": 200,
                "message": "Add Street successfully",
                "Street": row,
            });

        } catch (error) {
            return next(error);
        }
    }
    // SEARCH Street BY ID
    static getStreetById = async (req, res, next) => {
        const streetId = req.query.id
        try {
            const StreetById = await Street.findOne({ where: { ST_ID: streetId } })
            if (!StreetById) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }

            res.status(200).json({
                "status": 200,
                "message": "get Street successfully",
                "Street": StreetById
            })
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE Streets
    static getAllStreet = async (req, res, next) => {
        const page = (parseInt(req.query.page)-1) || 0
        const limit = parseInt(req.query.limit) || 25
        try {
            const { count, rows } = await Street.findAndCountAll({
                offset: limit * page,
                limit: limit,
                order: [["createdAt", "DESC"]]
            });

            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            return res.status(200).json({
                "status": 200,
                "message": "Get all Street Successfully",
                "Street": rows,
                totalPage: (Math.ceil(count / limit)+1),
                page,
                limit
            })
        } catch (error) {
            return next(error)
        }
    }
    ///UPDATE Street
    static updateStreet = async (req, res, next) => {
        console.log("ffff")
        const StreetId = req.query.id
        console.log(StreetId)
        let result;
        try {
            const exist = await Street.findOne({ where: { ST_ID: StreetId } })
            console.log(exist)
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            result = await Street.update(req.body, { where: { ST_ID: StreetId }, returning: true })
            res.status(200).json({
                "status": 200,
                "message": " Street  updated successfully",
                "result": result
            })
        } catch (error) {
            return next(error)
        }
    }
    /////Delete StreetIssue 

    static deleteStreet = async (req, res) => {
        const { id } = req.query;

        try {
            const exist = await Street.findOne({ where: { ST_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const data = await Street.destroy({ where: { ST_ID: id } });
            res.status(200).json({
                "status": 200,
                "message": "Street Deleted successfully",
                "Deleted Street": data
            })
        } catch (error) {
            return next(error)
        }

    }

}

// export default StreetController;   
module.exports = StreetController
