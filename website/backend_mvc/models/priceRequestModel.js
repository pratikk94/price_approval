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

async function insertTransactions(data) {
  const {
    customers,
    consignees,
    endUse,
    plant,
    endUseSegment,
    validFrom,
    validTo,
    paymentTerms,
    oneToOneMapping,
    requestId,
    prices, // Ensure this is correctly parsed as an array
    am_id,
  } = data;

  console.log(prices);

  const customerList = customers.split(",");
  const consigneeList = consignees.split(",");

  let transactions = [];

  if (oneToOneMapping) {
    for (let i = 0; i < customerList.length; i++) {
      transactions.push(
        `('${customerList[i]}', '${consigneeList[i]}', '${endUse}', '${plant}', '${endUseSegment}', '${validFrom}', '${validTo}', '${paymentTerms}', ${oneToOneMapping},
        '${requestId}'
        )`
      );
    }
  } else {
    for (let customer of customerList) {
      for (let consignee of consigneeList) {
        transactions.push(
          `('${customer}', '${consignee}', '${endUse}', '${plant}', '${endUseSegment}', '${validFrom}', '${validTo}', '${paymentTerms}', ${oneToOneMapping}, '${requestId}'
          )`
        );
      }
    }
  }

  await sql.connect(config);
  await sql.query(
    `INSERT INTO price_approval_requests (customer_id, consignee_id, end_use_id, plant, end_use_segment_id, valid_from, valid_to, payment_terms_id, mappint_type, request_name) VALUES ${transactions.join(
      ", "
    )}`
  );

  // Ensure 'prices' is an array before calling insertPrices
  if (Array.isArray(prices)) {
    await insertPrices(prices, requestId);
  } else {
    console.error("Invalid input: prices must be an array");
    throw new Error("Invalid input: prices must be an array");
  }

  await addTransactionToTable(requestId, am_id);

  return transactions.length;
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
              '${item.grade_type}',       '${item.gsm_range_from}', 
              '${item.gsm_range_to}',     '${item.agreed_price}', 
              '${item.special_discount}', '${item.reel_discount}', 
              '${item.pack_upcharge}',    '${item.TPC}',          '${item.offline_discount}', 
              '${item.net_nsr}',          '${item.old_net_nsr}')
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

module.exports = {
  handleNewRequest: getCurrentDateRequestId,
  insertTransactions,
};
