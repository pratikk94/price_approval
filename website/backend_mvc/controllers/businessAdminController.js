const businessAdminModel = require("../models/businessAdminModel");
const logger = require("../utils/logger");

async function fetchValuesByParams(req, res) {
  try {
    const paramsList = req.body.params;

    if (!Array.isArray(paramsList) || paramsList.length === 0) {
      logger.warn("Invalid params list provided");
      return res.status(400).send({ error: "Invalid params list" });
    }

    logger.info(`Fetching values for params: ${JSON.stringify(paramsList)}`);
    const values = await businessAdminModel.getValuesByParams(paramsList);
    
    res.send(values);
  } catch (err) {
    logger.error(`Error fetching values by params: ${err.message}`);
    res.status(500).send({ error: "An error occurred while fetching data" });
  }
}

async function fetchSalesRegions(req, res) {
  try {
    logger.info("Fetching sales regions");
    const salesList = await businessAdminModel.getSalesRegion();
    res.send(salesList);
  } catch (err) {
    logger.error(`Error fetching sales regions: ${err.message}`);
    res.status(500).send({ error: "An error occurred while fetching data" });
  }
}

async function fetchGradeWithPC(req, res) {
  try {
    const fsc = req.query.fsc;

    if (!fsc){
      logger.warn("FSC is required");
      return res.status(400).json({ message: "FSC is required" });
    }

    logger.info(`Fetching grade with PC for FSC: ${fsc}`);
    const gradeList = await businessAdminModel.getGradeWithPC(fsc);
    res.send(gradeList);
  } catch (err) {
    logger.error(`Error fetching grade with PC: ${err.message}`);
    res.status(500).send({ error: "An error occurred while fetching data" });
  }
}

async function addDefinedRule(req, res) {
  try {
    logger.info(`Adding defined rule: ${JSON.stringify(req.body)}`);
    const addRule = await businessAdminModel.addRule(req.body);
    res.send(addRule);
  } catch (err) {
    logger.error(`Error adding defined rule: ${err.message}`);
    res.status(500).send({ error: "An error occurred while inserting data" });
  }
}

async function fetchBusinessAdmin(req, res) {
  try {
    const { type, fsc } = req.params;
    logger.info(`Fetching business admin for type: ${type}, FSC: ${fsc}`);
    const result = await businessAdminModel.getBusinessAdmin(type, fsc);
    res.send(result.recordset);
  } catch (err) {
    logger.error(`Error fetching business admin: ${err.message}`);
    res.status(500).send({ error: "An error occurred while inserting data" });
  }
}

async function addEmployeeRole(req, res) {
  try {
    let { employee_id, employee_name, role, region, created_date, active } =
      req.body;
    created_date = created_date ? new Date(created_date) : new Date();

    logger.info(`Adding employee role: ${JSON.stringify(req.body)}`);
    const result = await businessAdminModel.addEmployeeRole(employee_id, employee_name, role, region, created_date, active);
    logger.info(`Employee role added successfully: ${JSON.stringify(result.recordset)}`);
    res.send(result.recordset);
  } catch (err) {
    logger.error(`Error adding employee role: ${err.message}`);
    res.status(500).send({ error: "An error occurred while inserting data" });
  }
}

module.exports = {
  fetchValuesByParams,
  fetchSalesRegions,
  fetchGradeWithPC,
  addDefinedRule,
  fetchBusinessAdmin,
  addEmployeeRole
};
