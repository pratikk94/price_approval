const PlantsModel = require("../models/plantsModel");

async function getPlants(req, res) {
  try {
    const result = await PlantsModel.fetchPlants();
    // Send the results as a response
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send({
      message: "Error fetching payment terms",
      error: error.message,
    });
  }
}

module.exports = {
    getPlants
};
