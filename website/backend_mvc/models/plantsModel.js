const db = require("../config/db");
const logger = require("../utils/logger");

async function fetchPlants() {
  try {
    logger.info("Fetching plants started");
    // const result = await request.query(query);
    let result = await db.executeQuery(`EXEC GetPlants`);
    logger.info("Fetching plants successful", { result });
    // Send the results as a response
    return result;
  } catch (error) {
    logger.error("An error occurred while fetching plants", { error });
    throw error;
  }
}

module.exports = {
  fetchPlants,
};