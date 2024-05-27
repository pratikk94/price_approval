// controllers/customerController.js
const customerModel = require("../models/customerModel");

const getCustomers = async (req, res) => {
  try {
    const type = parseInt(req.params.type, 10);
    const salesOffice = req.params.region || null;
    const customers = await customerModel.getCustomers(type, salesOffice);
    res.json(customers);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  getCustomers,
};
