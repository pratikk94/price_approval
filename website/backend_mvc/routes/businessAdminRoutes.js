const express = require("express");
const router = express.Router();
const businessAdminController = require("../controllers/businessAdminController");

router.post(
  "/fetchValuesByParams",
  businessAdminController.fetchValuesByParams
);

router.get("/fetch_sales_regions", businessAdminController.fetchSalesRegions);
router.get("/fetch_grade_with_pc", businessAdminController.fetchGradeWithPC);
router.post("/add_defined_rule", businessAdminController.addDefinedRule)



module.exports = router;
