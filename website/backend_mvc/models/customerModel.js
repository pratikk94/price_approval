const db = require("../config/db");
const logger = require("../utils/logger");

const getCustomers = async (type, salesOffice) => {
  try {
    logger.info(`Executing getCustomers with Type: ${type}, SalesOffice: ${salesOffice}`);

    const result = await db.executeQuery('EXEC GetCustomersByTypeAndSalesOffice @Type,@SalesOffice',
      { "Type": type, "SalesOffice": !salesOffice ? salesOffice : null });

    logger.info(`Query executed successfully for getCustomers with Type: ${type}, SalesOffice: ${salesOffice}`);

    return result.recordset;
  } catch (err) {
    logger.error(`Error in getCustomers with Type: ${type}, SalesOffice: ${salesOffice}: ${err.message}`);
    throw err;
  }
};

module.exports = {
  getCustomers,
};
