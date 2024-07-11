const roleModel = require("../models/roleModel");
const logger = require("../utils/logger");

const fetchRoleDetails = async (req, res) => {
  const role = req.params.role;
  logger.info("Fetching role details", { role });

  try {
    const details = await roleModel.getRoleDetails(role);

    if (details) {
      logger.debug("Role details fetched successfully", { role, details });
      res.json({ success: true, data: details });
    } else {
      logger.warn("Role not found", { role });
      res.status(404).json({ success: false, message: "Role not found" });
    }
  } catch (error) {
    logger.error("Error accessing the database", { error: error.message, role });
    res.status(500).json({
      success: false,
      message: "Error accessing the database",
      error: error.message,
    });
  }
};

async function getRoles(req, res) {
  logger.info("Fetching all roles");

  try {
    logger.debug("Roles fetched successfully", { roles });
    const roles = await roleModel.fetchRoles();
    res.json(roles);
  } catch (err) {
    logger.error("Failed to fetch roles", { error: err.message });
    res.status(500).send("Failed to fetch roles");
  }
}

const updateEmployeeRole = async (req, res) => {
  const employeeData = req.body;
  logger.info("Updating employee role", { employeeData });

  try {
    const employeeDetails = await roleModel.updateEmployeRole(employeeData)
    logger.debug("Employee role updated successfully", { employeeDetails });
    res.send(employeeDetails);
  } catch (error) {
    logger.error("Error accessing the database", { error: error.message, employeeData });
    res.status(500).json({
      success: false,
      message: "Error accessing the database",
      error: error.message,
    });
  }
};

const fetchRoleData = async (req, res) => {
  logger.info("Fetching role data");
  try {
    const result = await roleModel.fetchRoleData();
    logger.debug("Role data fetched successfully", { result });
    console.log(result);
    res.send(result.recordset);
  } catch (error) {
    logger.error("Error accessing the database", { error: error.message });
    res
      .status(500)
      .json({
        success: false,
        message: "Error accessing the database",
        error: error.message,
      });
  }
};

const fetchRoleById = async (req, res) => {
  const roleId = req.query.id;
  logger.info("Fetching role by ID", { roleId });

  try {
    const result = await roleModel.fetchRoleId(roleId);
    logger.debug("Role fetched successfully by ID", { roleId, result });
    res.send(result.recordset);
  } catch (error) {
    logger.error("Error accessing the database", { error: error.message, roleId });
    res
      .status(500)
      .json({
        success: false,
        message: "Error accessing the database",
        error: error.message,
      });
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
