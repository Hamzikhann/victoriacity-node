// import Sequelize from 'sequelize';
// import dotenv from 'dotenv'
// dotenv.config()
const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

// const connectDB = mysql.createConnection({
//     host : ,
//     database : ,
//     user : ,
//     password :
// });

const sequelize = new Sequelize(
	process.env.DB_DATABASE,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: process.env.DB_CONNECTION,
		port: Number(process.env.DB_PORT), // Add this line
		pool: {
			max: 15,
			min: 0,
			acquire: 90000000,
			idle: 10000
		}
	},
	// process.env.DB_PORT
);

// const sqlServerConfig = {
//     dialect: 'mssql',
//     dialectOptions: {
//       options: {
//         encrypt: false, // For non-SSL connections
//       },
//     },
//     host: process.env.SQL_SERVER_HOST,
//     port: 1433, // Change to your SQL Server port if it's different
//     username: process.env.SQL_SERVER_USER,
//     password: process.env.SQL_SERVER_PASSWORD,
//     database: process.env.SQL_SERVER_DATABASE,
//   };

// const msSql = new Sequelize(sqlServerConfig);

// const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME,
//     process.env.DB_PASSWORD, {
//     host: "localhost",
//     // port: "49394",  // <----------------The port number you copied
//     dialect: "mssql",
//     operatorsAliases: false,
//     pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//     }
// });

// connectDB.connect (function(error){
//     if(error){
//         throw error;
//     }else{
//         console.log('MySQL Database is connected successfully!');
//     }
// });

sequelize
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully.");
	})
	.catch((error) => {
		console.error("Unable to connect to the database: ", error);
	});

//  msSql.authenticate().then(() => {
//     console.log('SQL Server Connection has been established successfully.');
// }).catch((error) => {
//     console.error('Unable to connect to the SQL Server database: ', error);
// });

// export default sequelize;
module.exports = sequelize;
