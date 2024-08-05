// models/transactionModel.js
const sql = require("mssql");
const db = require("../config/db");
const config = require("../../backend_mvc/config");
const { addAuditLog } = require("../utils/auditTrails");
const { insertParentRequest } = require("../utils/fetchAllRequestIds");
const { STATUS, SYMMETRIC_KEY_NAME, CERTIFICATE_NAME } = require("../config/constants");
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

async function getCurrentDateRequestId() {
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD format
  console.log("CurrentDate->", currentDate);
  // await sql.connect(config);
  // const result = await sql.query(
  //   `SELECT MAX(request_name) AS maxRequestId FROM price_approval_requests WHERE request_name LIKE 'NR${currentDate}%'`
  // );
  let query = `SELECT MAX(request_name) AS maxRequestId FROM price_approval_requests WHERE request_name LIKE 'NR${currentDate}%'`;
  let result = await db.executeQuery(query);

  if (result.recordset[0].maxRequestId) {
    const nextId = parseInt(result.recordset[0].maxRequestId.slice(10)) + 1;
    return `NR${currentDate}${nextId.toString().padStart(4, "0")}`;
  } else {
    return `NR${currentDate}0001`;
  }
}

async function insertCombinationsOneToOne(
  customers,
  consignees,
  plants,
  data,
  am_id
) {
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
                      valid_from, valid_to, payment_terms_id, request_name,mappint_type.,am_id) 
                      OUTPUT INSERTED.*
                  VALUES (
                      '${customers[i]}', '${consignees[i]}', '${data.endUse}', '${plant}', 
                      '${data.endUseSegment}', '${data.validFrom}', '${data.validTo}', 
                      '${data.paymentTerms}', '${data.requestId}', ${data.oneToOneMapping},'${am_id}')
              `);
      }
    }
    // Add audit log for the INSERT operation
    await addAuditLog(
      "price_approval_requests",
      result.recordset[0].id,
      "INSERT",
      null
    );

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
  data,
  am_id
) {
  try {
    await sql.connect(config);
    const transaction = new sql.Transaction();
    await transaction.begin();
    const request = new sql.Request(transaction);

    for (const customer of customers) {
      for (const consignee of consignees) {
        for (const plant of plants) {
          let result = await request.query(`
                      INSERT INTO price_approval_requests (
                          customer_id, consignee_id, end_use_id, plant, end_use_segment_id, 
                          valid_from, valid_to, payment_terms_id, request_name, mappint_type,am_id) 
                          OUTPUT INSERTED.*
                      VALUES (
                          '${customer}', '${consignee}', '${data.endUse}', '${plant}', 
                          '${data.endUseSegment}', '${data.validFrom}', '${data.validTo}', 
                          '${data.paymentTerms}', '${data.requestId}', ${data.oneToOneMapping},'${am_id}')
                  `);
          // Add audit log for the INSERT operation
          console.log(result.recordset[0], "testing...........");
          await addAuditLog(
            "price_approval_requests",
            result.recordset[0].req_id,
            "INSERT",
            null
          );
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

// Function to format a Date object into 'YYYY-MM-DD HH:mm:ss' format
function formatDateToDBString(date) {
  const pad = (num) => (num < 10 ? "0" + num : num);

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    ".000Z"
  );
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
    tempAttachmentIds,
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

    console.log(typeof validFrom, validFrom, "validFrom");
    const adjustedValidFrom = new Date(
      formatDateToDBString(
        new Date(new Date(validFrom).getTime() + (5 * 60 + 30) * 60 * 1000)
      )
    ).toISOString();
    console.log(typeof adjustedValidFrom, adjustedValidFrom, "valueFrom");
    const adjustedValidTo = new Date(
      formatDateToDBString(
        new Date(new Date(validTo).getTime() + (5 * 60 + 30) * 60 * 1000)
      )
    ).toISOString();
    // Call the appropriate mapping function with the split data
    const result = await mappingFunction(
      customerList,
      consigneeList,
      plantList,
      {
        endUse,
        endUseSegment,
        validFrom: adjustedValidFrom,
        validTo: adjustedValidTo,
        paymentTerms,
        requestId,
        oneToOneMapping,
      },
      am_id
    );

    if (!result.success) {
      throw new Error(`Error inserting data: ${result.message}`);
    }

    console.log(validFrom, validTo, "validFrom, validTo");

    // Additional business logic for inserting prices
    if (Array.isArray(prices)) {
      await insertPrices(prices, requestId); // Assume insertPrices is defined elsewhere
    } else {
      throw new Error("Invalid input: prices must be an array");
    }

    changeAttachmentIds(tempAttachmentIds, requestId)
      .then(() => console.log("Attachment ID updated successfully."))
      .catch((error) => console.error("Error updating Attachment ID:", error));

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

async function changeAttachmentIds(tempAttachmentIds, newRequestId) {
  let pool = null;
  try {
    pool = await sql.connect(config);
    console.log(`${tempAttachmentIds}`);
    console.log(`New request id ${newRequestId}`);
    console.log(typeof tempAttachmentIds);
    if (tempAttachmentIds != undefined) {
      // Make sure `config` is defined with your DB credentials
      tempAttachmentIds =
        typeof tempAttachmentIds == "string"
          ? tempAttachmentIds.split(",")
          : tempAttachmentIds;
      const promises = tempAttachmentIds.map((tempId) => {
        console.log(
          `Temp ids are ${tempId} and New request id is ${newRequestId}`
        );
        return pool
          .request()
          .input("newRequestId", sql.NVarChar, newRequestId)
          .input("tempId", sql.NVarChar, tempId.toString())
          .query(
            `UPDATE files SET request_id = @newRequestId WHERE request_id = @tempId;`
          );
      });
      await Promise.all(promises);
    }

    console.log(
      `All tempAttachmentIds have been updated to the new request_id: ${newRequestId}`
    );
  } catch (error) {
    console.error("Failed to update request IDs:", error);
    throw error; // Rethrow or handle as needed
  }
}

async function insertPrices(data, request_id) {
  try {
    // await sql.connect(config);
    console.log(data);
    for (const item of data) {
      let fsc = item.fsc == undefined ? "N" : item.fsc;
      // const query = `INSERT INTO price_approval_requests_price_table 
      // (req_id, fsc, grade, grade_type, gsm_range_from, gsm_range_to, agreed_price, special_discount, 
      // reel_discount, pack_upcharge, TPC, offline_discount, net_nsr, old_net_nsr) 
      // OUTPUT INSERTED.*
      // VALUES 
      // ('${request_id}',      '${fsc}',          '${item.grade}', 
      // '${item.gradeType}',       '${item.gsmFrom}', 
      // '${item.gsmTo}',     '${item.agreedPrice}', 
      // '${item.specialDiscount}', '${item.reelDiscount}', 
      // '${item.packUpCharge}',    '${item.tpc}',          '${item.offlineDiscount}', 
      // '${item.netNSR}',          '${item.oldNetNSR}')`;

      // await sql.query(`${query} `);
      let result = await db.executeQuery(`EXEC InsertPriceApprovalRequest 
    @req_id ,@fsc,@grade,@grade_type,@gsm_range_from,@gsm_range_to,
    @agreed_price,@special_discount,@reel_discount, @pack_upcharge,
    @tpc,@offline_discount,@net_nsr,@old_net_nsr,@SymmetricKeyName,
    @CertificateName;
`, {
        req_id: request_id,
        fsc: fsc,
        grade: item.grade,
        grade_type: item.gradeType,
        gsm_range_from: item.gsmFrom,
        gsm_range_to: item.gsmTo,
        agreed_price: item.agreedPrice,
        special_discount: item.specialDiscount,
        reel_discount: item.reelDiscount,
        pack_upcharge: item.packUpCharge,
        tpc: item.tpc,
        offline_discount: item.offlineDiscount,
        net_nsr: item.netNSR,
        old_net_nsr: item.oldNetNSR,
        SymmetricKeyName: SYMMETRIC_KEY_NAME,
        CertificateName: CERTIFICATE_NAME
      });
      // Add audit log for the INSERT operation
      await addAuditLog(
        "price_approval_requests_price_table",
        result.recordset[0].id,
        "INSERT",
        null
      );
    }
    // return { success: true, message: "All prices inserted successfully." };
  } catch (err) {
    console.error("Database operation failed:", err);
    return { success: false, message: err.message };
  }
}

