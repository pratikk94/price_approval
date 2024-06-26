const express = require("express");
const router = express.Router();
const plantsController = require("../controllers/plantsController");

router.get("/fetch_plants", plantsController.getPlants);

module.exports = router;
