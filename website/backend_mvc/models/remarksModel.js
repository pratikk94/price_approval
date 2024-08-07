
const { SYMMETRIC_KEY_NAME, CERTIFICATE_NAME } = require("../config/constants");
const db = require("../config/db");
const { addAuditLog } = require("../utils/auditTrails");
const { fetchRequestNames } = require("../utils/fetchAllRequestIds");

async function getRemarksWithRequests(request_id) {
  try {
    const requestIds = await fetchRequestNames(request_id);
    const requestIDsString = requestIds.map(id => `'${id}'`).join(', ');
    result = await db.executeQuery(`EXEC dbo.GetRemarksByRequestIDs @RequestIDs,@SymmetricKeyName,@CertificateName`,
      {
        RequestIDs: requestIDsString, 
        SymmetricKeyName: SYMMETRIC_KEY_NAME,
        CertificateName: CERTIFICATE_NAME
      });
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function postRemark(remarkData) {
  try {
    const { request_id, user_id, comment } = remarkData;
    const result = await db.executeQuery(`EXEC InsertRemark @RequestID,@UserID,@Comment`, {
      RequestID: request_id,
      UserID: user_id,
      Comment: comment,
    });

    // Add audit log for the update operation
    await addAuditLog("Remarks", result.recordset[0].id, "INSERT", null);
    return result.recordset[0].id; // Returns the new remark ID
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

module.exports = {
  getRemarksWithRequests,
  postRemark,
};
