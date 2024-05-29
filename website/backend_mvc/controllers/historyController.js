const historyModel = require("../models/historyModel");
const getHistoryRequests = async (req, res) => {
  console.log(req.query);
  const customer_id = req.query["/history-requests?customerIds"];
  try {
    const data = {
      customerIds: customer_id,
      consigneeIds: req.query.consigneeIds,
      endUseId: req.query.endUseId,
      plantIds: req.query.plantIds,
      grade: req.query.grade,
    };

    console.log("data", data);

    const result = await historyModel.findRequests(data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  getHistoryRequests,
};
