const attachmentModel = require("../models/attachmentModel");
const logger = require("../utils/logger");

async function fetchFiles(req, res) {
  try {
    const { request_id } = req.params;
    logger.info(`Fetching files for request_id: ${request_id}`);
    const files = await attachmentModel.getFilesByRequestId(request_id);

    if (files.length > 0) {
      logger.info(`Found ${files.length} files for request_id: ${request_id}`);
      res.json(files);
    } else {
      logger.warn(`No files found for request_id: ${request_id}`);
      res.status(404).send("No files found for the provided request_id.");
    }
  } catch (err) {
    logger.error(`fetchFiles:: error:: ${err.message}`);
    res.status(500).send("Failed to fetch files.");
  }
}

module.exports = {
  fetchFiles,
};