async function addTransactionToTable(requestId, userId, isDraft = false) {
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
          and is_active = 1
          AND valid_from <= GETDATE()
          AND valid_to >= GETDATE()
      `
    );

    if (validRule.recordset.length === 0) {
      throw new Error("No valid rule found for the current date");
    }

    const { rule_id } = validRule.recordset[0];
    console.log(`Rule id is ${rule_id}`);
    const query2 = `
    SELECT approver, level
    FROM rule_mvc
    WHERE rule_id = @rule_id AND level = (
        SELECT level + 1
        FROM rule_mvc
        WHERE approver = @currentRole AND rule_id = @rule_id
    )
    `;
    const approversResult = await db.executeQuery(query2, {
      rule_id: rule_id,
      currentRole: "AM",
    });
    console.log("********");
    console.log(approversResult);
    if (isDraft) {
      //   query = `INSERT INTO transaction_mvc (rule_id, last_updated_by_role, last_updated_by_id, request_id, current_status, currently_pending_with, created_at)
      // OUTPUT INSERTED.*
      // VALUES ('${rule_id}', 'AM', '${employee_id}', '${requestId}','AM0','AM', GETDATE())`;
      insertParentRequest(requestId);
      const result = await db.executeQuery(`EXEC InsertTransaction 
    @RuleId, 
    @LastUpdatedByRole, 
    @LastUpdatedById, 
    @RequestId, 
    @CurrentStatus, 
    @CurrentlyPendingWith,
    @SymmetricKeyName,
    @CertificateName;`, {
        RuleId: rule_id,
        LastUpdatedByRole: 'AM',
        LastUpdatedById: employee_id,
        RequestId: requestId,
        CurrentStatus: 'AM0',
        CurrentlyPendingWith: 'AM',
        SymmetricKeyName: SYMMETRIC_KEY_NAME,
        CertificateName: CERTIFICATE_NAME

      });
      // const result = await sql.query(`${query}`);
      // console.log(result.recordset[0],"result.......")
      // Add audit log for the update operation
      console.log(result.recordset[0].id)
      await addAuditLog(
        "transaction_mvc",
        result.recordset[0].id,
        "INSERT",
        null
      );
    }
    if (approversResult.recordset.length === 1) {
      const { approver, level } = approversResult.recordset[0];

      const newStatus = `${approver}0_AM1`;

      // await sql.query(
      //   `
      //       INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
      //       VALUES ('${requestId}', '${rule_id}', '${newStatus}', '${approver}', '${currentRole}','${lastUpdatedById}', GETDATE())
      //   `
      // );
      // let query = `
      //       INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id, created_at)
      //       OUTPUT INSERTED.* 
      //       VALUES (@requestId, @rule_id, @newStatus, @approver, @currentRole, @lastUpdatedById, GETDATE())
      //   `;
      // requestId: requestId,
      //   rule_id: rule_id,
      //   newStatus: newStatus,
      //   approver: approver,
      //   currentRole: "AM",
      //   lastUpdatedById: employee_id,
      let result = await db.executeQuery(`EXEC InsertTransaction
    @RuleId, 
    @LastUpdatedByRole, 
    @LastUpdatedById, 
    @RequestId, 
    @CurrentStatus, 
    @CurrentlyPendingWith,
    @SymmetricKeyName,
    @CertificateName;`, {
        RequestId: requestId,
        RuleId: rule_id,
        CurrentStatus: newStatus,
        CurrentlyPendingWith: approver,
        LastUpdatedByRole: "AM",
        LastUpdatedById: employee_id,
        SymmetricKeyName: SYMMETRIC_KEY_NAME,
        CertificateName: CERTIFICATE_NAME
      });
      console.log(
        result,
        "testing transaction_mvc approversResult.recordset.length === 1"
      );
      // Add audit log for the update operation
      console.log(result.recordset[0].id)
      await addAuditLog(
        "transaction_mvc",
        result.recordset[0].id,
        "INSERT",
        null
      );
      const pool = await poolPromise;
      const result1 = await pool
        .request()
        .input("status", sql.Int, isDraft ? STATUS.DRAFT : STATUS.PENDING)
        .input("pendingWith", sql.Int, isDraft ? 1 : level)
        .input("req_id", sql.VarChar, requestId)
        .query(
          "INSERT INTO requests_mvc (status, pending, req_id)OUTPUT INSERTED.* VALUES (@status, @pendingWith, @req_id)"
        );
      await addAuditLog(
        "requests_mvc",
        result1.recordset[0].id,
        "INSERT",
        null
      );
    } else if (approversResult.recordset.length > 1) {
      for (const { approver, level } of approversResult.recordset) {
        const newStatus =
          approversResult.recordset.reduce(
            (acc, { approver }, index, array) => {
              return `${acc}${approver}0${index < array.length - 1 ? "_" : ""}`;
            },
            ""
          ) + `AM1`;

        // await sql.query(
        //   `INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id,created_at)
        //         VALUES ('${requestId}', '${rule_id}', '${newStatus}', '${approver}', '${currentRole}','${lastUpdatedById}', GETDATE())
        //     `
        // );
        // let query = `INSERT INTO transaction_mvc (request_id, rule_id, current_status, currently_pending_with, last_updated_by_role, last_updated_by_id,created_at)
        // OUTPUT INSERTED.*
        //       VALUES (@requestId, @rule_id, @newStatus, @approver, @currentRole,@lastUpdatedById, GETDATE())
        //   `;
        let result = await db.executeQuery(`EXEC InsertTransaction 
    @RuleId, 
    @LastUpdatedByRole, 
    @LastUpdatedById, 
    @RequestId, 
    @CurrentStatus, 
    @CurrentlyPendingWith,
    @SymmetricKeyName,
    @CertificateName;`, {
          RequestId: requestId,
          RuleId: rule_id,
          CurrentStatus: newStatus,
          CurrentlyPendingWith: approver,
          LastUpdatedByRole: "AM",
          LastUpdatedById: employee_id,
        });
        console.log(result.recordset[0].id)
        console.log(result.recordset[0], "trasanction testing..............");
        const pool = await poolPromise;
        const result1 = await pool
          .request()
          .input("status", sql.Int, isDraft ? STATUS.DRAFT : STATUS.PENDING)
          .input("pendingWith", sql.Int, isDraft ? 1 : level)
          .input("req_id", sql.VarChar, requestId)
          .query(
            "INSERT INTO requests_mvc (status, pending, req_id)OUTPUT INSERTED.* VALUES (@status, @pendingWith, @req_id)"
          );
        await addAuditLog(
          "requests_mvc",
          result1.recordset[0].id,
          "INSERT",
          null
        );

        // Add audit log for the update operation
        await addAuditLog(
          "transaction_mvc",
          result.recordset[0].id,
          "INSERT",
          null
        );
      }
    }

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
    // const priceResult = await sql.query(`
    //       SELECT *
    //       FROM price_approval_requests_price_table
    //       WHERE req_id = '${requestId}' AND id = (SELECT MAX(id) FROM price_approval_requests_price_table WHERE req_id = '${requestId}')
    //   `);
    const priceResult = await db.executeQuery(`EXEC GetLatestPriceApprovalRequest 
        @requestId,@SymmetricKeyName,@CertificateName`,
      {
        requestId: requestId,
        SymmetricKeyName: SYMMETRIC_KEY_NAME,
        CertificateName: CERTIFICATE_NAME
      })
    return {
      consolidatedRequest: consolidated,
      priceDetails: priceResult.recordset,
    };
  } catch (err) {
    console.error("Database operation failed:", err);
    throw err;
  }
}

