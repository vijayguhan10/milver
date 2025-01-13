const express = require("express");
const router = express.Router();
const FuelAllowanceController = require("../controllers/FuelAllowanceController");

router.post("/addfuel", FuelAllowanceController.addFuelAllowance);

module.exports = router;
