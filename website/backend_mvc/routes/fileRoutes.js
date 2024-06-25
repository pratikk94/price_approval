const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const fileController = require("../controllers/fileController");

// Define a route to handle requests for transaction data
router.post("/upload_file",upload.single("file"), fileController.uploadFileDetails);

module.exports = router;
