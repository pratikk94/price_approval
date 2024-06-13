// models/customerModel.js
const db = require("../config/db");
const getCustomers = async (type, salesOffice) => {
  try {
    let query = "";

    if (type === 1) {
      query = "SELECT * FROM customer WHERE Category LIKE '%CUST%'";
    } else if (type === 2) {
      query = "SELECT * FROM customer WHERE Category LIKE '%CONS%'";
    } else if (type === 3) {
      query = "SELECT * FROM customer WHERE Category LIKE '%end_use%'";
    }

    if (salesOffice) {
      query += ` AND sales_office = @salesOffice`;
    }

    let result = await db.executeQuery(query,{"salesOffice":salesOffice});
   
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

module.exports = {
  getCustomers,
};
