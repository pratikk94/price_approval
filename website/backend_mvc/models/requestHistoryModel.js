//Request history.js
// const sql = require("mssql");
// const config = require("../config"); // Assuming your config file is named dbConfig.js

const db = require("../config/db");

async function getTransactionsByRequestId(requestId) {
  try {
    // await sql.connect(config);
    console.log(`Request id is ${requestId}`);

    // Fetch all parent request IDs, recursively adjusting each to start with 'N'
    let currentRequestId = requestId;
    let requestIds = [requestId]; // Include the original request ID in the array
    let parentFound = true;

    while (parentFound) {
      const fetchParentIdQuery = `
        SELECT 
          parent_request_name
        FROM 
          dbo.pre_approved_request_status_mvc
        WHERE 
          request_name = '${currentRequestId}'
      `;
      // const parentIdResult = await new sql.Request().query(fetchParentIdQuery);
      const parentIdResult = await db.executeQuery(fetchParentIdQuery, {
        currentRequestId: currentRequestId,
      });
      if (
        parentIdResult.recordset.length > 0 &&
        parentIdResult.recordset[0].parent_request_name
      ) {
        // Replace first character of parent_request_name with 'N'
        currentRequestId = parentIdResult.recordset[0];
        // "N" + parentIdResult.recordset[0].parent_request_name.substring(1);
        requestIds.push(currentRequestId);
      } else {
        parentFound = false; // Stop the loop if no parent is found
      }
    }

    // Array to collect all transaction histories
    let allTransactions = [];

    // Run the query for each requestId
    for (const id of requestIds.reverse()) {
      const transactionHistoryQuery = `
      WITH RankedTransactions AS (
  SELECT 
      FORMAT(CONVERT(datetime2, t.created_at), 'dd/MM/yyyy h:mm tt') as formatted_created_at,
      t.id,
      t.rule_id,
      t.currently_pending_with,
      t.last_updated_by_role,
      t.last_updated_by_id,
      t.current_status,
      t.request_id,
      r.status,
      r.pending,
      ROW_NUMBER() OVER (PARTITION BY t.current_status ORDER BY CONVERT(datetime2, t.created_at) DESC) as rn
  FROM 
      dbo.transaction_mvc AS t
  INNER JOIN 
      dbo.requests_mvc AS r ON t.request_id = r.req_id
  WHERE 
      t.request_id = '${id}'
)
SELECT
    rt.id,
    rt.rule_id,
    rt.currently_pending_with,
    rt.last_updated_by_role,
    CONCAT(dr.employee_name, ' (', dr.role, ')') as last_updated_by_id,
    rt.current_status,
    rt.request_id,
    rt.pending,
    rt.formatted_created_at as created_at
FROM
    RankedTransactions as rt
INNER JOIN
    dbo.define_roles as dr ON rt.last_updated_by_id = dr.employee_id
WHERE
    rn = 1
ORDER BY
    rt.id ASC;
      `;

      // const transactionResult = await new sql.Request().query(
      //   transactionHistoryQuery
      // );
      console.log(transactionHistoryQuery);
      const transactionResult = await db.executeQuery(transactionHistoryQuery);
      allTransactions.push(...transactionResult.recordset); // Spread operator to flatten the results
    }

    return allTransactions;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

module.exports = {
  getTransactionsByRequestId,
};
