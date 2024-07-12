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
    let result = await db.executeQuery(query, {
      approver: approver,
      level: level,
    });
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
    let result = await db.executeQuery(
      "EXEC UpdateAndInsertRule @RuleData,@Region",
      { RuleData: JSON.stringify(data), Region: data[0].region }
    );
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

async function getRulesByRegion(region) {
  try {
    // const pool = await poolPromise;
    const result = await db.executeQuery(
      `SELECT TOP (1000) [id], [rule_id], [region], [approver], [level], [valid_from], [valid_to], [created_at], [is_active] FROM [dbo].[rule_mvc] WHERE [region] = '${region}'`
    );
    return result.recordset;
  } catch (err) {
    throw new Error(err);
  }
}

const updateRules = async (rules) => {
  try {
    console.log(rules);
    for (const rule of rules) {
      db.executeQuery(
        ` UPDATE [PriceApprovalSystem].[dbo].[rule_mvc]
          SET region = @region, approvers = @approvers, level = @level,
              valid_from = @valid_from, valid_to = @valid_to, is_active = @is_active
          WHERE id = @id`,
        {
          id: rule.id,
          region: rule.region,
          approvers: rule.approvers.join(", "),
          level: rule.level,
          valid_from: rule.valid_from,
          valid_to: rule.valid_to,
          is_active: rule.is_active,
        }
      );
    }
  } catch (err) {
    throw new Error("Error updating rules: " + err.message);
  }
};

const addRule = async (rule) => {
  try {
    await db.executeQuery(`
      INSERT INTO [PriceApprovalSystem].[dbo].[rule_mvc] (region, approvers, level, valid_from, valid_to, is_active)
      VALUES (${rule.region}, ${rule.approvers.join(", ")}, ${rule.level}, ${
      rule.valid_from
    }, ${rule.valid_to}, ${rule.is_active})
    `);
  } catch (err) {
    throw new Error("Error adding rule: " + err.message);
  }
};

module.exports = {
  getRulesByApproverAndLevel,
  getApproversByLevels,
  postApproversByLevels,
  getRulesByRegion,
  updateRules,
  addRule,
};
