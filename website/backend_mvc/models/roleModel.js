// models/roleModel.js
const sql = require("mssql");
const config = require("../../backend_mvc/config");
const db = require("../config/db");
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
  try {

    let query = `UPDATE define_roles
    SET employee_name = @newName, role = @newRole, region = @newRegion, active=@newActive
    WHERE employee_id = @employeeId`;

    let input = {
      "employeeId": roleDetails.employee_id,
      "newName": roleDetails.employee_name,
      "newRole": roleDetails.role,
      "newActive": roleDetails.active,
      "newRegion": roleDetails.region
    }

    let result = await db.executeQuery(query, input);

    return result;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

module.exports = { getRoleDetails, updateEmployeRole };
