// controllers/transactionController.js
const transactionModel = require("../models/transactionModel");
const priceRequestModel = require("../models/priceRequestModel");
const sql = require("mssql");
const config = require("../config");
const {
  updatePreApprovedRequestStatus,
  addADraft,
} = require("./requestController");

const { getRegionAndRoleByEmployeeId } = require("../utils/fetchDetails");
const { insertParentRequest } = require("../utils/fetchAllRequestIds");
const { STATUS } = require("../config/constants");
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

    priceRequestModel.addTransactionToTable(requestId, am_id);
    insertParentRequest(requestId, requestId);

    logger.info("Transaction processed successfully:: Id:",requestId);

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
      logger.info(`Updating pre-approved request status for request ID: ${oldRequestId}`);
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
      logger.info(`Transaction accepted successfully for request ID: ${requestId}`);
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
      pushDataToTable(requestId, action + oldRequestId.substring(1));

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
    logger.error(`Error fetching price approval data for request ID ${requestId}: ${error.message}`);
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

module.exports = {
  processTransaction,
  getPriceApprovalData,
  processPrevApprovedTransaction,
};
