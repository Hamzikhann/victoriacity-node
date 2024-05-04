const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const AccountTransaction = require("../../models/AccountTransaction.js");
const AccountCategory = require("../../models/AccountsCategory.js");
const Employee = require("../../models/Employee.js");
const EmployeeSalaryHistory = require("../../models/EmployeeSalaryHistory.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler.js");
const {
  InstallmentReceipts,
  InstallmentType,
  Liability,
  Withdrawal,
  Payment_Mode,
  Sequelize,
  PayOff,
} = require("../../models/index.js");
const incomecategory = require("../../models/IncomeCategories.js");
const Project = require("../../models/project.js");
const csvUploadService = require("../../services/csvService.js");
const accounttransaction = require("../../models/AccountTransaction.js");
const csvtojson = require("csvtojson/v2/");
const XLSX = require("xlsx");
const expensecategory = require("../../models/ExpenseCategories.js");
const { Op } = require("sequelize");
const sequelize = require("../../../config/connectdb.js");
const AccountTransactionService = require("../../services/AccountTransactionService.js");

const fs = require("fs").promises;
dotenv.config();

class AccountTransactionController {
  static addAccountTransaction = async (req, res, next) => {
    const {
      amount,
      categoryId,
      date,
      type,
      projectId,
      receiptId,
      ledgerNo,
      description,
      balance,
    } = req.body;
    console.log({ amount, categoryId, date, type });
    if (!(amount && categoryId && type)) {
      return res.status(400).json({
        status: 400,
        message: "all fields are  required",
      });
    }
    if (type == "Expense") {
      if (!(ledgerNo && description && date)) {
        return res.status(400).json({
          status: 400,
          message: "all fields are  required ",
        });
      }
    }
    try {
      let transactions;
      let currentBalance = 0;
      if (type == "Expense") {
        currentBalance = await AccountTransaction.max("balance", {
          where: { type: "Expense", projectId: projectId },
        });
        transactions = new AccountTransaction({
          amount: amount,
          categoryId: categoryId,
          type: type,
          projectId: projectId,
          receiptId: receiptId,
          ledgerNo: ledgerNo,
          description: description,
          balance: parseInt(balance) + (parseInt(currentBalance) || 0),
          date: date,
        });
      } else {
        currentBalance = await AccountTransaction.max("balance", {
          where: { type: "Income", projectId: projectId },
        });
        transactions = new AccountTransaction({
          amount: amount,
          categoryId: categoryId,
          type: type,
          projectId: projectId,
          receiptId: receiptId,
          ledgerNo: ledgerNo,
          description: description,
          balance: parseInt(balance) + (parseInt(currentBalance) || 0),
          date: date,
        });
      }

      await transactions.save();

      return res.status(200).send({
        status: 200,
        message: "Add Transaction  successfully",
        AssetTypes: transactions,
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: "Unable to Add Transaction ",
        error: error,
      });
    }
  };
  //script to add data from installment Receipt to Account Transaction
  static receiptsToTransaction = async (req, res, next) => {
    try {
      const installmentReceipts = await InstallmentReceipts.findAll();

      const arr = await Promise.all(
        installmentReceipts.map(async (receipt) => {
          const findCat = await incomecategory.findOne({
            where: { title: "Installment" },
          });
          if (!findCat) {
            res.status(400).json({
              staus: 400,
              message: "Income category not found for title: Installment",
            });
            console.error("Income category not found for title: Installment");
            return null;
          }
          const project = await Project.findOne({
            where: { name: "Victoria City" },
          });
          return {
            amount: receipt.Installment_Paid,
            categoryId: findCat.id,
            date: receipt.createdAt,
            employeeSalaryHistory: null,
            type: "Income",
            projectId: project.id,
            receiptId: receipt.INS_RC_ID,
          };
        }),
      );

      // Insert data into the AccountTransaction table
      await AccountTransaction.bulkCreate(arr);
      return res
        .status(200)
        .json({ status: 200, Message: "Data Fetch Successfully" });
    } catch (error) {
      next(error);
    }
  };

  // //SEARCH Asset Type BY ID
  static getTransactionById = async (req, res, next) => {
    const { id } = req.query;
    console.log(req.query);
    try {
      const transactions = await AccountTransaction.findAll({
        include: [
          { as: "EmployeeSalaryHistory", model: EmployeeSalaryHistory },
          { as: "InstallmentReceipts", model: InstallmentReceipts },
        ],
        where: { id: id },
      });
      if (transactions.length > 0) {
        res.status(200).send({
          status: 200,
          message: "get transaction s successfully",
          AssetType: transactions,
        });
      } else {
        res.status(400).send({
          status: 404,
          message: "No transaction s Found against id",
        });
      }
    } catch (error) {
      return next(error);
    }
  };

