// const sql = require("mssql");
const db = require("../config/db");
const config = require("../../backend_mvc/config");
const { addAuditLog } = require("../utils/auditTrails");
const { json } = require("body-parser");
// const poolPromise = new sql.ConnectionPool(config)
//   .connect()
//   .then((pool) => {
//     console.log("Connected to MSSQL");
//     return pool;
//   })
//   .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

const getRulesByApproverAndLevel = async (approver, level) => {
  try {
    // await sql.connect(config);
    // const result =
    //   await sql.query`SELECT * FROM rule_mvc WHERE approver = ${approver} AND level = ${level}`;
    const query = `SELECT * FROM rule_mvc WHERE approver = @approver AND level = @level`;
    let result = await db.executeQuery(query, { "approver": approver, "level": level });
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

const getApproversByLevels = async () => {
  try {
    // await sql.connect(config);
    // const result =
    //   await sql.query`SELECT level, STRING_AGG(approver, ',') AS approvers
    // FROM rule_Mvc
    // GROUP BY level
    // ORDER BY level`;
    const query = `SELECT level, STRING_AGG(approver, ',') AS approvers
    FROM rule_Mvc
    GROUP BY level
    ORDER BY level`;
    let result = await db.executeQuery(query);
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

const postApproversByLevels = async (data) => {
  try {
    let result = await db.executeQuery('EXEC UpdateAndInsertRule @RuleData', { "RuleData": JSON.stringify(data) });
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

module.exports = {
  getRulesByApproverAndLevel,
  getApproversByLevels,
  postApproversByLevels
};
