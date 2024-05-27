// remarksModel.js
const sql = require("mssql");
const config = require("../config"); // Assuming your config file is named dbConfig.js
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

async function getRemarksWithRequests(request_id) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        DISTINCT r.request_id,
        r.id,
        r.user_id,
        r.comment,
        r.created_at
      FROM 
        dbo.Remarks AS r
      INNER JOIN 
        dbo.requests_mvc AS req
      ON 
        r.request_id = req.req_id
      WHERE r.request_id = '${request_id}'
    `);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function postRemark(remarkData) {
  try {
    await sql.connect(config);
    const { request_id, user_id, comment } = remarkData;
    const result = await sql.query(`
        INSERT INTO dbo.Remarks (request_id, user_id, comment, created_at)
        VALUES ('${request_id}', '${user_id}', '${comment}', GETDATE())
        SELECT SCOPE_IDENTITY() as id
      `);
    return result.recordset[0].id; // Returns the new remark ID
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

module.exports = {
  getRemarksWithRequests,
  postRemark,
};
