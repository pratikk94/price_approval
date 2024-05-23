// models/transactionModel.js
const sql = require("mssql");
const config = require("../../backend_mvc/config");

async function getCurrentDateRequestId() {
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD format
  console.log("CurrentDate->", currentDate);
  await sql.connect(config);
  const result = await sql.query(
    `SELECT MAX(request_name) AS maxRequestId FROM price_approval_requests WHERE request_name LIKE 'NR${currentDate}%'`
  );
  if (result.recordset[0].maxRequestId) {
    const nextId = parseInt(result.recordset[0].maxRequestId.slice(10)) + 1;
    return `NR${currentDate}${nextId.toString().padStart(4, "0")}`;
  } else {
    return `NR${currentDate}0001`;
  }
}

async function insertCombinationsOneToOne(customers, consignees, plants, data) {
  try {
    await sql.connect(config);
    const transaction = new sql.Transaction();
    await transaction.begin();
    const request = new sql.Request(transaction);

    for (let i = 0; i < customers.length; i++) {
      for (const plant of plants) {
        await request.query(`
                  INSERT INTO price_approval_requests (
                      customer_id, consignee_id, end_use_id, plant, end_use_segment_id, 
                      valid_from, valid_to, payment_terms_id, request_name,mappint_type) 
                  VALUES (
                      '${customers[i]}', '${consignees[i]}', '${data.endUse}', '${plant}', 
                      '${data.endUseSegment}', '${data.validFrom}', '${data.validTo}', 
                      '${data.paymentTerms}', '${data.requestId}', ${data.oneToOneMapping})
              `);
      }
    }

    await transaction.commit();
    return {
      success: true,
      message: "Data inserted successfully.",
      count: customers.length * plants.length,
    };
  } catch (err) {
    console.error("Error during database operation:", err);
    return { success: false, message: err.message };
  }
}

async function insertCombinationsOneToMany(
  customers,
  consignees,
  plants,
  data
) {
  try {
    await sql.connect(config);
    const transaction = new sql.Transaction();
    await transaction.begin();
    const request = new sql.Request(transaction);

    for (const customer of customers) {
      for (const consignee of consignees) {
        for (const plant of plants) {
          await request.query(`
                      INSERT INTO price_approval_requests (
                          customer_id, consignee_id, end_use_id, plant, end_use_segment_id, 
                          valid_from, valid_to, payment_terms_id, request_name, mappint_type) 
                      VALUES (
                          '${customer}', '${consignee}', '${data.endUse}', '${plant}', 
                          '${data.endUseSegment}', '${data.validFrom}', '${data.validTo}', 
                          '${data.paymentTerms}', '${data.requestId}', ${data.oneToOneMapping})
                  `);
        }
      }
    }

    await transaction.commit();
    return {
      success: true,
      message: "Data inserted successfully.",
      count: customers.length * consignees.length * plants.length,
    };
  } catch (err) {
    console.error("Error during database operation:", err);
    return { success: false, message: err.message };
  }
}

async function insertTransactions(data) {
  const {
    customers,
    consignees,
    endUse,
    endUseSegment,
    validFrom,
    validTo,
    paymentTerms,
    oneToOneMapping,
    requestId,
    prices, // Assume prices is an array
    am_id,
  } = data;

  const customerList = customers.split(",");
  const consigneeList = consignees.split(",");
  const plantList = data.plant.split(","); // Assuming plant is also provided as a comma-separated string

  try {
    await sql.connect(config);

    // Determine which function to call based on the mapping type
    const mappingFunction = oneToOneMapping
      ? insertCombinationsOneToMany
      : insertCombinationsOneToOne;

    // Call the appropriate mapping function with the split data
    const result = await mappingFunction(
      customerList,
      consigneeList,
      plantList,
      {
        endUse,
        endUseSegment,
        validFrom,
        validTo,
        paymentTerms,
        requestId,
        oneToOneMapping,
      }
    );

    if (!result.success) {
      throw new Error(`Error inserting data: ${result.message}`);
    }

    // Additional business logic for inserting prices
    if (Array.isArray(prices)) {
      await insertPrices(prices, requestId); // Assume insertPrices is defined elsewhere
    } else {
      throw new Error("Invalid input: prices must be an array");
    }

    // Example function to log a transaction record
    await logTransaction(requestId, am_id);

    return {
      success: true,
      message: `Successfully processed ${result.count} transactions.`,
      count: result.count,
    };
  } catch (err) {
    console.error("Error during transaction insertion:", err);
    return {
      success: false,
      message: err.message || "Failed to insert transactions",
    };
  }
}

async function logTransaction(requestId, am_id) {
  // Example logging function that inserts a transaction log into the database
  const request = new sql.Request();
  // await request.query(`
  //     INSERT INTO transaction_logs (request_id, am_id, log_time)
  //     VALUES ('${requestId}', '${am_id}', GETDATE())
  // `);
}

