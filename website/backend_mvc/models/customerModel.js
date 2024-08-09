const { SYMMETRIC_KEY_NAME, CERTIFICATE_NAME } = require("../config/constants");
const db = require("../config/db");
const getCustomers = async (type, salesOffice) => {
  try {
    const result = await db.executeQuery('EXEC GetCustomersByTypeAndSalesOffice @Type,@SalesOffice,@SymmetricKeyName,@CertificateName',
      { "Type": type, "SalesOffice": salesOffice, SymmetricKeyName:SYMMETRIC_KEY_NAME,
        CertificateName:CERTIFICATE_NAME });
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

module.exports = {
  getCustomers,
};
