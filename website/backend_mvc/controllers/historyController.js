const historyModel = require("../models/historyModel");
exports.getHistoryRequests = async (req, res) => {
  try {
    const data = {
      customerIds: req.query.customerIds,
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
