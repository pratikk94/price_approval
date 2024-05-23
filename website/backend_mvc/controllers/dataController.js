const priceRequestModel = require("../models/priceRequestModel");

async function getTransactionData(req, res) {
  const { role, status } = req.params; // Assuming these are passed as URL parameters
  console.log("Role:", role, "Status:", status);
  try {
    const result = await priceRequestModel.fetchData(role, status);
    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Failed to fetch data due to server error.");
  }
}

async function getRequestDetails(req, res) {
  const { customerIds, consigneeIds, endUseId, plantIds, grade } = req.query;
  try {
    const result = await priceRequestModel.fetchRequestDetails({
      customerIds,
      consigneeIds,
      endUseId,
      plantIds,
      grade,
    });
    res.json(result);
  } catch (error) {
    res.status(500).send(`Server error: ${error.message}`);
  }
}

module.exports = {
  getTransactionData,
  getRequestDetails,
};
