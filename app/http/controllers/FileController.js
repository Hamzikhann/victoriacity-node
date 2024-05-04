
const FileService = require('../../services/FileService.js');
const CustomErrorHandler = require('../../services/CustomErrorHandler');
const { OpenFile, Phase, UnitType, PaymentPlan, PlotSize, Sector, Block, UnitNature, FileSubmissionDetail } = require('../../models/index.js');
const { Op } = require('sequelize');

class FileController {

    static create = async (req, res, next) => {
        const { SR_Prefix, SR_Start, SR_End, Code_Prefix, Code_Start, PS_ID, UType_ID, PHS_ID, SECT_ID, BK_ID, PP_ID, NType_ID } = req.body
        if (!(SR_Prefix && SR_Start && SR_End && Code_Prefix && Code_Start && PS_ID && UType_ID && PHS_ID && SECT_ID && PP_ID && BK_ID && NType_ID)) {
            return next(CustomErrorHandler.wrongCredentials('All fields are required!'))
        }

        try {
            let maxCodeId = await OpenFile.max('OF_MaxCode');

            maxCodeId = maxCodeId+1;

            const froms = await FileService.createFileFroms(req.body, maxCodeId, req.user.id);

            await OpenFile.bulkCreate(froms);

            res.status(200).json({
                "status": 200,
                "message": "Add Files successfully",
            });

        } catch (error) {
            return next(error)
        }

    }
    // SEARCH file BY ID
    static getFileById = async (req, res, next) => {
        const fileId = req.query.id
        console.log("sss", fileId)
        try {
            const allFile = await OpenFile.findByPk(fileId,{ include: [{ as: 'Phase', model: Phase }, { as: 'UnitType', model: UnitType }, { as: 'PaymentPlan', model: PaymentPlan }, { as: 'PlotSize', model: PlotSize }, { as: 'Sector', model: Sector }, { as: 'Block', model: Block }, { as: 'UnitNature', model: UnitNature }] });

            if (!allFile) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            return res.status(200).json({
                "status": 200,
                "message": "Get all File successfully",
                "file": allFile
            })
        } catch (error) {
            return next(error)
        }
    }

    static getFileByFromNo = async (req, res, next) => {
        let formNo = req.query.formNo;
        try {

            if (!formNo){
                return res.status(400).jason({Message:"formNo is Required"})
            }

            const fileDetail = await FileSubmissionDetail.findOne({where: {
                Form_Code: formNo ,   // Search by Form_Code 
             }});
            // console.log('fileDetail',fileDetail);
            if (fileDetail) {
                return res.status(400).json({status:400,Message:"File Already Submitted"})
            }

            const file = await OpenFile.findOne({ include: [{ as: 'Phase', model: Phase }, { as: 'UnitType', model: UnitType }, { as: 'PaymentPlan', model: PaymentPlan }, { as: 'PlotSize', model: PlotSize }, { as: 'Sector', model: Sector }, { as: 'Block', model: Block }, { as: 'UnitNature', model: UnitNature }],
            where: {
                  Form_Code: formNo ,   // Search by Form_Code 
              },
                ///
                });

            if (!file) {
                return res.status(404).json({status:404,Message:"No Record Found"})
            }
            file.toJSON()
            return res.status(200).json({
                status: 200,
                "message": "Get File successfully",
                "file": file
            })
        } catch (error) {
            return next(error)
        }
    }

    // GET ALL AVAILABLE fileS
    static get = async (req, res, next) => {
        const formNo = (req.query.formNo) || '';
        const page = (parseInt(req.query.page)-1) || 0;
        const limit = parseInt(req.query.limit) || 25;

        let filters = [
            { IsDeleted: 0 }
        ];

        if(formNo != "") {
            filters.push({SRForm_No: formNo});
        }
        

        try {
            const { count, rows } = await OpenFile.findAndCountAll({
                include: [{ as: 'Phase', model: Phase }, { as: 'UnitType', model: UnitType }, { as: 'PaymentPlan', model: PaymentPlan }, { as: 'PlotSize', model: PlotSize }, { as: 'Sector', model: Sector }, { as: 'Block', model: Block }, { as: 'UnitNature', model: UnitNature }], where: {
                    [Op.and]: filters
                },
                offset: limit * page,
                limit: limit,
                order: [["OF_ID", "DESC"]]
            });

            if (rows.length === 0) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }
            return res.status(200).json({
                "status": 200,
                "message": "Get all File successfully",
                "file": rows,
                totalPage: (Math.ceil(count/limit)+1),
                totalRecords: count,
                page,
                limit
            })
        } catch (error) {
            return next(error)
        }
    }
    ///UPDATE file
    static update = async (req, res, next) => {

        const fileId = req.query.id
        let result;
        try {
            const exist = await OpenFile.findOne({ where: { OF_ID: fileId } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            result = await OpenFile.update(req.body, { where: { OF_ID: fileId }, returning: true })
            res.status(200).json({
                "status": 200,
                "message": " File  updated successfully",
                "Updated File": result
            })
        } catch (error) {
            return next(error)
        }
    }
    /////Delete FileIssue 
    static deleteFile = async (req, res, next) => {
        const { id } = req.query;
        let data;
        try {
            const exist = await OpenFile.findOne({ where: { OF_ID: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            if (!(exist.IsDeleted)) {
                data = await OpenFile.update({ IsDeleted: 1 }, { where: { OF_ID: id }, returning: true });
            }
            res.status(200).json({
                "status": 200,
                "message": "File Deleted successfully",
                "Deleted File": data
            })
        } catch (error) {
            return next(error)
        }
    }

    static getFileByFromCode = async (req, res, next) => {
        let formCode = req.query.formCode;
        try {
          if (!formCode) {
            return res.status(400).jason({ Message: "formNo is Required" });
          }
    
          const file = await OpenFile.findOne({
            include: [
              { as: "Phase", model: Phase },
              { as: "UnitType", model: UnitType },
              { as: "PaymentPlan", model: PaymentPlan },
              { as: "PlotSize", model: PlotSize },
              { as: "Sector", model: Sector },
              { as: "Block", model: Block },
              { as: "UnitNature", model: UnitNature },
            ],
            where: {
              Form_Code: formCode, // Search by Form_Code
            },
            ///
          });
    
          if (!file) {
            return res
              .status(404)
              .json({ status: 404, Message: "No Record Found" });
          }
          file.toJSON();
          return res.status(200).json({
            status: 200,
            message: "Get File successfully",
            file: file,
          });
        } catch (error) {
          return next(error);
        }
      };
}

// export default FileIssueController;   
module.exports = FileController
