// models/customerModel.js
const sql = require("mssql");
const config = require("../../backend_mvc/config");
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));
const getCustomers = async (type, salesOffice) => {
  try {
    const pool = await poolPromise;
    let query = "";

    if (type === 1) {
      query = "SELECT * FROM customer WHERE Category LIKE '%CUST%'";
    } else if (type === 2) {
      query = "SELECT * FROM customer WHERE Category LIKE '%CONS%'";
    } else if (type === 3) {
      query = "SELECT * FROM customer WHERE Category LIKE '%end_use%'";
    }

    if (salesOffice) {
      query += ` AND sales_office = '${salesOffice}'`;
    }

    const result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

module.exports = {
  getCustomers,
};
