const gradeModel = require("../models/gradeModel");

async function getGrades(req, res) {
  try {
    const fsc = req.query.fsc == 1 ? "Y" : "N";
    const result = await gradeModel.fetchGrade(fsc);
   // Send the results as a response
   res.json(result.recordset);
  } catch (error) {
    res.status(500).send({
      message: "Error fetching payment terms",
      error: error.message,
    });
  }
}

module.exports = {
    getGrades,
};
