const { CREATED_BY } = require("../config/constants");
const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const logger = require("../utils/logger");

async function getValuesByParams(paramsList) {

  try {
    logger.info("Fetching values by params", { paramsList });

    let paramsString = paramsList.map((param) => `'${param}'`).join(",");
    let query = `SELECT [id], [params], [value], [status] FROM [dbo].[business_admin] WHERE [params] IN (${paramsString})`;


    let result = await db.executeQuery(query);
    logger.info("Values fetched successfully", { count: result.recordset.length });

    return result.recordset;
  } catch (err) {
    logger.error("SQL error in getValuesByParams", { error: err.message });
    throw err;
  }
}

async function getSalesRegion() {

  try {
    logger.info("Fetching sales regions");
    let query = `SELECT [id] as id,[desc] as name from sales_office`;

    let result = await db.executeQuery(query);
    logger.info("Sales regions fetched successfully", { count: result.recordsets.length });

    return result.recordsets;
  } catch (err) {
    logger.error("SQL error in getSalesRegion", { error: err.message });
    throw err;
  }
}

async function getGradeWithPC(fsc) {

  try {
    logger.info("Fetching grades with profit centers", { fsc });
    let result = await db.executeQuery("EXEC GetProfitCentersByFSC @fsc", {
      fsc: fsc,
    });
    return result.recordsets;
  } catch (err) {
    logger.error("SQL error in getGradeWithPC", { error: err.message });
    throw err;
  }
}

async function addRule(data) {
  try {
    logger.info("Adding new rule", { data });

    const query = `INSERT INTO defined_rules (rule_name, profit_center, region, valid_from, valid_to, active, rm, nsm, hdsm, validator, created_at)
    OUTPUT INSERTED.* 
    VALUES (@rule_name, @profit_center, @region,@valid_from, @valid_to, @active, @rm, @nsm, @hdsm, @validator, @created_at)`;

    const inputs = {
      rule_name: data.rule_name,
      profit_center: data.profit_center.join(","),
      region: data.region,
      valid_from: data.valid_from,
      valid_to: data.valid_to,
      active: data.active,
      rm: data.rm,
      nsm: data.nsm,
      hdsm: data.hdsm,
      validator: data.validator,
      created_at: data.created_at,
    };

    let result = await db.executeQuery(query, inputs);
    logger.info("Rule added successfully", { ruleId: result.recordset[0].id });

    // Add audit log for the update operation
    await addAuditLog("defined_rules", result.recordset[0].id, "INSERT", null);

    return result;
  } catch (err) {
    logger.error("SQL error in addRule", { error: err.message });
    throw err;
  }
}

async function getBusinessAdmin(type, fsc) {
  try {
    logger.info("Fetching business admin data", { type, fsc });

    let result = await db.executeQuery(
      "EXEC GetBusinessAdminData @queryType, @fsc",
      { queryType: type, fsc: fsc ? fsc : null }
    );

    return result;
  } catch (err) {
    logger.error("SQL error in getBusinessAdmin", { error: err.message });
    throw err;
  }
}

async function addEmployeeRole(
  employee_id,
  employee_name,
  role,
  region,
  created_date,
  active
) {
  try {
    logger.info("Adding employee role", { employee_id, employee_name, role, region, created_date, active });

    let result = await db.executeQuery(
      `EXEC InsertEmployeeRole @employee_id, @employee_name, @role, @region, @created_by, @created_date, @active`,
      {
        employee_id: employee_id,
        employee_name: employee_name,
        role: role,
        region: region,
        created_by: CREATED_BY,
        created_date: created_date,
        active: active,
      }
    );
    return result;
  } catch (err) {
    logger.error("SQL error in addEmployeeRole", { error: err.message });
    throw err;
  }
}

module.exports = {
  getValuesByParams,
  getSalesRegion,
  getGradeWithPC,
  addRule,
  getBusinessAdmin,
  addEmployeeRole,
};
