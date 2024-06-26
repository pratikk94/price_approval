const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");

// Define the route for getting role details by role
router.get("/:role", roleController.fetchRoleDetails);
router.post("/update-employee-role",roleController.updateEmployeeRole);
router.get("/data/fetchRoles", roleController.fetchRoleData);
router.get("/data/fetchRolesId", roleController.fetchRoleById);


module.exports = router;
