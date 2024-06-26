const express = require("express");
const router = express.Router();
const {
  fetchRoleDetails,
  updateEmployeeRole,
  getRoles,
} = require("../controllers/roleController");

// Define the route for getting role details by role
router.get("/:role", fetchRoleDetails);
router.post("/update-employee-role", updateEmployeeRole);
router.post("/all_roles", getRoles);
module.exports = router;
