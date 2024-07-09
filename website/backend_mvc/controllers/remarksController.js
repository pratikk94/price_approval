const remarksModel = require("../models/remarksModel");
const logger = require("../utils/logger");

async function fetchRemarksWithRequests(req, res) {
  logger.info("Fetching remarks with requests...");
  logger.debug("Request ID:", req.body.request_id);

  try {
    const data = await remarksModel.getRemarksWithRequests(req.body.request_id);
    res.json(data);
  } catch (err) {
    logger.error("Error fetching data:", err);
    res.status(500).send("Failed to fetch data");
  }
}

// New function for posting a remark
async function createRemark(req, res) {
  logger.info("Creating a new remark...");
  logger.debug("Request body:", req.body);
  
  try {
    const newRemarkId = await remarksModel.postRemark(req.body);
    res
      .status(201)
      .json({ message: "Remark created successfully", id: newRemarkId });
  } catch (err) {
    logger.error("Error posting remark:", err);
    res.status(500).send("Failed to post remark");
  }
}

module.exports = {
  fetchRemarksWithRequests,
  createRemark,
};
