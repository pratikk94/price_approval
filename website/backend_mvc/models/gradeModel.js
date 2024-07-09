const db = require("../config/db");
const logger = require("../utils/logger");

async function fetchGrade(fsc) {
  try {
    logger.info(`Fetching grades for FSC: ${fsc}`);

    let result = await db.executeQuery(`EXEC GetMaterialsByFSC @fsc=${fsc}`);

    logger.info(`Fetch grades successful for FSC: ${fsc}. Result: ${JSON.stringify(result.recordset)}`);

    // Send the results as a response
    return result;
  } catch (error) {
    logger.error(`Error fetching grades for FSC: ${fsc}. Error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  fetchGrade,
};
