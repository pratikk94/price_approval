const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get(
  "/transactions/:requestId/analyze",
  transactionController.analyzeTransaction
);

router.get(
  "/transactions-pending/:approver/:pendingWith",
  transactionController.getTransactionsByRole
);

router.get(
  "/transactions/:role",
  transactionController.getTransactionsPendingWithRole
);

router.get("/transactions-all/:role", transactionController.getTransactions);

router.post(
  "/transactions-add/:requestId/:roleId/:role",
  transactionController.acceptTransaction
);

module.exports = router;
