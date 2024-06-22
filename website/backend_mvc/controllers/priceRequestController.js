// controllers/transactionController.js
const priceRequestModel = require("../models/priceRequestModel");
const transactionModel = require("../models/priceRequestModel");
const sql = require("mssql");
const config = require("../config");
const {
  updatePreApprovedRequestStatus,
  addADraft,
} = require("./requestController");

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
      tempAttachmentId,
    } = req.body;

    const requestId = await transactionModel.handleNewRequest();
    console.log("requestId", requestId); // Debugging output (requestId value
    const result = await transactionModel.insertTransactions({
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
      tempAttachmentId,
    });

    priceRequestModel.addTransactionToTable(requestId, am_id);

    res.json({
      message: "Transaction processed successfully",
      data: result,
      id: requestId,
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
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
    } = req.body;
    console.log("oldRequestId", oldRequestId);
    console.log("Action is ", action);
    if (action == "R") {
      console.log("In update");
      updatePreApprovedRequestStatus(oldRequestId, -1);
    }

    const requestId = await transactionModel.handleNewRequest();
    console.log("requestId", requestId); // Debugging output (requestId value
    if (action == "D") {
      console.log("In draft");
      addADraft(requestId);
    }
    const result = await transactionModel.insertTransactions({
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
    });

    priceRequestModel.addTransactionToTable(
      requestId,
      am_id,
      (draft = action == "D")
    );
    if (oldRequestId != undefined)
      pushDataToTable(requestId, action + oldRequestId.substring(1));

    res.json({
      message: "Transaction processed successfully",
      data: result,
      id: requestId,
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).send("Failed to process transaction");
  }
}

async function getPriceApprovalData(req, res) {
  const { requestId } = req.params; // Assuming request_id is passed as a URL parameter

  try {
    const data = await priceRequestModel.fetchConsolidatedRequest(requestId);
    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching price approval data");
    console.error("Error:", error);
  }
}

async function pushDataToTable(requestName, parentRequestName) {
  try {
    await sql.connect(config); // replace 'config' with your actual configuration object

    const query = `
      INSERT INTO pre_approved_request_status_mvc (request_name, parent_request_name)
      VALUES ('${requestName}','${parentRequestName}')
    `;

    const result = await sql.query(query);

    console.log(result);
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

module.exports = {
  processTransaction,
  getPriceApprovalData,
  processPrevApprovedTransaction,
};
