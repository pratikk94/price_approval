// controllers/transactionController.js
const transactionModel = require("../models/transactionModel");
const priceRequestModel = require("../models/priceRequestModel");
const sql = require("mssql");
const config = require("../config");
const {
  updatePreApprovedRequestStatus,
  addADraft,
} = require("./requestController");
const db = require("../config/db");
const { getRegionAndRoleByEmployeeId } = require("../utils/fetchDetails");
const { insertParentRequest } = require("../utils/fetchAllRequestIds");
const { STATUS, SYMMETRIC_KEY_NAME, CERTIFICATE_NAME } = require("../config/constants");
const logger = require("../utils/logger");
async function processTransaction(req, res) {
  try {
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
      prices,
      am_id,
      tempAttachmentIds,
    } = req.body;
 
    logger.info("Processing transaction...");
    logger.debug("Received request body:", req.body);

    const requestId = await priceRequestModel.handleNewRequest();
    logger.info(`New request ID generated: ${requestId}`);

    const result = await priceRequestModel.insertTransactions({
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
      prices,
      am_id,
      tempAttachmentIds,
    });

   await priceRequestModel.addTransactionToTable(requestId, am_id);
    insertParentRequest(requestId, requestId);

    logger.info("Transaction processed successfully:: Id:", requestId);

    res.json({
      message: "Transaction processed successfully",
      data: result,
      id: requestId,
    });
  } catch (error) {
    logger.error("Error processing transaction:", error);
    res.status(500).send("Failed to process transaction");
  }
}

async function processPrevApprovedTransaction(req, res) {
  try {
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
      prices,
      am_id,
      action,
      oldRequestId,
      tempAttachmentIds,
    } = req.body;

    logger.info("Processing previous approved transaction...");
    logger.debug("Received request body:", req.body);

    if (action == "R") {
      logger.info(
        `Updating pre-approved request status for request ID: ${oldRequestId}`
      );
      updatePreApprovedRequestStatus(oldRequestId, STATUS.APPROVED);
    }

    const requestId = await priceRequestModel.handleNewRequest();
    logger.info(`New request ID generated: ${requestId}`);

    const resultA = await getRegionAndRoleByEmployeeId(am_id);

    if (action == "D") {
      logger.info(`Adding draft for request ID: ${requestId}`);
      addADraft(requestId);
      priceRequestModel.addTransactionToTable(
        requestId,
        am_id,
        (draft = action == "D")
      );
    } else {
      try {
        const result3 = await transactionModel.acceptTransaction(
          resultA[0]["region"],
          action,
          requestId,
          am_id,
          resultA[0]["role"],
          oldRequestId,
          false,
          action == "B" || action == "E"
        );
        if (result3.success) {
          // res.json({
          //   message: "Transaction added successfully",
          //   currentStatus: result3.currentStatus,
          // });
        } else {
          // res.status(500).send("Failed to process transaction");
        }
      } catch (error) {
        // res.status(500).send("Server error while adding transaction");
        // console.error("Error:", error);
      }
    }
    if (resultA.success) {
      logger.info(
        `Transaction accepted successfully for request ID: ${requestId}`
      );
      // res.json({
      //   message: "Transaction added successfully",
      //   currentStatus: result.currentStatus,
      // });
    } else {
      logger.error(`Failed to accept transaction for request ID: ${requestId}`);
      // res.status(500).send("Failed to process transaction");
    }

    const result = await priceRequestModel.insertTransactions({
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
      prices,
      am_id,
      tempAttachmentIds,
    });

    // priceRequestModel.addTransactionToTable(
    //   requestId,
    //   am_id,
    //   (draft = action == "D")
    // );
    if (oldRequestId != undefined)
      pushDataToTable(requestId, "N" + oldRequestId.substring(1));

    res.json({
      message: "Transaction processed successfully",
      data: result,
      id: requestId,
    });
  } catch (error) {
    logger.error("Error processing transaction:", error);
    res.status(500).send("Failed to process transaction");
  }
}

async function getPriceApprovalData(req, res) {
  const { requestId } = req.params; // Assuming request_id is passed as a URL parameter

  try {
    logger.info(`Fetching price approval data for request ID: ${requestId}`);
    const data = await priceRequestModel.fetchConsolidatedRequest(requestId);
    res.json(data);
  } catch (error) {
    logger.error(
      `Error fetching price approval data for request ID ${requestId}: ${error.message}`
    );
    res.status(500).send("Error fetching price approval data");
  }
}

