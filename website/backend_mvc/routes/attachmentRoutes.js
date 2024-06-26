const express = require("express");
const router = express.Router();
const attchmentController = require("../controllers/attachmentController");
router.get("/:request_id", attchmentController.fetchFiles);

module.exports = router;
