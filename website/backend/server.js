const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const sql = require("mssql");
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:5173", // or the specific origin you want to allow
  credentials: true, // allowing credentials (cookies, session)
};
const app = express();
const PORT = process.env.PORT || 3001;
const { format } = require("date-fns");
app.use(cors(corsOptions));
app.use(express.json());
// Configuration object for your SQL Server
const config = {
  user: "sa",
  //password: "SayaliK20311",
  //server: "localhost", // You can use 'localhost\\instance' if it's a local SQL Server instance
  password: "SayaliK20311",
  server: "localhost", // You can use 'localhost\\instance' if it's a local SQL Server instance
  port: 1433,
  database: "PriceApprovalSystem",
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    // encrypt: false, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Use this if you're on a local development environment
  },
};

app.use(
  session({
    secret: "pratik", // Replace 'your_secret_key' with a real secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 30 * 60 * 1000, // 30 minutes
    },
  })
);

function transformData(rawData) {
  // Assuming rawData is an array of your items, similar to those in the 'price' array
  // Start by grouping data by req_id (if rawData comes varied by req_id)
  const groupedByReqId = rawData.reduce((acc, item) => {
    const {
      req_id,
      customer_id,
      consignee_id,
      plant,
      end_use_id,
      end_use_segment_id,
      payment_terms_id,
      valid_from,
      valid_to,
      fsc,
      mappint_type,
    } = item; // Extract these common properties

    // Initialize or update the group
    if (!acc[req_id]) {
      acc[req_id] = {
        req_id,
        customer_id,
        consignee_id,
        plant,
        end_use_id,
        end_use_segment_id,
        payment_terms_id,
        valid_from,
        valid_to,
        fsc,
        mappint_type,
        price: [], // Prepare to hold all 'grade' related data
      };
    }

    // Add the grade-specific information
    acc[req_id].price.push({
      grade: item.grade,
      grade_type: item.grade_type,
      gsm_range_from: item.gsm_range_from,
      gsm_range_to: item.gsm_range_to,
      agreed_price: item.agreed_price,
      special_discount: item.special_discount,
      reel_discount: item.reel_discount,
      tpc: item.tpc,
      offline_discount: item.offline_discount,
      net_nsr: item.net_nsr,
      old_net_nsr: item.old_net_nsr,
    });

    return acc;
  }, {});

  // Convert the grouped object back into an array
  return Object.values(groupedByReqId);
}

async function getCustomerNamesByIds(customerIds) {
  let pool = null;
  try {
    // Preparing a Table variable to pass the customerIds array to SQL query
    const sanitizedIds = customerIds
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));
    pool = await sql.connect(config);

    // Dynamically generate placeholders for the query
    const placeholders = sanitizedIds.map((_, index) => `@id${index}`);
    const query = `
    SELECT name
    FROM Customer
    WHERE code IN (${placeholders.join(", ")})
  `;

    const request = new sql.Request(pool);
    // Bind each customer ID to its corresponding placeholder
    sanitizedIds.forEach((id, index) => {
      request.input(`id${index}`, sql.Int, id);
    });

    const result = await request.query(query);

    // Return only the names
    return result.recordset.map((record) => record.name);
  } catch (err) {
    console.error("Database query failed:", err);
    throw err; // Rethrowing the error to be handled by the caller
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
}

async function sendMail() {
  // Create a transporter using Mailgun SMTP settings
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.mailgun.org", // Mailgun SMTP server
  //   port: 587, // SMTP port (587 is typically used for STARTTLS)
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: "pratik.khanapurkar.20@gmail.com", // Your Mailgun SMTP username
  //     pass: "A452731D6E455CEAB1DE48EF5797E6597849", // Your Mailgun SMTP password
  //   },
  // });
  // // Email options
  // let mailOptions = {
  //   from: "pratik.khanapurkar.20@gmail.com", // Sender address
  //   to: "khanapurkarpratik@gmail.com", // List of recipients
  //   subject: "Hello from Mailgun with Nodemailer", // Subject line
  //   text: "This is a test email sent from Node.js using Mailgun and Nodemailer.", // Plain text body
  //   html: "<b>This is a test email sent from Node.js using Mailgun and Nodemailer.</b>", // HTML body
  // };
  // // Send the email
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     return console.log(error);
  //   }
  //   console.log("Message sent: %s", info.messageId);
  // });
}

async function fetchAndProcessRules(requestId, employeeId) {
  let pool = null;
  try {
    // Establish a connection
    pool = await sql.connect(config);
    console.log("Connected to the database.");
    console.log("Processing rules for employee ID:", employeeId);

    const roleResults = await pool
      .request()
      .input("employeeId", sql.NVarChar, employeeId)
      .query("SELECT region FROM define_roles WHERE employee_id = @employeeId");

    if (roleResults.recordset.length === 0) {
      throw new Error("No region found for this employee.");
    }
    const { region } = roleResults.recordset[0];
    console.log("Region:", region);

    // 2 & 4. Fetch active rules for that region and check their validity
    const currentDate = new Date();
    const rulesResults = await pool.request().query(`
      SELECT * FROM defined_rules 
      WHERE region = '${region}' 
      AND active = 1 
      AND valid_from <= '${currentDate.toISOString()}' 
      AND valid_to >= '${currentDate.toISOString()}'
    `);

    if (rulesResults.recordset.length === 0) {
      throw new Error("No active or valid rules found for this region.");
    }
    console.log(rulesResults.recordset);
    // 5. Extract values of rm, nsm, hdsm, and validator for active and valid rules
    for (const rule of rulesResults.recordset) {
      console.log("Processing rule:", rule);
      const insertQuery = `
            INSERT INTO [transaction] (
                request_id, rule_id, region, am, am_status, am_status_updated_at,
                am_id, rm, nsm, hdsm, validator,timestamp,
                rm_status, rm_status_updated_at, rm_id,
                nsm_status, nsm_status_updated_at, nsm_id,
                hdsm_status, hdsm_status_updated_at, hdsm_id
            )
            OUTPUT INSERTED.request_id
            VALUES (
                ${requestId}, @ruleId, @region, 0, 0, GETDATE(), @employeeId,
                @rm, @nsm, @hdsm, @validator,GETDATE(),
                CASE WHEN @rm = 0 THEN -1 ELSE 0 END,
                CASE WHEN @rm = 0 THEN GETDATE() ELSE NULL END,
                CASE WHEN @rm = 0 THEN -1 ELSE NULL END,
                CASE 
                  WHEN @nsm > 1 THEN NULL 
                  WHEN @nsm = 1 THEN 0 
                  WHEN @nsm = 0 THEN -1  
                END,
                CASE 
                  WHEN @nsm > 1 THEN NULL 
                  WHEN @nsm = 1 THEN GETDATE() 
                  ELSE NULL 
                END,
                CASE 
                  WHEN @nsm > 1 THEN NULL 
                  WHEN @nsm = 1 THEN @employeeId 
                  ELSE NULL 
                END,
                CASE 
                  WHEN @hdsm > 1 THEN NULL 
                  WHEN @hdsm = 1 THEN 0 
                  WHEN @nsm = 0 THEN -1  
                END,
                CASE 
                  WHEN @hdsm > 1 THEN NULL 
                  WHEN @hdsm = 1 THEN GETDATE() 
                  ELSE NULL 
                END,
                CASE 
                  WHEN @hdsm > 1 THEN NULL 
                  WHEN @nsm = 1 THEN @employeeId 
                  ELSE NULL 
                END
                )`;

      const result = await pool
        .request()
        .input("ruleId", sql.NVarChar, rule.rule_name)
        .input("region", sql.NVarChar, region)
        .input("employeeId", sql.NVarChar, employeeId)
        .input("rm", sql.Int, rule.rm)
        .input("nsm", sql.Int, rule.nsm)
        .input("hdsm", sql.Int, rule.hdsm)
        .input("validator", sql.Int, rule.validator)
        .query(insertQuery);

      // Assuming there will be one record inserted at a time, so taking the first one
      if (result.recordset.length > 0) {
        return result.recordset[0].request_id; // Returns the inserted request_id
      } else {
        throw new Error("No request_id returned after insert.");
      }
    }
    console.log("Rules processed successfully.");
  } catch (err) {
    console.error("Error during database operations:", err);
    throw err; // Or handle error as needed
  } finally {
    // Close the database connection
    if (pool) {
      pool.close();
    }
  }
}

