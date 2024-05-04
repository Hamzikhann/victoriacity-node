// import multer from "multer"
// import path from 'path';
const multer = require('multer');
const path = require('path');

 const Upload = multer({
    storage: multer.diskStorage({
        destination: (req, res, cb) => {
            cb(null, 'uploads/')
        },
        filename: (req, res, cb) => {
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(res.originalname)}`
            cb(null, fileName)
        }
    })
})

module.exports = Upload
