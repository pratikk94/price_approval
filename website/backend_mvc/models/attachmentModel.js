const db = require("../config/db");
const { fetchRequestNames } = require("../utils/fetchAllRequestIds");
async function getFilesByRequestId(requestId) {
  try {
    const requestIds = await fetchRequestNames(requestId);
    const query = `SELECT * FROM files WHERE request_id IN ('${requestIds.join(
      "', '"
    )}')`;
    console.log(query);
    const result = await db.executeQuery(query);
    return result.recordset;
  } catch (err) {
    console.error("Database query error:", err);
    throw err; // Rethrow the error to be handled by the controller
  }
}

module.exports = {
  getFilesByRequestId,
};
