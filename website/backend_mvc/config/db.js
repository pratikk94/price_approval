const sql = require("mssql");
const { DB_CONFIG } = require("./constants");

const config = {
  user: "sa",
  password: "SayaliK20311",
  server: "localhost", // You can use 'localhost\\instance' if it's a local SQL Server instance
  //password: DB_CONFIG.password,
  //server: DB_CONFIG.server, // You can use 'localhost\\instance' if it's a local SQL Server instance
  port: DB_CONFIG.port,
  database: DB_CONFIG.database,
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
  }
}

module.exports = { executeQuery };
