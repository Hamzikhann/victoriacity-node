// import jwt from 'jsonwebtoken'
// import User from '../../models/User.js'
// import dotenv from 'dotenv'
// dotenv.config()

const jwt = require('jsonwebtoken');
const User = require('../../models/User.js');
const dotenv = require('dotenv');
dotenv.config();

var checkUserAuth = async (req, res, next) => {
    
    const { authorization } = req.headers 
        try {
            //get token from header
            const token = authorization.split(' ')[1]
            
            if (!token){
                res.status(401).json({
                    "status":"failed",
                    "message":"Unauthorized User, No Token"
                })
            }

            //verify token
            const { userID, role } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            
            const user = {
                id: userID,
                role: role
            }
            req.user =user 
            next()
        } catch (error) {
            console.log('OOOOOOOOOOOOOOOOOOOOOOOOOO',error)
            res.status(401).send({
                "status":"failed",
                "message":"Unauthorized User"
            })
        }
    
    
}
module.exports = checkUserAuth

// export default checkUserAuth