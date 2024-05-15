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

async function isValidRole(lastUpdatedByRole, currentlyPendingWith) {
  try {
    await sql.connect(config);
    // Fetch levels for the currently pending with role
    const levelsResult = await sql.query(
      `
          SELECT level FROM rule_mvc WHERE approver = '${currentlyPendingWith}'
      `
    );

    if (levelsResult.recordset.length === 0) {
      return false; // No roles found at the same level.
    }

    const levels = levelsResult.recordset.map((row) => row.level);

    // Check if last_updated_by_role is at any of these levels
    const checkRoleValidity = `
          SELECT COUNT(1) as Count FROM rule_mvc
          WHERE approver = '${lastUpdatedByRole}' AND level IN (${levels.join(
      ", "
    )})
      `;
    const validityResult = await sql.query(checkRoleValidity);
    console.log(validityResult.recordset[0].Count);
    return validityResult.recordset[0].Count > 0;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

async function acceptTransaction(
  requestId,
  lastUpdatedById,
  lastUpdatedByRole
) {
  try {
    await sql.connect(config);

    // Fetch the transaction with the highest ID for the provided request_id
    const transactionResult = await sql.query(
      `
          SELECT TOP 1 id, currently_pending_with , rule_id
          FROM transaction_mvc
          WHERE request_id = '${requestId}'
          ORDER BY id DESC
      `
    );

    let { currently_pending_with: currentRole, rule_id } =
      transactionResult.recordset[0];

    //Check for valid lastUpdatedByRole.
    // if (lastUpdatedByRole !== currentRole) {
    //   return {
    //     success: false,
    //     message: "Unauthorized access",
    //   };
    // }

    console.log(lastUpdatedByRole, currentRole);
    const result = await isValidRole(lastUpdatedByRole, currentRole);
    console.log(result);
    if (!result) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    } else {
      currentRole =
        currentRole != lastUpdatedByRole ? lastUpdatedByRole : currentRole;

      // Fetch approvers with a higher level from the rules_mvc table
      const approversResult = await sql.query(
        `
      SELECT approver, level
      FROM rule_mvc
      WHERE rule_id = '${rule_id}' AND level = (
          SELECT level + 1
          FROM rule_mvc
          WHERE approver = '${currentRole}' AND rule_id = '${rule_id}'
      )
      `
      );

      // Construct and insert new transactions based on the number of approvers found
      if (approversResult.recordset.length === 1) {
        const { approver } = approversResult.recordset[0];
        const newStatus = `${approver}0_${currentRole}1`;

        await sql.query(
          `
              INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
              VALUES ('${requestId}', '${rule_id}', '${newStatus}', '${approver}', '${currentRole}','${lastUpdatedById}', GETDATE())
          `
        );
      } else if (approversResult.recordset.length > 1) {
        for (const { approver } of approversResult.recordset) {
          const newStatus =
            approversResult.recordset.reduce(
              (acc, { approver }, index, array) => {
                return `${acc}${approver}0${
                  index < array.length - 1 ? "_" : ""
                }`;
              },
              ""
            ) + `${currentRole}1`;

          await sql.query(
            `INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id,created_at)
                  VALUES ('${requestId}', '${rule_id}', '${newStatus}', '${approver}', '${currentRole}','${lastUpdatedById}', GETDATE())
              `
          );
        }
      }

      return { success: true, message: "Transactions added successfully." };
    }
  } catch (err) {
    console.error("Database connection error:", err);
    return { success: false, message: err.message };
  }
}
module.exports = {
  getTransactionByRequestId,
  getTransactionsPendingWithRole,
  getTransactionsByRole,
  fetchTransactions,
  acceptTransaction,
};
