const express = require("express");
const { 
  getAllCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} = require("../controllers/customerController");

const router = express.Router();

router.get("/", getAllCustomers);
router.post("/getById", getCustomerById); 
router.post("/", createCustomer);
router.put("/", updateCustomer); 
router.delete("/", deleteCustomer);

module.exports = router;
