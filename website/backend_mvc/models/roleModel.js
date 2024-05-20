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

module.exports = { getRoleDetails };
