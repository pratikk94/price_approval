const paymentModel = require("../models/paymentModel");

async function getLowestPaymentTerm(req, res) {
  try {
    const { customers, consignees, endUses } = req.body;
    const lowestPaymentTerm = await paymentModel.fetchLowestPaymentTermDetails(
      customers,
      consignees,
      endUses
    );
    res.json({
      lowestPaymentTerm: lowestPaymentTerm || "Payment within 30 days",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error fetching payment terms",
      error: error.message,
    });
  }
}

module.exports = {
  getLowestPaymentTerm,
};
