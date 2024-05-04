
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const MultiSalaryTransaction = require('../../models/MultipleSalaryTransaction.js')
const AccountTransaction = require('../../models/AccountTransaction.js')
const EmployeeSalaryHistory = require('../../models/EmployeeSalaryHistory.js')
dotenv.config();

class MultipleSalaryTransactionController {
    static addMultiSalaryTransaction = async (req, res, next) => {
        const { accountTransaction, employeeSalaryHistory } = req.body
        console.log({ accountTransaction,employeeSalaryHistory });
        if (accountTransaction && employeeSalaryHistory) {
            
            const transactions = await AccountTransaction.findAll({where : {id : accountTransaction }})
            const salaryHistories = await EmployeeSalaryHistory.findAll({ where: { id: employeeSalaryHistory } })
           
            if(transactions.length>0){
              if(salaryHistories.length>0){
            try {
                const multiSalaryTransaction = new MultiSalaryTransaction({
                    accountTransaction: accountTransaction,
                    employeeSalaryHistory: employeeSalaryHistory
                })

                
                        await multiSalaryTransaction.save();

                        res.status(200).send({
                            "status": 200,
                            "message": "Add MultiSalaryTransaction successfully",
                            "MultiSalaryTransactions": multiSalaryTransaction
                        });
                   
                

            } catch (error) {
                console.log(error);
                res.status(400).send({
                    "status": 400,
                    "message": "Unable to Add MultiSalaryTransactions",
                    error: error
                })
            }}
            else {
                res.status(400).send({
                    "status": 400,
                    "message": "No MultiSalaryTransactions Found",
                })
            }
        }  else {
            res.status(400).send({
                "status": 400,
                "message": "No Account Transactions Found",
            })
        }
        } else {
            res.status(400).send({
                "status": 400,
                "message": "All fields are required"
            })
        }
    }

    static deleteMultiSalaryTransaction = async (req, res) => {
        const { id } = req.query;
        try {
            const exist = await MultiSalaryTransaction.findOne({ where: { accountTransaction : id } })
            if (!exist) {
                return next(CustomErrorHandler.notFound("Data not found!"))
            }

            const result = await MultiSalaryTransaction.destroy({ where: { accountTransaction : id }, returning: true });
            res.status(200).json({
                "status": 200,
                "message": "Employee MultiSalaryTransactions Deleted successfully",
                "Employee MultiSalaryTransactions Deleted": result
            })
        } catch (error) {
            return next(error)
        }

    }

}


// export default MultiSalaryTransactionController
module.exports = MultipleSalaryTransactionController