async function insertPrices(data, request_id) {
  try {
    await sql.connect(config);
    for (const item of data) {
      await sql.query(
        `
              INSERT INTO price_approval_requests_price_table 
              (req_id, fsc, grade, grade_type, gsm_range_from, gsm_range_to, agreed_price, special_discount, 
              reel_discount, pack_upcharge, TPC, offline_discount, net_nsr, old_net_nsr) 
              VALUES 
              ('${request_id}',      '${item.fsc}',          '${item.grade}', 
              '${item.gradeType}',       '${item.gsmFrom}', 
              '${item.gsmTo}',     '${item.agreedPrice}', 
              '${item.specialDiscount}', '${item.reelDiscount}', 
              '${item.packUpCharge}',    '${item.tpc}',          '${item.offlineDiscount}', 
              '${item.netNSR}',          '${item.oldNetNSR}')
          `
      );
    }
    // return { success: true, message: "All prices inserted successfully." };
  } catch (err) {
    console.error("Database operation failed:", err);
    return { success: false, message: err.message };
  }
}

async function addTransactionToTable(requestId, userId) {
  try {
    await sql.connect(config);

    // Fetch user details, including am_id and region_id
    const userDetails = await sql.query(
      `
          SELECT employee_id, region
          FROM define_roles
          WHERE employee_id = '${userId}'
      `
    );

    if (userDetails.recordset.length === 0) {
      throw new Error("User not found");
    }

    const { employee_id, region } = userDetails.recordset[0];

    console.log(region);

    // Check for a valid rule_id where today's date is within the valid range
    const validRule = await sql.query(
      `
          SELECT rule_id
          FROM rule_mvc
          WHERE region = '${region}'
          AND valid_from <= GETDATE()
          AND valid_to >= GETDATE()
      `
    );

    if (validRule.recordset.length === 0) {
      throw new Error("No valid rule found for the current date");
    }

    const { rule_id } = validRule.recordset[0];

    // Insert into transaction table
    const currentTime = new Date();
    const result = await sql.query(
      `
          INSERT INTO transaction_mvc (rule_id, last_updated_by_role, last_updated_by_id, request_id, current_status, currently_pending_with, created_at)
          VALUES ('${rule_id}', 'AM', '${employee_id}', '${requestId}', 'RM0A1', 'RM', '${currentTime}')
      `
    );

    return { success: true, message: "Transaction successfully added." };
  } catch (err) {
    console.error("Database operation failed:", err);
    return { success: false, message: err.message };
  }
}

async function fetchConsolidatedRequest(requestId) {
  try {
    await sql.connect(config);
    // Fetch all rows from the price_approval_requests table with the given request_id
    const requestResult = await sql.query(
      `
          SELECT *
          FROM price_approval_requests
          WHERE request_name = '${requestId}'
      `
    );

    // Consolidate rows by combining similar data into one JSON object
    const consolidated = requestResult.recordset.reduce((acc, row) => {
      Object.keys(row).forEach((key) => {
        if (!(key in acc)) {
          acc[key] = new Set(); // Initialize a new Set for each key
        }
        // Check if the value is null before splitting and adding to the Set
        if (row[key] !== null && row[key] !== undefined) {
          row[key]
            .toString()
            .split(",")
            .forEach((value) => {
              if (value.trim() !== "") {
                // Ensure empty strings are not added
                acc[key].add(value.trim());
              }
            });
        }
      });
      return acc;
    }, {});
    // Convert sets back to comma-separated strings
    Object.keys(consolidated).forEach((key) => {
      consolidated[key] = Array.from(consolidated[key]).join(", ");
    });
    // Fetch all rows from the price_approval_system_price table with the maximum ID
    const priceResult = await sql.query(`
          SELECT *
          FROM price_approval_requests_price_table
          WHERE req_id = '${requestId}' AND id = (SELECT MAX(id) FROM price_approval_requests_price_table WHERE req_id = '${requestId}')
      `);
    return {
      consolidatedRequest: consolidated,
      priceDetails: priceResult.recordset,
    };
  } catch (err) {
    console.error("Database operation failed:", err);
    throw err;
  }
}

