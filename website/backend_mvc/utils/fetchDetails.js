// const sql = require("mssql");

// // Database connection string
// const config = {
//   user: DB_CONFIG.user,
//   password: DB_CONFIG.password,
//   server: DB_CONFIG.server, // You can use 'localhost\\instance' if it's a local SQL Server instance
//   //password: DB_CONFIG.password,
//   //server: DB_CONFIG.server, // You can use 'localhost\\instance' if it's a local SQL Server instance
//   port: DB_CONFIG.port,
//   database: DB_CONFIG.database,
//   options: {
//     enableArithAbort: true,
//     encrypt: true, // Use this if you're on Windows Azure
//     // encrypt: false, // Use this if you're on Windows Azure
//     trustServerCertificate: true, // Use this if you're on a local development environment
//   },
// };
const db = require("../config/db");
async function getRegionAndRoleByEmployeeId(employeeId) {
  try {
    // Ensure a connection to the database
    // await sql.connect(config);

    // Query to fetch region and role by employee_id
    // const result =
    //   await sql.query`SELECT role, region FROM dbo.define_roles WHERE employee_id = ${employeeId}`;
      let result = await db.executeQuery(`SELECT role, region FROM dbo.define_roles WHERE employee_id=@employeeId`,{"employeeId":employeeId});
    console.log(result.recordset);
    return result.recordset;
  } catch (err) {
    console.error("Database query failed:", err);
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
