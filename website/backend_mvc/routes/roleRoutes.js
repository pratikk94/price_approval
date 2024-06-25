const express = require("express");
const router = express.Router();
const { fetchRoleDetails, updateEmployeeRole } = require("../controllers/roleController");

// Define the route for getting role details by role
router.get("/:role", fetchRoleDetails);
router.post("/update-employee-role",updateEmployeeRole);

module.exports = router;
