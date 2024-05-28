// routes.js
const express = require("express");
const router = express.Router();
const requestHistoryController = require("../controllers/requestHistoryController");

// New route for fetching transactions by request ID
router.get(
  "/requestHistory/:requestId",
  requestHistoryController.fetchTransactionsByRequestId
);

module.exports = router;
