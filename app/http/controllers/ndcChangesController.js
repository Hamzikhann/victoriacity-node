const { PlotSize, NDCChanges } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class NdcChangesController {
  static create = async (req, res, next) => {
    const { Name, Fee_Amt, IsActive } = req.body;
    if (!(Name && Fee_Amt)) {
      return next(
        CustomErrorHandler.wrongCredentials("All fields are required!")
      );
    }
    try {
      const exist = await NDCChanges.findOne({ where: { Name: Name } });
      if (exist) {
        return next(CustomErrorHandler.alreadyExist());
      }
      let maxId = await NDCChanges.max("FC_ID");
      const createNDCChanges = new NDCChanges({
        FC_ID: ++maxId || 1,
        Name,
        Fee_Amt,
        IsActive,
      });

      await createNDCChanges.save();

      res.status(200).json({
        status: 200,
        message: "Add NDC Changes successfully",
        data: createNDCChanges,
      });
    } catch (error) {
      return next(error);
    }
  };

  static getNDCChangesById = async (req, res, next) => {
    const NDCChangesId = req.query.id;
    try {
      const NDCChangesById = await NDCChanges.findOne({
        where: { FC_ID: NDCChangesId },
      });
      if (!NDCChangesById) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      res.status(200).json({
        status: 200,
        message: "get NDC Changes successfully",
        data: NDCChangesById,
      });
    } catch (error) {
      return next(error);
    }
  };

  static get = async (req, res, next) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 25;
    try {
      const { count, rows } = await NDCChanges.findAndCountAll({
        offset: limit * page,
        limit: limit,
        order: [["createdAt", "DESC"]],
      });

      if (rows.length === 0) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      return res.status(200).json({
        status: 200,
        message: "Get all NDC Changes Successfully",
        data: rows,
        totalPage: Math.ceil(count / limit) + 1,
        page,
        limit,
      });
    } catch (error) {
      return next(error);
    }
  };
  static getActive = async (req, res, next) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 25;
    try {
      const { count, rows } = await NDCChanges.findAndCountAll({
        offset: limit * page,
        limit: limit,
        order: [["createdAt", "DESC"]],
        where: { IsActive: 1 },
      });

      if (rows.length === 0) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      return res.status(200).json({
        status: 200,
        message: "Get all NDC Changes Successfully",
        data: rows,
        totalPage: Math.ceil(count / limit) + 1,
        page,
        limit,
      });
    } catch (error) {
      return next(error);
    }
  };

  static update = async (req, res, next) => {
    const NDCChangesId = req.query.id;
    let result;
    try {
      const exist = await NDCChanges.findOne({
        where: { FC_ID: NDCChangesId },
      });
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      result = await NDCChanges.update(req.body, {
        where: { FC_ID: NDCChangesId },
        returning: true,
      });
      res.status(200).json({
        status: 200,
        message: " NDC Changes  updated successfully",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  };
  /////Delete NDC

  static delete = async (req, res, next) => {
    const { id } = req.query;
    try {
      const exist = await NDCChanges.findOne({ where: { FC_ID: id } });
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      const data = await NDCChanges.destroy({ where: { FC_ID: id } });
      res.status(200).json({
        status: 200,
        message: "NDC Changes Deleted successfully",
        data: data,
      });
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = NdcChangesController;
