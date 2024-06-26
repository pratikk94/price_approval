const db = require("../config/db");
const getCustomers = async (type, salesOffice) => {
  try {
    console.log(!salesOffice ? salesOffice : null, "..................")
    const result = await db.executeQuery('EXEC GetCustomersByTypeAndSalesOffice @Type,@SalesOffice',
      { "Type": type, "SalesOffice": !salesOffice ? salesOffice : null });
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

module.exports = {
  getCustomers,
};
