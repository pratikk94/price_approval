const historyModel = require("../models/historyModel");
const logger = require("../utils/logger");

const getHistoryRequests = async (req, res) => {
  const customer_id = req.query["/history-requests?customerIds"];
  try {
    const data = {
      customerIds: customer_id,
      consigneeIds: req.query.consigneeIds,
      endUseId: req.query.endUseId,
      plantIds: req.query.plantIds,
      grade: req.query.grade,
    };

    logger.info(`Fetching history requests with data: ${JSON.stringify(data)}`);
    const result = await historyModel.findRequests(data);
    logger.info(`History requests fetched successfully: ${JSON.stringify(result)}`);
    res.json(result);
  } catch (error) {
    logger.error(`Error fetching history requests: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  getHistoryRequests,
};
