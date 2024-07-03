const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const fileController = require("../controllers/fileController");

router.post("/upload_file",upload.single("file"), fileController.uploadFileDetails);
router.get("/download/:requestId",fileController.downloadFileByFileId);
router.delete("/download/:requestId",fileController.deleteFileByFileId);


module.exports = router;
