// transactionsController.js
const requestHistoryModel = require("../models/requestHistoryModel");

async function fetchTransactionsByRequestId(req, res) {
  try {
    const requestId = req.params.requestId;
    const transactions = await requestHistoryModel.getTransactionsByRequestId(
      requestId
    );

    // Check if any transaction has status == 1 and modify the message
    const accepted = transactions.some((t) => t.status === 1);

    const message = accepted
      ? "Request accepted"
      : "Transactions fetched successfully";

    res.json({ message, data: transactions });
  } catch (err) {
    console.error("Error fetching transactions", err);
    res.status(500).send("Failed to fetch transactions");
  }
}

module.exports = {
  fetchTransactionsByRequestId,
};
