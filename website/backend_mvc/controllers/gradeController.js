const gradeModel = require("../models/gradeModel");
const logger = require("../utils/logger");

async function getGrades(req, res) {
  try {
    const fsc = req.query.fsc == 1 ? "Y" : "N";
    logger.info(`Fetching grades with FSC: ${fsc}`);
    const result = await gradeModel.fetchGrade(fsc);
    logger.info(`Grades fetched successfully: ${JSON.stringify(result.recordset)}`);
    // Send the results as a response
    res.json(result.recordset);
  } catch (error) {
    logger.error(`Error fetching grades: ${error.message}`);
    res.status(500).send({
      message: "Error fetching payment terms",
      error: error.message,
    });
  }
}

module.exports = {
  getGrades,
};
