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
const PORT = process.env.PORT || 3000;
const { format } = require("date-fns");
app.use(cors(corsOptions));
app.use(express.json());
// Configuration object for your SQL Server
const config = {
  user: "sa",
  password: "12345",
  server: "PRATIK-PC\\PSPD", // You can use 'localhost\\instance' if it's a local SQL Server instance
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
    res.json({ loggedIn: true, role: req.session.role });
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
    const result = await pool.request().query`EXEC FetchEmployees`;

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
    req.body;
  const user_id = 1; // Hardcoded as per requirement
  const created_by = "backend_user"; // This can also be fetched dynamically if needed
  let pool = null; // Initialize the pool variable
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

// API endpoint that adds price approval requests
app.post("/api/add_price_request", async (req, res) => {
  let pool = null;

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
    const result = await pool.request().query`
            EXEC InsertPriceApprovalRequest 
                @customerIds=${customerIds}, 
                @consigneeIds=${consigneeIds}, 
                @plants=${plants}, 
                @endUseIds=${endUseIds}, 
                @endUseSegmentIds=${endUseSegmentIds}, 
                @paymentTermsId=${paymentTermsId}, 
                @validFrom=${validFrom}, 
                @validTo=${validTo}, 
                @fsc=${fsc}, 
                @mappint_type=${mappint_type}`;

    const requestId = result.recordset[0].id;
    // console.log(requestId);

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
      const result = await sql.query`
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
    }

    // Additional insert operations here, following the same pattern
    let status = "1";
    if (req.body.isDraft) status = "0";

    const final_result =
      await sql.query`EXEC InsertReportStatus @report_id=${requestId}, @status=${status}, @status_updated_by_id=${statusUpdatedById}`;

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
