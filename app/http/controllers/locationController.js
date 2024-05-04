const { MYLocation, Booking } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const express = require("express");
const router = express.Router();

class LocationController {
  //create location
  static create = async (req, res, next) => {
    try {
      const {
        Plot_Location,
        Percentage,
        isActive
      } = req.body;
    //   console.log("sdfjklllllllllll",req.body);
      const row = await MYLocation.create({
        Plot_Location,
        Percentage,
        isActive
      });
      res.status(200).json({
        message: "Location added successfully",
        status: 200,
        location: row,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  //get all location
  static getAllLocation = async (req, res, next) => {
    try {
      const locations = await MYLocation.findAll();
      if (!locations) {
        return next(CustomErrorHandler.notFound("LOCATIONS not found"));
      }
      res.status(200).json({
        status: 200,
        message: "all Location retrieved successfully",
        locations: locations,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  //get location by id
  static getLocationById = async (req, res, next) => {
    const locationId = req.query.id;
    // console.log("🚀 ~ file: locationController.js:46 ~ LocationController ~ getLocationById= ~ locationId:", locationId)
    try {
      const location = await MYLocation.find({where:{Location_ID:locationId}});
      //if id not found
      if (!location) {
        return next(CustomErrorHandler.notFound("Location not found"));
      }
      res.status(200).json({
        status: 200,
        message: "single location retrieved successfully",
        location: location,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  //update location
  static updateLocation = async (req, res, next) => {
    const locationId = req.query.id;
    try {
      const [updatedRowsCount, updatedRows] = await MYLocation.update(req.body, {
        where: { Location_ID: locationId },
        returning: true,
      });
      if (updatedRowsCount === 0) {
        return next(CustomErrorHandler.notFound("Location not found"));
      }
      res.status(200).json({
        status: 200,
        message: "Location updated successfully",
        locations: updatedRows,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  //delete location
  static deleteLocation = async (req, res, next) => {
    const locationId = req.query.id;
    try {
      const deletedRowsCount = await MYLocation.destroy({
        where: { Location_ID: locationId },
      });
      if (deletedRowsCount === 0) {
        return next(CustomErrorHandler.notFound("Location not found"));
      }
      res.status(200).json({
        status: 200,
        message: "Location deleted successfully",
        deletedRowsCount: deletedRowsCount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = LocationController;
