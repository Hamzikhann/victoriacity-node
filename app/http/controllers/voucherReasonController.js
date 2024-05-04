
const { VoucherReason } = require("../../models")
const CustomErrorHandler = require("../../services/CustomErrorHandler")

class VoucherReasonController {

  static create = async (req, res, next) => {
    const {
      VR_NAME,
      VR_TYPE,
      Descrip

    } = req.body
    if (!(
      VR_NAME &&
      VR_TYPE &&
      Descrip
    )) {
      return next(CustomErrorHandler.wrongCredentials('All fields are required!'))
    }
    try {
      const exist = await VoucherReason.findOne({ where: { VR_NAME: VR_NAME } })
      if (exist) {
        return next(CustomErrorHandler.alreadyExist())
      }

      const voucherReasonType = new VoucherReason({
        VR_NAME,
        VR_TYPE,
        Descrip

      })

      await voucherReasonType.save();
      res.status(200).json({
        "status": 200,
        "message": "Add VoucherReason successfully",
        "VoucherReason": voucherReasonType,
      });
    } catch (error) {
      return next(error);
    }

  }
  // SEARCH Phase BY ID
  static getVoucherReasonById = async (req, res, next) => {
    const id = req.query.id
    try {
      const voucherReasonId = await VoucherReason.findOne({ where: { VR_ID: id } })
      if (!voucherReasonId) {
        return next(CustomErrorHandler.notFound('Data not found!'))
      }

      res.status(200).json({
        status: 200 ,
        "message": "get VoucherReason successfully",
        "VoucherReason": voucherReasonId
      })
    } catch (error) {
      return next(error)
    }
  }
  // GET ALL AVAILABLE Phases
  static get = async (req, res, next) => {
    try {
      const voucherReason = await VoucherReason.findAll();

      if (voucherReason.length === 0) {
        return next(CustomErrorHandler.notFound('Data not found!'))
      }
      return res.status(200).json({
        status: 200 ,
        "message": "Get all VoucherReason Successfully",
        "Voucher Reason": voucherReason
      })
    } catch (error) {
      return next(error)
    }
  }
  ///UPDATE Phase
  static update = async (req, res, next) => {
    const { id } = req.query
    console.log(id)
    let result;
    try {
      const exist = await VoucherReason.findOne({ where: { VR_ID: id } })
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"))
      }
      result = await VoucherReason.update(req.body, { where: { VR_ID: id }, returning: true })
      res.status(200).json({
        status: 200 ,
        "message": " VoucherReason  updated successfully",
        "Updated VoucherReason": result
      })
    } catch (error) {
      return next(error)
    }
  }
  /////Delete PhaseIssue 

  static delete = async (req, res, next) => {
    const { id } = req.query;
    try {
      const exist = await VoucherReason.findOne({ where: { VR_ID: id } })
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"))
      }
      const data = await VoucherReason.destroy({ where: { VR_ID: id } });
      res.status(200).json({
        "status": 200,
        "message": "VoucherReason Deleted successfully",
        "Deleted VoucherReason": data
      })
    } catch (error) {
      return next(error)
    }
  }

}

// export default PhaseController;   
module.exports = VoucherReasonController
