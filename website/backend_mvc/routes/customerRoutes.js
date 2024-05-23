// routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.get("/customers/:type", customerController.getCustomers);

module.exports = router;