/** @format */

const express = require("express");
const router = express.Router();
const db = require("./../db");
const CustomerController = require("./../controllers/CustomerController");

router.post("/add-customer", CustomerController.addCustomer);
router.get("/get", CustomerController.getAllCustomers);
router.get("/detail/:id", CustomerController.getCustomerById);

module.exports = router;