  static getAllTransaction = async (req, res, next) => {
    console.log(req.query);
    try {
      const result = await AccountTransaction.findAll({
        include: [
          { as: "EmployeeSalaryHistory", model: EmployeeSalaryHistory },
          { as: "InstallmentReceipts", model: InstallmentReceipts },
        ],
      });
      if (result.length > 0) {
        res.status(200).send({
          status: 200,
          message: "get transaction s successfully",
          AssetType: result,
        });
      } else {
        res.status(400).send({
          status: 404,
          message: "No transaction Found",
        });
      }
    } catch (error) {
      return next(error);
    }
  };

  static updateAccountTransaction = async (req, res, next) => {
    try {
      const { id } = req.query;
      const { categoryId, amount, type, projectId } = req.body;

      const result = await AccountTransaction.findOne({ where: { id: id } });

      if (!result) {
        return res.status(404).json({
          status: 404,
          message: "Category not found",
        });
      }
      const category = await AccountCategory.findAll({
        where: { id: categoryId },
      });
      if (category.length <= 0) {
        return res
          .send(400)
          .json({ status: 400, Message: "Category Not found" });
      }

      // Update the category with the provided fields
      const Transaction = await AccountTransaction.update(
        {
          amount: amount,
          type: type,
          projectId: projectId,
          categoryId: categoryId,
        },
        { where: { id: id } },
      );

      return res.status(200).json({
        status: 200,
        message: "Category updated successfully",
        updatedCategory: result,
      });
    } catch (error) {
      // Handle any errors that occur during the process
      next(error);
    }
  };

  /////Delete Transaction

