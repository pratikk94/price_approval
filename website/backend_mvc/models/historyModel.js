const sql = require("mssql");
const config = require("../config");
const poolPromise = new sql.ConnectionPool(config).connect();

exports.findRequests = async ({
  customerIds,
  consigneeIds,
  endUseId,
  plantIds,
  grade,
}) => {
  const customerIdsArray = customerIds ? customerIds.split(",") : [];
  const consigneeIdsArray = consigneeIds ? consigneeIds.split(",") : [];
  const plantIdsArray = plantIds ? plantIds.split(",") : [];

  const pool = await poolPromise;
  const request = new sql.Request(pool);

  // Start building the SQL query dynamically based on provided parameters.
  let query = `SELECT DISTINCT requests_mvc.req_id, requests_mvc.*, price_approval_requests_price_table.*
FROM price_approval_requests_price_table
INNER JOIN requests_mvc ON price_approval_requests_price_table.req_id = requests_mvc.req_id
WHERE price_approval_requests_price_table.grade = '${grade}'
  AND requests_mvc.status = 1
  AND requests_mvc.req_id IN (
      SELECT DISTINCT request_name 
      FROM price_approval_requests 
      WHERE 
  `;

  // Array to hold individual conditions to be joined later.
  let conditions = [];

  if (customerIdsArray.length) {
    conditions.push(`customer_id IN ('${customerIdsArray.join("', '")}')`);
  }
  if (consigneeIdsArray.length) {
    conditions.push(`consignee_id IN ('${consigneeIdsArray.join("', '")}')`);
  }
  if (plantIdsArray.length) {
    conditions.push(`plant IN ('${plantIdsArray.join("', '")}')`);
  }
  if (endUseId) {
    conditions.push(`end_use_id = '${endUseId}'`);
  }
  // if (grade) {
  //   conditions.push(`grade = '${grade}'`);
  // }

  // Check if there are any conditions to append, otherwise select all records.
  if (conditions.length) {
    query += ` ${conditions.join(" AND ")}`;
    query += ")";
  } else {
    // If no parameters are provided, the user might expect all records or an error.
    // This depends on your API design; here we select all records.
    query = `SELECT DISTINCT requests_mvc.req_id, requests_mvc.*, price_approval_requests_price_table.*
    FROM price_approval_requests_price_table
    INNER JOIN requests_mvc ON price_approval_requests_price_table.req_id = requests_mvc.req_id
    WHERE price_approval_requests_price_table.grade = '${grade}'
      AND requests_mvc.status = 1
      AND requests_mvc.req_id IN (
          SELECT DISTINCT request_name 
          FROM price_approval_requests);`;
  }

  try {
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error executing queries:", error);
    throw new Error("Internal Server Error");
  }
};
