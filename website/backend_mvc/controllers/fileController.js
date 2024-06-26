const fileModel = require("../models/fileModel");

async function uploadFileDetails(req, res) {
  try {
    if (!req.file || !req.body.request_id) {
        return res.status(400).send("No file uploaded or request_id missing.");
      }
      const { originalname, buffer } = req.file;
      const result = await fileModel.uploadFile(originalname,buffer, req.body.request_id);
      console.log(result);
      res.status(201).json({
        message: "File uploaded successfully",
      });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

async function fetchFileByRequestId(req, res) {
  try {
    const result = await fileModel.fetchFileByRequest(req.params.request_id);
    console.log(result.recordset);
    if (result.recordset.length > 0) {
      res.json(result.recordset);
    } else {
      res.status(404).send("No files found for the provided request_id.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

module.exports = {
    uploadFileDetails,
    fetchFileByRequestId
};
