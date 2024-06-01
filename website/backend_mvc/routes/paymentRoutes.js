// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/payment-details", paymentController.fetchMinPaymentDetails);

module.exports = router;
