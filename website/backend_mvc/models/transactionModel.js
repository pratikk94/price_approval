const sql = require("mssql");

const config = {
  user: "sa",
  password: "SayaliK20311",
  server: "localhost", // You can use 'localhost\\instance' if it's a local SQL Server instance
  //password: "12345",
  //server: "PRATIK-PC\\PSPD", // You can use 'localhost\\instance' if it's a local SQL Server instance
  port: 1433,
  database: "PriceApprovalSystem",
  options: {
    enableArithAbort: true,
    encrypt: true, // Use this if you're on Windows Azure
    // encrypt: false, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Use this if you're on a local development environment
  },
};

// Make sure to maintain a connection pool instead of connecting in each function
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

const getTransactionsByRole = async (approver, pendingWith) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT * FROM transaction_mvc WHERE currently_pending_with = '${pendingWith}' AND last_updated_by_role = '${approver}'`
      );
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

const getTransactionByRequestId = async (requestId) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT TOP 1 * FROM transaction_mvc WHERE request_id = '${requestId}' ORDER BY id DESC`
      );
    return result.recordset[0];
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

const getTransactionsPendingWithRole = async (role) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT * FROM transaction_mvc WHERE currently_pending_with = '${role}'`
      );
    console.log(result.recordset);
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    return null;
  }
};

async function fetchTransactions(role) {
  try {
    await sql.connect(config);
    const result = await sql.query(
      `
            WITH MaxIds AS (
                SELECT MAX(id) AS maxId, request_id
                FROM transaction_mvc
                GROUP BY request_id
            ),
            MaxDetails AS (
                SELECT m.maxId, m.request_id, t.current_status
                FROM transaction_mvc t
                INNER JOIN MaxIds m ON t.id = m.maxId
            ),
            RelatedTransactions AS (
                SELECT t.*
                FROM transaction_mvc t
                INNER JOIN MaxDetails m ON t.request_id = m.request_id AND t.current_status = m.current_status
            )
            SELECT *
            FROM RelatedTransactions
            WHERE EXISTS (
                SELECT 1
                FROM transaction_mvc
                WHERE request_id = RelatedTransactions.request_id
                AND current_status = RelatedTransactions.current_status
                AND id != RelatedTransactions.id
            )
            AND currently_pending_with = '${role}'
            UNION
            SELECT *
            FROM transaction_mvc
            WHERE id IN (SELECT maxId FROM MaxDetails)
            AND currently_pending_with = '${role}';
        `
    );
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

module.exports = {
  getTransactionByRequestId,
  getTransactionsPendingWithRole,
  getTransactionsByRole,
  fetchTransactions,
};
