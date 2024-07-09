const { STATUS } = require("../config/constants");
const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const { insertParentRequest } = require("../utils/fetchAllRequestIds");
const { requestStatus } = require("../utils/updateRequestStatus");
const logger = require("../utils/logger");

const updateRequestStatus = async (req, res) => {
  const { current_role, region, action, req_id } = req.body;
  logger.info("Updating request status...", { current_role, region, action, req_id });
  try {
    let result = await requestStatus(current_role, region, action, req_id);
    res.json({
      message: result.message,
      status: result.status,
      pendingWith: result.pendingWith,
    });
  } catch (err) {
    logger.error("Error updating request status", { error: err.message });
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updatePreApprovedRequestStatus = async (requestName, action) => {
  logger.info("Updating pre-approved request status...", { requestName, action });
  try {

    const query = `
      SELECT parent_request_name, request_name
      FROM pre_approved_request_status_mvc
      WHERE parent_request_name LIKE '%${requestName.substring(1)}%'
    `;
    logger.debug("Executing query:", query);
    const parentRequestResult = await db.executeQuery(query);

    logger.debug("Parent request result:", parentRequestResult);

    let pending = "";
    if (action == STATUS.REJECTED) {
      pending = ", [pending] = '1'";
    }
    if (action == STATUS.APPROVED) {
      //ADD THIS TO DISPLACE IT FROM REWORK.
      action = -2;
    }
    if (action === STATUS.COMPLETELY_APPROVED) {
      action = 1;
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

    logger.debug("Executing update query:", query3);
    const updateResult2 = await db.executeQuery(query3);
    logger.debug("Update result:", updateResult2);
    // Add audit log for the UPDATE operation
    await addAuditLog("requests_mvc", 0, "UPDATE", null);
  } catch (error) {
    logger.error("Error in operation:", error);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addADraft = async (requestName) => {
  logger.info("Adding a draft...", { requestName });
  try {
    const query = `
    DECLARE @request_id VARCHAR(255) = '${requestName}'; -- replace with your actual request_id

    DECLARE @parent_request_id VARCHAR(255) = STUFF(@request_id, 1, 1, 'D');
    
    INSERT INTO pre_approved_request_status_mvc (request_name, parent_request_name)
    OUTPUT INSERTED.*
    VALUES (@request_id, @parent_request_id);
    `;
    logger.debug("Executing insert query:", query);
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
    logger.debug("Insert result:", result);
  } catch (err) {
    logger.error("Database connection error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
module.exports = {
  updateRequestStatus,
  updatePreApprovedRequestStatus,
  addADraft,
};
