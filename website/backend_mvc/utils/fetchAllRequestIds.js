const db = require("../config/db");

async function fetchRequestNames(initialRequestName) {
  let requestNames = [];
  let processedRequestNames = new Set(); // To track processed request names

  async function fetchParentRequestName(requestName) {
    if (processedRequestNames.has(requestName)) {
      // If we've already processed this requestName, stop to prevent infinite loop
      return;
    }
    processedRequestNames.add(requestName); // Mark this requestName as processed

    try {
      const query = `SELECT parent_request_name FROM [PriceApprovalSystem].[dbo].[pre_approved_request_status_mvc] WHERE request_name = '${requestName}'`;
      let result = await db.executeQuery(query);
      requestNames.push(requestName);
      if (result.recordset.length > 0) {
        let parentRequestName = result.recordset[0].parent_request_name;

        if (parentRequestName) {
          // Replace the first character with 'N'
          let modifiedRequestName = "N" + parentRequestName.substring(1);
          await fetchParentRequestName(modifiedRequestName);
        }
      }
    } catch (err) {
      console.error("SQL error", err);
    }
  }

  await fetchParentRequestName(initialRequestName);
  return requestNames;
}

// Function to insert request_id and parent_request_id
async function insertParentRequest(newRequestId, requestId) {
  try {
    // Call fetchRequestNames to get parent_request_id
    const parentRequestId = await fetchRequestNames(requestId); // Assuming this function returns the parent_request_id

    // Insert into the database
    const result = await db.executeQuery(
      `INSERT INTO request_mapper (request_id, parent_request_id) VALUES ('${newRequestId}', '${
        parentRequestId[parentRequestId.length - 1]
      }')`
    );

    console.log(result); // Log or handle the result
  } catch (err) {
    console.error("Error inserting request:", err);
  }
}

//Example usage
insertParentRequest("NR202407010003");

// Example usage
// fetchRequestNames("NR202406250001")
//   .then((requestNames) => {
//     console.log(requestNames);
//   })
//   .catch((err) => {
//     console.error(err);
//   });

module.exports = {
  fetchRequestNames,
  insertParentRequest,
};
