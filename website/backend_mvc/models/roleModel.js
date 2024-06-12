// models/roleModel.js
const sql = require("mssql");
const config = require("../../backend_mvc/config");
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

const getRoleDetails = async (role) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("roleParam", sql.VarChar, role)
      .query("SELECT * FROM role_matrix WHERE role = @roleParam");
    return result.recordset[0]; // returns the first record or undefined
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

const updateEmployeRole = async (roleDetails) => {
  const { employee_id, employee_name, role, region, active } = roleDetails;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("employeeId", sql.NVarChar(255), employee_id)
      .input("newName", sql.NVarChar(255), employee_name)
      .input("newRole", sql.NVarChar(255), role)
      .input("newActive", sql.Int, active)
      .input("newRegion", sql.NVarChar(255), region).query`UPDATE define_roles
      SET employee_name = @newName, role = @newRole, region = @newRegion, active=@newActive
      WHERE employee_id = @employeeId`;

      return ({ message: "Employee role updated successfully", result });
      // returns the first record or undefined
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

module.exports = { getRoleDetails,updateEmployeRole };
