const sql = require("mssql");

const config = {
  user: "sa",
  password: "SayaliK20311",
  server: "localhost", // You can use 'localhost\\instance' if it's a local SQL Server instance
  //password: "12345",
  //server: "PRATIK-PC\\PSPD", // You can use 'localhost\\instance' if it's a local SQL Server instance
  port: 1433,
  database: "PriceApprovalSystem",
  options: {
    enableArithAbort: true,
    encrypt: true, // Use this if you're on Windows Azure
    // encrypt: false, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Use this if you're on a local development environment
  },
};

const getRulesByApproverAndLevel = async (approver, level) => {
  try {
    await sql.connect(config);
    const result =
      await sql.query`SELECT * FROM rule_mvc WHERE approver = ${approver} AND level = ${level}`;
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

const getApproversByLevels = async () => {
  try {
    await sql.connect(config);
    const result =
      await sql.query`SELECT level, STRING_AGG(approver, ',') AS approvers
    FROM rule_Mvc
    GROUP BY level
    ORDER BY level`;
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

module.exports = {
  getRulesByApproverAndLevel,
  getApproversByLevels,
};
