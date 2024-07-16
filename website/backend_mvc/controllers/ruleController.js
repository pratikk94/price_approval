const ruleModel = require("../models/ruleModel");
const logger = require("../utils/logger");

const getRulesByApproverAndLevel = async (req, res) => {
  const { approver, level } = req.params;
  logger.info("Fetching rules by approver and level", { approver, level });

  try {
    const rules = await ruleModel.getRulesByApproverAndLevel(approver, level);
    logger.debug("Rules fetched successfully", { approver, level, rules });
    res.json(rules);
  } catch (error) {
    logger.error("Error retrieving data", { error: error.message, approver, level });
    res.status(500).send("Error retrieving data");
  }
};

const getApproversByLevels = async (req, res) => {
  logger.info("Fetching approvers by levels");

  try {
    const approversByLevels = await ruleModel.getApproversByLevels();
    logger.debug("Approvers by levels fetched successfully", { approversByLevels });
    res.json(approversByLevels);
  } catch (error) {
    logger.error("Error retrieving data", { error: error.message });
    res.status(500).send("Error retrieving data");
  }
};

const postApproversByLevels = async (req, res) => {
  const dataArray = req.body.dataArray;
  logger.info("Posting approvers by levels", { dataArray });

  try {
    const result = await ruleModel.postApproversByLevels(dataArray);
    logger.debug("Approvers by levels posted successfully", { result });
    res.json(result);
  } catch (error) {
    logger.error("Error posting data", { error: error.message, dataArray });
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

const updateRules = async (req, res) => {
  try {
    const rules = req.body.rules;
    console.log("COnsole log rules", rules);
    await ruleModel.updateRules(rules);
    res.json({ message: "Rules updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addRule = async (req, res) => {
  try {
    const rule = req.body.rule;
    await ruleModel.addRule(rule);
    res.json({ message: "Rule added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getRulesByApproverAndLevel,
  getApproversByLevels,
  postApproversByLevels,
  getRulesByRegion,
  updateRules,
  addRule,
};
