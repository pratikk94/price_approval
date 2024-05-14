const express = require("express");
const router = express.Router();
const ruleController = require("../controllers/ruleController");

router.get(
  "/rules/:approver/:level",
  ruleController.getRulesByApproverAndLevel
);

router.get("/approvers-by-levels", ruleController.getApproversByLevels);

module.exports = router;