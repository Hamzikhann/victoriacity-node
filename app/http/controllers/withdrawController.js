const { Withdraw, Withdrawal } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const express = require("express");
const router = express.Router();

class WithdrawController {
  static createWithdraw = async (req, res, next) => {
    try {
      const { amount, withdrawalId, date, description } = req.body;

      if (!(amount && withdrawalId)) {
        return next(
          CustomErrorHandler.wrongCredentials(
            "Amount and Withdrawal ID are required!"
          )
        );
      }
      const existingWithdrawal = await Withdrawal.findByPk(withdrawalId);
      if (!existingWithdrawal) {
        return res
          .status(400)
          .json({ status: 400, Message: "Withdrawal not found" });
      }

      // Calculate the updated balance
      const updatedBalance = existingWithdrawal.balance + amount;

      // Update the Withdrawal with the new balance
      const updatedWithdrawal = await Withdrawal.update(
        { balance: updatedBalance },
        { where: { id: withdrawalId } }
      );

      if (!updatedWithdrawal) {
        return res
          .status(500)
          .json({ error: "Failed to update Withdrawal balance" });
      }
      const newWithdraw = await Withdraw.create({
        amount,
        withdrawalId,
        description,
        date,
      });

      if (!newWithdraw) {
        return res
          .status(400)
          .json({ status: 400, Message: "Withdraw not Created" });
      }

      res.status(200).json({
        status: 200,
        message: "Withdraw Created Successfully",
        data: newWithdraw,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getAllWithdraws = async (req, res) => {
    try {
      const Withdraws = await Withdraw.findAll({
        include: [{ model: Withdrawal, as: "Withdrawal" }],
      });

      if (!Withdraws || Withdraws.length === 0) {
        return res.status(404).json({ error: "Withdraws not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Get Withdraws successfully",
        data: Withdraws,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getWithdrawById = async (req, res, next) => {
    try {
      const { id } = req.query;

      if (!id) {
        return next(CustomErrorHandler.wrongCredentials("Id is required"));
      }

      const withdraw = await Withdraw.findByPk(id, {
        include: [{ model: Withdrawal, as: "Withdrawal" }],
      });

      if (!withdraw) {
        return res.status(404).json({ error: "Withdraw not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Get Withdraw successfully",
        data: withdraw,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getWithdrawByWithdrawalId = async (req, res, next) => {
    try {
      const { id } = req.query;

      if (!id) {
        return next(CustomErrorHandler.wrongCredentials("Id is required"));
      }

      const withdraw = await Withdraw.findAll({
        where: { withdrawalId: id },
        include: [{ model: Withdrawal, as: "Withdrawal" }],
      });

      if (!withdraw) {
        return res.status(404).json({ error: "Withdraw not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Get Withdraw successfully",
        data: withdraw,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getAllWithdraw = async (req, res, next) => {
    try {
      const { id } = req.query;

      if (!id) {
        return next(CustomErrorHandler.wrongCredentials("Id is required"));
      }

      const withdraw = await Withdraw.findAll({
        where: { withdrawalId: id },
        include: [{ model: Withdrawal, as: "Withdrawal" }],
      });

      if (!withdraw) {
        return res.status(404).json({ error: "Withdraw not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Get Withdraw successfully",
        data: withdraw,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static updateWithdraw = async (req, res) => {
    try {
      const { id } = req.query;
      const { amount, withdrawalId } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Id is required" });
      }

      const withdraw = await Withdraw.findOne({ where: { id } });

      if (!withdraw) {
        return res.status(404).json({ error: "Withdraw not found" });
      }

      const updatedWithdraw = await Withdraw.update(
        { amount, withdrawalId },
        { where: { id } }
      );

      res.status(200).json({
        status: 200,
        message: "Withdraw updated successfully",
        data: updatedWithdraw,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static deleteWithdraw = async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Id is required" });
      }

      const Withdraw = await Withdraw.findOne({ where: { id } });

      if (!Withdraw) {
        return res.status(404).json({ error: "Withdraw not found" });
      }

      const deletedWithdraw = await Withdraw.destroy({ where: { id } });

      res.status(200).json({
        status: 200,
        message: "Withdraw deleted successfully",
        data: deletedWithdraw,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = WithdrawController;
