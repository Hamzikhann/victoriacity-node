const { Liability } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const express = require("express");
const router = express.Router();

class LiabilityController {
  static createLiability = async (req, res, next) => {
    try {
      const { name, description, amount, balance } = req.body;
      if (!(name && description && amount && balance)) {
        return next(
          CustomErrorHandler.wrongCredentials("All fields are required!")
        );
      }
      const newLiability = await Liability.create({
        name,
        description,
        amount,
        balance,
      });
      res.status(200).json({status:200,Message:"Added Successfullt",data:newLiability});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getAllLiabilities = async (req, res) => {
    try {
      const liability = await Liability.findAll();
      if (!liability) {
        return res.status(404).json({ error: "Liability not found" });
      }
      res
        .status(200)
        .json({
          status: 200,
          message: "get Liability successfully",
          data: liability,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({status:500, error: "Internal Server Error" });
    }
  };
  
  static getAllLiabilitiesForUser = async (req, res) => {
    try {
      const liability = await Liability.findAll();
      if (!liability) {
        return res.status(404).json({ error: "Liability not found" });
      }
      res
        .status(200)
        .json({
          status: 200,
          message: "get Liability successfully",
          data: liability,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({status:500, error: "Internal Server Error" });
    }
  };

  static getLiabilityById = async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        next(CustomErrorHandler.wrongCredentials("Id is Required"));
      }
      const liability = await Liability.findByPk(id);

      if (!liability) {
        return res.status(404).json({ error: "Liability not found" });
      }

      res
        .status(200)
        .json({
          status: 200,
          message: "get Liability successfully",
          data: liability,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getLiabilityForUserById = async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        next(CustomErrorHandler.wrongCredentials("Id is Required"));
      }
      const liability = await Liability.findByPk(id);

      if (!liability) {
        return res.status(404).json({ error: "Liability not found" });
      }

      res
        .status(200)
        .json({
          status: 200,
          message: "get Liability successfully",
          data: liability,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static updateLiability = async (req, res) => {
    try {
      const { id } = req.query;
      const { name, description, amount, balance } = req.body;

      // Check if any of the fields are missing
      if (!id) {
        return res.status(400).json({ error: "Id is required" });
      }
      const liabilities = await Liability.findOne({ where: { id: id } });
      if (!liabilities) {
        next(CustomErrorHandler.notFound("No liability Found"));
      }
      const updatedLiability = await Liability.update(
        { name, description, amount, balance },
        { where: { id: id } }
      );
      res
        .status(200)
        .json({
          status: 200,
          message: "Liability updated successfully",
          data: updatedLiability,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static deleteLiability = async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Id is required" });
      }
      const liabilities = await Liability.findOne({ where: { id: id } });
      if (!liabilities) {
        next(CustomErrorHandler.notFound("No liability Found"));
      }
      const deleteLiability = await Liability.destroy({ where: { id: id } });
      res
        .status(200)
        .json({
          status: 200,
          message: "Liability delete successfully",
          data: deleteLiability,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static liabilityTotalAmount = async (req, res) => {
    try {
      // Fetch all liabilities
      const liabilities = await Liability.findAll();
  
      if (!liabilities || liabilities.length === 0) {
        return res.status(404).json({ error: "Liabilities not found" });
      }
  
      // Calculate total amount and total balance
      const totalAmount = liabilities.reduce((acc, liability) => acc + liability.amount, 0);
      const totalBalance = liabilities.reduce((acc, liability) => acc + liability.balance, 0);
  
      res.status(200).json({
        status: 200,
        message: "Get Liabilities totals successfully",
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
module.exports = LiabilityController;
