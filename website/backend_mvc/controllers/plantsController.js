const PlantsModel = require("../models/plantsModel");
const logger = require("../utils/logger");

async function getPlants(req, res) {
  try {
    logger.info("Fetching plant details");

    const result = await PlantsModel.fetchPlants();
    
    logger.info(`Plant details fetched successfully: ${JSON.stringify(result.recordset)}`);
    // Send the results as a response
    res.json(result.recordset);
  } catch (error) {
    logger.error(`Error fetching plant details: ${error.message}`);
    res.status(500).send({
      message: "Error fetching payment terms",
      error: error.message,
    });
  }
}

module.exports = {
  getPlants
};
