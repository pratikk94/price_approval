const sql = require("mssql");
const config = require("../../backend_mvc/config");
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
    let pool = await sql.connect(config);
    let query = `SELECT [id] as id,[desc] as name from sales_office`;

    let result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  } finally {
    sql.close();
  }
}

async function getGradeWithPC(fsc) {
  try {
    let pool = await sql.connect(config);
    const query = `SELECT id as code,grade,FSC_Y_N,Grade_Description as name,Profit_Centre as profitCenter 
    FROM profit_center where status = 1 and FSC_Y_N = '${fsc}'`;

    let result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  } finally {
    sql.close();
  }
}


async function addRule(data) {
  try {
    console.log(data);
    const {
      rule_name,
      profit_center,
      region,
      valid_from,
      valid_to,
      active,
      rm,
      nsm,
      hdsm,
      validator,
      created_at,
    } = data;
    const profitCenterString = profit_center.join(","); // Convert array to string if needed
    console.log(profitCenterString, "testing........")
    let pool = await sql.connect(config);
    const query = `INSERT INTO defined_rules (rule_name, profit_center, region, valid_from, valid_to, active, rm, nsm, hdsm, validator, created_at)
          VALUES (${rule_name}, ${profitCenterString}, ${region}, ${valid_from}, ${valid_to}, ${active}, ${rm}, ${nsm}, ${hdsm}, ${validator}, ${created_at})`;

    let result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  } finally {
    sql.close();
  }
}

module.exports = {
  getValuesByParams,
  getSalesRegion,
  getGradeWithPC,
  addRule
};
