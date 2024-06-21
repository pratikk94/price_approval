const sql = require("mssql");

const config = {
  user: "sa",
  password: "SayaliK20311",
  server: "localhost", // You can use 'localhost\\instance' if it's a local SQL Server instance
  // password: "Innominds@123",
  // server: "localhost", // You can use 'localhost\\instance' if it's a local SQL Server instance
  port: 1433,
  database: "PriceApprovalSystem",
  options: {
    enableArithAbort: true,
    encrypt: true, // Use this if you're on Windows Azure
    // encrypt: false, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Use this if you're on a local development environment
  },
};

async function connect() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to Database");
    return pool;
  } catch (error) {
    console.log("Databse connection error", error);
    throw error;
  }
}
async function executeQuery(query, inputs = {}) {
  try {
    const pool = await connect();
    const request = pool.request();
    if (inputs) {
      for (const key in inputs) {
        request.input(key, inputs[key]);
      }
    }
    const result = await request.query(query);
    console.log("Connection pool is open:", pool.connected);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    sql.close();
  }
}

module.exports = { executeQuery };
