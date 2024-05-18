// controllers/roleController.js
const { getRoleDetails } = require("../models/roleModel");

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

module.exports = { fetchRoleDetails };
