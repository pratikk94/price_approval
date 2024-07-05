const customerModel = require("../models/customerModel");
const logger = require("../utils/logger");

const getCustomers = async (req, res) => {
  try {
    const type = parseInt(req.params.type, 10);
    const salesOffice = req.params.region || null;

    logger.info(`Fetching customers with type: ${type}, salesOffice: ${salesOffice}`);
    const customers = await customerModel.getCustomers(type, salesOffice);
    res.json(customers);
  } catch (err) {
    logger.error(`Error fetching customers: ${err.message}`);
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  getCustomers,
};
