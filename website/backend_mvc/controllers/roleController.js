// controllers/roleController.js
const { getRoleDetails, updateEmployeRole } = require("../models/roleModel");

const fetchRoleDetails = async (req, res) => {
  const role = req.params.role;
  try {
    const details = await getRoleDetails(role);
    if (details) {
      res.json({ success: true, data: details });
    } else {
      res.status(404).json({ success: false, message: "Role not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error accessing the database",
        error: error.message,
      });
  }
};

const updateEmployeeRole = async (req, res) => {
  try {
    const emplotyeeDetails = await updateEmployeRole(req.body)
    res.send(emplotyeeDetails);

  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error accessing the database",
        error: error.message,
      });
  }

}
module.exports = { fetchRoleDetails, updateEmployeeRole };