async function pushDataToTable(requestName, parentRequestName) {
  try {
    await sql.connect(config); // replace 'config' with your actual configuration object

    const query = `
      INSERT INTO pre_approved_request_status_mvc (request_name, parent_request_name)
      VALUES ('${requestName}','${parentRequestName}')
    `;
    insertParentRequest(requestName, parentRequestName);
    const result = await sql.query(query);

    logger.info(`Data pushed to table: ${JSON.stringify(result)}`);
  } catch (err) {
    logger.error("Database connection error:", err);
    res.status(500).send("Database connection error:", err);
  }
}

async function fetchPriceRequestByStatus(req, res) {
  const status = req.params.status;
  try {
    // await sql.connect(config);
    // const query = `SELECT DISTINCT [request_id] FROM [PriceApprovalSystem].[dbo].[transaction_mvc] WHERE current_status LIKE '%${status}%'`;
    // console.log(query);
    // const result = await sql.query(query);
    const result = await priceRequestModel.fetchRequestByStatus(status);
    const consolidatedResults = [];
    console.log("Here");
    // Assuming priceRequestModel.fetchConsolidatedRequest is an async function
    for (const row of result.recordset) {
      const requestId = row.request_id;
      console.log(requestId);
      const consolidatedRequest =
        await priceRequestModel.fetchConsolidatedRequest(requestId);
      console.log(consolidatedRequest);
      consolidatedResults.push(consolidatedRequest);
    }
    getCustomerConsigneeAndEndUseDetails(consolidatedResults, res); // Return or process the aggregated results
  } catch (error) {
    logger.error("Error fetching price request by status:", error);
    // Assuming 'res' is the response object from an Express.js handler
    res.status(500).send("Failed to fetch price request by status");
  }
}

async function fetchNamesByIds(ids) {
  try {
    // let pool = await sql.connect(config);
    // let query = `SELECT [id], [Name] FROM [PriceApprovalSystem].[dbo].[customer] WHERE [id] IN (${ids.join(
    //   ","
    // )})`;

    // console.log("Query:", query);
    // let result = await pool.request().query(query);
    // await pool.close();
    let result = await db.executeQuery(`EXEC FetchNamesByIds @Ids, @SymmetricKeyName, @CertificateName`,
      {
        Ids : '1,2,3,4',
        SymmetricKeyName:SYMMETRIC_KEY_NAME,
        CertificateName:CERTIFICATE_NAME,
    });
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function getCustomerConsigneeAndEndUseDetails(jsonArray, res) {
  try {
    for (let jsonInput of jsonArray) {
      const consolidatedRequest = jsonInput.consolidatedRequest;

      // Extract IDs from JSON
      const customerId = consolidatedRequest.customer_id;
      const consigneeIds = consolidatedRequest.consignee_id
        ? consolidatedRequest.consignee_id.split(",").map((id) => id.trim())
        : [];
      const endUseId = consolidatedRequest.end_use_id
        ? [consolidatedRequest.end_use_id]
        : [];

      // Fetch names from database
      const customerName = customerId
        ? await fetchNamesByIds([customerId])
        : [];
      const consigneeNames =
        consigneeIds.length > 0 ? await fetchNamesByIds(consigneeIds) : [];
      const endUseName =
        endUseId.length > 0 ? await fetchNamesByIds(endUseId) : [];

      // Modify the JSON to include names
      consolidatedRequest.customer_name = customerName.length
        ? customerName[0].Name
        : null;
      consolidatedRequest.consignee_names = consigneeNames.map(
        (consignee) => consignee.Name
      );
      consolidatedRequest.end_use_name = endUseName.length
        ? endUseName[0].Name
        : null;
    }

    console.log("JSON array with names:", jsonArray);

    return res.json(jsonArray);
  } catch (err) {
    console.error("Error in getCustomerConsigneeAndEndUseDetails", err);
    throw err;
  }
}

module.exports = {
  processTransaction,
  getPriceApprovalData,
  processPrevApprovedTransaction,
  fetchPriceRequestByStatus,
};
