const sql = require("mssql");
const config = require("../../backend_mvc/config");

// Make sure to maintain a connection pool instead of connecting in each function
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

class User {
  static async findUserByEmployeeId(employee_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("employee_id", sql.VarChar, employee_id)
        .query(
          "SELECT role, region FROM define_roles WHERE employee_id = @employee_id AND active = 1"
        );
      return result.recordset[0];
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

module.exports = User;
