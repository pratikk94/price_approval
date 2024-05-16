// controllers/transactionController.js
const priceRequestModel = require("../models/priceRequestModel");
const transactionModel = require("../models/priceRequestModel");

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
    });

    res.json({ message: "Transaction processed successfully", data: result });
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

module.exports = {
  processTransaction,
  getPriceApprovalData,
};
