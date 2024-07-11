const ruleModel = require("../models/ruleModel");

const getRulesByApproverAndLevel = async (req, res) => {
  try {
    const { approver, level } = req.params;
    const rules = await ruleModel.getRulesByApproverAndLevel(approver, level);
    res.json(rules);
  } catch (error) {
    res.status(500).send("Error retrieving data");
  }
};

const getApproversByLevels = async (req, res) => {
  try {
    const approversByLevels = await ruleModel.getApproversByLevels();
    res.json(approversByLevels);
  } catch (error) {
    res.status(500).send("Error retrieving data");
  }
};

const postApproversByLevels = async (req, res) => {
  try {
    const result = await ruleModel.postApproversByLevels(req.body.dataArray);
    res.json(result);
  } catch (error) {
    res.status(500).send("Error retrieving data");
  }
};

async function getRulesByRegion(req, res) {
  const region = req.params.region;
  try {
    const rules = await ruleModel.getRulesByRegion(region);
    res.json(rules);
  } catch (err) {
    console.error("Error fetching rules:", err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getRulesByApproverAndLevel,
  getApproversByLevels,
  postApproversByLevels,
  getRulesByRegion,
};
