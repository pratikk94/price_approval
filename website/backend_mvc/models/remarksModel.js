
const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const { fetchRequestNames } = require("../utils/fetchAllRequestIds");
const logger = require("../utils/logger");

async function getRemarksWithRequests(request_id) {
  logger.info("getRemarksWithRequests called with request_id:", request_id);
  try {
    const requestIds = await fetchRequestNames(request_id);
    const requestIDsString = requestIds.map(id => `'${id}'`).join(', ');
    result = await db.executeQuery(`EXEC dbo.GetRemarksByRequestIDs @RequestIDs`, { "RequestIDs": requestIDsString });
    logger.info("getRemarksWithRequests successful for request_id:", request_id);
    return result.recordset;
  } catch (err) {
    logger.error(`SQL error in getRemarksWithRequests for request_id: ${request_id}, error: ${err}`);
    throw err;
  }
}

async function postRemark(remarkData) {
  logger.info("postRemark called with data:", remarkData);
  try {
    const { request_id, user_id, comment } = remarkData;
    const result = await db.executeQuery(`EXEC InsertRemark @RequestID,@UserID,@Comment`, {
      RequestID: request_id,
      UserID: user_id,
      Comment: comment,
    });

    // Add audit log for the update operation
    await addAuditLog("Remarks", result.recordset[0].id, "INSERT", null);
    logger.info("postRemark successful for request_id:", request_id);
    return result.recordset[0].id; // Returns the new remark ID
  } catch (err) {
    logger.error(`SQL error in postRemark with data: ${remarkData}, error: ${err}`);
    throw err;
  }
}

module.exports = {
  getRemarksWithRequests,
  postRemark,
};
