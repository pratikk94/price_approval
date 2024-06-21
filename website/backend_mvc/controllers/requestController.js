// models/customerModel.js
// const sql = require("mssql");
// const config = require("../../backend_mvc/config");
// const poolPromise = new sql.ConnectionPool(config)
//   .connect()
//   .then((pool) => {
//     console.log("Connected to MSSQL");
//     return pool;
//   })
//   .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");

const updateRequestStatus = async (req, res) => {
  const { current_role, region, action, req_id } = req.body;
  try {
    // const pool = await poolPromise;
    // const roleInfo = await pool
    //   .request()
    //   .input("currentRole", sql.VarChar, current_role)
    //   .input("region", sql.VarChar, region)
    //   .query(
    //     "SELECT level FROM rule_mvc WHERE approver = @currentRole AND region = @region"
    //   );
    const query = "SELECT level FROM rule_mvc WHERE approver = @currentRole AND region = @region";
    const roleInfo = await db.executeQuery(query, { "currentRole": currentRole, "region": region });

    if (roleInfo.recordset.length > 0) {
      const { level } = roleInfo.recordset[0];
      let status = 0;
      let pendingWith = level + 1;
      console.log(action);
      console.log(typeof action);
      switch (action) {
        case "1": // Approve
          // const nextLevelExists = await pool
          //   .request()
          //   .input("nextLevel", sql.Int, pendingWith)
          //   .query(
          //     "SELECT COUNT(1) AS LevelExists FROM rule_mvc WHERE level = @nextLevel"
          //   );
          const query2 = "SELECT COUNT(1) AS LevelExists FROM rule_mvc WHERE level = @nextLevel";
          const nextLevelExists = await db.executeQuery(query2, { "nextLevel": nextLevel });
          if (nextLevelExists.recordset[0].LevelExists === 0) {
            status = 1;
            pendingWith = 0;
          }
          break;
        case "2": // Rework
          if (level === 2) {
            status = 2;
            pendingWith = 1;
          } else if (level > 2) {
            status = 2;
            pendingWith = 2;
          }
          updatePreApprovedRequestStatus(req_id, -1);
          break;
        case "3": // Reject
          status = 3;
          pendingWith = level; // indicates who rejected it
          break;
      }

      // Insert the status update into requests_status_mvc
      // await pool
      //   .request()
      //   .input("status", sql.Int, status)
      //   .input("pendingWith", sql.Int, pendingWith)
      //   .input("req_id", sql.VarChar, req_id)
      //   .query(
      //     "INSERT INTO requests_mvc (status, pending, req_id) VALUES (@status, @pendingWith, @req_id)"
      //   );
      let query3 = "INSERT INTO requests_mvc (status, pending, req_id)OUTPUT INSERTED.* VALUES (@status, @pendingWith, @req_id)";
      let result = await db.executeQuery(query3, { "status": status, "pendingWith": pendingWith, "req_id": req_id });

      // Add audit log for the INSERT operation
      await addAuditLog('requests_mvc', result.recordset[0].id, 'INSERT', null);

      if (pendingWith == 0) {
        updatePreApprovedRequestStatus(req_id, 1);
      }
      res.json({
        message: "Request status updated successfully",
        status,
        pendingWith,
      });
    } else if (current_role === "AM") {
      // const nextLevelExists = await pool
      //   .request()
      //   .input("nextLevel", sql.Int, pendingWith)
      //   .query(
      //     "SELECT COUNT(1) AS LevelExists FROM rule_mvc WHERE level = @nextLevel"
      //   );
      const query4 = "SELECT COUNT(1) AS LevelExists FROM rule_mvc WHERE level = @nextLevel"
        ;
      const nextLevelExists = await db.executeQuery(query4, { "nextLevel": nextLevel });
      if (nextLevelExists.recordset[0].LevelExists === 0) {
        status = 1;
        pendingWith = -1;
      }
      // await pool
      //   .request()
      //   .input("status", sql.Int, status)
      //   .input("pendingWith", sql.Int, pendingWith)
      //   .input("req_id", sql.VarChar, req_id)
      //   .query(
      //     "INSERT INTO requests_status_mvc (status, pendingWith, requestStatus) VALUES (@status, @pendingWith, @requestStatus)"
      //   );

      let query5 = "INSERT INTO requests_status_mvc (status, pendingWith, requestStatus)OUTPUT INSERTED.* VALUES (@status, @pendingWith, @requestStatus)";

      let result = await db.executeQuery(query5, { "status": status, "pendingWith": pendingWith, "req_id": req_id });

      // Add audit log for the INSERT operation
      await addAuditLog('requests_status_mvc', result.recordset[0].id, 'INSERT', null);
      res.json({
        message: "Request status updated successfully",
        status,
        pendingWith,
      });
    } else {
      res.status(404).json({ message: "Role or region not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updatePreApprovedRequestStatus = async (requestName, action) => {
  try {
    await sql.connect(config);

    console.log("LIKE QUERY IS " + requestName.substring(1));

    // Use parameterized queries to prevent SQL injection
    // const parentRequestResult = await sql.query`
    //   SELECT parent_request_name, request_name
    //   FROM pre_approved_request_status_mvc
    //   WHERE parent_request_name LIKE '%' + ${requestName.substring(1)} + '%'
    // `;
    const query = await sql.query`
      SELECT parent_request_name, request_name
      FROM pre_approved_request_status_mvc
      WHERE parent_request_name LIKE '%' + ${requestName.substring(1)} + '%'
    `;

    const parentRequestResult = await db.executeQuery(query);

    console.log(`Request name is ${requestName}`);

    let pending = "";
    if (action == 5) {
      pending = ", [pending] = '1'";
    }

    // Ensure poolPromise is defined elsewhere in your module
    // const pool = await poolPromise;
    const query3 = `
      UPDATE [PriceApprovalSystem].[dbo].[requests_mvc]
      SET [status] = ${action} ${pending}
      WHERE [id] = (
        SELECT TOP 1 [id]
        FROM [PriceApprovalSystem].[dbo].[requests_mvc]
        WHERE [req_id] = '${requestName}'
        ORDER BY [id] DESC
      );
    `;
    const updateResult2 = await db.executeQuery(query3);

    // Add audit log for the UPDATE operation
    await addAuditLog('requests_mvc', updateResult2.recordset[0].id, 'UPDATE', null);

    // const updateResult2 = await pool.request().query(query3);
    console.log(updateResult2);
  } catch (error) {
    console.error("Error in operation:", error);
  }
};

const addADraft = async (requestName) => {
  try {
    await sql.connect(config); // replace 'config' with your actual configuration object

    const query = `
    DECLARE @request_id VARCHAR(255) = '${requestName}'; -- replace with your actual request_id

    DECLARE @parent_request_id VARCHAR(255) = STUFF(@request_id, 1, 1, 'D');
    
    INSERT INTO pre_approved_request_status_mvc (request_name, parent_request_name)
    OUTPUT INSERTED.*
    VALUES (@request_id, @parent_request_id);
    `;
    const result = await db.executeQuery(query);

    // Add audit log for the Insert operation
    await addAuditLog('pre_approved_request_status_mvc', result.recordset[0].id, 'INSERT', null);

    // const result = await sql.query(query);
    updatePreApprovedRequestStatus(requestName, 5);
    console.log(result);
  } catch (err) {
    console.error("Database connection error:", err);
  }
};
module.exports = {
  updateRequestStatus,
  updatePreApprovedRequestStatus,
  addADraft,
};
