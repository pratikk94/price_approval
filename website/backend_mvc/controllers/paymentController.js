// controllers/paymentController.js
const paymentModel = require("../models/paymentModel");

const fetchMinPaymentDetails = async (req, res) => {
  try {
    const { customers, consignees, endUses } = req.body;
    const paymentDetails = await paymentModel.calculateMinPaymentTerm(
      customers,
      consignees,
      endUses
    );
    res.json(paymentDetails);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  fetchMinPaymentDetails,
};
