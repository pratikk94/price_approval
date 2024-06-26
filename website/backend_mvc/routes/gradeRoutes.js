
const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/gradeController");

router.get("/fetch_grade", gradeController.getGrades);

module.exports = router;
