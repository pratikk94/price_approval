const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");

router.post("/update-status", requestController.updateRequestStatus);

module.exports = router;
