const fileModel = require("../models/fileModel");
const logger = require("../utils/logger");

async function uploadFileDetails(req, res) {
  try {
    if (!req.file || !req.body.request_id) {
      logger.warn("No file uploaded or request_id missing");
      return res.status(400).send("No file uploaded or request_id missing.");
    }
    const { originalname, buffer } = req.file;
    logger.info(`Uploading file: ${originalname} for request_id: ${req.body.request_id}`);
    const result = await fileModel.uploadFile(originalname, buffer, req.body.request_id);
    logger.info(`File uploaded successfully: ${JSON.stringify(result)}`);
    res.status(201).json({
      message: "File uploaded successfully",
    });
  } catch (error) {
    logger.error(`Error uploading file: ${error.message}`);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

async function downloadFileByFileId(req, res) {
  try {
    const requestId = req.params.requestId;
    logger.info(`Downloading file for requestId: ${requestId}`);
    const result = await fileModel.downloadFile(requestId);
    console.log(result);
    const file = result.recordset[0];
    const buffer = file.file_data;
    const fileName = file.file_name;

    logger.info(`File downloaded successfully: ${fileName}`);
    // Set the response headers to indicate a file attachment
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    logger.error(`Error downloading file: ${error.message}`);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

async function deleteFileByFileId(req, res) {
  try {
    const requestId = req.params.requestId;
    logger.info(`Deleting file for requestId: ${requestId}`);
    const result = await fileModel.deleteFile(requestId);
    if (result.rowsAffected[0] === 0) {
      logger.warn(`File not found for requestId: ${requestId}`);
      return res.status(404).send('File not found');
    }
    logger.info(`File deleted successfully for requestId: ${requestId}`);
    res.send('File deleted successfully');
  } catch (error) {
    logger.error(`Error deleting file: ${error.message}`);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

module.exports = {
  uploadFileDetails,
  downloadFileByFileId,
  deleteFileByFileId
};
