const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
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
        .query`SELECT code, name FROM customer where category IN ('END_USE')`;
    } else if (type == 2) {
      result = await pool.request()
        .query`SELECT code, name FROM customer where category IN ('DOM_CONS','EXP_CONS')`;
    } else {
      result = await pool.request()
        .query`SELECT code, name FROM customer WHERE category IN ('DOM_CUST', 'EXP_CUST', 'INTERDIV_CUST')`;
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

app.post("/api/add_price_request", async (req, res) => {
  let pool = null;
  try {
    // Connect to database
    pool = await sql.connect(config);
    console.log(req.body);
    // Insert into the main table
    const mainResult = await pool.request()
      .query`INSERT INTO main (customer_id, consignee_id, plant, end_use_id, end_use_segment_id, payment_terms_id, valid_from, valid_to, fsc, mappint_type) VALUES (${req.body.customerIds}, ${req.body.consigneeIds}, ${req.body.plants}, ${req.body.endUseIds}, ${req.body.endUseSegmentIds}, ${req.body.paymentTermsId}, ${req.body.validFrom}, ${req.body.validTo}, ${req.body.fsc},${req.body.mappingType}); SELECT SCOPE_IDENTITY() as id;`;

    const requestId = mainResult.recordset[0].id;

    // Insert into the main_price_table
    const priceTable = req.body.priceTable; // Assuming this is an array of objects
    for (const item of priceTable) {
      await pool.request()
        .query`INSERT INTO main_price_table (request_id, grade, grade_type, gsm_range_from, gsm_range_to, agreed_price, special_discount, reel_discount, pack_upcharge, tpc, offline_discount, net_nsr, old_net_nsr) VALUES (${requestId}, ${item.grade}, ${item.gradeType}, ${item.gsmRangeFrom}, ${item.gsmRangeTo}, ${item.agreedPrice}, ${item.specialDiscount}, ${item.reelDiscount}, ${item.packUpcharge}, ${item.tpc}, ${item.offlineDiscount}, ${item.netNsr}, ${item.oldNetNsr});`;
    }

    res.status(200).send("Data added successfully");
  } catch (err) {
    console.error("Database operation failed:", err);
    res.status(500).send("Failed to add data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
