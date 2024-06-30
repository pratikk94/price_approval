const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

// Define a route to handle requests for transaction data
router.get("/data/:role/:status/:id", dataController.getTransactionData);

router.get("/request-details", dataController.getRequestDetails);

router.get("/request-Report/:status/:id", dataController.getRequestReport);


module.exports = router;
