//Request history.js
// const sql = require("mssql");
// const config = require("../config"); // Assuming your config file is named dbConfig.js

const db = require("../config/db");
const { fetchRequestNames } = require("../utils/fetchAllRequestIds");

async function getTransactionsByRequestId(requestId) {
  try {
   
    console.log(`Request id is ${requestId}`);
    const requestIds = await fetchRequestNames(requestId);

    let allTransactions = [];
    for (const id of requestIds.reverse()) {
    const result = await db.executeQuery(`EXEC dbo.GetTransactionHistory ${id }`);
    
    allTransactions.push(...result.recordset); // Spread operator to flatten the results
    }
    return allTransactions;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

module.exports = {
  getTransactionsByRequestId,
};
