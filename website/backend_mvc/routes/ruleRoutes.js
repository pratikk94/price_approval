const express = require("express");
const router = express.Router();
const ruleController = require("../controllers/ruleController");

router.get(
  "/rules/:approver/:level",
  ruleController.getRulesByApproverAndLevel
);

router.get("/approvers-by-levels", ruleController.getApproversByLevels);

router.post("/approvers-by-levels", ruleController.postApproversByLevels);

module.exports = router;
