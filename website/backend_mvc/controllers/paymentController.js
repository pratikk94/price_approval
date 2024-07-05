const paymentModel = require("../models/paymentModel");
const logger = require("../utils/logger");

async function getLowestPaymentTerm(req, res) {
  try {
    const { customers, consignees, endUses } = req.body;
    logger.info(`Fetching lowest payment term details with customers: ${customers}, consignees: ${consignees}, endUses: ${endUses}`);
    const lowestPaymentTerm = await paymentModel.fetchLowestPaymentTermDetails(
      customers,
      consignees,
      endUses
    );
    logger.info(`Lowest payment term details fetched successfully: ${JSON.stringify(lowestPaymentTerm)}`);
    res.json({
      lowestPaymentTerm: lowestPaymentTerm || "Payment within 30 days",
    });
  } catch (error) {
    logger.error(`Error fetching lowest payment term details: ${error.message}`);
    res.status(500).send({
      message: "Error fetching payment terms",
      error: error.message,
    });
  }
}


async function getProfitCenter(req, res) {
  try {
    logger.info("Fetching profit center details");
    const result = await paymentModel.fetchProfitCenter();
    logger.info(`Profit center details fetched successfully: ${JSON.stringify(result.recordset)}`);
    res.json(result.recordset);
  } catch (error) {
    logger.error(`Error fetching profit center details: ${error.message}`);
    res.status(500).send({
      message: "Error fetching payment terms",
      error: error.message,
    });
  }
}

module.exports = {
  getLowestPaymentTerm,
  getProfitCenter
};
