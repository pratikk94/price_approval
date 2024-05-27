// routes.js
const express = require("express");
const router = express.Router();
const remarksController = require("../controllers/remarksController");

router.post("/fetch-remarks", remarksController.fetchRemarksWithRequests);
router.post("/remarks", remarksController.createRemark); // New route for posting remarks

module.exports = router;
