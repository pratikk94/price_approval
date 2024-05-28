//Request history.js
const sql = require("mssql");
const config = require("../config"); // Assuming your config file is named dbConfig.js

async function getTransactionsByRequestId(requestId) {
  try {
    await sql.connect(config);
    console.log(`Request id is ${requestId}`);
    const query = `
        WITH RankedTransactions AS (
          SELECT 
              t.id,
              t.rule_id,
              t.currently_pending_with,
              t.last_updated_by_role,
              t.last_updated_by_id,
              t.current_status,
              t.request_id,
              t.created_at,
              r.status,
              r.pending,
              ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY t.created_at DESC) as rn
          FROM 
              dbo.transaction_mvc AS t
          INNER JOIN 
              dbo.requests_mvc AS r ON t.request_id = r.req_id
      )
      SELECT
          id,
          rule_id,
          currently_pending_with,
          last_updated_by_role,
          last_updated_by_id,
          current_status,
          request_id,
          created_at,
          status,
          pending
      FROM
          RankedTransactions
      WHERE
      request_id = '${requestId}' and rn = 1
    `;

    const request = new sql.Request();
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

module.exports = {
  getTransactionsByRequestId,
};
