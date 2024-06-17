const sql = require("mssql");
const config = require("../../backend_mvc/config");
const db = require("../config/db");
async function getValuesByParams(paramsList) {
  try {
    let pool = await sql.connect(config);
    let paramsString = paramsList.map((param) => `'${param}'`).join(",");
    let query = `SELECT [id], [params], [value], [status] FROM [dbo].[business_admin] WHERE [params] IN (${paramsString})`;

    let result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  } finally {
    sql.close();
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
    const query = `SELECT id as code,grade,FSC_Y_N,Grade as name,Profit_Centre as profitCenter 
    FROM profit_center where status = 1 and FSC_Y_N = @fsc`;

    const inputs = {
      fsc: fsc,
    };

    let result = await db.executeQuery(query, inputs);
    return result.recordsets;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function addRule(data) {
  try {
    const query = `INSERT INTO defined_rules (rule_name, profit_center, region, valid_from, valid_to, active, rm, nsm, hdsm, validator, created_at)
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
};
