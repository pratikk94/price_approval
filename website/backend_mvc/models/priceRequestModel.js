// models/transactionModel.js
const sql = require("mssql");
const config = require("../../backend_mvc/config");

async function getCurrentDateRequestId() {
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD format
  await sql.connect(config);
  const result = await sql.query(
    `SELECT MAX(req_id) AS maxRequestId FROM price_approval_requests WHERE req_id LIKE 'NR${currentDate}%'`
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
  } = data;
  const customerList = customers.split(",");
  const consigneeList = consignees.split(",");

  let transactions = [];

  if (oneToOneMapping) {
    for (let i = 0; i < customerList.length; i++) {
      transactions.push(
        `('${customerList[i]}', '${consigneeList[i]}', '${endUse}', '${plant}', '${endUseSegment}', '${validFrom}', '${validTo}', '${paymentTerms}', ${oneToOneMapping})`
      );
    }
  } else {
    for (let customer of customerList) {
      for (let consignee of consigneeList) {
        transactions.push(
          `('${customer}', '${consignee}', '${endUse}', '${plant}', '${endUseSegment}', '${validFrom}', '${validTo}', '${paymentTerms}', ${oneToOneMapping})`
        );
      }
    }
  }

  await sql.connect(config);
  await sql.query(
    `INSERT INTO price_approval_requests (customer_id, consignee_id, end_use_id, plant, end_use_segment_id, valid_from, valid_to, payment_terms_id, mappint_type) VALUES ${transactions.join(
      ", "
    )}`
  );

  return transactions.length;
}

module.exports = {
  handleNewRequest: getCurrentDateRequestId,
  insertTransactions,
};