async function fetchData(role, status) {
  try {
    await sql.connect(config);
    const statusSTR =
      status == 0 ? "AND currently_pending_with = '${role}'" : "";
    // Use advanced query to get transactions pending with the given role
    const transactionsResult = await sql.query(
      `
          WITH MaxIds AS (
              SELECT MAX(id) AS maxId, request_id
              FROM transaction_mvc
              GROUP BY request_id
          ),
          MaxDetails AS (
              SELECT m.maxId, m.request_id, t.current_status
              FROM transaction_mvc t
              INNER JOIN MaxIds m ON t.id = m.maxId
          ),
          RelatedTransactions AS (
              SELECT t.*
              FROM transaction_mvc t
              INNER JOIN MaxDetails m ON t.request_id = m.request_id AND t.current_status = m.current_status
          )
          SELECT *
          FROM RelatedTransactions
          WHERE EXISTS (
              SELECT 1
              FROM transaction_mvc
              WHERE request_id = RelatedTransactions.request_id
              AND current_status = RelatedTransactions.current_status
              AND id != RelatedTransactions.id
          )
          ${statusSTR}
          UNION
          SELECT *
          FROM transaction_mvc
          WHERE id IN (SELECT maxId FROM MaxDetails)
          ${statusSTR}
      `
    );

    let details = [];

    // For each transaction, fetch and consolidate request details
    for (let transaction of transactionsResult.recordset) {
      console.log(transaction.request_id);
      const requestResult = await sql.query(`
              SELECT 
              request_name,
              c.name AS customer_name, 
              consignee.name AS consignee_name, 
              enduse.name AS enduse_name,
              plant,
              valid_from,
              valid_to,
              payment_terms_id
                FROM price_approval_requests par
                JOIN customer c ON par.customer_id = c.id
                JOIN customer consignee ON par.consignee_id = consignee.id
                JOIN customer enduse ON par.end_use_id = enduse.id
                JOIN requests_mvc rs ON par.request_name = rs.req_id
              WHERE request_name = '${transaction.request_id}' and rs.status = '${status}'
      `);

      const consolidated = requestResult.recordset.reduce((acc, row) => {
        Object.keys(row).forEach((key) => {
          if (!(key in acc)) acc[key] = new Set();
          if (row[key] != null) {
            row[key]
              .toString()
              .split(",")
              .forEach((value) => {
                if (value.trim() !== "") acc[key].add(value.trim());
              });
          }
        });
        return acc;
      }, {});

      Object.keys(consolidated).forEach((key) => {
        consolidated[key] = Array.from(consolidated[key]).join(", ");
      });

      // Fetch price details with the maximum ID
      const priceResult = await sql.query(`
              SELECT *
              FROM price_approval_requests_price_table
              WHERE req_id = '${transaction.request_id}' AND id = (SELECT MAX(id) FROM price_approval_requests_price_table WHERE req_id = '${transaction.request_id}')
          `);

      details.push({
        request_id: transaction.request_id,
        consolidatedRequest: consolidated,
        priceDetails: priceResult.recordset,
      });
    }

    return details;
  } catch (err) {
    console.error("Database operation failed:", err);
    throw err;
  }
}

//History
async function fetchRequestDetails({
  customerIds,
  consigneeIds,
  endUseId,
  plantIds,
  grade,
}) {
  try {
    await sql.connect(config);

    // Helper function to query and update request ID sets using parameterized queries
    async function queryRequestIds(columnName, values) {
      if (!values) return new Set();

      const list = values
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value);
      if (list.length === 0) {
        return new Set();
      }

      const request = new sql.Request();
      const params = list.map((id, index) => {
        const paramName = `param${index}`;
        request.input(paramName, sql.VarChar, id);
        return `@${paramName}`;
      });

      const query = `
        SELECT DISTINCT request_name
        FROM price_approval_requests
        WHERE ${columnName} IN (${params.join(",")})
      `;

      const result = await request.query(query);

      return new Set(result.recordset.map((row) => row.request_name));
    }

    // Parallel queries for efficiency
    const [
      customerRequestIds,
      consigneeRequestIds,
      endUseRequestIds,
      plantRequestIds,
    ] = await Promise.all([
      queryRequestIds("customer_id", customerIds),
      queryRequestIds("consignee_id", consigneeIds),
      queryRequestIds("end_use_id", endUseId),
      queryRequestIds("plant", plantIds),
    ]);

    // Calculate the intersection of all sets
    const allRequestIds = [
      customerRequestIds,
      consigneeRequestIds,
      endUseRequestIds,
      plantRequestIds,
    ];

    console.log(allRequestIds);

    const commonRequestIds = allRequestIds.reduce(
      (a, b) => new Set([...a].filter((x) => b.has(x)))
    );

    // Fetch details for intersected IDs
    if (commonRequestIds.size > 0) {
      const filteredRequestIds = Array.from(commonRequestIds);
      const request = new sql.Request();
      filteredRequestIds.forEach((id, index) =>
        request.input(`reqId${index}`, sql.VarChar, id)
      );
      const gradeFilter = grade ? ` AND grade = @grade` : "";
      if (grade) request.input("grade", sql.VarChar, grade);

      const detailsQuery = `
        SELECT * 
        FROM price_approval_requests_price_table 
        WHERE req_id IN (${filteredRequestIds
          .map((_, index) => `@reqId${index}`)
          .join(",")})
        ${gradeFilter}
      `;
      const details = await request.query(detailsQuery);
      return details.recordset;
    }

    return []; // Return empty if no common IDs found or no parameters provided
  } catch (err) {
    console.error("Database operation failed:", err);
    throw err;
  }
}

module.exports = {
  handleNewRequest: getCurrentDateRequestId,
  insertTransactions,
  fetchConsolidatedRequest,
  fetchData,
  fetchRequestDetails,
  addTransactionToTable,
};
