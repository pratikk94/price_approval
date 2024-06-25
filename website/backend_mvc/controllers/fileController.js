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

module.exports = {
    uploadFileDetails
};
