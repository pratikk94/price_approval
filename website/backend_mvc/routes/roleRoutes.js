// routes/roleRoutes.js
const express = require("express");
const router = express.Router();
const { fetchRoleDetails } = require("../controllers/roleController");

// Define the route for getting role details by role
router.get("/:role", fetchRoleDetails);

module.exports = router;
