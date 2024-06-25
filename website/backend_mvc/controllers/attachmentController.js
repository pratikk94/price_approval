const attachmentModel = require("../models/attachmentModel");

async function fetchFiles(req, res) {
  try {
    const { request_id } = req.params;
    const files = await attachmentModel.getFilesByRequestId(request_id);
    if (files.length > 0) {
      res.json(files);
    } else {
      res.status(404).send("No files found for the provided request_id.");
    }
  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).send("Failed to fetch files.");
  }
}

module.exports = {
  fetchFiles,
};
