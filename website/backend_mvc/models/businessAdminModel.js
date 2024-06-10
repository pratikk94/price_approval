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

module.exports = {
  getValuesByParams,
};