async function insertRequest(isNewRequest, reqId, parentReqId) {
  let pool = null;

  try {
    pool = await sql.connect(config);
    console.log("STATUS" + isNewRequest);
    if (isNewRequest === 3) requestType = "B";
    else if (isNewRequest === 2) requestType = "E";
    else if (isNewRequest == "N") requestType = "N";
    const parentReqIdValue = parentReqId;
    console.log(
      "Inserting request with type:",
      requestType,
      "and parent ID:",
      parentReqIdValue,
      "for request ID:",
      reqId
    );
    // Prepare the SQL query using template literals
    const query = `
          INSERT INTO request_status (status, req_id, parent_req_id)
          VALUES (@requestType, @reqId, @parentReqIdValue)
      `;

    // Execute the query with input parameters
    await pool
      .request()
      .input("requestType", sql.VarChar, requestType)
      .input("reqId", sql.Int, reqId)
      .input("parentReqIdValue", sql.Int, parentReqIdValue)
      .query(query);

    console.log("Request inserted successfully.");
  } catch (err) {
    console.error("SQL error", err);
  }
}

function filterDuplicates(details) {
  const unique = {};
  details.forEach((detail) => {
    if (!unique[detail.req_id]) {
      unique[detail.req_id] = detail;
    }
  });
  return Object.values(unique);
}

