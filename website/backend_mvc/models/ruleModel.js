const sql = require("mssql");
const config = require("../../backend_mvc/config");

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
