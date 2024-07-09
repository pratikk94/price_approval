const transactionModel = require("../models/transactionModel");
const logger = require("../utils/logger");

const analyzeTransaction = async (req, res) => {
  const { requestId } = req.params;
  logger.info("Analyzing transaction", { requestId });

  try {
    const transaction = await transactionModel.getTransactionByRequestId(
      requestId
    );
    if (!transaction) {
      logger.warn("Transaction not found", { requestId });
      return res.status(404).send("Transaction not found");
    }

    const tel = transaction.current_status.split("_");
    const roleMatch =
      transaction.currently_pending_with === tel[0].substring(0, 2);
    logger.debug("Transaction elements", { tel: tel[0].substring(0, 2), roleMatch });


    let result = null;
    if (tel.length === 2 && roleMatch) {
      result = tel[1].slice(-1); // Last digit of the second element
    } else if (tel.length >= 3) {
      const index = tel.findIndex((element) => element.includes(tel[0]));
      if (index !== -1) {
        result = tel[index].slice(-1); // Last digit of the mth element
      }
    }
    logger.debug("Analyze result", { result });
    res.json({ result });
  } catch (error) {
    logger.error("Error processing transaction", { error: error.message, requestId });
    res.status(500).send("Error processing transaction");
  }
};

const getTransactionsByRole = async (req, res) => {
  const { approver, pendingWith } = req.params;
  logger.info("Fetching transactions by role", { approver, pendingWith });

  try {
    const transactions = await transactionModel.getTransactionsByRole(
      approver,
      pendingWith
    );
    logger.debug("Transactions fetched", { transactions });
    res.json(transactions);
  } catch (error) {
    logger.error("Error fetching transactions", { error: error.message, approver, pendingWith });
    res.status(500).send("Error retrieving transactions");
  }
};

const getTransactionsPendingWithRole = async (req, res) => {
  const { role } = req.params;
  logger.info("Fetching transactions pending with role", { role });

  try {
    const transactions = await transactionModel.getTransactionsPendingWithRole(
      role
    );
    logger.debug("Transactions fetched", { transactions });
    if (transactions.length > 0) {
      res.json(transactions);
    } else {
      logger.warn("No transactions found for the specified role", { role });
      res.status(404).send("No transactions found for the specified role");
    }
  } catch (error) {
    logger.error("Error processing request", { error: error.message, role });
    res.status(500).send("Server error");
  }
};

async function getTransactions(req, res) {
  const role = req.params.role;
  logger.info("Fetching transactions", { role });

  try {
    const transactions = await transactionModel.fetchTransactions(role);
    logger.debug("Transactions fetched", { transactions });

    if (transactions.length > 0) {
      res.json(transactions);
    } else {
      logger.warn("No transactions found matching the criteria", { role });
      res.status(404).send("No transactions found matching the criteria.");
    }
  } catch (error) {
    logger.error("Server error while retrieving transactions", { error: error.message, role });
    res.status(500).send("Server error while retrieving transactions");
  }
}

async function acceptTransaction(req, res) {
  const { requestId, region, action, lastUpdatedById, lastUpdatedByRole } = req.params;
  logger.info("Accepting transaction", { requestId, region, action, lastUpdatedById, lastUpdatedByRole });

  try {
    const result = await transactionModel.acceptTransaction(
      region,
      action,
      requestId,
      lastUpdatedById,
      lastUpdatedByRole
    );
    if (result.success) {
      logger.debug("Transaction accepted successfully", { requestId, currentStatus: result.currentStatus });
      res.json({
        message: "Transaction added successfully",
        currentStatus: result.currentStatus,
      });
    } else {
      logger.warn("Failed to process transaction", { requestId });
      res.status(500).send("Failed to process transaction");
    }
  } catch (error) {
    logger.error("Server error while adding transaction", { error: error.message, requestId });
    res.status(500).send("Server error while adding transaction");
  }
}

module.exports = {
  getTransactionsPendingWithRole,
  analyzeTransaction,
  getTransactionsByRole,
  getTransactions,
  acceptTransaction,
};
