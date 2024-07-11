const express = require("express");
const router = express.Router();
const attchmentController = require("../controllers/attachmentController");
const emailController = require("../controllers/emailController")

router.get("/:request_id", attchmentController.fetchFiles);
router.post('/send-email', emailController.sendEmail);

module.exports = router;
