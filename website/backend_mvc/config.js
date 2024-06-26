const sql = require("mssql");
require('dotenv').config();


const config = {
  user: process.env.DB_USER,
  // password: "12345",
  // server: "PRATIK-PC\\PSPD", // You can use 'localhost\\instance' if it's a local SQL Server instance
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // You can use 'localhost\\instance' if it's a local SQL Server instance
  port: 1433,
  database: process.env.DB_NAME,
  options: {
    enableArithAbort: true,
    encrypt: true, // Use this if you're on Windows Azure
    // encrypt: false, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Use this if you're on a local development environment
  },
};

module.exports = config;
