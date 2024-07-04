// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login/:employee_id", authController.login);
router.get("/session", authController.checkSession);
router.get("/logout", authController.logout);

module.exports = router;
