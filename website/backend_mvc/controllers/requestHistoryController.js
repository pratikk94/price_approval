const requestHistoryModel = require("../models/requestHistoryModel");
const logger = require("../utils/logger");

async function fetchTransactionsByRequestId(req, res) {
  const requestId = req.params.requestId;
  logger.info("Fetching transactions for request ID", { requestId });

  try {
    const transactions = await requestHistoryModel.getTransactionsByRequestId(
      requestId
    );
    logger.debug("Transactions fetched successfully", { requestId, transactions });
    res.json({ data: transactions });
  } catch (err) {
    logger.error("Error fetching transactions", { error: err.message, requestId });
    res.status(500).send("Failed to fetch transactions");
  }
}

async function fetchReportTransactions(req, res) {
  try {
    const transactions = await requestHistoryModel.getReportsTransactions();
    logger.debug("Report Transactions fetched successfully", transactions);
    res.json({ data: transactions });
  } catch (err) {
    logger.error("Error fetching Report transactions", { error: err.message });
    res.status(500).send("Failed to fetch transactions");
  }
}


module.exports = {
  fetchTransactionsByRequestId,
  fetchReportTransactions
};
