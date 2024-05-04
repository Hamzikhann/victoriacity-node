// import jwt from 'jsonwebtoken'
// import User from '../../models/User.js'
// import dotenv from 'dotenv'
// import UserRole from '../../models/UserRole.js'
// dotenv.config()

const jwt = require('jsonwebtoken');
const User = require('../../models/User.js');
const dotenv = require('dotenv');
const UserRole = require('../../models/UserRole.js');
dotenv.config();

const adminHrAuth = async (req, res, next) => {
    const userId = req.user.id
    try {
        const role =  req.user.role
      
        const roleName = await UserRole.findAll({where: { id: role } })
        if(roleName.name != 'admin' && roleName.name != 'hr'){
            return res.status(401).send({
                "status":"failed",
                "message":"Unauthorized User"
            })
        }
        
        next()
    } catch (error) {
        res.status(401).send({
            "status":"failed",
            "message":"Unauthorized User"
        })
    } 
}
module.exports = adminHrAuth

// export default adminHrAuth