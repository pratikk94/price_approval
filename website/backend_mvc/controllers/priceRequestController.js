// controllers/transactionController.js
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
    } = req.body;

    const requestId = await transactionModel.handleNewRequest();
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
    });

    res.json({ message: "Transaction processed successfully", data: result });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).send("Failed to process transaction");
  }
}

module.exports = {
  processTransaction,
};
