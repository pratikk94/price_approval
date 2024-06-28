const sql = require("mssql");

// Database connection string
const config = {
  user: "sa",
  password: "SayaliK20311",
  server: "localhost", // You can use 'localhost\\instance' to connect to named instance
  database: "PriceApprovalSystem",
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Use this if you're on a local development environment
  },
};

async function getRegionAndRoleByEmployeeId(employeeId) {
  try {
    // Ensure a connection to the database
    await sql.connect(config);

    // Query to fetch region and role by employee_id
    const result =
      await sql.query`SELECT role, region FROM dbo.define_roles WHERE employee_id = ${employeeId}`;

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
