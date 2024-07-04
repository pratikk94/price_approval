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
const { insertParentRequest } = require("../utils/fetchAllRequestIds");
const { requestStatus } = require("../utils/updateRequestStatus");

const updateRequestStatus = async (req, res) => {
  const { current_role, region, action, req_id } = req.body;
  try {
    let result = await requestStatus(current_role, region, action, req_id);
    res.json({
      message: result.message,
      status: result.status,
      pendingWith: result.pendingWith,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updatePreApprovedRequestStatus = async (requestName, action) => {
  try {
    // await sql.connect(config);

    console.log("LIKE QUERY IS " + requestName.substring(1));

    // Use parameterized queries to prevent SQL injection
    // const parentRequestResult = await sql.query`
    //   SELECT parent_request_name, request_name
    //   FROM pre_approved_request_status_mvc
    //   WHERE parent_request_name LIKE '%' + ${requestName.substring(1)} + '%'
    // `;
    const query = `
      SELECT parent_request_name, request_name
      FROM pre_approved_request_status_mvc
      WHERE parent_request_name LIKE '%${requestName.substring(1)}%'
    `;
    console.log(query);
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
    console.log(`Updated Result`);
    console.log(updateResult2);
    // Add audit log for the UPDATE operation
    await addAuditLog("requests_mvc", 0, "UPDATE", null);

    // const updateResult2 = await pool.request().query(query3);
    console.log(updateResult2);
  } catch (error) {
    console.error("Error in operation:", error);
  }
};

const addADraft = async (requestName) => {
  try {
    // await sql.connect(config); // replace 'config' with your actual configuration object

    const query = `
    DECLARE @request_id VARCHAR(255) = '${requestName}'; -- replace with your actual request_id

    DECLARE @parent_request_id VARCHAR(255) = STUFF(@request_id, 1, 1, 'D');
    
    INSERT INTO pre_approved_request_status_mvc (request_name, parent_request_name)
    OUTPUT INSERTED.*
    VALUES (@request_id, @parent_request_id);
    `;
    const result = await db.executeQuery(query);
    insertParentRequest(requestName);
    // Add audit log for the Insert operation
    await addAuditLog(
      "pre_approved_request_status_mvc",
      result.recordset[0].id,
      "INSERT",
      null
    );

    // const result = await sql.query(query);
    updatePreApprovedRequestStatus(requestName, STATUS.DRAFT);
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
