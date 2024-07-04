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
    console.log("tempAttachmentIds", tempAttachmentIds);
    const requestId = await priceRequestModel.handleNewRequest();
    console.log("requestId", requestId); // Debugging output (requestId value
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
      tempAttachmentIds,
    } = req.body;
    console.log(tempAttachmentIds);
    console.log("oldRequestId", oldRequestId);
    console.log("Action is ", action);
    if (action == "R") {
      console.log("In update");
      updatePreApprovedRequestStatus(oldRequestId, STATUS.APPROVED);
    }

    const requestId = await priceRequestModel.handleNewRequest();
    const resultA = await getRegionAndRoleByEmployeeId(am_id);

    console.log("requestId", requestId); // Debugging output (requestId value
    if (action == "D") {
      console.log("In draft");
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
      // res.json({
      //   message: "Transaction added successfully",
      //   currentStatus: result.currentStatus,
      // });
    } else {
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
    insertParentRequest(requestName, parentRequestName);
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
