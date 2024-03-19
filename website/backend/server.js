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

// A simple API endpoint that fetches employee data
app.get("/api/fetch_employees", async (req, res) => {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query to select employee_name and employee_id
    const result = await pool.request()
      .query`SELECT employee_name as name, employee_id as id FROM user_master`;

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

// A simple API endpoint that fetches roles
app.get("/api/fetch_roles", async (req, res) => {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query to select employee_name and employee_id
    const result = await pool.request().query`SELECT * FROM roles`;

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

// A simple API endpoint that fetches region
app.get("/api/fetch_region", async (req, res) => {
  let pool = null;
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query to select employee_name and employee_id
    const result = await pool.request().query`SELECT * from region`;

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

app.post("/api/add_employee_role", async (req, res) => {
  const { employee_id, employee_name, role, region, created_date } = req.body;
  const user_id = 1; // Hardcoded as per requirement
  const created_by = "backend_user"; // This can also be fetched dynamically if needed
  let pool = null; // Initialize the pool variable
  try {
    pool = await sql.connect(config);

    const query = `
          INSERT INTO define_roles (employee_id, employee_name, role, region, created_by, created_date,active ) 
          VALUES (@employee_id, @employee_name, @role, @region, @created_by, @created_date, @active);
      `;

    const request = new sql.Request(pool);
    request.input("employee_id", sql.VarChar, employee_id);
    request.input("employee_name", sql.VarChar, employee_name);
    request.input("role", sql.VarChar, role);
    request.input("region", sql.VarChar, region);
    request.input("created_by", sql.VarChar, created_by);
    request.input("active", 1);
    request.input(
      "created_date",
      sql.DateTime,
      created_date ? new Date(created_date) : new Date()
    ); // Use provided date or current date

    await request.query(query);

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

//fetch data from roles table
app.get("/api/fetch_roles_data", async (req, res) => {
  let pool = null;
  try {
    // Connect to the database
    pool = await sql.connect(config);

    // Query to fetch all values from the 'define' table
    const result = await pool.request().query`SELECT * FROM define_roles`;

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

app.get("/api/fetch_roles_data_by_id", async (req, res) => {
  let pool = null;
  try {
    // Connect to the database
    pool = await sql.connect(config);
    const id = req.query.id;
    // Query to fetch all values from the 'define' table
    const result = await pool.request()
      .query`SELECT * FROM define_roles where id =${id}`;

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

// Api to fetch grade.
app.get("/api/fetch_price_requests", async (req, res) => {
  let pool = null;
  const fsc = req.query.fsc == 1 ? "Y" : "N";
  try {
    // Establish a connection to the database
    pool = await sql.connect(config);

    // Query the database
    const result = await pool.request().query`SELECT 
      pra.req_id,
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
      ) AS EndUseNames,
      pra.*,
      prt.*,
      rs.created_at as created_on,rs.last_updated_at as updated_on,rs.status_updated_by_id as created_by
  FROM 
      price_approval_requests pra
  LEFT JOIN
      report_status rs ON pra.req_id = rs.report_id
  LEFT JOIN 
      price_approval_requests_price_table prt ON pra.req_id = prt.req_id
      
      `;
    // WHERE rs.status = 1
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

app.get("/api/fetch_approvers", async (req, res) => {
  const { role, region } = req.query;
  let pool = null;
  try {
    pool = await sql.connect(config);
    const query = `SELECT * FROM define_roles WHERE role like '%${
      role ?? ""
    }%' AND region like '%${region ?? ""}%'`;
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

app.get("/api/fetch_profit_centers", async (req, res) => {
  const { role, region } = req.query;
  let pool = null;
  try {
    pool = await sql.connect(config);
    const query = `SELECT  [id], [name]
    FROM [PriceApprovalSystem].[dbo].[profit_center]
    ORDER BY name ASC;`;
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

app.get("/api/fetch_profit_centers", async (req, res) => {
  const { role, region } = req.query;
  let pool = null;
  try {
    pool = await sql.connect(config);
    const query = `SELECT  [id], [name]
    FROM [PriceApprovalSystem].[dbo].[profit_center]
    ORDER BY name ASC`;
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

app.get("/api/get_approver", async (req, res) => {
  const { role, region } = req.query;
  let pool = null;
  try {
    pool = await sql.connect(config);
    const query = `SELECT  * from define_roles`;
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

app.get("/api/fetch_rules", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const query = `SELECT r.*, STRING_AGG(dr.employee_name, ', ') AS approver_names
    FROM rules r
    CROSS APPLY STRING_SPLIT(REPLACE(REPLACE(r.approvers, '[', ''), ']', ''), ',') AS s
    JOIN define_roles dr ON dr.employee_id = s.value 
    WHERE r.status = 1
    -- TRY_CAST(s.value AS INT)
    GROUP BY r.name,r.id,r.region
          ,r.profit_center
          ,r.valid_from
          ,r.valid_to
          ,r.approvers
          ,r.status
          ,r.created_by
    ,r.created_date;`;
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

app.get("/api/fetch_rules_by_id", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const id = req.query.id;
    const query = `SELECT r.*, STRING_AGG(dr.employee_name, ', ') AS approver_names
    FROM rules r
    CROSS APPLY STRING_SPLIT(REPLACE(REPLACE(r.approvers, '[', ''), ']', ''), ',') AS s
    JOIN define_roles dr ON dr.employee_id = s.value 
    WHERE r.status = 1 and r.id = ${id}
    GROUP BY r.name,r.id,r.region
          ,r.profit_center
          ,r.valid_from
          ,r.valid_to
          ,r.approvers
          ,r.status
          ,r.created_by
    ,r.created_date;`;
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

app.get("/api/fetch_report_status", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const query = `SELECT  * from report_status`;
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

app.post("/api/add_price_request", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
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
      .query(`INSERT INTO price_approval_requests (customer_id, consignee_id, plant, end_use_id, end_use_segment_id, payment_terms_id, valid_from, valid_to, fsc, mappint_type) 
              VALUES (@customerIds, @consigneeIds, @plants, @endUseIds, @endUseSegmentIds, @paymentTermsId, @validFrom, @validTo, @fsc, @mappint_type);
              SELECT SCOPE_IDENTITY() AS id;`);

    const requestId = mainResult.recordset[0].id;
    // console.log(requestId);

    for (const item of req.body.priceTable) {
      // console.log(item);
      await pool
        .request()
        .input("reqId", sql.VarChar, `${requestId}`)
        .input("grade", sql.VarChar, item.grade)
        .input("gradeType", sql.VarChar, item.gradeType)
        .input("gsmFrom", sql.VarChar, item.gsmFrom)
        .input("gsmTo", sql.VarChar, item.gsmTo)
        .input("agreedPrice", sql.VarChar, `${item.agreedPrice}`)
        .input("specialDiscount", sql.VarChar, `'${item.specialDiscount}'`)
        .input("reelDiscount", sql.VarChar, `'${item.reelDiscount}'`)
        .input("packUpcharge", sql.VarChar, `'${item.packUpCharge}'`)
        .input("tpc", sql.VarChar, `'${item.tpc}'`)
        .input("offlineDiscount", sql.VarChar, `'${item.offlineDiscount}'`)
        .input("netNSR", sql.VarChar, `'${item.netNSR}'`)
        .input("oldNetNSR", sql.VarChar, `'${item.oldNetNSR}'`)
        .query(`INSERT INTO price_approval_requests_price_table (req_id, grade, grade_type, gsm_range_from, gsm_range_to, agreed_price, special_discount, reel_discount, pack_upcharge, tpc, offline_discount, net_nsr, old_net_nsr) 
                VALUES (@reqId, @grade, @gradeType, @gsmFrom, @gsmTo, @agreedPrice, @specialDiscount, @reelDiscount, @packUpcharge, @tpc, @offlineDiscount, @netNSR, @oldNetNSR)`);
    }

    // Additional insert operations here, following the same pattern

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

app.get("/api/price_requests", async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(config);
    const req_id = req.query.id;
    console.log(req_id);
    const result = await sql.query(`
    SELECT 
    pra.*,
    prt.*,
    rs.created_at,rs.last_updated_at,rs.status_updated_by_id,
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
    ) AS EndUseNames
FROM 
    price_approval_requests pra
LEFT JOIN 
    price_approval_requests_price_table prt ON pra.req_id = prt.req_id
  LEFT JOIN
      report_status rs ON pra.req_id = rs.report_id
WHERE 
    pra.req_id = ${req_id}
    `);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
