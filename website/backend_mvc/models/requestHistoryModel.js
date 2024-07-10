const db = require("../config/db");
const { fetchRequestNames } = require("../utils/fetchAllRequestIds");
const logger = require("../utils/logger");

async function getTransactionsByRequestId(requestId) {
  logger.info("getTransactionsByRequestId called with requestId:", requestId); // Log function call

  try {
    const requestIds = await fetchRequestNames(requestId);
    logger.info(`Fetched request names for requestId: ${requestId}, ${requestIds}`);
    let allTransactions = [];
    for (const id of requestIds.reverse()) {
      const result = await db.executeQuery(`EXEC dbo.GetTransactionHistory ${id}`);
      logger.info(`Fetched transactions for requestId: ${id}, result: ${result}`);
      allTransactions.push(...result.recordset); // Spread operator to flatten the results
    }
    logger.info(`Returning transactions for requestId: ${requestId}, allTransactions: ${allTransactions}`);
    return allTransactions;
  } catch (err) {
    logger.error(`SQL error in getTransactionsByRequestId for requestId: ${requestId}, error: ${err}`); // Log error
    throw err;
  }
}

async function getReportsTransactions() {
  logger.info("getReportsTransactions called");

  try {
    const result = await db.executeQuery(`EXEC dbo.GetReportsWithDiffTime`);
    logger.info(`getReportsTransactions successful, result: ${result}`);
    return result;
  } catch (err) {
    logger.error(`SQL error in getReportsTransactions, error: ${err}`,);
    throw err;
  }
}

module.exports = {
  getTransactionsByRequestId,
  getReportsTransactions
};
