const roleModel = require("../models/roleModel");

const fetchRoleDetails = async (req, res) => {
  const role = req.params.role;
  try {
    const details = await roleModel.getRoleDetails(role);
    if (details) {
      res.json({ success: true, data: details });
    } else {
      res.status(404).json({ success: false, message: "Role not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accessing the database",
      error: error.message,
    });
  }
};

async function getRoles(req, res) {
  try {
    const roles = await roleModel.fetchRoles();
    res.json(roles);
  } catch (err) {
    res.status(500).send("Failed to fetch roles");
  }
}

const updateEmployeeRole = async (req, res) => {
  try {
    const emplotyeeDetails = await roleModel.updateEmployeRole(req.body);

    res.send(emplotyeeDetails);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accessing the database",
      error: error.message,
    });
  }
};

const fetchRoleData = async (req, res) => {
  try {
    const result = await roleModel.fetchRoleData();
    console.log(result);
    res.send(result.recordset);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accessing the database",
      error: error.message,
    });
  }
};

const fetchRoleById = async (req, res) => {
  try {
    const result = await roleModel.fetchRoleId(req.query.id);
    console.log(result);
    res.send(result.recordset);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error accessing the database",
      error: error.message,
    });
  }
};
async function getRoles(req, res) {
  try {
    const roles = await roleModel.fetchRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function addRole(req, res) {
  try {
    const role = req.body;
    const adjustHierarchy = req.body.adjustHierarchy || false;
    const result = await roleModel.addRole(role, adjustHierarchy);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function updateRole(req, res) {
  try {
    const role = req.body;
    const result = await roleModel.updateRole(role);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

module.exports = {
  fetchRoleDetails,
  updateEmployeeRole,
  fetchRoleData,
  fetchRoleById,
  getRoles,
  addRole,
  updateRole,
};
