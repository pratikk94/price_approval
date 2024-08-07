// const sql = require("mssql");
// const config = require("../../backend_mvc/config");
const { CREATED_BY, SYMMETRIC_KEY_NAME, CERTIFICATE_NAME } = require("../config/constants");
const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");

async function getValuesByParams(paramsList) {
  try {
    // let pool = await sql.connect(config);
    let paramsString = paramsList.map((param) => `'${param}'`).join(",");
    let query = `SELECT [id], [params], [value], [status] FROM [dbo].[business_admin] WHERE [params] IN (${paramsString})`;

    // let result = await pool.request().query(query);
    let result = await db.executeQuery(query);

    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function getSalesRegion() {
  try {
    let query = `SELECT [id] as id,[desc] as name from sales_office`;

    let result = await db.executeQuery(query);

    return result.recordsets;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function getGradeWithPC(fsc) {
  try {
    let result = await db.executeQuery("EXEC GetProfitCentersByFSC @fsc", {
      fsc: fsc,
    });
    return result.recordsets;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function addRule(data) {
  try {
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
    // Add audit log for the update operation
    await addAuditLog("defined_rules", result.recordset[0].id, "INSERT", null);

    return result;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function getBusinessAdmin(type, fsc) {
  try {
    let result = await db.executeQuery(
     "EXEC GetBusinessAdminData @queryType, @fsc,@SymmetricKeyName,@CertificateName",
      {
        queryType: type, fsc: fsc ? fsc : null, SymmetricKeyName: SYMMETRIC_KEY_NAME,
        CertificateName: CERTIFICATE_NAME
      }
    );

    return result;
  } catch (err) {
    console.error("SQL error", err);
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
    let result = await db.executeQuery(
      `EXEC InsertEmployeeRole @employee_id, @employee_name, @role, @region, @created_by, @created_date, @active,@SymmetricKeyName,@CertificateName`,
      {
        employee_id: employee_id,
        employee_name: employee_name,
        role: role,
        region: region,
        created_by: CREATED_BY,
        created_date: created_date,
        active: active,
        SymmetricKeyName: SYMMETRIC_KEY_NAME,
        CertificateName: CERTIFICATE_NAME
      }
    );
    return result;
  } catch (err) {
    console.error("SQL error", err);
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