async function FetchAMDataWithStatus(employeeId, status, res) {
  let pool = null;
  console.log(employeeId, status);
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);
    console.log("Connected to the database.");

    // 1. Fetch region from 'define_role' for a given 'employee_id'
    // Replace with actual employee ID
    console.log(
      `SELECT region FROM define_roles WHERE employee_id =${employeeId}`
    );
    const regionResult = await pool
      .request()
      .input("employeeId", sql.NVarChar, employeeId)
      .query("SELECT region FROM define_roles WHERE employee_id = @employeeId");

    if (regionResult.recordset.length === 0) {
      throw new Error("No region found for this employee.");
    }

    const region = regionResult.recordset[0].region;
    console.log("Region:", region);
    console.log("Status:", status);

    // 2. Fetch all ids where 'rm' is greater than 0
    const idsResult = await pool
      .request()
      .input("region", sql.VarChar, region)
      .input("status", sql.VarChar, status) // Correctly setting the parameter
      .query(
        `WITH LatestTransactionPerRequest AS (
          SELECT 
              request_id,
              MAX(id) AS MaxId
          FROM 
              [transaction]
          GROUP BY 
              request_id
      )
      , DetailedTransactions AS (
          SELECT 
              t.*,
              lt.MaxId as LatestTransactionId
          FROM 
              [transaction] t
          INNER JOIN 
              LatestTransactionPerRequest lt ON t.id = lt.MaxId
      )
      SELECT 
          dt.request_id,
          dt.region,
          dt.rule_id,
          dt.am,
          dt.am_status,
          dt.am_status_updated_at,
          dt.am_id,
          dt.rm,
          dt.rm_status,
          dt.rm_status_updated_at,
          dt.rm_id,
          dt.nsm_status,
          dt.nsm_status_updated_at,
          dt.nsm_id,
          dt.hdsm_status,
          dt.hdsm_status_updated_at,
          dt.hdsm_id,
          dt.validator_status,
          dt.validator_status_updated_at,
          dt.validator_id,
          dt.id,
          dt.hdsm,
          dt.validator,
          dt.nsm,
          dt.timestamp
      FROM 
          DetailedTransactions dt
      WHERE 
          dt.am_status = @status and dt.region = @region ;`
      );
    console.log("IDS", idsResult);
    // Assuming you're using these IDs to fetch related price requests...
    const ids = idsResult.recordset.map((row) => row.request_id);
    const rms = idsResult.recordset.map((row) => row.rm_status);
    const nsms = idsResult.recordset.map((row) => row.nsm_status);
    const hdsm = idsResult.recordset.map((row) => row.hdsm_status);
    const validators = idsResult.recordset.map((row) => row.validator_status);
    const details = await fetchPriceApprovalDetails(
      ids,
      region,
      employeeId,
      status,
      rms,
      nsms,
      hdsm,
      validators
    );
    if (details != undefined && details.length > 0) {
      details.forEach((detail) => {
        if (Array.isArray(detail.req_id) && detail.req_id.length > 0) {
          detail.req_id = detail.req_id[0]; // Convert array to single value
        }
        // Add any additional transformations needed
      });

      const filteredDetails = filterDuplicates(details);
      console.log("Details->", filteredDetails);
      res.json(filteredDetails);
    } else res.json([]);
  } catch (err) {
    console.error("Error during database operations:", err);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function FetchRMDataWithStatus(employeeId, status, res) {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);
    console.log("Connected to the database.");

    // 1. Fetch region from 'define_role' for a given 'employee_id'
    // Replace with actual employee ID
    console.log(
      `SELECT region FROM define_roles WHERE employee_id =${employeeId}`
    );
    const regionResult = await pool
      .request()
      .input("employeeId", sql.NVarChar, employeeId)
      .query("SELECT region FROM define_roles WHERE employee_id = @employeeId");

    if (regionResult.recordset.length === 0) {
      throw new Error("No region found for this employee.");
    }

    const region = regionResult.recordset[0].region;
    console.log("Region:", region);

    // 2. Fetch all ids where 'rm' is greater than 0
    const idsResult = await pool
      .request()
      .input("region", sql.VarChar, region)
      .input("status", sql.VarChar, status) // Correctly setting the parameter
      .query(
        `WITH LatestTransactionPerRequest AS (
          SELECT 
              request_id,
              MAX(id) AS MaxId
          FROM 
              [transaction]
          GROUP BY 
              request_id
      )
      , DetailedTransactions AS (
          SELECT 
              t.*,
              lt.MaxId as LatestTransactionId
          FROM 
              [transaction] t
          INNER JOIN 
              LatestTransactionPerRequest lt ON t.id = lt.MaxId
      )
      SELECT 
          dt.request_id,
          dt.region,
          dt.rule_id,
          dt.am,
          dt.am_status,
          dt.am_status_updated_at,
          dt.am_id,
          dt.rm,
          dt.rm_status,
          dt.rm_status_updated_at,
          dt.rm_id,
          dt.nsm_status,
          dt.nsm_status_updated_at,
          dt.nsm_id,
          dt.hdsm_status,
          dt.hdsm_status_updated_at,
          dt.hdsm_id,
          dt.validator_status,
          dt.validator_status_updated_at,
          dt.validator_id,
          dt.id,
          dt.hdsm,
          dt.validator,
          dt.nsm,
          dt.timestamp
      FROM 
          DetailedTransactions dt
      WHERE 
          dt.rm_status = @status and dt.region = @region ;`
      );

    console.log(idsResult);
    // Assuming you're using these IDs to fetch related price requests...
    const ids = idsResult.recordset.map((row) => row.request_id);
    const rms = idsResult.recordset.map((row) => row.rm_status);
    const nsms = idsResult.recordset.map((row) => row.nsm_status);
    const hdsm = idsResult.recordset.map((row) => row.hdsm_status);
    const validators = idsResult.recordset.map((row) => row.validator_status);

    console.log("IDs:", ids);
    if (ids.length > 0) {
      const details = await fetchPriceApprovalDetails(
        [...new Set(ids)],
        region,
        employeeId,
        status,
        rms,
        nsms,
        hdsm,
        validators
      );

      res.json(details);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error("Error during database operations:", err);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function FetchNSMDataWithStatus(employeeId, status, res) {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);
    console.log("Connected to the database.");

    // 1. Fetch region from 'define_role' for a given 'employee_id'
    // Replace with actual employee ID
    console.log(
      `SELECT region FROM define_roles WHERE employee_id =${employeeId}`
    );
    const regionResult = await pool
      .request()
      .input("employeeId", sql.NVarChar, employeeId)
      .query("SELECT region FROM define_roles WHERE employee_id = @employeeId");

    if (regionResult.recordset.length === 0) {
      throw new Error("No region found for this employee.");
    }

    const region = regionResult.recordset[0].region;
    console.log("Region:", region);
    console.log("Status:", status);

    // 2. Fetch all ids where 'rm' is greater than 0
    const idsResult = await pool
      .request()
      .input("region", sql.VarChar, region)
      .input("status", sql.VarChar, status) // Correctly setting the parameter
      .query(
        `WITH LatestTransactionPerRequest AS (
          SELECT 
              request_id,
              MAX(id) AS MaxId
          FROM 
              [transaction]
          GROUP BY 
              request_id
      )
      , DetailedTransactions AS (
          SELECT 
              t.*,
              lt.MaxId as LatestTransactionId
          FROM 
              [transaction] t
          INNER JOIN 
              LatestTransactionPerRequest lt ON t.id = lt.MaxId
      )
      SELECT 
          dt.request_id,
          dt.region,
          dt.rule_id,
          dt.am,
          dt.am_status,
          dt.am_status_updated_at,
          dt.am_id,
          dt.rm,
          dt.rm_status,
          dt.rm_status_updated_at,
          dt.rm_id,
          dt.nsm_status,
          dt.nsm_status_updated_at,
          dt.nsm_id,
          dt.hdsm_status,
          dt.hdsm_status_updated_at,
          dt.hdsm_id,
          dt.validator_status,
          dt.validator_status_updated_at,
          dt.validator_id,
          dt.id,
          dt.hdsm,
          dt.validator,
          dt.nsm,
          dt.timestamp
      FROM 
          DetailedTransactions dt
      WHERE 
          dt.nsm_status = @status ;
      `
      );

    console.log(idsResult);
    // Assuming you're using these IDs to fetch related price requests...
    const ids = idsResult.recordset.map((row) => row.request_id);
    const rms = idsResult.recordset.map((row) => row.rm_status);
    const nsms = idsResult.recordset.map((row) => row.nsm_status);
    const hdsm = idsResult.recordset.map((row) => row.hdsm_status);
    const validators = idsResult.recordset.map((row) => row.validator_status);

    console.log("IDs:", ids);
    if (ids.length > 0) {
      const details = await fetchPriceApprovalDetails(
        [...new Set(ids)],
        region,
        employeeId,
        status,
        rms,
        nsms,
        hdsm,
        validators
      );

      res.json(details);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error("Error during database operations:", err);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function FetchHDSMDataWithStatus(employeeId, status, res) {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);
    console.log("Connected to the database.");

    // 1. Fetch region from 'define_role' for a given 'employee_id'
    // Replace with actual employee ID
    console.log(
      `SELECT region FROM define_roles WHERE employee_id =${employeeId}`
    );
    const regionResult = await pool
      .request()
      .input("employeeId", sql.NVarChar, employeeId)
      .query("SELECT region FROM define_roles WHERE employee_id = @employeeId");

    if (regionResult.recordset.length === 0) {
      throw new Error("No region found for this employee.");
    }

    const region = regionResult.recordset[0].region;
    console.log("Region:", region);

    // 2. Fetch all ids where 'rm' is greater than 0
    const idsResult = await pool
      .request()
      .input("region", sql.VarChar, region)
      .input("status", sql.VarChar, status) // Correctly setting the parameter
      .query(
        `WITH LatestTransactionPerRequest AS (
            SELECT 
                request_id,
                MAX(id) AS MaxId
            FROM 
                [transaction]
            GROUP BY 
                request_id
        )
        , DetailedTransactions AS (
            SELECT 
                t.*,
                lt.MaxId as LatestTransactionId
            FROM 
                [transaction] t
            INNER JOIN 
                LatestTransactionPerRequest lt ON t.id = lt.MaxId
        )
        SELECT 
            dt.request_id,
            dt.region,
            dt.rule_id,
            dt.am,
            dt.am_status,
            dt.am_status_updated_at,
            dt.am_id,
            dt.rm,
            dt.rm_status,
            dt.rm_status_updated_at,
            dt.rm_id,
            dt.nsm_status,
            dt.nsm_status_updated_at,
            dt.nsm_id,
            dt.hdsm_status,
            dt.hdsm_status_updated_at,
            dt.hdsm_id,
            dt.validator_status,
            dt.validator_status_updated_at,
            dt.validator_id,
            dt.id,
            dt.hdsm,
            dt.validator,
            dt.nsm,
            dt.timestamp
        FROM 
            DetailedTransactions dt
        WHERE 
            dt.hdsm_status = @status AND dt.nsm > 0
                 `
      );

    console.log(idsResult);
    // Assuming you're using these IDs to fetch related price requests...
    const ids = idsResult.recordset.map((row) => row.request_id);
    const rms = idsResult.recordset.map((row) => row.rm_status);
    const nsms = idsResult.recordset.map((row) => row.nsm_status);
    const hdsm = idsResult.recordset.map((row) => row.hdsm_status);
    const validators = idsResult.recordset.map((row) => row.validator_status);

    console.log("IDs:", ids);
    if (ids.length > 0) {
      const details = await fetchPriceApprovalDetails(
        [...new Set(ids)],
        region,
        employeeId,
        status,
        rms,
        nsms,
        hdsm,
        validators
      );

      res.json(details);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error("Error during database operations:", err);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function FetchBlockedStatus(employeeId, status, res) {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);
    console.log("Connected to the database.");

    // 1. Fetch region from 'define_role' for a given 'employee_id'
    // Replace with actual employee ID
    console.log(
      `SELECT region FROM define_roles WHERE employee_id =${employeeId}`
    );
    const regionResult = await pool
      .request()
      .input("employeeId", sql.NVarChar, employeeId)
      .query("SELECT region FROM define_roles WHERE employee_id = @employeeId");

    if (regionResult.recordset.length === 0) {
      throw new Error("No region found for this employee.");
    }

    const region = regionResult.recordset[0].region;
    console.log("Region:", region);

    // 2. Fetch all ids where 'rm' is greater than 0
    const idsResult = await pool
      .request()
      .input("region", sql.VarChar, region)
      .input("status", sql.VarChar, status) // Correctly setting the parameter
      .query(
        `WITH LatestTransactionPerRequest AS (
            SELECT 
                request_id,
                MAX(id) AS MaxId
            FROM 
                [transaction]
            GROUP BY 
                request_id
        )
        , DetailedTransactions AS (
            SELECT 
                t.*,
                lt.MaxId as LatestTransactionId
            FROM 
                [transaction] t
            INNER JOIN 
                LatestTransactionPerRequest lt ON t.id = lt.MaxId
        )
        SELECT 
            dt.request_id,
            dt.region,
            dt.rule_id,
            dt.am,
            dt.am_status,
            dt.am_status_updated_at,
            dt.am_id,
            dt.rm,
            dt.rm_status,
            dt.rm_status_updated_at,
            dt.rm_id,
            dt.nsm_status,
            dt.nsm_status_updated_at,
            dt.nsm_id,
            dt.hdsm_status,
            dt.hdsm_status_updated_at,
            dt.hdsm_id,
            dt.validator_status,
            dt.validator_status_updated_at,
            dt.validator_id,
            dt.id,
            dt.hdsm,
            dt.validator,
            dt.nsm,
            dt.timestamp
        FROM 
            DetailedTransactions dt
          INNER JOIN request_status rs ON dt.request_id = rs.req_id
        WHERE 
            rs.status = @status AND dt.region = @region 
        `
      );

    console.log(idsResult);
    // Assuming you're using these IDs to fetch related price requests...
    const ids = idsResult.recordset.map((row) => row.request_id);
    const rms = idsResult.recordset.map((row) => row.rm_status);
    const nsms = idsResult.recordset.map((row) => row.nsm_status);
    const hdsm = idsResult.recordset.map((row) => row.hdsm_status);
    const validators = idsResult.recordset.map((row) => row.validator_status);

    console.log("IDs:", ids);
    if (ids.length > 0) {
      const details = await fetchPriceApprovalDetails(
        [...new Set(ids)],
        region,
        employeeId,
        status,
        rms,
        nsms,
        hdsm,
        validators
      );

      res.json(details);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error("Error during database operations:", err);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function AssignStatus(region, roleIndex, action) {
  let pool = null;
  try {
    // Open connection to the database
    pool = await sql.connect(config);

    // Fetch rule values from the rule table using region
    const result = await pool.request()
      .query`SELECT * FROM defined_rules WHERE region = ${region}`;
    const rules = result.recordset[0]; // assuming only one record matches
    console.log("Rules:", rules);
    // Check if today's date is between validFrom and validTo
    const today = new Date().setHours(0, 0, 0, 0);
    const validFrom = new Date(rules.valid_from);
    const validTo = new Date(rules.valid_to);
    console.log("Today:", today);
    console.log("Valid From:", validFrom.setHours(0, 0, 0, 0));
    console.log("Valid To:", validTo.setHours(0, 0, 0, 0));
    if (today >= validFrom && today <= validTo) {
      // Initialise statuses and roles from the database values
      console.log("Rules", rules);
      const statuses = [
        0,
        rules.rm_status,
        rules.nsm_status,
        rules.hdsm_status,
        rules.validator_status,
      ];
      const roles = [0, rules.rm, rules.nsm, rules.hdsm, rules.validator];

      // Adjust the roles as per your logic
      for (let i = 1; i < roles.length; i++) {
        if (roles[i] === 0) roles[i] = -1;
      }

      console.log("Status", statuses);
      console.log("Action", action);
      console.log("Row Index", roleIndex);
      // Process action based on the provided action and roleIndex
      if ((action == "1" || action == "5") && roles[roleIndex] > -1) {
        statuses[roleIndex] = parseInt(action);
        // Find the next positive role and set its status to 0

        for (let i = roleIndex + 1; i < roles.length; i++) {
          if (!roles.some((element) => element > roles[roleIndex])) {
            for (let j = i; j < region.length; j++) {
              if (roles[j] > -1) {
                statuses[j] = 1;
              }
            }
            break;
          }
          if (roles[i] > -1) {
            statuses[i] = 0;
          }
          if (roles[i] != roles[i + 1]) {
            break;
          }
        }
      } else if ((action == "2" || action == "3") && roles[roleIndex] > -1) {
        // Find the previous positive role and set its status to 2
        console.log(roleIndex);
        for (let i = roleIndex; i >= 0; i--) {
          if (roles[i] > -1) {
            statuses[i] = action;
          }
        }
        for (let i = roleIndex; i < roles.length; i++) {
          if (roles[i] == roles[i + 1] && roles[i] != undefined) {
            statuses[i + 1] = action;
            console.log(statuses);
            i++;
          } else if (roles[i] > -1) {
            statuses[i] = undefined;
          }
        }
      }

      // Return or update the data as needed
      console.log("Roles:", roles);
      console.log("Statuses:", statuses);
      return statuses;
    } else {
      console.log("Date is not within the valid range.");
    }
  } catch (err) {
    console.error("SQL error", err);
  }
}

async function fetchPriceApprovalDetails(
  reqIds,
  region,
  employeeId,
  status,
  rms,
  nsms,
  hdsms,
  validators
) {
  let pool = null;
  let consolidatedResults = [];

  try {
    pool = await sql.connect(config);
    console.log("Connected to the database.");

    if (reqIds.length > 0) {
      console.log(
        "Fetching details for request IDs:",
        reqIds,
        employeeId,
        region,
        status
      );
      console.log("Request IDs:", reqIds);
      for (let id = 0; id < reqIds.length; id++) {
        const result = await pool.request().input("reqId", sql.Int, reqIds[0])
          .query(`
        SELECT 
        TOP 1 
        rs.id,
    pra.*,
    rs.status AS CurrentStatus,
    (SELECT STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY c.name) 
        FROM customer c
        JOIN STRING_SPLIT(pra.customer_id, ',') AS splitCustomerIds ON c.code = TRY_CAST(splitCustomerIds.value AS INT)
    ) AS CustomerNames,
    (SELECT STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY c.name) 
        FROM customer c
        JOIN STRING_SPLIT(pra.consignee_id, ',') AS splitConsigneeIds ON c.code = TRY_CAST(splitConsigneeIds.value AS INT)
    ) AS ConsigneeNames,
    (SELECT STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY c.name) 
        FROM customer c
        JOIN STRING_SPLIT(pra.end_use_id, ',') AS splitEndUseIds ON c.code = TRY_CAST(splitEndUseIds.value AS INT)
    ) AS EndUseNames FROM price_approval_requests pra
    
    LEFT JOIN request_status rs ON pra.req_id = rs.parent_req_id  
WHERE 
    pra.req_id = @reqId
    ORDER BY rs.id DESC  
 `);

        if (result.recordset.length > 0) {
          let overallStatus = 1;
          console.log(
            "ResultStatus",
            rms[id],
            nsms[id],
            hdsms[id],
            validators[id]
          );
          if (rms[id] != null) {
            overallStatus = overallStatus && rms[id];
          }
          if (nsms[id] != null) {
            overallStatus = overallStatus && nsms[id];
          }
          if (hdsms[id] != null) {
            overallStatus = overallStatus && hdsms[id];
          }
          if (validators[id] != null) {
            overallStatus = overallStatus && validators[id];
          }
          result.recordset[0].overallStatus = overallStatus;
          console.log("Result", result.recordset[0]);
          consolidatedResults.push(result.recordset[0]); // Assuming you expect one record per reqId, adjust if necessary
        }
      }

      return consolidatedResults;
    }
  } catch (err) {
    console.error("Error during database operations:", err);
    throw err;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function fetchPriceApprovalStatus(reqId) {
  let pool = null;
  try {
    // Connect to database
    pool = await sql.connect(config);
    // Query database for user role

    const result = await pool.request().input("reqId", sql.NVarChar, reqId)
      .query`SELECT TOP 1 CASE 
        WHEN RM_status = 0 THEN 'Pending with RM'
        WHEN RM_status = 1 THEN 
            CASE 
                WHEN NSM_status = 0 THEN 'Pending with NSM'
                WHEN NSM_status = 1 THEN 
                    CASE 
                        WHEN HDSM_status = 0 THEN 'Pending with HDSM'
                        WHEN HDSM_status = 1 THEN 
                            CASE 
                                WHEN Validator_status = 0 THEN 'Pending with Validator'
                                WHEN Validator_status = 1 THEN 'Approved by Validator'
                                WHEN Validator_status = 2 THEN 'Validator is reworking'
                                WHEN Validator_status = 3 THEN 'Validator is rejected'
                            END
                        WHEN HDSM_status = 2 THEN 'HDSM is reworking'
                        WHEN HDSM_status = 3 THEN 'HDSM is rejected'
                    END
                WHEN NSM_status = 2 THEN 'NSM is reworking'
                WHEN NSM_status = 3 THEN 'NSM is rejected'
            END
        WHEN RM_status = 2 THEN 'RM is reworking'
        WHEN RM_status = 3 THEN 'RM is rejected'
        ELSE 'Status unclear or not started'
    END AS Current_Status
FROM
    [transaction] where request_id = @reqid
	ORDER BY timestamp desc`;
    const resultStatus = result.recordset[0].current_status;
    return resultStatus;
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ message: "Internal Server Error" });
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
}

app.post("/api/login", async (req, res) => {
  const employee_id = req.body.employee_id;

  let pool = null;
  try {
    // Connect to database
    pool = await sql.connect(config);
    // Query database for user role

    console.log(
      `SELECT role FROM define_roles WHERE employee_id = ${employee_id}`
    );
    const result = await pool.request()
      .query`SELECT role FROM define_roles WHERE employee_id = ${employee_id}`;

    if (result.recordset.length > 0 && req.session) {
      // Set session
      console.log("Employee ID:", employee_id);
      console.log(result);
      req.session.employee_id = employee_id;
      req.session.role = result.recordset[0].role;

      res.json({ loggedIn: true, role: result.recordset[0].role });
    } else {
      res.status(401).json({ loggedIn: false, message: "Invalid employee ID" });
    }
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ message: "Internal Server Error" });
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

// Check Session API
app.get("/api/session", (req, res) => {
  if (req.session.employee_id && req.session.role) {
    res.json({
      loggedIn: true,
      role: req.session.role,
      employee_id: req.session.employee_id,
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout API
app.get("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.json({ loggedOut: true });
  });
});

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
      result = await pool.request().query`EXEC GetAllCustomersEndUse`;
    } else if (type == 2) {
      result = await pool.request().query`EXEC GetAllCustomersConsignee`;
    } else {
      result = await pool.request().query`EXEC GetAllCustomers`;
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
    const result = await pool.request().query`EXEC GetPaymentTerms`;

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
    const result = await pool.request().query`EXEC GetPlants`;

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
      .query`EXEC GetMaterialsByFSC @fsc=${fsc}`;

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

// API endpoint that fetches employee data
app.get("/api/fetch_employees", async (req, res) => {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query to select employee_name and employee_id
    const result = await pool.request()
      .query`Select employee_name as name, employee_id as id from user_master`;

    // Send query results as a response
    res.json(result.recordset);
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).send("Error fetching employee data");
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

// API endpoint that fetches roles
app.get("/api/fetch_roles", async (req, res) => {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query to select employee_name and employee_id
    const result = await pool.request().query`EXEC FetchRoles`;

    // Send query results as a response
    res.json(result.recordset);
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).send("Error fetching employee data");
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

// API endpoint that fetches region
app.get("/api/fetch_region", async (req, res) => {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query to select employee_name and employee_id
    const result = await pool.request().query`EXEC FetchRegion`;

    // Send query results as a response
    res.json(result.recordset);
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).send("Error fetching employee data");
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

// API endpoint that fetch emplotyee role
app.post("/api/add_employee_role", async (req, res) => {
  let { employee_id, employee_name, role, region, created_date, active } =
    req.body; // Hardcoded as per requirement
  const created_by = "backend_user"; // This can also be fetched dynamically if needed
  let pool = null; // Initialize the pool variable
  console.log(employee_id);
  try {
    pool = await sql.connect(config);
    created_date = created_date ? new Date(created_date) : new Date();
    await pool.request()
      .query`EXEC InsertEmployeeRole @employee_id=${employee_id}, @employee_name=${employee_name}, @role=${role}, @region=${region}, @created_by=${created_by}, @created_date=${created_date}, @active=${active}`;
    res.status(200).send("Role and employee details added successfully.");
  } catch (err) {
    console.error("Database operation failed:", err);
    res.status(500).send("Failed to add role and employee details.");
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

// API endpoint that fetch data from roles table
app.get("/api/fetch_roles_data", async (req, res) => {
  let pool = null;
  try {
    // Connect to the database
    pool = await sql.connect(config);

    // Query to fetch all values from the 'define' table
    const result = await pool.request().query`EXEC FetchDefinedRoles`;

    // Send the query results as a response
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Failed to fetch data.");
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

// API endpint that fetches data from roles table by id
app.get("/api/fetch_roles_data_by_id", async (req, res) => {
  let pool = null;
  try {
    // Connect to the database
    pool = await sql.connect(config);
    const id = req.query.id;
    // Query to fetch all values from the 'define' table
    const result = await pool.request()
      .query`EXEC FetchDefinedRoleById @id=${id}`;

    // Send the query results as a response
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Failed to fetch data.");
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

// API endpoiubt that fetches price request data
app.get("/api/fetch_price_requests", async (req, res) => {
  let pool = null;
  const status = req.query.status;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query the database
    const result = await pool.request()
      .query`EXEC FetchPriceRequest @status=${status}`;
    // Send the results as a response

    const transformedData = result.recordset.map((item) => ({
      ...item, // Spread the rest of the properties of the object
      req_id: item.req_id[0], // Assuming all values in req_id array are the same, take the first one
    }));
    console.log("TransformedData", transformedData);
    res.json(transformedData);
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

// API endpoint that fetches appovers by role and region
app.get("/api/fetch_approvers", async (req, res) => {
  const { role, region } = req.query;
  let pool = null;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query`EXEC SearchDefineRoles @role=${
      role || ""
    }, @region=${region || ""}`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching customers");
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

// API endpoint that fetches profit centers
app.get("/api/fetch_profit_centers", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const query = `EXEC FetchProfitCenters`;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching customers");
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

// API endpoint that fetches all roles
app.get("/api/get_approver", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const query = `EXEC FetchAllDefinedRoles`;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching customers");
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

// API endpoint that fetches all rules
app.get("/api/fetch_rules", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query`EXEC FetchRules`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching customers");
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

// API endpoint that fetches rules by id
app.get("/api/fetch_rules_by_id", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const id = req.query.id;

    const result = await pool.request().query`EXEC FetchRuleById @id=${id}`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching customers");
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

// API endpoint that fetches all report status
app.get("/api/fetch_report_status", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const query = `EXEC FetchReportStatus`;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching customers");
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

//API endpoint that fetches report status by id
app.get("/api/fetch_report_status_by_id", async (req, res) => {
  let pool = null;
  try {
    const id = req.query.id;
    pool = await sql.connect(config);
    const result = await pool.request()
      .query`EXEC FetchReportStatusById @id=${id}`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching customers");
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

// API endpoint that fetches price approval requests by id
app.get("/api/price_requests", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const req_id = req.query.id;
    console.log(req_id);
    const result = await sql.query(
      `EXEC FetchPriceRequestById @reqId=${req_id}`
    );

    const formattedResult = result.recordset.reduce((acc, row) => {
      if (!acc[row.req_id]) {
        acc[row.req_id] = {
          req_id: row.req_id,
          customer_id: row.CustomerNames,
          consignee_id: row.ConsigneeNames,
          plant: row.plant,
          end_use_id: row.EndUseNames,
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
    console.log(formattedResult);
    const transformedData = Object.values(formattedResult).map((item) => ({
      ...item, // Spread the rest of the properties of the object
      req_id: item.req_id[0], // Assuming all values in req_id array are the same, take the first one
    }));
    res.json(transformedData);
    //res.json(Object.values(formattedResult));
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

// API endpoint that updates price approval requests
app.post("/api/update-report-status", async (req, res) => {
  const { reportId, statusUpdatedById, newStatus } = req.body;
  let pool = null;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .query`EXEC UpdateReportStatus @reportId=${reportId}, @newStatus=${newStatus}, @statusUpdatedById=${statusUpdatedById}`;
    console.log(result);
    res.status(200).json({ message: "Report status updated successfully" });
  } catch (err) {
    console.error("Database operation failed:", err);
    res.status(500).send("Failed to update report status");
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

// Endpoint to update a rule
app.put("/api/update-rule/:id", async (req, res) => {
  let pool = null;

  try {
    pool = await sql.connect(config);

    const { id } = req.params;
    const {
      name,
      region,
      profit_center,
      valid_from,
      valid_to,
      approvers,
      status,
    } = req.body;
    console.log(req.body);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("region", sql.NVarChar, region)
      .input("profit_center", sql.NVarChar, JSON.stringify(profit_center)) // assuming JSON storage for array
      .input("valid_from", sql.Date, valid_from)
      .input("valid_to", sql.Date, valid_to)
      .input("approvers", sql.NVarChar, JSON.stringify(approvers)) // assuming JSON storage for array
      .input("status", sql.Int, status)
      .execute("UpdateRule"); // Stored Procedure Name

    console.log(result);
    res.json({ message: "Rule updated successfully." });
  } catch (err) {
    console.error("Database operation failed:", err);
    res.status(500).send("Failed to update report status");
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

app.post("/api/update-employee-role", async (req, res) => {
  const { employee_id, employee_name, role, region } = req.body;
  let pool = null;

  try {
    pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("employeeId", sql.Int, employee_id)
      .input("newName", sql.NVarChar(255), employee_name)
      .input("newRole", sql.NVarChar(255), role)
      .input("newRegion", sql.NVarChar(255), region)
      .execute("UpdateEmployeeRole");

    res.json({ message: "Employee role updated successfully", result });
  } catch (err) {
    console.error("Error executing stored procedure:", err);
    res.status(500).send("Failed to update employee role");
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

//NEW
//api to add to defined rules
app.post("/api/add_defined_rule", async (req, res) => {
  let pool = null;
  try {
    await sql.connect(config);
    const {
      rule_name,
      profit_center,
      region,
      valid_from,
      valid_to,
      active,
      rm,
      nsm,
      hdsm,
      validator,
      created_at,
    } = req.body;

    // Assuming profit_center is an array, convert it to a string to store in the database.
    // If your database design is different, you might need a different approach.
    const profitCenterString = profit_center.join(","); // Convert array to string if needed
    pool = await sql.connect(config);
    const result = await pool.request().query`
          INSERT INTO defined_rules (rule_name, profit_center, region, valid_from, valid_to, active, rm, nsm, hdsm, validator, created_at)
          VALUES (${rule_name}, ${profitCenterString}, ${region}, ${valid_from}, ${valid_to}, ${active}, ${rm}, ${nsm}, ${hdsm}, ${validator}, ${created_at})
      `;

    res.json({ message: "Insert successful", result });
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ message: "Error inserting data", err });
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

app.get("/api/fetch_defined_rule", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query`SELECT * FROM defined_rules`;

    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ message: "Error inserting data", err });
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

app.get("/api/fetch_grade_with_pc", async (req, res) => {
  let pool = null;
  const fsc = req.query.fsc;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .query`SELECT id as code,grade as name,FSC_Y_N,Grade_Description,Profit_Centre as profitCenter FROM profit_center where status = 1 and FSC_Y_N = ${fsc}`;

    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ message: "Error fetching data", err });
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

app.post("/api/add_price_request", async (req, res) => {
  let pool = null;
  console.log("Request Body", req.body);
  try {
    pool = await sql.connect(config);
    let {
      customerIds,
      consigneeIds,
      plants,
      endUseIds,
      endUseSegmentIds,
      paymentTermsId,
      validFrom,
      validTo,
      fsc,
      mappint_type,
      statusUpdatedById,
    } = req.body;
    mappint_type != undefined ? (mappint_type = 2) : (mappint_type = 1);
    console.log(req.body);
    const mainResult = await pool
      .request()
      .input("customerIds", sql.VarChar, req.body.customerIds)
      .input("consigneeIds", sql.VarChar, req.body.consigneeIds)
      .input("plants", sql.VarChar, req.body.plants)
      .input("endUseIds", sql.VarChar, req.body.endUseIds)
      .input("endUseSegmentIds", sql.VarChar, req.body.endUseSegmentIds)
      .input("paymentTermsId", sql.VarChar, req.body.paymentTermsId)
      .input("validFrom", sql.DateTime, new Date(req.body.validFrom))
      .input("validTo", sql.DateTime, new Date(req.body.validTo))
      .input("fsc", sql.Int, req.body.fsc)
      .input("mappint_type", sql.Int, req.body.mappingType)
      .input("am_id", sql.VarChar, req.body.am_id)
      .query(`INSERT INTO price_approval_requests (customer_id, consignee_id, plant, end_use_id, end_use_segment_id, payment_terms_id, valid_from, valid_to, fsc, mappint_type,am_id) 
              VALUES (@customerIds, @consigneeIds, @plants, @endUseIds, @endUseSegmentIds, @paymentTermsId, @validFrom, @validTo, @fsc, @mappint_type,@am_id);
              SELECT SCOPE_IDENTITY() AS id;`);

    const requestId = mainResult.recordset[0].id;
    console.log(requestId);
    console.log("Here 1");
    pool = await sql.connect(config);
    for (const item of req.body.priceTable) {
      // console.log(item);

      const reqId = requestId;
      const grade = item.grade;
      const gradeType = item.gradeType;
      const gsmFrom = item.gsmFrom;
      const gsmTo = item.gsmTo;
      const agreedPrice = item.agreedPrice;
      const specialDiscount = item.specialDiscount;
      const reelDiscount = item.reelDiscount;
      const packUpcharge = item.packUpCharge;
      const tpc = item.tpc;
      const offlineDiscount = item.offlineDiscount;
      const netNSR = item.netNSR;
      const oldNetNSR = item.oldNetNSR;
      const result = await pool.request().query`
                EXEC InsertPriceApprovalRequestPriceTable 
                    @reqId=${reqId}, 
                    @grade=${grade}, 
                    @gradeType=${gradeType}, 
                    @gsmFrom=${gsmFrom}, 
                    @gsmTo=${gsmTo}, 
                    @agreedPrice=${agreedPrice}, 
                    @specialDiscount=${specialDiscount}, 
                    @reelDiscount=${reelDiscount}, 
                    @packUpcharge=${packUpcharge}, 
                    @tpc=${tpc}, 
                    @offlineDiscount=${offlineDiscount}, 
                    @netNSR=${netNSR}, 
                    @oldNetNSR=${oldNetNSR}`;
      console.log(result);
    }
    console.log("Here 2");
    const status = await pool
      .request()
      .input("customerIds", sql.VarChar, req.body.customerIds)
      .input("consigneeIds", sql.VarChar, req.body.consigneeIds)
      .input("plants", sql.VarChar, req.body.plants)
      .input("endUseIds", sql.VarChar, req.body.endUseIds)
      .input("endUseSegmentIds", sql.VarChar, req.body.endUseSegmentIds)
      .input("paymentTermsId", sql.VarChar, req.body.paymentTermsId)
      .input("validFrom", sql.DateTime, new Date(req.body.validFrom))
      .input("validTo", sql.DateTime, new Date(req.body.validTo))
      .input("fsc", sql.Int, req.body.fsc)
      .input("mappint_type", sql.Int, req.body.mappingType)
      .input("am_id", sql.VarChar, req.body.am_id)
      .query(`INSERT INTO price_approval_requests (customer_id, consignee_id, plant, end_use_id, end_use_segment_id, payment_terms_id, valid_from, valid_to, fsc, mappint_type,am_id) 
            VALUES (@customerIds, @consigneeIds, @plants, @endUseIds, @endUseSegmentIds, @paymentTermsId, @validFrom, @validTo, @fsc, @mappint_type,@am_id);
            SELECT SCOPE_IDENTITY() AS id;`);
    console.log("REQUEST_ID", req.body.parentReqId);
    insertRequest(
      req.body.mode == undefined ? "N" : req.body.mode,
      requestId,
      req.body.parentReqId != undefined ? req.body.parentReqId : requestId
    );
    fetchAndProcessRules(requestId, req.body.am_id)
      .then(() => console.log("Finished processing."))
      .catch((err) => console.error(err));

    res.status(200).send("Data added successfully");
  } catch (err) {
    console.error("Database operation failed:", err);
    res.status(500).send("Failed to add data");
  }
});

app.get("/api/fetch_sales_regions", async (req, res) => {
  let pool = null;
  const fsc = req.query.fsc;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .query`SELECT [id] as id,[desc] as name from sales_office`;

    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ message: "Error fetching data", err });
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

app.get("/api/fetch_request_am_with_status", async (req, res) => {
  console.log("CALLEDD...");
  FetchAMDataWithStatus(req.query.employeeId, req.query.status, res);
});

app.get("/api/fetch_request_rm_with_status", async (req, res) => {
  FetchRMDataWithStatus(req.query.employeeId, req.query.status, res);
});

app.get("/api/fetch_blocked_requests", async (req, res) => {
  FetchBlockedStatus(req.query.employeeId, "B", res);
});

app.get("/api/fetch_request_manager_with_status", async (req, res) => {
  const role = req.query.role;
  if (role === "NSM") {
    FetchNSMDataWithStatus(req.query.employeeId, req.query.status, res);
  } else if (role === "HDSM") {
    FetchHDSMDataWithStatus(req.query.employeeId, req.query.status, res);
  }
});

app.post("/api/update_request_status_manager", async (req, res) => {
  let { id, action, employee_id, request_id } = req.body;
  const role = req.body.role;
  action = action == 0 ? "1" : action;
  console.log(req.body);
  let pool = null;
  try {
    pool = await sql.connect(config);
    console.log("Connected to the database.");

    // Fetch the latest row for the given requestId
    const fetchQuery = `
          SELECT TOP 1 *
          FROM [transaction]
          WHERE request_id = @requestId
          ORDER BY id DESC`;

    const latestRowResult = await pool
      .request()
      .input("requestId", sql.Int, request_id)
      .query(fetchQuery);

    if (latestRowResult.recordset.length === 0) {
      throw new Error("No existing rows found for this request ID.");
    }

    const latestRow = latestRowResult.recordset[0];
    console.log("Latest row for the request ID:", latestRow);

    // Replace column_names and column_values with actual fields from latestRow and the values you want to insert.
    const insertQuery = `
    INSERT INTO [transaction] (
        request_id, rule_id, region, am, am_status, am_status_updated_at, am_id,
        rm, rm_status, rm_status_updated_at, rm_id,
        nsm, nsm_status, nsm_status_updated_at, nsm_id,
        hdsm, hdsm_status, hdsm_status_updated_at, hdsm_id,
        validator, validator_status, validator_status_updated_at, validator_id,
        timestamp
    )
    VALUES (
        @requestId, @ruleId, @region, @am, @amStatus, @amStatusUpdatedAt, @amId,
        @rm, @rmStatus, @rmStatusUpdatedAt, @rmId,
        @nsm, @nsmStatus, @nsmStatusUpdatedAt, @nsmId,
        @hdsm, @hdsmStatus, @hdsmStatusUpdatedAt, @hdsmId,
        @validator, @validatorStatus, @validatorStatusUpdatedAt, @validatorId,
        @timestamp
    );
    SELECT SCOPE_IDENTITY() AS newId;`;
    console.log(latestRow);
    // if (role == "NSM") {
    //   console.log("In NSM");
    //   nsm_id = employee_id;
    //   nsmStatus = action;
    //   if (action > 1) {
    //     rm_status = action;
    //   }
    // } else if (role == "HDSM") {
    //   console.log("In HDSM");
    //   hdsm_id = employee_id;
    //   hdsmStatus = action;
    //   if (action > 1) {
    //     nsmStatus = action;
    //   }
    //   console.log(hdsm_id);
    // }

    const roles = ["AM", "RM", "NSM", "HDSM", "Validator"];
    const rmIndex = roles.indexOf(role);
    const statusV = await AssignStatus(latestRow.region, rmIndex, action);
    console.log(typeof statusV);
    console.log("STATUSV", statusV);
    let [
      newAmStatus,
      newRmStatus,
      newNsmStatus,
      newHdsmStatus,
      newValidatorStatus,
    ] = statusV;
    amStatus = rmIndex == 0 ? action : newAmStatus ?? latestRow.am_status;
    rmStatus = rmIndex == 1 ? action : newRmStatus ?? latestRow.rm_status;
    nsmStatus = rmIndex == 2 ? action : newNsmStatus ?? latestRow.nsm_status;
    hdsmStatus = rmIndex == 3 ? action : newHdsmStatus ?? latestRow.hdsm_status;
    validatorStatus =
      rmIndex == 4 ? action : newValidatorStatus ?? latestRow.validator_status;
    console.log("HDSM Status", hdsmStatus);
    console.log(latestRow.hdsm_status_updated_at);
    console.log("Latest", latestRow);

    nsmId = latestRow.nsm_id;
    hdsmId = latestRow.hdsm_id;
    validatorId = latestRow.validator_id;
    if (rmIndex == 1) {
      nsmId = employee_id;
    }
    if (rmIndex == 2) {
      hdsmId = employee_id;
    }
    if (rmIndex == 3) {
      validatorId = employee_id;
    }

    const newRecordResult = await pool
      .request()
      .input("requestId", sql.VarChar, latestRow.request_id)
      .input("ruleId", sql.VarChar, latestRow.rule_id)
      .input("region", sql.VarChar, latestRow.region)
      // Continue for each input parameter, ensuring they match those in your table
      .input("am", sql.VarChar, latestRow.am) // Assuming 'am' is varchar; change data types accordingly
      .input(
        "amStatus",
        sql.Int,
        amStatus != undefined ? amStatus : latestRow.am_status
      )
      .input("amStatusUpdatedAt", sql.VarChar, latestRow.am_status_updated_at)
      .input("amId", sql.VarChar, latestRow.am_id)
      // Continue with all the parameters as per your database fields and data types
      // RM-related fields (change types as needed)
      .input("rm", sql.VarChar, latestRow.rm)
      .input(
        "rmStatus",
        sql.Int,
        rmStatus == undefined ? null : rmStatus.toString() // Assuming status is an integer
      ) // Example based on your action logic
      .input(
        "rmStatusUpdatedAt",
        sql.VarChar,
        rmIndex == 1 ? new Date().toISOString() : latestRow.rm_status_updated_at
      ) // Setting to current time
      .input("rmId", sql.VarChar, rmIndex == 1 ? employee_id : latestRow.rm_id) // Assuming action requires setting this to the employeeId
      // Continue setting inputs for nsm, hdsm, and validator similarly
      .input("nsm", sql.VarChar, latestRow.nsm)
      .input(
        "nsmStatus",
        sql.VarChar,
        nsmStatus == undefined ? null : nsmStatus.toString()
      )
      .input(
        "nsmStatusUpdatedAt",
        sql.VarChar,
        rmIndex == 2
          ? new Date().toISOString()
          : latestRow.nsm_status_updated_at
      )
      .input(
        "nsmId",
        sql.VarChar,
        rmIndex == 2 ? employee_id : latestRow.nsm_id
      )
      .input("hdsm", sql.VarChar, latestRow.hdsm)
      .input(
        "hdsmStatus",
        sql.VarChar,
        hdsmStatus == undefined ? null : hdsmStatus.toString()
      )
      .input(
        "hdsmStatusUpdatedAt",
        sql.VarChar,
        rmIndex == 3
          ? new Date().toISOString()
          : latestRow.hdsm_status_updated_at != null
          ? latestRow.hdsm_status_updated_at
          : ""
      )
      .input(
        "hdsmId",
        sql.VarChar,
        rmIndex == 3 ? employee_id : latestRow.hdsm_id
      )
      .input("validator", sql.VarChar, latestRow.validator)
      .input(
        "validatorStatus",
        sql.VarChar,
        validatorStatus != null
          ? validatorStatus == undefined
            ? null
            : validatorStatus.toString()
          : ""
      )
      .input(
        "validatorStatusUpdatedAt",
        sql.VarChar,
        rmIndex == 4
          ? new Date().toISOString()
          : latestRow.validator_status_updated_at != null
          ? latestRow.validator_status_updated_at
          : ""
      )
      .input(
        "validatorId",
        sql.VarChar,
        rmIndex == 4 ? employee_id : latestRow.validator_id
      )
      .input("timestamp", sql.DateTime, new Date())
      .query(insertQuery);

    // Assuming the new row is inserted successfully
    const newRequestId = newRecordResult.recordset[0].newId;
    console.log(
      "New row added based on the latest existing row for the request ID:",
      newRequestId
    );

    res.json({
      newRequestId,
      message: "Request updated and duplicated successfully",
    });
  } catch (err) {
    console.error("Error during database operations:", err);
    throw err;
  } finally {
    if (pool) await pool.close();
  }
});

app.get("/api/fetch_price_request_by_id", async (req, res) => {
  let pool = null;
  try {
    // Ensure a connection is established
    pool = await sql.connect(config);
    const id = req.query.id;
    console.log(id);
    // Perform the query
    const result = await pool.request().query`
      SELECT 
          par.*, 
          part.*
      FROM 
          price_approval_requests AS par
      LEFT JOIN 
          price_approval_requests_price_table AS part
      ON 
          par.req_id = part.req_id
      WHERE par.req_id = ${id}; 
  `;

    // Log or return the results
    const transformedData = transformData(result.recordset);
    console.log(transformedData);
    console.log(JSON.stringify(transformedData, null, 2));
    res.json(JSON.stringify(transformedData, null, 2));
  } catch (err) {
    // Log and throw any error that occurs
    console.error("SQL error", err.message);
    throw err;
  } finally {
    if (pool) await pool.close();
  }
});

async function getAllUpdatersWithLatestUpdateAndRoleHandlingInvalidDate(
  requestId
) {
  try {
    await sql.connect(config);

    const query = `
        SELECT id, am_id, am_status_updated_at, am_status,
               rm_id, rm_status_updated_at, rm_status,
               nsm_id, nsm_status_updated_at, nsm_status,
               hdsm_id, hdsm_status_updated_at, hdsm_status,
               validator_id, validator_status_updated_at, validator_status
        FROM [transaction]
        WHERE request_id = ${requestId}
    `;

    const result = await sql.query(query);
    if (result.recordset.length === 0) {
      console.log("No updates found.");
      return "No updates found.";
    }

    const messagesPromises = result.recordset.map(async (row) => {
      const id = row.id;
      const userResults = await Promise.all([
        getUserInfo(row.am_id),
        getUserInfo(row.rm_id),
        getUserInfo(row.nsm_id),
        getUserInfo(row.hdsm_id),
        getUserInfo(row.validator_id),
      ]);

      const updatesSet = new Set();
      console.log(row);
      for (let i = 0; i < userResults.length; i++) {
        const userInfo = userResults[i];
        console.log(userInfo);
        if (userInfo != null) {
          const statusField = `${userInfo.role}_status`;
          const timestampField = `${userInfo.role}_status_updated_at`;

          if (row[userInfo.idField] !== "-1" && row[timestampField]) {
            const formattedTimestamp = row[timestampField];
            const status = getStatus(row[statusField.toLowerCase()]);
            const update = `${id}: ${userInfo.role.toUpperCase()} update (${status}). Updated by ${
              userInfo.name
            } at ${formattedTimestamp}`;
            updatesSet.add(update); // Add the update to the Set
          }
        }
      }

      return Array.from(updatesSet); // Return unique updates as an array
    });

    const messagesArrays = await Promise.all(messagesPromises); // Array of arrays
    const messages = messagesArrays.flat(); // Flatten the array of arrays

    if (messages.length > 0) {
      console.log(messages);
      return messages;
    } else {
      console.log("No valid updates found.");
      return "No valid updates found.";
    }
  } catch (err) {
    console.error("An error occurred:", err);
    return "Error fetching updaters with latest updates and roles.";
  } finally {
    await sql.close();
  }
}

async function getUserInfo(id) {
  const userResult =
    await sql.query`SELECT um.employee_name as employee_name, dr.role as role FROM user_master um LEFT JOIN define_roles dr ON um.employee_id = dr.employee_id WHERE dr.employee_id  = ${id}`;
  if (userResult.recordset.length > 0) {
    const userInfo = userResult.recordset[0];

    return {
      name: userInfo.employee_name,
      role: userInfo.role.toLowerCase(),
      idField: `${userInfo.role.toLowerCase()}_id`,
    };
  } else {
    return null;
  }
}

function getStatus(status) {
  console.log(status);
  switch (status) {
    case "1":
      return "Approved";
    case "2":
      return "Rejected";
    case "3":
      return "Rework";
    case "0":
      return "Pending";
    default:
      return "Unknown";
  }
}

app.get("/api/get_history_of_price_request", async (req, res) => {
  const messages =
    await getAllUpdatersWithLatestUpdateAndRoleHandlingInvalidDate(
      req.query.id
    );

  const messagesById = {};
  for (const message of messages) {
    const id = message.split(": ")[0];
    const content = message.split(": ")[1];
    if (!messagesById[id]) {
      messagesById[id] = [content];
    } else {
      messagesById[id].push(content);
    }
  }

  const uniqueMessages = Object.values(messagesById);

  const result = uniqueMessages.map(
    (idMessages) => idMessages[idMessages.length - 1]
  );
  console.log(result);
  res.json(result);
});

//sendMail();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