  static deleteAccountTransaction = async (req, res) => {
    const { id } = req.query;
    console.log("ooooooooooooooooo", id);
    if (id) {
      try {
        const result = await AccountTransaction.findAll({ where: { id: id } });

        if (result) {
          return res.status(400).json({
            status: 404,
            message: "Transaction not found",
          });
        }
        AccountTransaction.destroy({ where: { id: id } });

        return res.status(200).send({
          status: 200,
          message: "Transaction Deleted successfully",
          "Deleted Transaction": result,
        });
      } catch (error) {
        console.log(error);
        res.status(400).send({
          status: 400,
          message: "Unable to Deleted Transaction",
          error: error,
        });
      }
    } else {
      res.status(400).send({
        status: 400,
        message: "ID IS REQUIRED",
      });
    }
  };
  static getTransactionByProjectId = async (req, res, next) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 25;
    try {
      const { projectId, type } = req.query;
      if (!projectId || !type) {
        return res.status(400).json({
          status: 400,
          message: "All fields are required",
        });
      }
      let transaction;
      let result;
      if (projectId == 2 && type == "income") {
        let installmentReceipts = await InstallmentReceipts.findAll({
          attributes: [
            "InsType_ID",
            "INS_RC_ID",
            [
              Sequelize.fn("SUM", Sequelize.col("Installment_Paid")),
              "Installment_Paid",
            ],
            "Installment_Month",
            "INSTRUMENT_NO",
            "PMID",
            "IRC_Date",
            [Sequelize.literal("MONTH(IRC_Date)"), "month"],
            [Sequelize.literal("YEAR(IRC_Date)"), "year"],
          ],
          include: [
            { as: "Payment_Mode", model: Payment_Mode },
            { model: InstallmentType, as: "Installment_Type" },
          ],
          group: [
            "InsType_ID",
            Sequelize.literal("MONTH(IRC_Date)"),
            Sequelize.literal("YEAR(IRC_Date)"),
          ],
          order: [
            [Sequelize.literal("YEAR(IRC_Date)"), "DESC"],
            [Sequelize.literal("MONTH(IRC_Date)"), "DESC"],
          ],
          offset: limit * page,
          limit: limit,
        });

        const {result, total} = await AccountTransactionService.getIncomeTransaction(limit, page)

        let balance = 0;
        const findIncomecategory = await incomecategory.findAll({
          where: { projectId: projectId },
        });
        const findInsType = await InstallmentType.findAll();

        // installmentReceipts.rows = installmentReceipts.map((item, i) => {
        //   let ledgerNo = i + 1;
        //   balance += +item.Installment_Paid;
        //   const categoryId = findIncomecategory.find(
        //     (el) => el.title == item.Installment_Type.Name,
        //   );
        //   return {
        //     id: item.INS_RC_ID,
        //     amount: item.Installment_Paid ? item.Installment_Paid : 0,
        //     balance: balance,
        //     categoryIncome: categoryId,
        //     categoryId,
        //     ledgerNo: ledgerNo,
        //     date: item.IRC_Date,
        //     type: "Income",
        //     description: item.INSTRUMENT_NO,
        //     projectId: projectId,
        //     receiptId: item.INS_RC_ID,
        //     pmId: item.PMID,
        //   };
        // });
        installmentReceipts.rows = result.map((item, i) => {
          let ledgerNo = i + 1;
          balance += +item.amount;
          let categoryId
          if (item.InsType_ID) {
             categoryId = findIncomecategory.find(
              (el) => el.title == findInsType.find((it)=> it.InsType_ID == item.InsType_ID).Name,
            );
          }else{
            categoryId = findIncomecategory.find((el)=> el.id == item.categoryId)
          }
          return {
            id: item.id,
            amount: item.amount ? item.amount : 0,
            balance: balance,
            categoryIncome: categoryId,
            categoryId,
            ledgerNo: ledgerNo,
            date: item.date,
            type: "Income",
            description: item.description,
            projectId: projectId,
            receiptId: item.INS_RC_ID,
            pmId: item.PMID,
          };
        });
        installmentReceipts.count = total[0].total_count;
        transaction = installmentReceipts;
      } else {
        transaction = await AccountTransaction.findAndCountAll({
          include: [
            { as: "InstallmentReceipts", model: InstallmentReceipts },
            { as: "categoryExpense", model: expensecategory },
            { as: "categoryIncome", model: incomecategory },
          ],
          where: { projectId: projectId, type: type },
          offset: limit * page,
          limit: limit,
        });
      }

      if (transaction.rows.length > 0) {
        return res.status(200).json({
          status: 200,
          message: "Transaction found",
          Transaction: transaction.rows,
          result,
          totalPage: Math.ceil(transaction.count / limit) + 1,
          totalRecords: transaction.count,
          page,
          limit,
        });
      }
      return res.status(404).json({
        status: 404,
        message: "Transaction not found",
      });
    } catch (error) {
      return next(error);
    }
  };

  static async uploadCSV(req, res) {
    try {
      const { projectId, type } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const project = await Project.findOne({ where: { id: projectId } });

      if (!project) {
        return res.status(404).json({ error: "Project  not found!" });
      }
      const workbook = XLSX.readFile(req.file.path);
      const sheet_name_list = workbook.SheetNames;
      const records = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[1]],
      );
      let data = [];
      let titles = [];
      let category = null;
      for (let item of records) {
        const title = item["ACCOUNT TYPE"];
        titles.push(title);
        if (title) {
          if (type == "Expense") {
            const find = await expensecategory.findOne({
              where: {
                title: {
                  [Op.like]: item["MAIN HEAD ACCOUNTS"],
                },
                projectId: project.id,
                parentId: null,
              },
            });
            if (find) {
              category = await expensecategory.findOne({
                where: {
                  title: {
                    [Op.like]: title.trim(),
                  },
                  projectId: project.id,
                  parentId: find.id,
                },
              });
            }
          }
          if (type == "Income") {
            category = await incomecategory.findOne({
              where: {
                title: {
                  [Op.like]: title,
                },
                projectId: project.id,
              },
            });
          }

          // console.log("HHHHHHHHHHHHHHHHHHHHH", category);
          // if(!category){
          //   return res.status(404).json({ error: 'category  not found!' });
          // }
          if (category) {
            if (typeof item["DATE"] == "number") {
              if (item["FOLIO"] == 2262) {
                data.push({
                  amount: item["DEBIT"]
                    ? item["DEBIT"]
                    : item[" DEBIT "]
                      ? item[" DEBIT "]
                      : item[" DEBIT  "],
                  balance: item["BALANCE"]
                    ? item["BALANCE"]
                    : item[" BALANCE "],
                  categoryId: category.id,
                  ledgerNo: item["FOLIO"],
                  date: new Date(
                    Math.round((item["DATE"] - 25569) * 86400 * 1000),
                  )
                    .toISOString()
                    .substring(0, 10),
                  type: type,
                  description: `${item["DESCRIPTION"]} ${item["ACCOUNT NAME"]}`,
                  projectId: project.id,
                });
              }
            }
          }
        }
      }
      // console.log('JJJJJJJJJJJJJJ', data)
      await accounttransaction.bulkCreate(data);

      return res.status(200).json({
        status: 200,
        message: "Records inserted successfully",
        records,
        data,
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  static partnerData = async (req, res, next) => {
    try {
      const allProjects = await Project.findAll();
      const liability = await Liability.findAll();
      const withdrawal = await Withdrawal.findAll();
      const projectData = [];

      const {result:installments} = await AccountTransactionService.getIncomeTransaction()
      for (const project of allProjects) {
        const projectId = project.id;
        const projectName = project.name;

        const allIncome = await accounttransaction.findAll({
          where: { projectId, type: "Income" },
        });

        const allExpense = await accounttransaction.findAll({
          where: { projectId, type: "Expense" },
        });

        let totalIncome = allIncome
          .map((item) => item.amount)
          .reduce((acc, curr) => acc + +curr, 0);

        const totalExpense = allExpense
          .map((item) => item.amount)
          .reduce((acc, curr) => acc + +curr, 0);

        if (projectId == 2) {
          totalIncome = installments
            .map((item) => item.amount)
            .reduce((acc, curr) => acc + +curr, 0);
        }
        const profit = totalIncome - totalExpense;

        projectData.push({
          projectId,
          projectName,
          totalIncome,
          totalExpense,
          profit,
        });
      }

      const totalLiabilityAmount = liability
        .map((item) => item.balance)
        .reduce((acc, curr) => acc + +curr, 0);

      const totalWithdrawalBalance = withdrawal
        .map((item) => item.balance)
        .reduce((acc, curr) => acc + +curr, 0);
      const totalProjectIncome = projectData
        .map((project) => project.totalIncome)
        .reduce((acc, curr) => acc + +curr, 0);

      const totalProjectExpense = projectData
        .map((project) => project.totalExpense)
        .reduce((acc, curr) => acc + +curr, 0);
      const totalProjectProfit = projectData
        .map((project) => project.profit)
        .reduce((acc, curr) => acc + +curr, 0);
      const payoff = await PayOff.findAll();
      const totalPayoff = payoff
        .map((project) => project.amount)
        .reduce((acc, curr) => acc + +curr, 0);

      const liabilityProfit =
        totalProjectIncome - totalProjectExpense - totalLiabilityAmount;
      const WithdrawalProfit =
        totalProjectIncome - totalProjectExpense - totalWithdrawalBalance;
      const totalProfit =
        totalProjectProfit - totalLiabilityAmount - totalWithdrawalBalance;
      const spotClosing =
        totalProjectIncome -
        (totalProjectExpense + +totalPayoff + totalWithdrawalBalance);
      return res.status(200).json({
        status: 200,
        message: "Get Data Successfully",
        data: [
          {
            liabilityProfit,
            WithdrawalProfit,
            totalWithdrawalBalance,
            totalProfit,
            projectData,
            totalProjectProfit,
            spotClosing,
            payoff:
              totalProjectExpense + +payoff.total + totalWithdrawalBalance,
          },
        ],
      });
    } catch (err) {
      return next(CustomErrorHandler.serverError(err));
    }
  };

  static specificIncomeToTransaction = async (req, res, next) => {
    try {
      const installmentReceipts = await InstallmentReceipts.findAll({
        include: [{ as: "Installment_Type", model: InstallmentType }],
        order: [["INS_RC_ID", "ASC"]],
      });

      installmentReceipts.map(async (receipt) => {
        if (receipt.Installment_Type && receipt.Installment_Type.Name) {
          const findCat = await incomecategory.findOne({
            where: { title: receipt.Installment_Type.Name },
          });
          if (findCat) {
            let balance = await AccountTransaction.max("balance", {
              where: { type: "Income", projectId: 2 },
            });
            await AccountTransaction.create({
              ledgerNo: receipt.INS_RC_ID,
              amount: receipt.Installment_Paid,
              balance: balance + receipt.Installment_Paid,
              categoryId: findCat.id,
              date: receipt.IRC_Date,
              pmId: receipt.PMID,
              type: "Income",
              receiptId: receipt.INS_RC_ID,
              description: receipt.INSTRUMENT_NO,
              projectId: 2,
            });
          }
        }
      }),
        res
          .status(200)
          .json({ status: 200, Message: "Data Fetch Successfully" });
    } catch (error) {
      next(error);
    }
  };

  static downloadCsv = async (req, res) => {
    try {
      const transactions = await AccountTransaction.findAll({
        include: [
          { model: AccountCategory, as: "Category" },
          { model: EmployeeSalaryHistory, as: "EmployeeSalaryHistory" },
          { model: InstallmentReceipts, as: "InstallmentReceipts" },
        ],
      });

      const dataStream = await csvUploadService.downloadCsv(transactions);

      res.setHeader("Content-Type", "application/vnd.openxmlformats");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=AccountTransactions.csv`,
      );
      return res.sendFile(dataStream);
    } catch (error) {
      console.error("Error in downloadCsvController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

// export default AssetTypeController;
module.exports = AccountTransactionController;
