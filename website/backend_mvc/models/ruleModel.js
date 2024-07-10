const db = require("../config/db");
const config = require("../../backend_mvc/config");
const { addAuditLog } = require("../utils/auditTrails");
const { json } = require("body-parser");
const logger = require("../utils/logger");

const getRulesByApproverAndLevel = async (approver, level) => {
  logger.info(`getRulesByApproverAndLevel called with approver: ${approver} level: ${level}`);
  try {
    const query = `SELECT * FROM rule_mvc WHERE approver = @approver AND level = @level`;
    let result = await db.executeQuery(query, { "approver": approver, "level": level });
    logger.info(`getRulesByApproverAndLevel result: #{result}`);
    return result.recordset;
  } catch (err) {
    logger.error(`Database connection error in getRulesByApproverAndLevel:${err}`); 
    throw err;
  }
};

const getApproversByLevels = async () => {
  logger.info("getApproversByLevels called");
  try {
    const query = `SELECT level, STRING_AGG(approver, ',') AS approvers
    FROM rule_Mvc
    GROUP BY level
    ORDER BY level`;
    let result = await db.executeQuery(query);
    logger.info(`getApproversByLevels result: ${result}`);
    return result.recordset;
  } catch (err) {
    logger.error(`Database connection error in getApproversByLevels:${err}`);
    throw err;
  }
};

const postApproversByLevels = async (data) => {
  logger.info(`postApproversByLevels called with data: ${data}`); 
  try {
    let result = await db.executeQuery('EXEC UpdateAndInsertRule @RuleData,@Region', { "RuleData": JSON.stringify(data),"Region":data[0].region });
    logger.info(`postApproversByLevels result: ${result}`);
    return result.recordset;
  } catch (err) {
    logger.error(`Database connection error in postApproversByLevels: ${err}`);
    throw err;
  }
};

module.exports = {
  getRulesByApproverAndLevel,
  getApproversByLevels,
  postApproversByLevels
};
