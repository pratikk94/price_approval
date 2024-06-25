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

// Example usage
fetchRequestNames("NR202406250001")
  .then((requestNames) => {
    console.log(requestNames);
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = {
  fetchRequestNames,
};
