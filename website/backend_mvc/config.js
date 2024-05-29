const sql = require("mssql");

const config = {
  user: "sa",
  // password: "SayaliK20311",
  // server: "localhost", // You can use 'localhost\\instance' if it's a local SQL Server instance
  password: "12345",
  server: "PRATIK-PC\\PSPD", // You can use 'localhost\\instance' if it's a local SQL Server instance
  port: 1433,
  database: "PriceApprovalSystem",
  options: {
    enableArithAbort: true,
    encrypt: true, // Use this if you're on Windows Azure
    // encrypt: false, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Use this if you're on a local development environment
  },
};

module.exports = config;
