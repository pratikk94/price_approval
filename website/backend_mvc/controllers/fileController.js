const fileModel = require("../models/fileModel");

async function uploadFileDetails(req, res) {
  try {
    if (!req.file || !req.body.request_id) {
      return res.status(400).send("No file uploaded or request_id missing.");
    }
    const { originalname, buffer } = req.file;
    const result = await fileModel.uploadFile(originalname, buffer, req.body.request_id);
    console.log(result);
    res.status(201).json({
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

async function downloadFileByFileId(req, res) {
  try {
    const requestId = req.params.requestId;
    const result = await fileModel.downloadFile(requestId);
    console.log(result);
    const file = result.recordset[0];
    const buffer = file.file_data;
    const fileName = file.file_name;

    // Set the response headers to indicate a file attachment
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

async function deleteFileByFileId(req, res) {
  try {
    const requestId = req.params.requestId;
    
    const result = await fileModel.deleteFile(requestId);
    console.log(result);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('File not found');
    }
    res.send('File deleted successfully');
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

module.exports = {
  uploadFileDetails,
  downloadFileByFileId,
  deleteFileByFileId
};
