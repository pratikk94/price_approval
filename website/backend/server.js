const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
// Configuration object for your SQL Server
const config = {
  user: "sa",
  password: "SayaliK20311",
  server: "localhost", // You can use 'localhost\\instance' if it's a local SQL Server instance
  database: "PriceApprovalSystem",
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Use this if you're on a local development environment
  },
};

// Api to fetch customers. based upon ids which are currently hardcoded.
app.get("/api/fetch_customers", async (req, res) => {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);
    const type = req.query.type;
    // Query the database
    let result;
    if (type == 3) {
      console.log("selected");
      result = await pool.request()
        .query`SELECT code, name FROM customer where category IN (6)`;
    } else if (type == 2) {
      result = await pool.request()
        .query`SELECT code, name FROM customer where category IN (2, 4)`;
    } else {
      result = await pool.request()
        .query`SELECT code, name FROM customer where category IN (1, 3, 5)`;
    }
    // Send the results as a response
    res.json(result.recordset);
  } catch (err) {
    // If an error occurs, send an error response
    console.error("SQL error", err);
    res.status(500).send("An error occurred while fetching customers");
  } finally {
    // Close the database connection
    if (pool) {
      try {
        await pool.close();
      } catch (err) {
        console.error("Failed to close the pool:", err);
      }
    }
  }
});

// Api to fetch payment terms.
app.get("/api/fetch_payment_terms", async (req, res) => {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query the database
    const result = await pool.request()
      .query`SELECT terms as name, payment_terms_id as code FROM payment_terms`;

    // Send the results as a response
    res.json(result.recordset);
  } catch (err) {
    // If an error occurs, send an error response
    console.error("SQL error", err);
    res.status(500).send("An error occurred while fetching customers");
  } finally {
    // Close the database connection
    if (pool) {
      try {
        await pool.close();
      } catch (err) {
        console.error("Failed to close the pool:", err);
      }
    }
  }
});

// Api to fetch plants.
app.get("/api/fetch_plants", async (req, res) => {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query the database
    const result = await pool.request()
      .query`SELECT name, id as code FROM plant`;

    // Send the results as a response
    res.json(result.recordset);
  } catch (err) {
    // If an error occurs, send an error response
    console.error("SQL error", err);
    res.status(500).send("An error occurred while fetching customers");
  } finally {
    // Close the database connection
    if (pool) {
      try {
        await pool.close();
      } catch (err) {
        console.error("Failed to close the pool:", err);
      }
    }
  }
});

// Api to fetch grade.
app.get("/api/fetch_grade", async (req, res) => {
  let pool = null;
  const fsc = req.query.fsc == 1 ? "Y" : "N";
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query the database
    const result = await pool.request()
      .query`SELECT grade as name , id as code FROM material where fsc = ${fsc}`;

    // Send the results as a response
    res.json(result.recordset);
  } catch (err) {
    // If an error occurs, send an error response
    console.error("SQL error", err);
    res.status(500).send("An error occurred while fetching customers");
  } finally {
    // Close the database connection
    if (pool) {
      try {
        await pool.close();
      } catch (err) {
        console.error("Failed to close the pool:", err);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
