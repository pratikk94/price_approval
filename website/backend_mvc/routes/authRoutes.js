// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/api/login/:employee_id", authController.login);
router.get("/api/session", authController.checkSession);
router.get("/api/logout", authController.logout);

module.exports = router;
