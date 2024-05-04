const CustomErrorHandler = require("../../services/CustomErrorHandler");
const { TRFS, UnitType, PlotSize } = require("../../models");

class TransferFeeController {
  static create = async (req, res, next) => {
    const { Name, PS_ID, UType_ID, isActive, Type, Amount } = req.body;

    if (!(Name && PS_ID && UType_ID && Type && Amount)) {
      return next(
        CustomErrorHandler.wrongCredentials("All Fields are required!")
      );
    }
    try {
      const transferFee = await TRFS.create({
        Name,
        PS_ID,
        UType_ID,
        isActive,
        Type,
        Amount,
      });

      res.status(200).json({
        status: 200,
        message: "Add Transfer Fee Structure successfully",
        transferFee: transferFee,
      });
    } catch (error) {
      return next(error);
    }
  };
  // SEARCH TaxTag BY ID
  static getTRFSById = async (req, res, next) => {
    const TRFS_ID = req.query.id;
    try {
      const transferFee = await TRFS.findOne({
        include: [
          { as: "UnitType", model: UnitType },
          { as: "PlotSize", model: PlotSize },
        ],
        where: { TRFS_ID: TRFS_ID },
      });
      if (!transferFee) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      res.status(200).json({
        status: 200,
        message: "get taxTag successfully",
        transferFee: transferFee,
      });
    } catch (error) {
      return next(error);
    }
  };

  // GET ALL AVAILABLE TaxTags
  static get = async (req, res, next) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 25;
    try {
      const { count, rows } = await TRFS.findAndCountAll({
        include: [
          { as: "UnitType", model: UnitType },
          { as: "PlotSize", model: PlotSize },
        ],
        offset: limit * page,
        limit: limit,
        order: [["createdAt", "DESC"]],
      });

      if (rows.length === 0) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      return res.status(200).json({
        status: 200,
        message: "Get all TaxTag Successfully",
        transferFee: rows,
        totalPage: Math.ceil(count / limit) + 1,
        page,
        limit,
      });
    } catch (error) {
      return next(error);
    }
  };
  ///UPDATE TaxTag
  static update = async (req, res, next) => {
    const TRFS_ID = req.query.id;
    let result;
    try {
      const exist = await TRFS.findOne({ where: { TRFS_ID: TRFS_ID } });
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      result = await TRFS.update(req.body, {
        where: { TRFS_ID: TRFS_ID },
        returning: true,
      });
      res.status(200).json({
        status: 200,
        message: " Transfer Fee Structure  updated successfully",
        "Updated transferFee": result,
      });
    } catch (error) {
      return next(error);
    }
  };
  /////Delete TaxTagIssue

  static delete = async (req, res, next) => {
    const { TRFS_ID } = req.query;
    try {
      const exist = await TRFS.findOne({ where: { TRFS_ID: TRFS_ID } });
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      const data = await TRFS.destroy({ where: { TRFS_ID: TRFS_ID } });
      res.status(200).json({
        status: 200,
        message: "Transfer Fee Structure Deleted successfully",
        "Deleted transferFee": data,
      });
    } catch (error) {
      return next(error);
    }
  };
}

//export default TaxTagController;
module.exports = TransferFeeController;
