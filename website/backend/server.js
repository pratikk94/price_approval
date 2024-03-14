const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const { format } = require("date-fns");
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
        .query`SELECT code, name FROM customer where category IN ('END-USE')`;
    } else if (type == 2) {
      result = await pool.request()
        .query`SELECT code, name FROM customer where category IN ('DOM-CONS','EXP-CONS')`;
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

// Api to fetch grade.
app.get("/api/fetch_price_requests", async (req, res) => {
  let pool = null;
  const fsc = req.query.fsc == 1 ? "Y" : "N";
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query the database
    const result = await pool.request()
      .query`SELECT * FROM price_approval_requests `;

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

//TO-DO:update user id from ad.
//api to add price request.
app.post("/api/add_price_request", async (req, res) => {
  let pool = null;
  try {
    // Connect to database
    pool = await sql.connect(config);
    // Insert into the main table
    const mainResult = await pool.request()
      .query`INSERT INTO price_approval_requests (customer_id, consignee_id, plant, end_use_id, end_use_segment_id, payment_terms_id, valid_from, valid_to, fsc, mappint_type) VALUES (${req.body.customerIds}, ${req.body.consigneeIds}, ${req.body.plants}, ${req.body.endUseIds}, ${req.body.endUseSegmentIds}, ${req.body.paymentTermsId}, ${req.body.validFrom}, ${req.body.validTo}, ${req.body.fsc},${req.body.mappingType}); SELECT SCOPE_IDENTITY() as id;`;

    const requestId = mainResult.recordset[0].id;
    console.log(requestId);
    // Insert into the main_price_table
    const priceTable = req.body.priceTable; // Assuming this is an array of objects
    for (const item of priceTable) {
      await pool.request()
        .query`INSERT INTO price_approval_requests_price_table (req_id, grade, grade_type, gsm_range_from, gsm_range_to, agreed_price, special_discount, reel_discount, pack_upcharge, tpc, offline_discount, net_nsr, old_net_nsr) VALUES (
          ${requestId}, 
          ${item.grade},  ${item.gradeType}, 
          ${item.gsmFrom}, 
          ${item.gsmTo}, 
          ${item.agreedPrice != undefined ? item.agreedPrice : 0}, 
          ${item.specialDiscount != undefined ? item.specialDiscount : 0}, 
          ${item.reelDiscount != undefined ? item.reelDiscount : 0}, 
          ${item.packUpcharge != undefined ? item.packUpcharge : 0}, 
          ${item.tpc != undefined ? item.tpc : 0}, 
          ${item.offlineDiscount != undefined ? item.offlineDiscount : 0}, 
          ${item.netNSR != undefined ? item.netNSR : 0}, 
          ${item.oldNetNSR != undefined ? item.oldNetNSR : 0});`;
    }
    const time = format(Date(), "yyyy-MM-dd HH:mm:ss");
    const query = `
    INSERT INTO report_status (report_id,status, status_updated_by_id , created_at, last_updated_at) 
    VALUES (
        ${requestId},
        ${1},
        ${1},
        '${time}',
        '${time}')`;

    console.log(query);

    // Execute the query with parameters
    await pool.request().query(query);

    console.log("Data inserted successfully.");

    res.status(200).send("Data added successfully");
  } catch (err) {
    console.error("Database operation failed:", err);
    res.status(500).send("Failed to add data");
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (err) {
        console.error("Failed to close the pool:", err);
      }
    }
  }
});

app.get("/api/price-requests", async (req, res) => {
  try {
    pool = await sql.connect(config);
    const req_id = req.query.id;
    console.log(req_id);
    const result = await sql.query(`
      SELECT pra.*, prt.*
      FROM price_approval_requests pra
      LEFT JOIN price_approval_requests_price_table prt ON pra.req_id = prt.req_id
      where pra.req_id = ${req_id}
    `);

    const formattedResult = result.recordset.reduce((acc, row) => {
      if (!acc[row.req_id]) {
        acc[row.req_id] = {
          customer_id: row.customer_id,
          consignee_id: row.consignee_id,
          plant: row.plant,
          end_use_id: row.end_use_id,
          end_use_segment_id: row.end_use_segment_id,
          payment_terms_id: row.payment_terms_id,
          valid_from: row.valid_from,
          valid_to: row.valid_to,
          fsc: row.fsc,
          mappint_type: row.mappint_type,
          price: [],
        };
      }
      // Check if there's meaningful price table data before adding
      if (
        row.req_id /* Use an actual identifier from price_requests_approval_price_table to check */
      ) {
        acc[row.req_id].price.push({
          grade: row.grade,
          grade_type: row.grade_type,
          gsm_range_from: row.gsm_range_from,
          gsm_range_to: row.gsm_range_to,
          agreed_price: row.agreed_price,
          special_discount: row.special_discount,
          reel_discount: row.reel_discount,
          pack_upcharge: row.push_upcharge,
          tpc: row.tpc,
          offline_discount: row.offline_discount,
          net_nsr: row.net_nsr,
          old_net_nsr: row.old_net_nsr,

          // Other price table specific fields...
        });
      }
      return acc;
    }, {});

    res.json(Object.values(formattedResult));
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).send("Failed to fetch data");
  } finally {
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
