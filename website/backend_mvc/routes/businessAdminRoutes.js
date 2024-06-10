const express = require("express");
const router = express.Router();
const businessAdminController = require("../controllers/businessAdminController");

router.post(
  "/fetchValuesByParams",
  businessAdminController.fetchValuesByParams
);

module.exports = router;
