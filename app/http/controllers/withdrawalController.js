const { Withdrawal } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const express = require("express");
const router = express.Router();

class WithdrawalController {
  static createWithdrawal = async (req, res, next) => {
    try {
      const { name, description, amount, balance } = req.body;
      if (!(name && description && balance)) {
        return next(
          CustomErrorHandler.wrongCredentials("All fields are required!")
        );
      }
      const newWithdrawal = await Withdrawal.create({
        name,
        description,
        amount,
        balance,
      });
      res.status(200).json({status:200,Message:"Added Successfullt",data:newWithdrawal});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getAllWithdrawal = async (req, res) => {
    try {
      const withdrawal = await Withdrawal.findAll();
      if (!withdrawal) {
        return res.status(404).json({ error: "Withdrawal not found" });
      }
      res
        .status(200)
        .json({
          status: 200,
          message: "get Withdrawal successfully",
          data: withdrawal,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({status:500, error: "Internal Server Error" });
    }
  };
  
  static getAllWithdrawalForUser = async (req, res) => {
    try {
      const withdrawal = await Withdrawal.findAll();
      if (!withdrawal) {
        return res.status(404).json({ error: "Withdrawal not found" });
      }
      res
        .status(200)
        .json({
          status: 200,
          message: "get Withdrawal successfully",
          data: withdrawal,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({status:500, error: "Internal Server Error" });
    }
  };

  static getWithdrawalById = async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        next(CustomErrorHandler.wrongCredentials("Id is Required"));
      }
      const withdrawal = await Withdrawal.findByPk(id);

      if (!withdrawal) {
        return res.status(404).json({ error: "Withdrawal not found" });
      }

      res
        .status(200)
        .json({
          status: 200,
          message: "get Withdrawal successfully",
          data: withdrawal,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getWithdrawalForUserById = async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        next(CustomErrorHandler.wrongCredentials("Id is Required"));
      }
      const withdrawal = await Withdrawal.findByPk(id);

      if (!withdrawal) {
        return res.status(404).json({ error: "Withdrawal not found" });
      }

      res
        .status(200)
        .json({
          status: 200,
          message: "get Withdrawal successfully",
          data: withdrawal,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static updateWithdrawal = async (req, res) => {
    try {
      const { id } = req.query;
      const { name, description, amount, balance } = req.body;

      // Check if any of the fields are missing
      if (!id) {
        return res.status(400).json({ error: "Id is required" });
      }
      const withdrawal = await Withdrawal.findOne({ where: { id: id } });
      if (!withdrawal) {
        next(CustomErrorHandler.notFound("No Withdrawal Found"));
      }
      const updatedWithdrawal = await Withdrawal.update(
        { name, description, amount, balance },
        { where: { id: id } }
      );
      res
        .status(200)
        .json({
          status: 200,
          message: "Withdrawal updated successfully",
          data: updatedWithdrawal,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static deleteWithdrawal = async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Id is required" });
      }
      const withdrawal = await Withdrawal.findOne({ where: { id: id } });
      if (!withdrawal) {
        next(CustomErrorHandler.notFound("No Withdrawal Found"));
      }
      const deleteWithdrawal = await Withdrawal.destroy({ where: { id: id } });
      res
        .status(200)
        .json({
          status: 200,
          message: "Withdrawal delete successfully",
          data: deleteWithdrawal,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static withdrawalTotalAmount = async (req, res) => {
    try {
      // Fetch all withdrawal
      const withdrawal = await Withdrawal.findAll();
  
      if (!withdrawal || withdrawal.length === 0) {
        return res.status(404).json({ error: "withdrawal not found" });
      }
  
      // Calculate total amount and total balance
      const totalAmount = withdrawal.reduce((acc, Withdrawal) => acc + Withdrawal.amount, 0);
      const totalBalance = withdrawal.reduce((acc, Withdrawal) => acc + Withdrawal.balance, 0);
  
      res.status(200).json({
        status: 200,
        message: "Get withdrawal totals successfully",
        data: {
          totalAmount,
          totalBalance,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 500, error: "Internal Server Error" });
    }
  };
  
}
module.exports = WithdrawalController;
