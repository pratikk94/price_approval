const businessAdminModel = require("../models/businessAdminModel");

async function fetchValuesByParams(req, res) {
  try {
    const paramsList = req.body.params;
    if (!Array.isArray(paramsList) || paramsList.length === 0) {
      return res.status(400).send({ error: "Invalid params list" });
    }

    const values = await businessAdminModel.getValuesByParams(paramsList);
    res.send(values);
  } catch (err) {
    res.status(500).send({ error: "An error occurred while fetching data" });
  }
}

module.exports = {
  fetchValuesByParams,
};
