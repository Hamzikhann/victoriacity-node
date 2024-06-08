// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import cors from "cors";
// import apiRoutes from "./routes/apiRoutes.js";
// import errorHandler from "./app/http/middlewares/errorHandler.js";
// import path from "path";
// import fileUpload from "express-fileupload";

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes.js");
const routeTest = require("./routes/routTest.js");
const errorHandler = require("./app/http/middlewares/errorHandler.js");
const path = require("path");
const db = require("./app/models/index.js");

const app = express();

// Database Connection
db.sequelize.sync().then(() => {
	console.log("MYSQL Database synchronized");
});

//app port
const port = process.env.APP_PORT;

global.appRoot = path.resolve(__dirname);

//CORS Policy
app.use(
	cors({
		origin: "*"
	})
);

// app.use(fileUpload());

//JSON
app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true }));

// app.use(express.json())
app.use("/uploads", express.static("uploads"));
//load routes
app.use("/api", apiRoutes);

//Error Handler Middleware
app.use(errorHandler);

app.listen(port, () => {
	console.log(`Server listening at http://${process.env.HTTP}:${port}`);
});
