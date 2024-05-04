const {  Voucher, VoucherType, VoucherReason } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler")
const pdfGenerator = require("../../services/PdfGenerator");
const {TRS_Request_Mst}= require('../../models/index')
class VoucherController {

  static create = async (req, res, next) => {
    console.log("hello")
    const { VOUCHER_DATE, VOUCHER_NO, PAYEE_NAME, Vouch_Type_ID
      , IRH_ID, BK_ID, BK_Reg_Code, Reg_Code_Disply, VR_ID, NDC_ID
      , TPC_ID, TT_ID, TRSR_ID, Description, PMID, CHQUE_DATE, CHEQUE_NO, INSTRUMENT_NO
      , DEBIT, CREDIT, AdminVarified, COMPANY_ID, PR_ID, FISCAL_YEAR_ID, USER_ID
    } = req.body
    console.log(VOUCHER_DATE, VOUCHER_NO, PAYEE_NAME, Vouch_Type_ID
      , IRH_ID, BK_ID, BK_Reg_Code, Reg_Code_Disply, VR_ID, NDC_ID
      , TPC_ID, TT_ID, TRSR_ID, Description, PMID, CHQUE_DATE, CHEQUE_NO, INSTRUMENT_NO
      , DEBIT, CREDIT, AdminVarified, COMPANY_ID, PR_ID, FISCAL_YEAR_ID, USER_ID)
    if (!(VOUCHER_DATE && VOUCHER_NO && PAYEE_NAME && Vouch_Type_ID
      && IRH_ID && BK_ID && BK_Reg_Code && Reg_Code_Disply && VR_ID && NDC_ID
      && TPC_ID && TT_ID && TRSR_ID && Description && PMID && CHQUE_DATE && CHEQUE_NO && INSTRUMENT_NO
      && DEBIT && CREDIT && AdminVarified && COMPANY_ID && PR_ID && FISCAL_YEAR_ID && USER_ID )) {
      return next(CustomErrorHandler.wrongCredentials('All fields are required!'))
    }
    try {
      const exist = await Voucher.findOne({ where: { VOUCHER_NO: VOUCHER_NO } })
      if (exist) {
        return next(CustomErrorHandler.alreadyExist())
      }

      const voucher = new Voucher({
        VOUCHER_DATE, VOUCHER_NO, PAYEE_NAME, Vouch_Type_ID
        , IRH_ID, BK_ID, BK_Reg_Code, Reg_Code_Disply, VR_ID, NDC_ID
        , TPC_ID, TT_ID, TRSR_ID, Description, PMID, CHQUE_DATE, CHEQUE_NO, INSTRUMENT_NO
        , DEBIT, CREDIT, AdminVarified, COMPANY_ID, PR_ID, FISCAL_YEAR_ID, USER_ID
      })

      await voucher.save();
      res.status(200).json({
        "status": 200,
        "message": "Add voucher successfully",
        "Voucher": voucher,
      });
    } catch (error) {
      return next(error);
    }

  }
  // SEARCH Phase BY ID
  static getVoucherById = async (req, res, next) => {
    const voucherId = req.query.id
    try {
      const voucherById = await Voucher.findOne({ include: [{ as: 'VoucherType', model: VoucherType }, { as: 'VoucherReason', model: VoucherReason }] , where: { VOUCHER_ID: voucherId } })
      if (!voucherById) {
        return next(CustomErrorHandler.notFound('Data not found!'))
      }

      res.status(200).json({
        status: 200 ,
        "message": "get VOUCHER successfully",
        "Voucher": voucherById
      })
    } catch (error) {
      return next(error)
    }
  }
  // GET ALL AVAILABLE Phases
  static get = async (req, res, next) => {
    try {
      const voucher = await Voucher.findAll({ include: [{ as: 'VoucherType', model: VoucherType }, { as: 'VoucherReason', model: VoucherReason }] });

      if (voucher.length === 0) {
        return next(CustomErrorHandler.notFound('Data not found!'))
      }
      return res.status(200).json({
        status: 200 ,
        "message": "Get all Voucher Successfully",
        "Voucher": voucher
      })
    } catch (error) {
      return next(error)
    }
  }
  ///UPDATE Phase
  static update = async (req, res, next) => {
    console.log("hello")
    const voucherId = req.query.id
    let result;
    try {
      const exist = await Voucher.findOne({ where: { VOUCHER_ID: voucherId } })
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"))
      }
      result = await Voucher.update(req.body, { where: { VOUCHER_ID: voucherId }, returning: true })
      res.status(200).json({
        status: 200 ,
        "message": " Voucher  updated successfully",
        "Updated Voucher": result
      })
    } catch (error) {
      return next(error)
    }
  }
  ///Update UISER ID
  static updateUser = async (req, res, next) => {
    const voucherId = req.body.voucherId
    const userId = req.body.userId
    let result;
    try {
      if(!voucherId){
        return next(CustomErrorHandler.notFound("voucherId is required"))
      }
      if(!userId){
        return next(CustomErrorHandler.notFound("userId is required"))
      }
      const exist = await Voucher.findAll({ where: { VOUCHER_ID: voucherId } })
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"))
      }
       result = await Voucher.update(
            { Assign_BY: userId },
            { where: { VOUCHER_ID: voucherId }, returning: true }
        );

      res.status(200).json({
        status: 200 ,
        "message": " Voucher  updated successfully",
        "Updated Voucher": result
      })
    } catch (error) {
      console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ",error)
      return next(error)
      
    }
  }
  /////Delete PhaseIssue 

  static delete = async (req, res, next) => {
    console.log("wwwwwwwwwwwww")
    const { id } = req.query;
    let data;
    try {
      const exist = await Voucher.findOne({ where: { VOUCHER_ID: id } })
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"))
      }
      if (!(exist.IsDeleted)) {
         data = await Voucher.update({ IsDeleted: 1 }, { where: { VOUCHER_ID: id } });
      }
      res.status(200).json({
        "status": 200,
        "message": "Voucher Deleted successfully",
        "Deleted Voucher": data
      })
    } catch (error) {
      return next(error)
    }
  }

  static createNDCReport = async (req, res, next) => {
    const {id,Reg_Code_Disply} = req.query;
    
   
    try {
      const checkExpiry = await TRS_Request_Mst.findAll({where:{Reg_Code_Disply:Reg_Code_Disply}}) 
      if (checkExpiry.length === 0) {
        return next(CustomErrorHandler.notFound("Record not found"));
      }
    
      // Convert each instance to JSON
      const checkExpiryJson = checkExpiry.map((instance) => instance.toJSON());
    
      const expireDate = new Date(checkExpiryJson[0].Expire_Date);
      const today = new Date();
      expireDate.setHours(0, 0, 0, 0); // Set time to midnight for comparison
      today.setHours(0, 0, 0, 0);

      if (expireDate < today) {
        return next(CustomErrorHandler.notFound("Your validity Date is Expired"));
      }
      const { count, rows } = await Voucher.findAndCountAll({
        
        where: { VOUCHER_ID: id },
        row: true,
      });

      if (rows.length == 0) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      const file = rows[0];
      if (!file) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      file.toJSON();
      // rows.toJSON();

      const pdf = await pdfGenerator.NDC_Report_Generator(file, rows);
console.log("EEEEEEEEEEEEEEEEEEEEEEEEEEEEE", `${process.env.APP_URL}/${pdf}`)
      return res.status(200).json({
        status: 200,
        message: "Get NCD Report Successfully",
        rows: rows,
        file: { url: `${process.env.APP_URL}/${pdf}` },
      });
    } catch (error) {
      return next(error);
    }
  };
}

// export default PhaseController;   
module.exports = VoucherController
