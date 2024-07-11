const db = require("../config/db");
const logger = require("../utils/logger");

async function getRegionAndRoleByEmployeeId(employeeId) {
  try {
    logger.info(`Fetching region and role for employee ID: ${employeeId}`);
    let result = await db.executeQuery(`SELECT role, region FROM dbo.define_roles WHERE employee_id=@employeeId`, { "employeeId": employeeId });
    logger.info(`Query result for employee ID ${employeeId}: ${JSON.stringify(result.recordset)}`);
    return result.recordset;
  } catch (err) {
    logger.error(`Database query failed for employee ID ${employeeId}: ${err}`);
    throw err; // Rethrow the error for further handling
  }
}

// Example usage
getRegionAndRoleByEmployeeId("e1001")
  .then((data) => {
    console.log("Query result:", data);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

module.exports = {
  getRegionAndRoleByEmployeeId,
};
