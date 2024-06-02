const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/lowest-payment-term", paymentController.getLowestPaymentTerm);

module.exports = router;
