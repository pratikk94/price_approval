// transactionsController.js
const requestHistoryModel = require("../models/requestHistoryModel");

async function fetchTransactionsByRequestId(req, res) {
  try {
    const requestId = req.params.requestId;
    const transactions = await requestHistoryModel.getTransactionsByRequestId(
      requestId
    );

    res.json({ data: transactions });
  } catch (err) {
    console.error("Error fetching transactions", err);
    res.status(500).send("Failed to fetch transactions");
  }
}

module.exports = {
  fetchTransactionsByRequestId,
};
