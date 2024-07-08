const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const priceRequestController = require("../controllers/priceRequestController");

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
  "/transactions-add/:requestId/:region/:action/:lastUpdatedById/:lastUpdatedByRole",
  transactionController.acceptTransaction
);

router.get(
  "/price-approval/:requestId",
  priceRequestController.getPriceApprovalData
);

router.get(
  "/completed-transactions/:status",
  priceRequestController.fetchPriceRequestByStatus
);

module.exports = router;
