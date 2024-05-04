const { Payment_Mode } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class PaymentModeController {
  static create = async (req, res, next) => {
    const { Description, IsActive } = req.body;

    if (!Description) {
      return next(
        CustomErrorHandler.wrongCredentials("All fields are required!")
      );
    }
    try {
      const [row, created] = await Payment_Mode.findOrCreate({
        where: { Description: Description },
        defaults: {
          IsActive,
        },
      });
      if (!created) {
        return next(CustomErrorHandler.alreadyExist());
      }

      res.status(200).json({
        status: 200,
        message: "Add Payment_Mode successfully",
        PaymentMode: row,
      });
    } catch (error) {
      return next(error);
    }
  };

  // SEARCH PaymentMode BY ID
  static getPaymentModeById = async (req, res, next) => {
    const PaymentModeId = req.query.id;
    try {
      const PaymentMode = await Payment_Mode.findOne({
        where: { PMID: PaymentModeId },
      });
      if (!PaymentMode) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      res.status(200).json({
        status: 200,
        message: "get Payment_Mode successfully",
        PaymentMode: PaymentMode,
      });
    } catch (error) {
      return next(error);
    }
  };
  // GET ALL AVAILABLE PaymentModes
  static get = async (req, res, next) => {
    const page = (parseInt(req.query.page)-1) || 0
    const limit = parseInt(req.query.limit) || 25
    try {
      const { count, rows } = await Payment_Mode.findAndCountAll({
        offset: limit * page,
        limit: limit,
        order: [["createdAt", "DESC"]]
      });

      if (rows.length === 0) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      return res.status(200).json({
        status: 200,
        message: "Get all Payment_Mode Successfully",
        PaymentMode: rows,
        totalPage: (Math.ceil(count / limit)+1),
        page,
        limit
      });
    } catch (error) {
      return next(error);
    }
  };
  ///UPDATE PaymentMode
  static update = async (req, res, next) => {
    const PaymentModeId = req.query.id;
    let result;
    try {
      const exist = await Payment_Mode.findOne({
        where: { PMID: PaymentModeId },
      });
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      result = await Payment_Mode.update(req.body, {
        where: { PMID: PaymentModeId },
        returning: true,
      });
      res.status(200).json({
        status: 200,
        message: " Payment_Mode updated successfully",
        "Updated PaymentMode": result,
      });
    } catch (error) {
      return next(error);
    }
  };
  /////Delete PaymentModeIssue

  static delete = async (req, res) => {
    const { id } = req.query;
    try {
      const exist = await Payment_Mode.findOne({ where: { PMID: id } });
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      const data = await Payment_Mode.destroy({ where: { PMID: id } });
      res.status(200).json({
        status: 200,
        message: "PaymentMode Deleted successfully",
        "Deleted PaymentMode": data,
      });
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = PaymentModeController;
