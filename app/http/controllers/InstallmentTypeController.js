const { InstallmentType } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class InstallmentTypeController {

    static create = async (req, res, next) => {
        const {Name, Abbrev ,Status} = req.body

        if (!(Name && Abbrev)) {
            return next(
              CustomErrorHandler.wrongCredentials("All fields are required!")
            );
          }
          try {
            const [row, created] = await InstallmentType.findOrCreate({
              where: { Name: Name },
              defaults: {
                Abbrev,
                Status
              },
            });
            if (!created) {
              return next(CustomErrorHandler.alreadyExist());
            }
            res.status(200).json({
                "status": 200,
                "message": "Add InstallmentType successfully",
                "InstallmentType": row,
            });
        } catch (error) {
            return next(error);
        }

    }

    // SEARCH InstallmentType BY ID
    static getInstallmentTypeById = async (req, res, next) => {
        const InstallmentTypeId = req.query.id
        try {
            const installmentType = await InstallmentType.findOne({ where: { InsType_ID: InstallmentTypeId } })
            if (!installmentType) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            res.status(200).json({
                "status": 200,
                "message": "get InstallmentType successfully",
                "InstallmentType": installmentType
            })

        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE InstallmentTypes
    static get = async (req, res, next) => {
        const page = (parseInt(req.query.page)-1) || 0;
        const limit = parseInt(req.query.limit) || 25;
        try {
            const { count, rows } = await InstallmentType.findAndCountAll({
                offset: limit * page,
                limit: limit,
                order: [["createdAt", "DESC"]]
            });

            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            return res.status(200).json({
                status: 200,
                message: "Get all InstallmentType Successfully",
                InstallmentType: rows,
                totalPage: (Math.ceil(count / limit)+1),
                page,
                limit
            });
        } catch (error) {
            return next(error)
        }
    }
    ///UPDATE InstallmentType
    static update = async (req, res, next) => {
        const InstallmentTypeId = req.query.id
        let result;
        try {
            const exist = await InstallmentType.findOne({ where: { InsType_ID: InstallmentTypeId } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            result = await InstallmentType.update(req.body, { where: { InsType_ID: InstallmentTypeId }, returning: true })
            res.status(200).json({
                "status": 200,
                "message": " InstallmentType updated successfully",
                "Updated InstallmentType": result
            })
        } catch (error) {
            return next(error)
        }

    }
    /////Delete InstallmentTypeIssue 

    static delete = async (req, res,next) => {
        const { id } = req.query;
        try {
            const exist = await InstallmentType.findOne({ where: { InsType_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const data = await InstallmentType.destroy({ where: { InsType_ID: id } });
            res.status(200).json({
                "status": 200,
                "message": "InstallmentType Deleted successfully",
                "Deleted InstallmentType": data
            })
        } catch (error) {
            return next(error)
        }
    }

}

module.exports = InstallmentTypeController
