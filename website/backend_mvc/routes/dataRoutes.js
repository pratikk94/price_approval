const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

// Define a route to handle requests for transaction data
router.get("/data/:role/:status", dataController.getTransactionData);

router.get("/request-details", dataController.getRequestDetails);

module.exports = router;
