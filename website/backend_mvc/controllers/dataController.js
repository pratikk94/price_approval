const priceRequestModel = require("../models/priceRequestModel");
const logger = require("../utils/logger");

async function getTransactionData(req, res) {
  try {
    const { role, status, id } = req.params; // Assuming these are passed as URL parameters
    logger.info(`Fetching transaction data for role: ${role}, status: ${status}, id: ${id}`);
    const result = await priceRequestModel.fetchData(role, status, id);
    res.json(result);
  } catch (error) {
    logger.error(`Error fetching transaction data: ${error.message}`);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

async function getRequestDetails(req, res) {
  const { customerIds, consigneeIds, endUseId, plantIds, grade } = req.query;
  try {
    logger.info(`Fetching request details with params: ${JSON.stringify(req.query)}`);
    const result = await priceRequestModel.fetchRequestDetails({
      customerIds,
      consigneeIds,
      endUseId,
      plantIds,
      grade,
    });
    res.json(result);
  } catch (error) {
    logger.error(`Error fetching request details: ${error.message}`);
    res.status(500).send(`Server error: ${error.message}`);
  }
}

async function getRequestReport(req, res) {
  const { status, id } = req.params;
  try {
    logger.info(`Fetching request report for id: ${id}, status: ${status}`);
    const result = await priceRequestModel.fetchRequestReport(
      id, status
    );
    res.json(result);
  } catch (error) {
    logger.error(`Error fetching request report: ${error.message}`);
    res.status(500).send(`Server error: ${error.message}`);
  }
}
module.exports = {
  getTransactionData,
  getRequestDetails,
  getRequestReport
};
