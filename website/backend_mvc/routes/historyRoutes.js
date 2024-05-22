const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");
router.get("/history-requests", historyController.getHistoryRequests);

module.exports = router;