async function fetchData(role, status, id) {
  try {
    let transactionsResult;
    if (role.indexOf("NSM") != -1) {
      transactionsResult = await db.executeQuery(
        "EXEC GetTransactionDetails @Status, @Role,@SymmetricKeyName,@CertificateName",
        { Status: status, Role: role, SymmetricKeyName: SYMMETRIC_KEY_NAME, CertificateName: CERTIFICATE_NAME }
      );
    }

    // Use advanced query to get transactions pending with the given role
    else {
      transactionsResult = await db.executeQuery(
        "EXEC GetTransactionDetails @Status, @Role,@SymmetricKeyName,@CertificateName",
        { Status: status, Role: role, SymmetricKeyName: SYMMETRIC_KEY_NAME, CertificateName: CERTIFICATE_NAME }
      );
    }
    let details = [];
    // For each transaction, fetch and consolidate request details
    let uniqueTransactions = transactionsResult.recordset.filter(
      (value, index, self) =>
        self.findIndex((t) => t.request_id === value.request_id) === index
    );
    for (let transaction of uniqueTransactions) {
      console.log(transaction.request_id);
      let query =
        role == "RM" || role == "AM"
          ? `EXEC GetPriceApprovalRequests @Id = '${id}', @Status = '${status}', @RequestId = ${transaction.request_id}, @Role = '${role}',@SymmetricKeyName = '${SYMMETRIC_KEY_NAME}', @CertificateName='${CERTIFICATE_NAME}'`
          : `EXEC GetPriceApprovalRequestsHigh  @Status = '${status}', @RequestId = ${transaction.request_id}, @Role = '${role}',@SymmetricKeyName = '${SYMMETRIC_KEY_NAME}', @CertificateName='${CERTIFICATE_NAME}'`;
      // Fetch price details with the maximum ID
      const requestResult = await db.executeQuery(query);

      if (requestResult.recordset.length > 0) {
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

        console.log(consolidated["request_name"], "consolidated....");
        if (consolidated["request_name"] != "undefined") {
          consolidated["request_name"] =
            consolidated["request_name"].split(",")[
            consolidated["request_name"].split(",").length - 1
            ];
        } else {
          console.log("In here ... ELse");
          consolidated["request_name"] = transaction.request_id;
        }
        // Fetch price details with the maximum ID
        const priceResult = await db.executeQuery(
          "EXEC GetPriceApprovalRequestDetails @RequestID, @Role",
          { RequestID: transaction.request_id, Role: role }
        );

        details.push({
          request_id: transaction.request_id,
          consolidatedRequest: consolidated,
          priceDetails: priceResult.recordset,
        });
      }
    }
    console.log(details, "fetch details...");
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

async function fetchRequestReport(req_id, status) {
  try {
    let result = await db.executeQuery(`EXEC GetReports @RequestID,@Status`, {
      RequestID: req_id,
      status: status,
    });
    console.log(result);
    return result;
  } catch (err) {
    console.error("Database operation failed:", err);
    throw err;
  }
}

async function fetchRequestByStatus(status) {
  try {
    let result = await db.executeQuery(`EXEC GetPriceRequestByStatus @StatusFilter
      ,@SymmetricKeyName,@CertificateName`, {
      StatusFilter: status,
      SymmetricKeyName: SYMMETRIC_KEY_NAME,
      CertificateName: CERTIFICATE_NAME
    });
    console.log(result);
    return result;
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
  fetchRequestReport,
  fetchRequestByStatus
};
