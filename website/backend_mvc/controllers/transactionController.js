const transactionModel = require("../models/transactionModel");

const analyzeTransaction = async (req, res) => {
  try {
    const { requestId } = req.params;
    const transaction = await transactionModel.getTransactionByRequestId(
      requestId
    );
    if (!transaction) {
      return res.status(404).send("Transaction not found");
    }

    const tel = transaction.current_status.split("_");
    const roleMatch =
      transaction.currently_pending_with === tel[0].substring(0, 2);
    console.log("tel", tel[0].substring(0, 2)); // Debugging output
    console.log("roleMatch", roleMatch); // Debugging output

    let result = null;
    if (tel.length === 2 && roleMatch) {
      result = tel[1].slice(-1); // Last digit of the second element
    } else if (tel.length >= 3) {
      const index = tel.findIndex((element) => element.includes(tel[0]));
      if (index !== -1) {
        result = tel[index].slice(-1); // Last digit of the mth element
      }
    }

    res.json({ result });
  } catch (error) {
    console.error("Error processing transaction", error); // Log the specific error
    res.status(500).send("Error processing transaction");
  }
};

const getTransactionsByRole = async (req, res) => {
  try {
    const { approver, pendingWith } = req.params;
    const transactions = await transactionModel.getTransactionsByRole(
      approver,
      pendingWith
    );
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions", error); // Log the specific error
    res.status(500).send("Error retrieving transactions");
  }
};

const getTransactionsPendingWithRole = async (req, res) => {
  try {
    const { role } = req.params;
    console.log(role); // Debugging output (role value
    const transactions = await transactionModel.getTransactionsPendingWithRole(
      role
    );
    if (transactions.length > 0) {
      res.json(transactions);
    } else {
      res.status(404).send("No transactions found for the specified role");
    }
  } catch (error) {
    console.error("Error processing request:", error); // Log the specific error
    res.status(500).send("Server error");
  }
};

async function getTransactions(req, res) {
  const role = req.params.role; // Assuming role is still provided
  try {
    const transactions = await transactionModel.fetchTransactions(role);
    if (transactions.length > 0) {
      res.json(transactions);
    } else {
      res.status(404).send("No transactions found matching the criteria.");
    }
  } catch (error) {
    res.status(500).send("Server error while retrieving transactions");
    console.error("Error:", error);
  }
}

async function acceptTransaction(req, res) {
  const requestId = req.params.requestId;
  const roleId = req.params.roleId;
  const role = req.params.role;
  try {
    const result = await transactionModel.acceptTransaction(
      requestId,
      roleId,
      role
    );
    if (result.success) {
      res.json({
        message: "Transaction added successfully",
        currentStatus: result.currentStatus,
      });
    } else {
      res.status(500).send("Failed to process transaction");
    }
  } catch (error) {
    res.status(500).send("Server error while adding transaction");
    console.error("Error:", error);
  }
}

module.exports = {
  getTransactionsPendingWithRole,
  analyzeTransaction,
  getTransactionsByRole,
  getTransactions,
  acceptTransaction,
};
