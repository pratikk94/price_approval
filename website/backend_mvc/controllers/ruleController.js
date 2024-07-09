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

module.exports = {
  getRulesByApproverAndLevel,
  getApproversByLevels,
  postApproversByLevels
};
