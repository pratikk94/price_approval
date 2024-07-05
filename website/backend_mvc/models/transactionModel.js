// const sql = require("mssql");
// const config = require("../../backend_mvc/config");
const url = require("../utils");
const axios = require("axios");
const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const { requestStatus } = require("../utils/updateRequestStatus");
const { insertParentRequest } = require("../utils/fetchAllRequestIds");
const { STATUS } = require("../config/constants");

// // Make sure to maintain a connection pool instead of connecting in each function
// const poolPromise = new sql.ConnectionPool(config)
//   .connect()
//   .then((pool) => {
//     console.log("Connected to MSSQL");
//     return pool;
//   })
//   .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

const getTransactionsByRole = async (approver, pendingWith) => {
  try {
    // const pool = await poolPromise;
    // const result = await pool
    //   .request()
    //   .query(
    //     `SELECT * FROM transaction_mvc WHERE currently_pending_with = '${pendingWith}' AND last_updated_by_role = '${approver}'`
    //   );
    const query = `SELECT * FROM transaction_mvc WHERE currently_pending_with = @pendingWith AND last_updated_by_role = @approver`;
    let result = await db.executeQuery(query, {
      pendingWith: pendingWith,
      approver: approver,
    });

    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

const getTransactionByRequestId = async (requestId) => {
  try {
    // const pool = await poolPromise;
    // const result = await pool
    //   .request()
    //   .query(
    //     `SELECT TOP 1 * FROM transaction_mvc WHERE request_id = '${requestId}' ORDER BY id DESC`
    //   );
    const query = `SELECT TOP 1 * FROM transaction_mvc WHERE request_id = @requestId ORDER BY id DESC`;
    let result = await db.executeQuery(query, { requestId: requestId });
    return result.recordset[0];
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

const getTransactionsPendingWithRole = async (role) => {
  try {
    // const pool = await poolPromise;
    // const result = await pool
    //   .request()
    //   .query(
    //     `SELECT * FROM transaction_mvc WHERE currently_pending_with = '${role}'`
    //   );
    const query = `SELECT * FROM transaction_mvc WHERE currently_pending_with = @role`;
    let result = await db.executeQuery(query, { role: role });

    console.log(result.recordset);
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    return null;
  }
};

async function fetchTransactions(role) {
  try {
    // await sql.connect(config);
    const query = `
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
            AND currently_pending_with = @role
            UNION
            SELECT *
            FROM transaction_mvc
            WHERE id IN (SELECT maxId FROM MaxDetails)
            AND currently_pending_with = @role;
        `;
    let result = await db.executeQuery(query, { role: role });
    return result.recordset;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

async function isValidRole(lastUpdatedByRole, currentlyPendingWith) {
  try {
    // await sql.connect(config);
    // Fetch levels for the currently pending with role
    // const levelsResult = await sql.query(
    //   `
    //       SELECT level FROM rule_mvc WHERE approver = '${currentlyPendingWith}'
    //   `
    // );
    const query = `
    SELECT level FROM rule_mvc WHERE approver = @currentlyPendingWith
`;
    let levelsResult = await db.executeQuery(query, {
      currentlyPendingWith: currentlyPendingWith,
    });

    if (levelsResult.recordset.length === 0) {
      return false; // No roles found at the same level.
    }

    const levels = levelsResult.recordset.map((row) => row.level);

    console.log(levels);
    console.log(lastUpdatedByRole);
    // Check if last_updated_by_role is at any of these levels
    // const checkRoleValidity = `
    //       SELECT COUNT(1) as Count FROM rule_mvc
    //       WHERE approver = '${lastUpdatedByRole}' AND level <= ${levels[0]}
    //   `;
    // const validityResult = await sql.query(checkRoleValidity);

    const checkRoleValidity = `
    SELECT COUNT(1) as Count FROM rule_mvc
    WHERE approver = '${lastUpdatedByRole}' AND level <= ${levels[0]}
`;

    let validityResult = await db.executeQuery(checkRoleValidity, {});

    console.log(validityResult.recordset[0].Count);
    return validityResult.recordset[0].Count > 0;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

async function acceptTransaction(
  region,
  action,
  requestId,
  lastUpdatedById,
  lastUpdatedByRole,
  oldRequestId = "",
  isDraft = false,
  isBlockExtensionPreclosure = false
) {
  try {
    // await sql.connect(config);

    // Fetch the transaction with the highest ID for the provided request_id
    // const transactionResult = await sql.query(
    //   `
    //       SELECT TOP 1 id, currently_pending_with , rule_id
    //       FROM transaction_mvc
    //       WHERE request_id = '${requestId}'
    //       ORDER BY id DESC
    //   `
    // );

    let query = "";

    if (isDraft || action == "R") {
      query = `
    SELECT TOP 1 id, currently_pending_with , rule_id
    FROM transaction_mvc
    WHERE request_id = '${
      oldRequestId.length > 0 ? oldRequestId : requestId
    }' and currently_pending_with = '${lastUpdatedByRole}'
    ORDER BY id DESC
`;
    } else if (isBlockExtensionPreclosure) {
      query = `SELECT TOP 1 id, currently_pending_with , rule_id
      FROM transaction_mvc
      WHERE request_id = '${oldRequestId}'
      ORDER BY id DESC`;
    } else {
      query = `
    SELECT TOP 1 id, currently_pending_with , rule_id
    FROM transaction_mvc
    WHERE request_id = '${requestId}'
    ORDER BY id DESC`;
    }
    console.log(query);

    let transactionResult = await db.executeQuery(query);

    console.log(transactionResult, "testing.................");

    let { currently_pending_with: currentRole, rule_id } =
      transactionResult.recordset[0];

    //Check for valid lastUpdatedByRole.
    // if (lastUpdatedByRole !== currentRole) {
    //   return {
    //     success: false,
    //     message: "Unauthorized access",
    //   };
    // }

    if (lastUpdatedByRole == "Validator" && action == STATUS.APPROVED) {
      // await sql.query(
      //   `INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id,created_at)
      //         VALUES ('${requestId}', '${rule_id}', '${"Approved"}', '${"Approved"}', '${currentRole}','${lastUpdatedById}', GETDATE())
      //     `
      // );
      let query1 = `INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id,created_at)
        OUTPUT INSERTED.* 
            VALUES ('${requestId}', '${rule_id}', '${"Approved"}', '${"Approved"}', '${currentRole}','${lastUpdatedById}', GETDATE())
        `;
      let result = await db.executeQuery(query1, {});
      insertParentRequest(requestId, requestId);
      console.log(result.recordset[0], "Validator testing");
      // Add audit log for the update operation
      await addAuditLog(
        "transaction_mvc",
        result.recordset[0].id,
        "INSERT",
        null
      );
      // const response = await axios.post(
      //   `http://${url}:3000/api/update-status`,
      //   {
      //     current_role: lastUpdatedByRole,
      //     region: region, // You would need to adjust this as per actual requirements
      //     action: action, // Assuming action is to be passed as 1 for approve (example)
      //     req_id: requestId, // This is a mockup; adjust as needed
      //   }
      // );

      const response = await requestStatus(
        lastUpdatedByRole,
        region,
        action,
        requestId
      );
      console.log(response, "check the update data.................");

      return {
        success: true,
        message: "Transactions added and status updated successfully.",
      };
    }
    if (currentRole == "Approved") currentRole = "AM";

    console.log(lastUpdatedByRole, currentRole);
    const result = await isValidRole(lastUpdatedByRole, currentRole);
    console.log("In here");
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
      // const approversResult = await sql.query(
      //   `
      // SELECT approver, level
      // FROM rule_mvc
      // WHERE rule_id = '${rule_id}' AND level = (
      //     SELECT level + 1
      //     FROM rule_mvc
      //     WHERE approver = '${currentRole}' AND rule_id = '${rule_id}'
      // )
      // `
      // );
      const query = `
      SELECT approver, level
      FROM rule_mvc
      WHERE rule_id = @rule_id AND level = (
          SELECT level + 1
          FROM rule_mvc
          WHERE approver = @currentRole AND rule_id = @rule_id
      )
      `;
      const approversResult = await db.executeQuery(query, {
        rule_id: rule_id,
        currentRole: currentRole,
      });
      console.log("********");
      console.log(approversResult);
      console.log(`ACTION IS ${action}`);
      // Construct and insert new transactions based on the number of approvers found
      if (action == STATUS.REJECTED) {
        console.log(action, "testing....................................");
        // await sql.query(
        //   `
        //       INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
        //       VALUES ('${requestId}', '${rule_id}', 'Rejected', 'Rejected', '${currentRole}','${lastUpdatedById}', GETDATE())
        //   `
        // );
        let query = `
            INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
            OUTPUT INSERTED.* 
            VALUES (@requestId, @rule_id, 'Rejected', 'Rejected', @currentRole,@lastUpdatedById, GETDATE())
        `;
        let result = await db.executeQuery(query, {
          requestId: requestId,
          rule_id: rule_id,
          currentRole: currentRole,
          lastUpdatedById: lastUpdatedById,
        });
        const response = await requestStatus(
          lastUpdatedByRole,
          region,
          action,
          requestId
        );

        insertParentRequest(requestId, requestId);
        console.log(result.recordset[0], "testing tranc action == 2");
        // Add audit log for the update operation
        await addAuditLog(
          "transaction_mvc",
          result.recordset[0].id,
          "INSERT",
          null
        );
        return {
          success: true,
          message: "Transactions rejected and status updated successfully.",
        };
      }
      if (action == STATUS.REWORK) {
        // if (currentRole != "RM")
        //   await sql.query(
        //     `
        //       INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
        //       VALUES ('${requestId}', '${rule_id}', 'Rework', 'RM', '${currentRole}','${lastUpdatedById}', GETDATE())
        //   `
        //   );
        // await sql.query(
        //   `
        //       INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
        //       VALUES ('${requestId}', '${rule_id}', 'Rework', 'AM', '${currentRole}','${lastUpdatedById}', GETDATE())
        //   `
        // );
        /* TODO
        For rework fetch all the roles who can rework
        if role is AM & AM rework and tran go to RM and above
        If RM rework and tran go to all (NSM&HDSM) above levels in pending
        also check same level(NSM&HDSM)
        */

        console.log(`Current role is ${currentRole}`);

        if (currentRole != "RM") {
          let query = `INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
          OUTPUT INSERTED.* 
          VALUES (@requestId, @rule_id, 'Rework', 'RM', @currentRole,@lastUpdatedById, GETDATE())`;
          let result = await db.executeQuery(query, {
            requestId: requestId,
            rule_id: rule_id,
            currentRole: currentRole,
            lastUpdatedById: lastUpdatedById,
          });

          console.log(result.recordset[0], "testing RM.................");
          // Add audit log for the update operation
          await addAuditLog(
            "transaction_mvc",
            result.recordset[0].id,
            "INSERT",
            null
          );

          const response = await requestStatus(
            currentRole,
            region,
            action,
            requestId
          );
        }
        let query = `INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
          OUTPUT INSERTED.* 
          VALUES (@requestId, @rule_id, 'Rework', 'AM', @currentRole,@lastUpdatedById, GETDATE())
          `;
        let result1 = await db.executeQuery(query, {
          requestId: requestId,
          rule_id: rule_id,
          currentRole: currentRole,
          lastUpdatedById: lastUpdatedById,
        });
        insertParentRequest(requestId, requestId);
        console.log(result1.recordset[0], "testing out side..............");
        // Add audit log for the update operation
        await addAuditLog(
          "transaction_mvc",
          result1.recordset[0].id,
          "INSERT",
          null
        );

        if (currentRole == "RM") {
          const response = await requestStatus("RM", region, action, requestId);
        }

        return {
          success: true,
          message: "Transactions added and status updated successfully.",
        };
      } else if (approversResult.recordset.length === 1) {
        const { approver } = approversResult.recordset[0];
        const newStatus = `${approver}0_${currentRole}1`;

        // await sql.query(
        //   `
        //       INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
        //       VALUES ('${requestId}', '${rule_id}', '${newStatus}', '${approver}', '${currentRole}','${lastUpdatedById}', GETDATE())
        //   `
        // );
        let query = `
              INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
              OUTPUT INSERTED.* 
              VALUES (@requestId, @rule_id, @newStatus, @approver, @currentRole, @lastUpdatedById, GETDATE())
          `;
        let result = await db.executeQuery(query, {
          requestId: requestId,
          rule_id: rule_id,
          newStatus: newStatus,
          approver: approver,
          currentRole: currentRole,
          lastUpdatedById: lastUpdatedById,
        });
        console.log(
          result.recordset[0],
          "testing transaction_mvc approversResult.recordset.length === 1"
        );
        // Add audit log for the update operation
        await addAuditLog(
          "transaction_mvc",
          result.recordset[0].id,
          "INSERT",
          null
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

          // await sql.query(
          //   `INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id,created_at)
          //         VALUES ('${requestId}', '${rule_id}', '${newStatus}', '${approver}', '${currentRole}','${lastUpdatedById}', GETDATE())
          //     `
          // );
          let query = `INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id,created_at)
          OUTPUT INSERTED.*
                VALUES (@requestId, @rule_id, @newStatus, @approver, @currentRole,@lastUpdatedById, GETDATE())
            `;
          let result = await db.executeQuery(query, {
            requestId: requestId,
            rule_id: rule_id,
            newStatus: newStatus,
            approver: approver,
            currentRole: currentRole,
            lastUpdatedById: lastUpdatedById,
          });

          console.log(result.recordset[0], "trasanction testing..............");
          // Add audit log for the update operation
          await addAuditLog(
            "transaction_mvc",
            result.recordset[0].id,
            "INSERT",
            null
          );
        }
      }

      // const response = await axios.post(
      //   `http://${url}:3000/api/update-status`,
      //   {
      //     current_role: lastUpdatedByRole,
      //     region: region, // You would need to adjust this as per actual requirements
      //     action: action, // Assuming action is to be passed as 1 for approve (example)
      //     req_id: requestId, // This is a mockup; adjust as needed
      //   }
      // );

      const response = await requestStatus(
        lastUpdatedByRole,
        region,
        action,
        requestId
      );

      insertParentRequest(requestId, requestId);

      console.log(response, "check the update data.................");

      // Handle response from the update-status API
      console.log("Update status API response:", response.data);

      return {
        success: true,
        message: "Transactions added and status updated successfully.",
      };
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
