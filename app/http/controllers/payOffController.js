const { PayOff, Liability } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const express = require("express");
const router = express.Router();

class PayOffController {
  static createPayOff = async (req, res, next) => {
    try {
      const { amount, liabilityId, date, description } = req.body;

      if (!(amount && liabilityId)) {
        return next(
          CustomErrorHandler.wrongCredentials(
            "Amount and Liability ID are required!"
          )
        );
      }
      const existingLiability = await Liability.findByPk(liabilityId);
      if (amount > existingLiability.balance) {
        return res
          .status(400)
          .json({
            status: 400,
            Message: "Liability Have INSUFFICIENT BALANCE",
          });
      }
      if (!existingLiability) {
        return res
          .status(400)
          .json({ status: 400, Message: "Liability not found" });
      }

      // Calculate the updated balance
      const updatedBalance = existingLiability.balance - amount;

      // Update the liability with the new balance
      const updatedLiability = await Liability.update(
        { balance: updatedBalance },
        { where: { id: liabilityId } }
      );

      if (!updatedLiability) {
        return res
          .status(500)
          .json({ error: "Failed to update Liability balance" });
      }
      const newPayOff = await PayOff.create({
        amount,
        liabilityId,
        description,
        date,
      });

      if (!newPayOff) {
        return res
          .status(400)
          .json({ status: 400, Message: "Payoff not Created" });
      }

      res.status(200).json({
        status: 200,
        message: "Payoff Created Successfully",
        data: newPayOff,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getAllPayOffs = async (req, res) => {
    try {
      const payOffs = await PayOff.findAll({
        include: [{ model: Liability, as: "Liability" }],
      });

      if (!payOffs || payOffs.length === 0) {
        return res.status(404).json({ error: "PayOffs not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Get PayOffs successfully",
        data: payOffs,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getPayOffById = async (req, res, next) => {
    try {
      const { id } = req.query;

      if (!id) {
        return next(CustomErrorHandler.wrongCredentials("Id is required"));
      }

      const payOff = await PayOff.findByPk(id, {
        include: [{ model: Liability, as: "Liability" }],
      });

      if (!payOff) {
        return res.status(404).json({ error: "PayOff not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Get PayOff successfully",
        data: payOff,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getPayOffByLiabilityId = async (req, res, next) => {
    try {
      const { id } = req.query;

      if (!id) {
        return next(CustomErrorHandler.wrongCredentials("Id is required"));
      }

      const payOff = await PayOff.findAll({
        where: { liabilityId: id },
        include: [{ model: Liability, as: "Liability" }],
      });

      if (!payOff) {
        return res.status(404).json({ error: "PayOff not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Get PayOff successfully",
        data: payOff,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getAllPayoff = async (req, res, next) => {
    try {
      const { id } = req.query;

      if (!id) {
        return next(CustomErrorHandler.wrongCredentials("Id is required"));
      }

      const payOff = await PayOff.findAll({
        where: { liabilityId: id },
        include: [{ model: Liability, as: "Liability" }],
      });

      if (!payOff) {
        return res.status(404).json({ error: "PayOff not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Get PayOff successfully",
        data: payOff,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static updatePayOff = async (req, res) => {
    try {
      const { id } = req.query;
      const { amount, liabilityId } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Id is required" });
      }

      const payOff = await PayOff.findOne({ where: { id } });

      if (!payOff) {
        return res.status(404).json({ error: "PayOff not found" });
      }

      const updatedPayOff = await PayOff.update(
        { amount, liabilityId },
        { where: { id } }
      );

      res.status(200).json({
        status: 200,
        message: "PayOff updated successfully",
        data: updatedPayOff,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static deletePayOff = async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Id is required" });
      }

      const payOff = await PayOff.findOne({ where: { id } });

      if (!payOff) {
        return res.status(404).json({ error: "PayOff not found" });
      }

      const deletedPayOff = await PayOff.destroy({ where: { id } });

      res.status(200).json({
        status: 200,
        message: "PayOff deleted successfully",
        data: deletedPayOff,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = PayOffController;
