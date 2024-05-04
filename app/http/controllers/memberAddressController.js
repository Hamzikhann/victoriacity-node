const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const MemberAddress= require("../../models/MemberAddress.js")
const CustomErrorHandler = require('../../services/CustomErrorHandler.js');
const { Member } = require('../../models/index.js');


class memberAddressController {

static addMemberAdress = async (req, res, next) => {
    const { memberId, memberAddress } = req.body;
        console.log({ memberId, memberAddress });

        if (!(memberId && memberAddress))  {
        return next(CustomErrorHandler.wrongCredentials('All fields are required!'))
    }
    // const member = await Member_MST.findAll({ where: { id: memberId } });
    // if (member.length>0){
    //     return res.status(400).json({Message:"No member Available Against Id"})
    // }
    try {
        const createMemberAddress = new MemberAddress({
            memberId: memberId,
            memberAddress: memberAddress,
        })

        await createMemberAddress.save();

        res.status(200).send({
            "status": 200,
            "message": "Add Member Address successfully",
            "Nominee": createMemberAddress,
        });

    } catch (error) {
        return next(error)
    }

}

     // SEARCH MemberAddress BY ID
     static getMemberAddressById = async (req, res, next) => {
        const {memberId} = req.query
        try {
            const Members = await MemberAddress.findOne({where: { id: memberId } })
            if (!Members) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }

            res.status(200).json({
                status: 200 ,
                "message": "get Member Address successfully",
                "Member": Member
            })
        } catch (error) {
            return next(error)
        }
    }
    // GET ALL AVAILABLE Members
    static getAllMemberAddress = async (req, res, next) => {
      
        try {
            const Members = await MemberAddress.findAll()
            if (!Members) {
                return next(CustomErrorHandler.notFound('Data not found!'))
            }

            res.status(200).json({
                status: 200 ,
                "message": "get Member Address successfully",
                "Member": Members
            })
            
        } catch (error) {
            return next(error)
        }
    }
    ///UPDATE MemberAddress
    static updateMemberAddress = async (req, res, next) => {
        const {id} = req.query.id
        let result;
        try {
            const exist = await MemberAddress.findOne({ where: { id: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            result = await MemberAddress.update(req.body, { where: { id: id }, returning: true })
            res.status(200).json({
                status: 200 ,
                "message": " Member Adress  updated successfully",
                "Updated Member": result
            })
        } catch (error) {
            return next(error)
        }
    }
    /////Delete MemberIssue 

    static deleteMemberAddress = async (req, res, next) => {
        const { id } = req.query;
        try {
            const exist = await MemberAddress.findOne({ where: { id: id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }
            const data = await Member.destroy({ where: { id: id } });
            res.status(200).json({
                "status": 200,
                "message": "MemberAdress Deleted successfully",
                "Deleted Member": data
            })
        } catch (error) {
            return next(error)
        }
    }

}

module.exports = memberAddressController



