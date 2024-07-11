const db = require("../config/db");
const { fetchRequestNames } = require("../utils/fetchAllRequestIds");
const logger = require("../utils/logger");

async function getFilesByRequestId(requestId) {
  logger.info("Fetching files by request ID", { requestId });

  try {
    const requestIds = await fetchRequestNames(requestId);
    const requestIDsString = requestIds.map(id => `'${id}'`).join(', ');

    // const query = `SELECT * FROM files WHERE request_id IN ('${requestIds.join(
    //   "', '"
    // )}')`;
    const result = await db.executeQuery(`EXEC GetFilesByRequestIds @RequestIds`, { "RequestIds": requestIDsString });

    logger.info("Files fetched successfully", { count: result.recordset.length });
    return result.recordset;
  } catch (err) {
    logger.error("Database query error", { error: err.message, requestId });
    throw err; // Rethrow the error to be handled by the controller
  }
}

module.exports = {
  getFilesByRequestId,
};
