const { UnitNature } = require("../../models/index.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");

class UnitNatureTypeController {
  static create = async (req, res, next) => {
    const { Name, Abbrev, Status } = req.body;
    if (!(Name && Abbrev)) {
      return next(
        CustomErrorHandler.wrongCredentials("All fields are required!")
      );
    }
    try {
      const exist = await UnitNature.findOne({
        where: { Name: Name },
      });
      if (exist) {
        return next(CustomErrorHandler.alreadyExist());
      }
      const createUnitNatureType = new UnitNature({
        Name,
        Abbrev,
        Status,
      });
      await createUnitNatureType.save();

      res.status(200).json({
        status: 200,
        message: "Add UnitNatureType successfully",
        UnitNatureType: createUnitNatureType,
      });
    } catch (error) {
      return next(error);
    }
  };
  // SEARCH UnitNatureType BY ID
  static getUnitNatureTypeById = async (req, res, next) => {
    const UnitNatureTypeId = req.query.id;

    try {
      const unitNatureType = await UnitNature.findOne({
        where: { NType_ID: UnitNatureTypeId },
      });
      if (!unitNatureType) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      res.status(200).json({
        status: 200,
        message: "get unitNatureType successfully",
        unitNatureType: unitNatureType,
      });
    } catch (error) {
      return next(error);
    }
  };
  // GET ALL AVAILABLE unitNatureTypes
  static get = async (req, res, next) => {
    const page = (parseInt(req.query.page)-1) || 0
    const limit = parseInt(req.query.limit) || 25
    try {
        const { count, rows } = await UnitNature.findAndCountAll({
          offset: limit * page,
          limit: limit,
          order: [["createdAt", "DESC"]]
        });

      if (rows.length === 0) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      res.status(200).json({
        status: 200,
        message: "Get all UnitNatureType Successfully",
        UnitNatureTypes: rows,
        totalPage: (Math.ceil(count / limit)+1),
        page,
        limit
      });
    } catch (error) {
      return next(error);
    }
  };
  ///UPDATE UnitNatureType
  static update = async (req, res, next) => {
    const UnitNatureTypeId = req.query.id;
    let result;
    try {
      const exist = await UnitNature.findOne({
        where: { NType_ID: UnitNatureTypeId },
      });
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      result = await UnitNature.update(req.body, {
        where: { NType_ID: UnitNatureTypeId },
        returning: true,
      });
      res.status(200).json({
        status: 200,
        message: " UnitNatureType updated successfully",
        "Updated UnitType": result,
      });
    } catch (error) {
      return next(error);
    }
  };
  /////Delete UnitNatureTypeIssue

  static delete = async (req, res) => {
    const { id } = req.query;
    try {
      const exist = await UnitNature.findOne({ where: { NType_ID: id } });
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      const data = await UnitNature.destroy({ where: { NType_ID: id } });
      res.status(200).json({
        status: 200,
        message: "UnitNatureType Deleted successfully",
        "Deleted UnitType": data,
      });
    } catch (error) {
      return next(error);
    }
  };
}

// export default UnitNatureTypeController;   
module.exports = UnitNatureTypeController
