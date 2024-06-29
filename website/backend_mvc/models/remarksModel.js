// remarksModel.js
// const sql = require("mssql");
// const config = require("../config"); // Assuming your config file is named dbConfig.js
// const poolPromise = new sql.ConnectionPool(config)
//   .connect()
//   .then((pool) => {
//     console.log("Connected to MSSQL");
//     return pool;
//   })
//   .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const { fetchRequestNames } = require("../utils/fetchAllRequestIds");

async function getRemarksWithRequests(request_id) {
  try {
    // const pool = await poolPromise;
    const query1 = `WITH RequestHierarchy AS (
      SELECT
          request_name AS request_id,
          parent_request_name
      FROM
          dbo.pre_approved_request_status_mvc
      WHERE
          request_name = '${request_id}'  -- Your specified request ID
  
      UNION ALL
  
      SELECT
          REPLACE(parent_request_name, 'RR', 'NR') AS request_id,  -- Transform parent request name
          NULL AS parent_request_name  -- Assuming there's only one level of parent
      FROM
          dbo.pre_approved_request_status_mvc
      WHERE
          request_name = '${request_id}'
  )
  SELECT DISTINCT
      r.request_id,
      r.id,
      r.user_id,
      r.comment,
      r.created_at
  FROM 
      dbo.Remarks AS r
  INNER JOIN
      RequestHierarchy rh ON r.request_id = rh.request_id;
  `;

    const requestIds = await fetchRequestNames(request_id);

    const query2 = `SELECT 
                    DISTINCT r.request_id,
                    r.id,
                    CONCAT(u.employee_name,'(',u.role,',',user_id,')') as user_id,
                    r.comment,
                    CONVERT(VARCHAR, CAST(r.created_at AS DATETIME2), 103) AS created_at
                    
                  FROM 
                    dbo.Remarks AS r
                  INNER JOIN define_roles AS u ON r.user_id = u.employee_id
                  WHERE r.request_id in ('${requestIds.join("', '")}')`;
    console.log(query2);

    //let result = await db.executeQuery(query1);
    // let result = await pool.request().query(query1);
    //if (result.recordset.length == 0)
    // result = await pool.request().query(query2);
    result = await db.executeQuery(query2);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function postRemark(remarkData) {
  try {
    // await sql.connect(config);
    const { request_id, user_id, comment } = remarkData;
    // const result = await sql.query(`
    //   INSERT INTO dbo.Remarks (request_id, user_id, comment, created_at)
    //   VALUES ('${request_id}', '${user_id}', '${comment}', GETDATE())
    //   SELECT SCOPE_IDENTITY() as id
    // `);
    let query = `INSERT INTO dbo.Remarks (request_id, user_id, comment, created_at)
    OUTPUT INSERTED.*
    VALUES ('${request_id}', '${user_id}', '${comment}', GETDATE())
    SELECT SCOPE_IDENTITY() as id
  `;
    const result = await db.executeQuery(query, {
      request_id: request_id,
      user_id: user_id,
      comment: comment,
    });
    // Add audit log for the update operation
    await addAuditLog("Remarks", result.recordset[0].id, "INSERT", null);
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
