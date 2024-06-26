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

async function fetchSalesRegions(req, res) {
  try {
    const salesList = await businessAdminModel.getSalesRegion();
    res.send(salesList);
  } catch (err) {
    res.status(500).send({ error: "An error occurred while fetching data" });
  }
}

async function fetchGradeWithPC(req, res) {
  try {
    const fsc = req.query.fsc;
    if (!fsc)
      return res.status(400).json({ message: "FSC is required" });

    const gradeList = await businessAdminModel.getGradeWithPC(fsc);
    res.send(gradeList);
  } catch (err) {
    res.status(500).send({ error: "An error occurred while fetching data" });
  }
}

async function addDefinedRule(req, res) {
  try {
    const addRule = await businessAdminModel.addRule(req.body);
    res.send(addRule);
  } catch (err) {
    res.status(500).send({ error: "An error occurred while inserting data" });
  }
}

async function fetchBusinessAdmin(req, res) {
  try {
    const result = await businessAdminModel.getBusinessAdmin(req.params.type,req.params.fsc);
    res.send(result.recordset);
  } catch (err) {
    res.status(500).send({ error: "An error occurred while inserting data" });
  }
}

async function addEmployeeRole(req, res) {
  try {
    let { employee_id, employee_name, role, region, created_date, active } =
    req.body;
    created_date = created_date ? new Date(created_date) : new Date();
    const result = await businessAdminModel.addEmployeeRole( employee_id, employee_name, role, region, created_date, active );
    console.log(result,"testing..............")
    res.send(result.recordset);
  } catch (err) {
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
