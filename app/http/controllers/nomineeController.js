const dotenv = require("dotenv");
const { MemNominee, Member, TRSRequest } = require("../../models/index.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const { Op } = require("sequelize");
dotenv.config();

class NomineeController {
  static addNominee = async (req, res, next) => {
    const {
      MEMBER_ID,
      NomineeName,
      NomineeFatherName,
      NomineeRealtion,
      NomineeCNIC,
      RelationToOwner,
      TRSR_ID,
    } = req.body;

    if (
      !(
        MEMBER_ID &&
        NomineeName &&
        NomineeFatherName &&
        NomineeRealtion &&
        NomineeCNIC &&
        RelationToOwner
      )
    ) {
      return next(
        CustomErrorHandler.wrongCredentials("All fields are required!")
      );
    }

    try {
      // Create the MemNominee entry
      console.log("AAAAAAAAAAAAAAAA",req.body)
      const row = await MemNominee.create({
    
       
          MEMBER_ID: MEMBER_ID,
          NomineeName: NomineeName,
          NomineeFatherName: NomineeFatherName,
          NomineeRealtion: NomineeRealtion,
          NomineeCNIC: NomineeCNIC,
          RelationToOwner: RelationToOwner,
     
      });

      if (TRSR_ID) {
        const search = await TRSRequest.findAll({
          where: { TRSR_ID: TRSR_ID },
        });

        if (!search || search.length === 0) {
          return res
            .status(404)
            .json({ Message: "No Transfer Request Available against TRSR_ID" });
        }
        await TRSRequest.update(
          { BUYER_MEMBER_NOMINEE_ID: row.MN_ID },
          { where: { TRSR_ID: TRSR_ID } }
        );
      }
      res.status(200).json({
        status: 200,
        message: "Add Nominee successfully",
        Nominee: row,
      });
    } catch (error) {
      return next(error);
    }
  };

  // SEARCH Nominee BY ID
  static getNomineeById = async (req, res, next) => {
    const nomineeId = req.query.id;
    console.log("helo");

    try {
      const nominee = await MemNominee.findOne({
        include: [{ as: "Member", model: Member }],
        where: { MN_ID: nomineeId },
      });
      if (!nominee) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      res.status(200).json({
        status: 200,
        message: "get MemNominee successfully",
        MemNominee: nominee,
      });
    } catch (error) {
      return next(error);
    }
  };
  // GET ALL AVAILABLE Nominees
  static getAllNominee = async (req, res, next) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 25;
    try {
      const { count, rows } = await MemNominee.findAndCountAll({
        include: [{ as: "Member", model: Member }],
        offset: limit * page,
        limit: limit,
        order: [["createdAt", "DESC"]],
      });

      if (rows.length === 0) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      return res.status(200).json({
        status: 200,
        message: "Get all MemNominee Successfully",
        MemNominee: rows,
        totalPage: Math.ceil(count / limit) + 1,
        page,
        limit,
      });
    } catch (error) {
      return next(error);
    }
  };
  ///UPDATE Nominee
  static updateNominee = async (req, res, next) => {
    const {
      MEMBER_ID,
      NomineeName,
      NomineeFatherName,
      NomineeRealtion,
      NomineeCNIC,
      RelationToOwner,
    } = req.body;
    console.log(
      MEMBER_ID,
      NomineeName,
      NomineeFatherName,
      NomineeRealtion,
      NomineeCNIC,
      RelationToOwner
    );
    const nomineeId = req.query.id;
    try {
      const result = await MemNominee.findAll({ where: { MN_ID: nomineeId } });
      if (!result) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      const nomineeById = await MemNominee.update(req.body, {
        where: { MN_ID: nomineeId },
      });

      res.status(200).json({
        status: 200,
        message: " Nominee  updated successfully",
        "Updated Nominee": nomineeById,
      });
    } catch (error) {
      return next(error);
    }
  };
  /////Delete NomineeIssue

  static deleteNominee = async (req, res, next) => {
    const { id } = req.query;

    try {
      const exist = await MemNominee.findOne({ where: { MN_ID: id } });
      if (!exist) {
        return next(CustomErrorHandler.notFound("Data not found!"));
      }
      const data = await MemNominee.destroy({ where: { MN_ID: id } });
      res.status(200).json({
        status: 200,
        message: "Unit Deleted successfully",
        "Deleted Unit": data,
      });
    } catch (error) {
      return next(error);
    }
  };

  static getNomineeByName = async (req, res, next) => {
    const { search } = req.query;

    console.log("ooooooooooooooooooo", search);
    if (!search) {
      return res.status(400).json({ status: 400, message: "Name required" });
    }
    try {
      const nominees = await MemNominee.findAll({
        include: [{ as: "Member", model: Member }],
        where: {
          NomineeName: {
            [Op.like]: `%${search}%`,
          },
        },
        order: [["MN_ID", "DESC"]],
        limit: 20,
      });

      if (nominees.length === 0) {
        return next(CustomErrorHandler.notFound("No matching nominees found!"));
      }

      res.status(200).json({
        status: 200,
        message: "Get MemNominees successfully",
        MemNominees: nominees,
      });
    } catch (error) {
      return next(error);
    }
  };
  static getNomineeByCNIC = async (req, res, next) => {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({ status: 400, message: "CNIC REQUIRED" });
    }
    try {
      const nominees = await MemNominee.findAll({
        include: [{ as: "Member", model: Member }],
        where: {
          NomineeCNIC: {
            [Op.like]: `%${search}%`,
          },
        },
        order: [["MN_ID", "DESC"]],
        limit: 20,
      });

      if (nominees.length === 0) {
        return next(CustomErrorHandler.notFound("No matching nominees found!"));
      }

      res.status(200).json({
        status: 200,
        message: "Get MemNominees successfully",
        MemNominees: nominees,
      });
    } catch (error) {
      return next(error);
    }
  };
}

// export default NomineeController;
module.exports = NomineeController;
