// remarksController.js
const remarksModel = require("../models/remarksModel");

async function fetchRemarksWithRequests(req, res) {
  console.log("Request ID:", req.body.request_id);
  try {
    const data = await remarksModel.getRemarksWithRequests(req.body.request_id);
    res.json(data);
  } catch (err) {
    console.error("Error fetching data", err);
    res.status(500).send("Failed to fetch data");
  }
}

// New function for posting a remark
async function createRemark(req, res) {
  try {
    const newRemarkId = await remarksModel.postRemark(req.body);
    res
      .status(201)
      .json({ message: "Remark created successfully", id: newRemarkId });
  } catch (err) {
    console.error("Error posting remark", err);
    res.status(500).send("Failed to post remark");
  }
}

module.exports = {
  fetchRemarksWithRequests,
  createRemark,
};
